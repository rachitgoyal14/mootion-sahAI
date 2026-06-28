from __future__ import annotations

import signal
import sys

from sqlalchemy import select

from app.core.config import settings
from app.core.database import SessionLocal
from app.core.models import Assignment, ChapterAssetGenerationJob
from app.core.redis import get_redis_connection
from app.services.assignment_service import process_generation_job, _refresh_assignment_status
from app.services.media_queue import QUEUE_KEY, acknowledge_media_generation_job


_should_stop = False


def process_media_generation_job(job_id: str) -> None:
    print(f"[media-worker] picked job {job_id}", file=sys.stderr, flush=True)
    db = SessionLocal()
    try:
        job = db.get(ChapterAssetGenerationJob, job_id)
        if not job:
            print(f"[media-worker] job not found in DB: {job_id}", file=sys.stderr, flush=True)
            return

        print(f"[media-worker] found job {job_id} status={job.status} attempt={job.attempt_count}", file=sys.stderr, flush=True)

        process_generation_job(db, job)

        print(f"[media-worker] finished processing {job_id} status={job.status} attempt={job.attempt_count}", file=sys.stderr, flush=True)

        assignment = db.scalar(select(Assignment).where(Assignment.id == job.assignment_id))
        if assignment:
            _refresh_assignment_status(db, str(assignment.id))
    finally:
        db.close()


def run_worker() -> None:
    print(f"[media-worker] Starting worker. Connecting to Redis at {settings.redis_url}...", flush=True)
    try:
        redis = get_redis_connection()
        ping_res = redis.ping()
        print(f"[media-worker] Redis connection verified: ping result -> {ping_res}", flush=True)
    except Exception as exc:
        print(f"[media-worker] ERROR: Redis connection test failed at {settings.redis_url}. Details: {exc}", flush=True)
        # Re-raise to ensure startup fails if queue is unreachable
        raise exc

    # Test object storage upload on startup
    print(f"[media-worker] Testing object storage credentials (bucket={settings.object_storage_bucket}, endpoint={settings.object_storage_endpoint})...", flush=True)
    try:
        from app.core.storage import get_object_storage_client
        from io import BytesIO
        client = get_object_storage_client()
        if not client.bucket_exists(settings.object_storage_bucket):
            client.make_bucket(settings.object_storage_bucket)
            print(f"[media-worker] Created object storage bucket '{settings.object_storage_bucket}'", flush=True)
        else:
            print(f"[media-worker] Object storage bucket '{settings.object_storage_bucket}' exists", flush=True)
        
        test_key = "test_worker_startup.txt"
        test_data = b"Mootion worker startup connectivity check"
        client.put_object(
            settings.object_storage_bucket,
            test_key,
            BytesIO(test_data),
            len(test_data),
            content_type="text/plain"
        )
        print("[media-worker] Object storage startup test upload succeeded!", flush=True)
    except Exception as exc:
        print(f"[media-worker] ERROR: Object storage startup credentials check failed. Details: {exc}", flush=True)
        # Re-raise to prevent starting worker with invalid storage config
        raise exc

    def _stop(*_args):
        global _should_stop
        _should_stop = True

    signal.signal(signal.SIGTERM, _stop)
    signal.signal(signal.SIGINT, _stop)

    while not _should_stop:
        item = redis.brpop(QUEUE_KEY, timeout=int(max(1, settings.asset_generation_poll_interval_seconds)))
        if not item:
            continue

        _, raw_job_id = item
        job_id = raw_job_id.decode("utf-8") if isinstance(raw_job_id, bytes) else str(raw_job_id)
        print(f"[media-worker] brpop -> {job_id}", file=sys.stderr, flush=True)
        try:
            process_media_generation_job(job_id)
        except Exception:
            # Keep the worker alive; the DB job row records the failure.
            print(f"[media-worker] error while processing {job_id}", file=sys.stderr, flush=True)
            continue
        finally:
            acknowledge_media_generation_job(job_id)
            print(f"[media-worker] acknowledged {job_id}", file=sys.stderr, flush=True)


if __name__ == "__main__":
    run_worker()

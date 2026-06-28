from __future__ import annotations

from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.redis import get_redis_connection
from app.core.models import ChapterAsset, ChapterAssetGenerationJob
from app.core.config import settings


QUEUE_KEY = f"{settings.media_job_queue_name}:queue"
ENQUEUED_KEY_PREFIX = f"{settings.media_job_queue_name}:enqueued:"


def enqueue_media_generation_job(job_id: str) -> bool:
    redis = get_redis_connection()
    marker_key = f"{ENQUEUED_KEY_PREFIX}{job_id}"
    if not redis.set(marker_key, "1", nx=True, ex=24 * 60 * 60):
        return False

    try:
        redis.lpush(QUEUE_KEY, job_id)
        print(f"[media-queue] enqueued {job_id} -> {QUEUE_KEY}")
        return True
    except Exception:
        redis.delete(marker_key)
        raise


def enqueue_pending_media_jobs() -> int:
    # Local import to avoid circular dependency
    from app.services.assignment_service import _refresh_assignment_status

    db: Session = SessionLocal()
    queued = 0
    redis = get_redis_connection()
    assignments_to_refresh = set()

    try:
        stale_before = datetime.now(timezone.utc) - timedelta(minutes=settings.media_job_stale_timeout_minutes)
        stale_processing_jobs = (
            db.query(ChapterAssetGenerationJob)
            .filter(
                ChapterAssetGenerationJob.status == "processing",
                ChapterAssetGenerationJob.started_at.isnot(None),
                ChapterAssetGenerationJob.started_at < stale_before,
            )
            .all()
        )

        for job in stale_processing_jobs:
            asset = db.get(ChapterAsset, job.chapter_asset_id)
            if asset and asset.generation_status == "ready":
                job.status = "ready"
                job.error_message = "Superseded: asset already ready"
                job.finished_at = datetime.now(timezone.utc)
                assignments_to_refresh.add(str(job.assignment_id))
                redis.delete(f"{ENQUEUED_KEY_PREFIX}{job.id}")
            else:
                job.status = "queued"
                job.started_at = None
                redis.delete(f"{ENQUEUED_KEY_PREFIX}{job.id}")

        db.flush()

        pending_jobs = db.query(ChapterAssetGenerationJob).filter(ChapterAssetGenerationJob.status == "queued").all()
        for job in pending_jobs:
            asset = db.get(ChapterAsset, job.chapter_asset_id)
            if asset and asset.generation_status == "ready":
                job.status = "ready"
                job.error_message = "Superseded: asset already ready"
                job.finished_at = datetime.now(timezone.utc)
                assignments_to_refresh.add(str(job.assignment_id))
                redis.delete(f"{ENQUEUED_KEY_PREFIX}{job.id}")
            else:
                if enqueue_media_generation_job(str(job.id)):
                    queued += 1

        db.commit()

        for assignment_id in assignments_to_refresh:
            try:
                _refresh_assignment_status(db, assignment_id)
            except Exception as e:
                print(f"[media-queue] Failed to refresh assignment {assignment_id}: {e}", flush=True)

    finally:
        db.close()

    return queued


def acknowledge_media_generation_job(job_id: str) -> None:
    redis = get_redis_connection()
    redis.delete(f"{ENQUEUED_KEY_PREFIX}{job_id}")
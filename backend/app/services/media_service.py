from __future__ import annotations

from io import BytesIO
from typing import Any

import httpx
from fastapi import HTTPException, status
from app.core.config import settings
from app.core.models import ChapterAsset
from app.core.storage import get_object_storage_client, ensure_media_bucket as ensure_object_storage_bucket, presigned_media_url


def build_playback_url(bucket: str, key: str) -> str:
    return presigned_media_url(bucket, key)


def resolve_asset_media_url(asset: ChapterAsset) -> str | None:
    if asset.storage_bucket and asset.storage_key:
        return build_playback_url(asset.storage_bucket, asset.storage_key)
    if asset.asset_type == "simulation" and asset.external_url and not asset.external_url.startswith(("http://", "https://")):
        return f"{settings.backend_public_url.rstrip('/')}/simulations/{asset.external_url}/html"
    return asset.external_url


def build_asset_object_key(asset_id: str, job_id: str) -> str:
    return f"chapter-assets/{asset_id}/{job_id}.mp4"


def ensure_media_bucket() -> None:
    ensure_object_storage_bucket()


def download_manim_video(video_id: str) -> tuple[bytes, str]:
    video_url = f"{settings.manim_service_base_url.rstrip('/')}/video/{video_id}"
    try:
        response = httpx.get(video_url, timeout=300.0)
    except httpx.RequestError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"Failed to fetch Manim video: {exc}") from exc

    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Manim service returned {response.status_code} while downloading video.",
        )

    content_type = response.headers.get("content-type", "video/mp4")
    return response.content, content_type


def store_generated_manim_video(asset: ChapterAsset, job_id: str, video_id: str) -> dict[str, Any]:
    import os
    ensure_media_bucket()
    client = get_object_storage_client()
    
    # Check if the generated video file exists locally on disk in animation-engine outputs
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
    local_video_path = os.path.join(base_dir, "animation-engine/outputs/videos", video_id, "final.mp4")
    file_exists = os.path.exists(local_video_path)
    file_size = os.path.getsize(local_video_path) if file_exists else 0
    
    print(f"[media-worker] Starting R2 upload for asset {asset.id}", flush=True)
    print(f"[media-worker] Local file path: {local_video_path}, file exists: {file_exists}, size: {file_size} bytes", flush=True)

    print(f"[media-worker] Downloading Manim video bytes for video_id: {video_id}...", flush=True)
    video_bytes, content_type = download_manim_video(video_id)
    print(f"[media-worker] Downloaded {len(video_bytes)} bytes of video {video_id} (content_type={content_type}).", flush=True)
    
    object_key = build_asset_object_key(str(asset.id), job_id)

    try:
        client.put_object(
            settings.object_storage_bucket,
            object_key,
            BytesIO(video_bytes),
            len(video_bytes),
            content_type=content_type,
        )
        print(f"[media-worker] Upload complete, R2 key: {object_key}", flush=True)
    except Exception as exc:
        import traceback
        print(f"[media-worker] ERROR: Object storage upload failed for key: {object_key}. Details: {exc}", flush=True)
        traceback.print_exc()
        raise exc

    asset.storage_bucket = settings.object_storage_bucket
    asset.storage_key = object_key
    asset.external_url = build_playback_url(settings.object_storage_bucket, object_key)
    print(f"[media-worker] Updating asset external_url to: {asset.external_url}", flush=True)

    return {
        "storage_bucket": settings.object_storage_bucket,
        "storage_key": object_key,
        "external_url": asset.external_url,
        "content_type": content_type,
    }


def get_signed_media_url(bucket: str, key: str) -> str:
    try:
        return presigned_media_url(bucket, key)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Media asset not available") from exc

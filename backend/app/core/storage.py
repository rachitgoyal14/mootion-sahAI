from __future__ import annotations

import logging
from functools import lru_cache
from datetime import timedelta
import boto3
from botocore.config import Config
from botocore.exceptions import ClientError

from app.core.config import settings

logger = logging.getLogger(__name__)


class Boto3R2Client:
    def __init__(self) -> None:
        endpoint = settings.object_storage_endpoint
        # Ensure it has a scheme. If not, default based on secure flag
        if not endpoint.startswith(("http://", "https://")):
            scheme = "https" if settings.object_storage_secure else "http"
            endpoint = f"{scheme}://{endpoint}"

        print(f"R2_ENDPOINT_URL={endpoint}", flush=True)
        print(f"R2_BUCKET_NAME={settings.object_storage_bucket}", flush=True)
        access_key = settings.object_storage_access_key or ""
        print(f"R2_ACCESS_KEY_ID={access_key[:6]}...", flush=True)

        self.s3 = boto3.client(
            "s3",
            endpoint_url=endpoint,
            aws_access_key_id=settings.object_storage_access_key,
            aws_secret_access_key=settings.object_storage_secret_key,
            config=Config(signature_version="s3v4"),
            region_name=settings.object_storage_region or "auto",
        )

    def bucket_exists(self, bucket_name: str) -> bool:
        try:
            self.s3.head_bucket(Bucket=bucket_name)
            return True
        except ClientError as e:
            error_code = e.response.get("Error", {}).get("Code")
            if error_code in ("404", 404, "NoSuchBucket"):
                return False
            # 403 means forbidden, but bucket exists and we don't have head permission
            if error_code in ("403", 403):
                return True
            raise e

    def make_bucket(self, bucket_name: str) -> None:
        try:
            self.s3.create_bucket(Bucket=bucket_name)
        except ClientError as e:
            error_code = e.response.get("Error", {}).get("Code")
            if error_code not in ("BucketAlreadyOwnedByYou", "BucketAlreadyExists"):
                raise e

    def put_object(self, bucket_name: str, object_name: str, data: any, length: int, content_type: str | None = None) -> None:
        extra_args = {}
        if content_type:
            extra_args["ContentType"] = content_type
        
        self.s3.put_object(
            Bucket=bucket_name,
            Key=object_name,
            Body=data,
            **extra_args
        )

    def presigned_get_object(self, bucket_name: str, object_name: str, expires: timedelta) -> str:
        expires_seconds = int(expires.total_seconds())
        return self.s3.generate_presigned_url(
            "get_object",
            Params={"Bucket": bucket_name, "Key": object_name},
            ExpiresIn=expires_seconds,
        )


@lru_cache(maxsize=1)
def get_object_storage_client() -> Boto3R2Client:
    return Boto3R2Client()


def ensure_media_bucket() -> None:
    client = get_object_storage_client()
    if not client.bucket_exists(settings.object_storage_bucket):
        client.make_bucket(settings.object_storage_bucket)


def presigned_media_url(bucket: str, key: str) -> str:
    if settings.object_storage_public_url:
        return f"{settings.object_storage_public_url.rstrip('/')}/{key}"
    client = get_object_storage_client()
    return client.presigned_get_object(
        bucket,
        key,
        expires=timedelta(minutes=settings.object_storage_signed_url_expiry_minutes),
    )

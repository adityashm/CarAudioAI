"""
DigitalOcean Spaces utilities (S3-compatible storage)
For storing DSP configuration files, user uploads, etc.
"""
import boto3
from botocore.exceptions import ClientError
from app.config import settings
import logging
from typing import Optional

logger = logging.getLogger(__name__)

def get_spaces_client():
    """Get DigitalOcean Spaces client if credentials are configured"""
    if settings.SPACES_KEY and settings.SPACES_SECRET:
        return boto3.client(
            's3',
            region_name=settings.SPACES_REGION,
            endpoint_url=settings.SPACES_ENDPOINT,
            aws_access_key_id=settings.SPACES_KEY,
            aws_secret_access_key=settings.SPACES_SECRET
        )
    return None


async def upload_file(
    file_path: str,
    object_name: str,
    content_type: str = "application/octet-stream",
    public: bool = False
) -> Optional[str]:
    """
    Upload file to DigitalOcean Spaces
    
    Args:
        file_path: Local file path to upload
        object_name: Name of object in Spaces (e.g., "dsp_configs/user123_pioneer.xml")
        content_type: MIME type of file
        public: Whether file should be publicly accessible
    
    Returns:
        str: Public URL of uploaded file, or None if failed
    """
    try:
        extra_args = {'ContentType': content_type}
        
        if public:
            extra_args['ACL'] = 'public-read'
        
        spaces_client.upload_file(
            file_path,
            settings.SPACES_BUCKET,
            object_name,
            ExtraArgs=extra_args
        )
        
        # Generate public URL
        url = f"{settings.SPACES_ENDPOINT}/{settings.SPACES_BUCKET}/{object_name}"
        
        logger.info(f"File uploaded successfully: {object_name}")
        return url
    
    except ClientError as e:
        logger.error(f"Failed to upload file: {e}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error uploading file: {e}")
        return None


async def upload_file_content(
    content: bytes,
    object_name: str,
    content_type: str = "application/octet-stream",
    public: bool = False
) -> Optional[str]:
    """
    Upload file content (bytes) to DigitalOcean Spaces
    
    Args:
        content: File content as bytes
        object_name: Name of object in Spaces
        content_type: MIME type
        public: Whether file should be publicly accessible
    
    Returns:
        str: Public URL of uploaded file, or None if failed
    """
    try:
        extra_args = {'ContentType': content_type}
        
        if public:
            extra_args['ACL'] = 'public-read'
        
        spaces_client.put_object(
            Bucket=settings.SPACES_BUCKET,
            Key=object_name,
            Body=content,
            **extra_args
        )
        
        # Generate public URL
        url = f"{settings.SPACES_ENDPOINT}/{settings.SPACES_BUCKET}/{object_name}"
        
        logger.info(f"Content uploaded successfully: {object_name}")
        return url
    
    except ClientError as e:
        logger.error(f"Failed to upload content: {e}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error uploading content: {e}")
        return None


async def download_file(object_name: str, local_path: str) -> bool:
    """
    Download file from DigitalOcean Spaces
    
    Args:
        object_name: Name of object in Spaces
        local_path: Local path to save file
    
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        spaces_client.download_file(
            settings.SPACES_BUCKET,
            object_name,
            local_path
        )
        
        logger.info(f"File downloaded successfully: {object_name}")
        return True
    
    except ClientError as e:
        logger.error(f"Failed to download file: {e}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error downloading file: {e}")
        return False


async def delete_file(object_name: str) -> bool:
    """
    Delete file from DigitalOcean Spaces
    
    Args:
        object_name: Name of object to delete
    
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        spaces_client.delete_object(
            Bucket=settings.SPACES_BUCKET,
            Key=object_name
        )
        
        logger.info(f"File deleted successfully: {object_name}")
        return True
    
    except ClientError as e:
        logger.error(f"Failed to delete file: {e}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error deleting file: {e}")
        return False


async def generate_presigned_url(object_name: str, expiration: int = 3600) -> Optional[str]:
    """
    Generate presigned URL for temporary access to private file
    
    Args:
        object_name: Name of object in Spaces
        expiration: URL expiration time in seconds (default 1 hour)
    
    Returns:
        str: Presigned URL, or None if failed
    """
    try:
        url = spaces_client.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': settings.SPACES_BUCKET,
                'Key': object_name
            },
            ExpiresIn=expiration
        )
        
        logger.info(f"Presigned URL generated for: {object_name}")
        return url
    
    except ClientError as e:
        logger.error(f"Failed to generate presigned URL: {e}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error generating presigned URL: {e}")
        return None


def get_file_categories():
    """
    Recommended folder structure in Spaces
    """
    return {
        "dsp_configs": "DSP configuration files (XML, JSON, BIT)",
        "user_uploads": "User uploaded files (measurements, images)",
        "measurements": "Frequency response measurement data",
        "exports": "Generated tuning profiles and reports",
        "temp": "Temporary files (auto-delete after 24h)"
    }

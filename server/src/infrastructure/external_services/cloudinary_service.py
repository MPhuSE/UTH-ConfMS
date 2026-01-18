import cloudinary
import cloudinary.uploader
from fastapi import UploadFile

cloudinary.config( 
  cloud_name = "dzlnapkgf", 
  api_key = "487264813524569", 
  api_secret = "MevtID4D-iESC5rg7KUrQ3LV2q4",
  secure = True
)

class CloudinaryService:
    @staticmethod
    async def upload_pdf(file: UploadFile, folder: str = "uth_conf_papers") -> str:
        try:
            result = cloudinary.uploader.upload(
                file.file,
                folder = folder,
                resource_type = "raw",
                access_mode = "public",
                use_filename = True,
                unique_filename = True
            )
            return result.get("secure_url")
        except Exception as e:
            raise Exception(f"Cloudinary Upload Error: {str(e)}")
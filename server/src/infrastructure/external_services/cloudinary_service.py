import cloudinary
import cloudinary.uploader
from fastapi import UploadFile, HTTPException
import uuid
import time

cloudinary.config(
    cloud_name="dzlnapkgf",
    api_key="487264813524569",
    api_secret="MevtID4D-iESC5rg7KUrQ3LV2q4",
    secure=True
)

class CloudinaryService:
    """
    Service upload & download PDF với Cloudinary
    - Ép .pdf
    - Không stream_xxx
    - resource_type = raw
    """

    @staticmethod
    async def upload_pdf(
        file: UploadFile,
        folder: str = "uth_conf_papers"
    ) -> str:

        # 1️⃣ Validate PDF
        if file.content_type != "application/pdf":
            raise HTTPException(400, "Chỉ chấp nhận file PDF")

        if not file.filename or not file.filename.lower().endswith(".pdf"):
            raise HTTPException(400, "File phải có đuôi .pdf")

        # 2️⃣ Read bytes
        await file.seek(0)
        file_bytes = await file.read()
        await file.seek(0)

        # 3️⃣ Clean filename
        base_name = file.filename.rsplit(".", 1)[0]
        safe_name = "".join(
            c if c.isalnum() or c in ["_", "-"] else "_"
            for c in base_name
        )[:50]

        if not safe_name:
            safe_name = "pdf"

        # 4️⃣ Custom public_id (KHÔNG để Cloudinary tự sinh)
        public_id = (
            f"{safe_name}_"
            f"{int(time.time())}_"
            f"{uuid.uuid4().hex[:8]}.pdf"
        )

        # 5️⃣ Upload
        try:
            result = cloudinary.uploader.upload(
                file_bytes,
                folder=folder,
                public_id=public_id,
                resource_type="raw",
                use_filename=False,
                unique_filename=False,
                overwrite=False
            )
        except Exception as e:
            raise HTTPException(500, f"Cloudinary upload failed: {e}")

        # 6️⃣ Validate result
        secure_url = result.get("secure_url")
        returned_public_id = result.get("public_id", "")

        if not secure_url:
            raise HTTPException(500, "Cloudinary không trả về secure_url")

        if "stream" in returned_public_id.lower():
            raise HTTPException(
                500,
                f"Public ID không hợp lệ: {returned_public_id}"
            )

        return secure_url

    # =========================
    # GET DOWNLOAD URL (từ database)
    # =========================
    @staticmethod
    def get_download_url(
        cloudinary_url: str,
        filename: str = "file.pdf"
    ) -> str:
        """
        Trả về URL gốc từ database, chỉ đảm bảo đúng resource_type=raw
        Không thêm fl_attachment
        """
        from urllib.parse import urlparse, urlunparse
        
        parsed = urlparse(cloudinary_url)
        path = parsed.path

        # Chỉ đảm bảo là /raw/upload/ (không thêm fl_attachment)
        if "/image/upload/" in path:
            path = path.replace("/image/upload/", "/raw/upload/")
        
        # Xóa fl_attachment nếu có
        if "fl_attachment" in path:
            # Tìm và xóa phần fl_attachment:filename/
            import re
            path = re.sub(r'/fl_attachment:[^/]+/', '/', path)

        return urlunparse(
            (parsed.scheme, parsed.netloc, path,
             parsed.params, parsed.query, parsed.fragment)
        )

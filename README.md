# UTH Conference Management System (UTH-ConfMS)

Hệ thống quản lý hội nghị khoa học trực tuyến dành cho Trường Đại học Giao thông vận tải TP.HCM (UTH). Hệ thống hỗ trợ toàn bộ quy trình tổ chức hội nghị từ nộp bài, phân biện, ra quyết định đến công bố kỷ yếu.

## 🚀 Tính Năng Chính

*   **Đa vai trò người dùng:**
    *   **Admin:** Quản lý hệ thống, cấu hình Tenants (đơn vị tổ chức), quản lý User.
    *   **Chair (Trưởng ban):** Quản lý hội nghị, tạo Track, phân công Reviewer, ra quyết định (Accept/Reject), gửi mail thông báo.
    *   **Reviewer (Phản biện):** Thẩm định bài báo, gửi nhận xét, trao đổi với tác giả (Rebuttal).
    *   **Author (Tác giả):** Nộp bài (Abstract/Fullpaper), theo dõi trạng thái, nộp Camera-ready.
*   **Quy trình nộp & duyệt bài:** Hỗ trợ quy trình Single-blind hoặc Double-blind review.
*   **Hỗ trợ AI:** Tích hợp Google Gemini để hỗ trợ Reviewer tóm tắt bài báo, gợi ý nhận xét và hỗ trợ Chair soạn email.
*   **Email & Thông báo:** Hệ thống gửi email tự động (SMTP), hỗ trợ template tùy chỉnh.
*   **Kỷ yếu & Thống kê:** Xuất danh sách bài báo, thống kê số lượng bài nộp/duyệt, xuất file Excel/PDF.
*   **SSO:** Đăng nhập qua Google.

## 🛠️ Công Nghệ Sử Dụng

### Backend (Server)
*   **Ngôn ngữ:** Python 3.11+
*   **Framework:** FastAPI
*   **Database:** PostgreSQL (sử dụng SQLAlchemy ORM & Asyncpg)
*   **Migrations:** Alembic
*   **AI:** Google Generative AI (Gemini)
*   **Storage:** Cloudinary (lưu trữ PDF/Images)
*   **Email:** SMTP (Gmail/Outlook...)

### Frontend (Client)
*   **Framework:** React (Vite)
*   **Styling:** Tailwind CSS + Lucide React Icons
*   **State Management:** Zustand
*   **Editor:** React Quill
*   **Network:** Axios

## 📦 Cài Đặt & Triển Khai

### 1. Yêu cầu hệ thống
*   Python 3.11 trở lên
*   Node.js 18 trở lên
*   PostgreSQL 14 trở lên

### 2. Cài đặt Backend

```bash
cd server

# Tạo môi trường ảo (khuyến nghị)
python -m venv venv
# Windows
.\venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# Cài đặt dependencies
pip install -r src/requirements.txt
```

**Cấu hình biến môi trường (`server/.env`):**
Tạo file `.env` trong thư mục `server/` với nội dung mẫu:

```ini
DATABASE_URL=postgresql+asyncpg://user:password@localhost/uth_confms_db
SECRET_KEY=your_secret_key_here_Please_Change_Identify
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=3000

# Google OAuth (SSO)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback

# Cloudinary (File Uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# SMTP Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM_EMAIL=your_email@gmail.com
SMTP_FROM_NAME="UTH Conference System"
FRONTEND_URL=http://localhost:5173

# Google Gemini AI
GOOGLE_API_KEY=your_gemini_api_key
```

**Chạy Database Migrations:**
```bash
# Đảm bảo database đã được tạo trong PostgreSQL
alembic upgrade head
```

**Chạy Server:**
```bash
cd src
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
Swagger UI sẽ có tại: `http://localhost:8000/docs`

### 3. Cài đặt Frontend

```bash
cd client

# Cài đặt packages
npm install

# Chạy development server
npm run dev
```
Truy cập web tại: `http://localhost:5173`

**Cấu hình Frontend (`client/.env`):**
```ini
VITE_API_URL=http://localhost:8000/api/v1
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

## 🔄 Quy trình triển khai (Deployment)
1.  **Backend:**
    *   Sử dụng Docker (có sẵn `Dockerfile` trong `server/`).
    *   Hoặc chạy trực tiếp với `gunicorn` + `uvicorn worker` trên Linux Service.
    *   Cấu hình Reverse Proxy (Nginx) trỏ về port 8000.
2.  **Frontend:**
    *   Build production: `npm run build`.
    *   Serve thư mục `dist` bằng Nginx/Apache hoặc deploy lên Vercel/Netlify.
3.  **Database:**
    *   Backup database định kỳ.
    *   Đảm bảo chạy `alembic upgrade head` mỗi khi deploy code mới.

## 📝 License
Dự án được phát triển nội bộ cho UTH.

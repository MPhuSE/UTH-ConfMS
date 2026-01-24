# Prompt Ngắn Gọn để Vẽ Sequence Diagram - UTH-ConfMS

Vẽ sequence diagram cho hệ thống quản lý hội nghị khoa học với các role và luồng sau:

## Roles
- **Admin** (đỏ): Quản lý toàn hệ thống, có tất cả quyền
- **Chair** (cam): Quản lý conference, assign reviewers, đưa ra decisions
- **Reviewer** (xanh lá): Xem assignments, submit reviews, declare COI, place bids
- **Author** (xanh dương): Submit papers, xem submissions, submit rebuttals, upload camera-ready
- **System/Database** (xám): Xử lý requests, lưu trữ dữ liệu

## 8 Luồng Chính Cần Vẽ

### 1. Conference Creation & Setup
Admin/Chair → Tạo conference → Tạo tracks → Cập nhật CFP → Thiết lập workflow (rebuttal, camera-ready deadlines)

### 2. Paper Submission
Author → Xem conferences → Chọn conference → Submit paper (PDF, title, abstract, track) → System upload PDF lên Cloudinary → Lưu vào database

### 3. Review Assignment
Chair/Admin → Xem submissions → Assign reviewer (hoặc auto-assign) → System check COI → Lưu assignment → Gửi email cho reviewer

### 4. Review Process
Reviewer → Xem assignments → Download PDF → Submit review (score, recommendation, comments) → System lưu review → Update assignment status

### 5. Decision Making
Chair/Admin → Xem tất cả reviews của submission → Đưa ra decision (Accept/Reject/Revision) → System lưu decision → Update submission status → Gửi email cho author

### 6. Rebuttal Flow
Author → Xem reviews → Submit rebuttal → System lưu rebuttal → Gửi email cho reviewers → Reviewers xem và phản hồi rebuttal

### 7. COI Declaration
Reviewer → Check COI trước khi review → Declare COI nếu có → System lưu COI → Gửi email cho chair

### 8. Bidding Flow
Reviewer → Xem submissions (blind mode) → Place bid (want/cannot/no preference) → System lưu bid → Chair dùng bids để auto-assign

## Format Yêu Cầu
- PlantUML hoặc Mermaid
- Có activation boxes
- Có notes cho deadline checks, COI checks
- Màu sắc phân biệt roles
- Export được PNG/SVG

## Lưu Ý
- Tất cả requests cần JWT authentication
- Deadline enforcement: submission, review, rebuttal, camera-ready
- Blind mode: reviewer không thấy author info
- COI checking tự động trước khi assign
- Audit logging cho mọi thao tác quan trọng
- Email notifications cho các events quan trọng

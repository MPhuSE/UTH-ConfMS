# Prompt để vẽ Sequence Diagram cho UTH-ConfMS

## Yêu cầu
Vẽ sequence diagram (sơ đồ trình tự) cho hệ thống quản lý hội nghị khoa học UTH-ConfMS với các role và luồng hoạt động sau:

## Các Role trong hệ thống

1. **Admin** (Quản trị viên hệ thống)
   - Có tất cả quyền của Chair
   - Quản lý users, system config, SMTP, quotas
   - Quản lý tất cả conferences, submissions, reviews, decisions

2. **Chair** (Chủ tịch hội nghị)
   - Tạo và quản lý conference
   - Assign reviewers cho submissions
   - Đưa ra decisions (Accept/Reject/Revision)
   - Quản lý workflow (rebuttal, camera-ready deadlines)
   - Xem tất cả submissions, reviews, assignments

3. **Reviewer** (Người đánh giá)
   - Xem assignments được giao cho mình
   - Submit reviews cho submissions
   - Declare COI (Conflict of Interest)
   - Place bids cho submissions
   - Xem và phản hồi rebuttals

4. **Author** (Tác giả)
   - Submit papers (upload PDF, title, abstract, chọn track)
   - Xem submissions của mình
   - Update submissions (trước deadline)
   - Submit rebuttals
   - Upload camera-ready versions (sau khi được accept)
   - Xem decisions và reviews

5. **System** (Hệ thống)
   - Database
   - Cloudinary (file storage)
   - Email Service (SMTP)
   - Audit Logging

---

## Các Sequence Diagram cần vẽ

### 1. Conference Creation & Setup Flow

**Actors:** Admin/Chair, System, Database

**Flow:**
1. Admin/Chair → System: POST /conferences (tạo hội nghị mới)
   - Input: name, abbreviation, description, website, location, dates, deadlines, tracks
2. System → Database: Lưu conference và tracks
3. Database → System: Trả về conference ID
4. System → Admin/Chair: Response với conference details
5. Admin/Chair → System: PUT /conferences/{id}/cfp (cập nhật CFP - Call for Papers)
6. System → Database: Lưu CFP content
7. Admin/Chair → System: PATCH /conferences/{id}/workflow (thiết lập workflow: rebuttal, camera-ready)
8. System → Database: Lưu workflow settings
9. System → Admin/Chair: Conference ready

---

### 2. Paper Submission Flow

**Actors:** Author, System, Cloudinary, Database

**Flow:**
1. Author → System: GET /conferences (xem danh sách conferences)
2. System → Database: Query conferences
3. Database → System: Danh sách conferences
4. System → Author: Hiển thị conferences với CFP status
5. Author → System: GET /conferences/{id} (xem chi tiết conference)
6. System → Author: Conference details (deadlines, tracks, workflow status)
7. Author → System: POST /submissions (submit paper)
   - Input: title, abstract, track_id, conference_id, PDF file, co-authors
8. System → System: Kiểm tra submission deadline
9. System → Cloudinary: Upload PDF file
10. Cloudinary → System: Trả về file URL
11. System → Database: Lưu submission (status: "SUBMITTED")
12. Database → System: Submission ID
13. System → Database: Tạo audit log
14. System → Author: Response với submission details

---

### 3. Review Assignment Flow

**Actors:** Chair/Admin, System, Database, Reviewer

**Flow:**
1. Chair/Admin → System: GET /submissions?conference_id={id} (xem submissions)
2. System → Database: Query submissions
3. Database → System: Danh sách submissions
4. System → Chair/Admin: Hiển thị submissions
5. Chair/Admin → System: POST /reviews/assignments (assign reviewer)
   - Input: submission_id, reviewer_id, auto_assigned
6. System → Database: Kiểm tra COI (Conflict of Interest)
7. System → Database: Kiểm tra reviewer đã có assignment chưa
8. System → Database: Lưu review assignment (status: "ASSIGNED")
9. Database → System: Assignment ID
10. System → Database: Tạo audit log
11. System → Email Service: Gửi email thông báo cho Reviewer
12. Email Service → Reviewer: Email notification
13. System → Chair/Admin: Response với assignment details

**Alternative: Auto-assign**
1. Chair/Admin → System: POST /reviews/assignments/auto (auto-assign reviewers)
2. System → Database: Query submissions và reviewers
3. System → System: Algorithm tự động assign (dựa trên COI, workload, bids)
4. System → Database: Lưu multiple assignments
5. System → Email Service: Gửi emails cho tất cả reviewers được assign
6. System → Chair/Admin: Response với assignments

---

### 4. Review Process Flow

**Actors:** Reviewer, System, Database, Author (indirect)

**Flow:**
1. Reviewer → System: GET /reviews/assignments/my-assignments (xem assignments)
2. System → Database: Query assignments của reviewer
3. Database → System: Danh sách assignments
4. System → Reviewer: Hiển thị assignments
5. Reviewer → System: GET /submissions/{id}/download (download PDF)
6. System → Cloudinary: Get PDF file
7. Cloudinary → System: PDF file
8. System → Reviewer: PDF file
9. Reviewer → System: POST /reviews/submit/{submission_id} (submit review)
   - Input: score, recommendation (Accept/Reject/Revision), comments, confidence
10. System → Database: Kiểm tra review deadline
11. System → Database: Lưu review (status: "COMPLETED")
12. Database → System: Review ID
13. System → Database: Update assignment status
14. System → Database: Tạo audit log
15. System → Reviewer: Response với review details

**Alternative: Reviewer Decline**
1. Reviewer → System: POST /reviews/assignments/{submission_id}/decline (decline assignment)
2. System → Database: Update assignment status = "DECLINED"
3. System → Database: Tạo audit log
4. System → Reviewer: Response

---

### 5. Decision Making Flow

**Actors:** Chair/Admin, System, Database, Author, Email Service

**Flow:**
1. Chair/Admin → System: GET /reviews?submission_id={id} (xem tất cả reviews của submission)
2. System → Database: Query reviews
3. Database → System: Danh sách reviews
4. System → Chair/Admin: Hiển thị reviews
5. Chair/Admin → System: POST /decisions (đưa ra decision)
   - Input: submission_id, decision (Accept/Reject/Revision), comments
6. System → Database: Kiểm tra có đủ reviews chưa
7. System → Database: Lưu decision
8. Database → System: Decision ID
9. System → Database: Update submission status
10. System → Database: Tạo audit log
11. System → Email Service: Gửi email thông báo cho Author
12. Email Service → Author: Email với decision
13. System → Chair/Admin: Response với decision details

**If Decision = Accept:**
14. System → Database: Enable camera-ready workflow (nếu đã được config)
15. Author → System: GET /submissions/{id} (xem decision)
16. System → Author: Decision details
17. Author → System: POST /camera-ready/upload (upload camera-ready version)
18. System → Cloudinary: Upload camera-ready PDF
19. Cloudinary → System: File URL
20. System → Database: Lưu camera-ready file
21. System → Author: Response

---

### 6. Rebuttal Flow

**Actors:** Author, System, Database, Reviewer, Chair/Admin

**Flow:**
1. Author → System: GET /submissions/{id} (xem reviews sau khi có decision)
2. System → Database: Query submission và reviews
3. Database → System: Submission với reviews
4. System → Author: Hiển thị reviews (nếu được phép)
5. Author → System: POST /rebuttals (submit rebuttal)
   - Input: submission_id, rebuttal_text
6. System → Database: Kiểm tra rebuttal deadline và rebuttal_open status
7. System → Database: Lưu rebuttal
8. Database → System: Rebuttal ID
9. System → Database: Tạo audit log
10. System → Email Service: Gửi email thông báo cho Reviewers và Chair
11. Email Service → Reviewer/Chair: Email notification
12. Reviewer → System: GET /rebuttals/{submission_id} (xem rebuttal)
13. System → Database: Query rebuttal
14. System → Reviewer: Hiển thị rebuttal
15. Reviewer → System: POST /rebuttals/{submission_id}/response (phản hồi rebuttal - nếu được phép)
16. System → Database: Lưu rebuttal response
17. System → Reviewer: Response

---

### 7. COI (Conflict of Interest) Declaration Flow

**Actors:** Reviewer, System, Database, Chair/Admin

**Flow:**
1. Reviewer → System: GET /reviews/coi/check/{submission_id} (kiểm tra COI trước khi review)
2. System → Database: Query COI declarations
3. Database → System: COI status
4. System → Reviewer: COI check result
5. Reviewer → System: POST /reviews/coi (declare COI)
   - Input: submission_id, coi_type, reason
6. System → Database: Lưu COI declaration
7. System → Database: Tạo audit log
8. System → Email Service: Gửi email thông báo cho Chair
9. System → Reviewer: Response
10. Chair/Admin → System: GET /reviews/coi/conferences/{id} (xem tất cả COIs)
11. System → Database: Query COIs
12. System → Chair/Admin: Danh sách COIs

---

### 8. Bidding Flow

**Actors:** Reviewer, System, Database, Chair/Admin

**Flow:**
1. Reviewer → System: GET /conferences/{id}/submissions/public (xem submissions để bid)
2. System → Database: Query submissions (chỉ title, abstract - blind mode)
3. Database → System: Danh sách submissions
4. System → Reviewer: Hiển thị submissions
5. Reviewer → System: POST /reviews/bids (place bid)
   - Input: submission_id, bid_type (WANT_TO_REVIEW / CANNOT_REVIEW / NO_PREFERENCE)
6. System → Database: Lưu bid
7. System → Database: Tạo audit log
8. System → Reviewer: Response
9. Chair/Admin → System: GET /reviews/bids/conferences/{id} (xem bids khi auto-assign)
10. System → Database: Query bids
11. System → Chair/Admin: Danh sách bids (dùng cho auto-assign algorithm)

---

## Yêu cầu kỹ thuật cho Sequence Diagram

1. **Format:** Vẽ bằng PlantUML, Mermaid, hoặc UML standard notation
2. **Actors:** Hiển thị tất cả actors ở phía trên
3. **Lifelines:** Vẽ lifelines (vertical lines) cho mỗi actor
4. **Messages:** 
   - Request messages: solid arrows với label (method + endpoint)
   - Response messages: dashed arrows
   - Error messages: red arrows
5. **Activation boxes:** Hiển thị activation boxes khi actor đang xử lý
6. **Notes:** Thêm notes cho các điều kiện quan trọng (deadline checks, COI checks, etc.)
7. **Loops/Alternatives:** Sử dụng alt/opt/loop frames cho các luồng thay thế
8. **Colors:** 
   - Admin: Red
   - Chair: Orange/Yellow
   - Reviewer: Green
   - Author: Blue
   - System/Database: Gray

---

## Lưu ý quan trọng

1. **Authentication:** Tất cả requests đều cần JWT token (không hiển thị trong diagram nhưng cần lưu ý)
2. **Authorization:** Mỗi endpoint có role-based access control
3. **Deadlines:** Nhiều operations bị giới hạn bởi deadlines (submission, review, rebuttal, camera-ready)
4. **Blind Mode:** Trong double-blind mode, reviewer không thấy author info
5. **COI Checking:** Tự động check COI trước khi assign reviewer
6. **Audit Logging:** Mọi thao tác quan trọng đều được log
7. **Email Notifications:** Gửi email cho các events quan trọng (assignment, decision, rebuttal)

---

## Output mong đợi

Vẽ 8 sequence diagrams riêng biệt cho 8 flows trên, hoặc 1 diagram tổng hợp nếu có thể. Mỗi diagram cần:
- Rõ ràng, dễ đọc
- Đầy đủ các bước quan trọng
- Có notes giải thích các điều kiện đặc biệt
- Sử dụng màu sắc để phân biệt roles
- Có thể export thành PNG/SVG để embed vào tài liệu

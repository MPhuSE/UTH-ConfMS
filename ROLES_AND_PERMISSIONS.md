# Phân Quyền và Chức Năng Theo Role

Tài liệu này mô tả chi tiết các chức năng mà mỗi role có thể thực hiện trong hệ thống UTH-ConfMS.

## Tổng Quan Các Role

Hệ thống có 4 role chính:
1. **Admin** - Quản trị viên hệ thống
2. **Chair** - Chủ tịch hội nghị
3. **Reviewer** - Người đánh giá bài báo
4. **Author** - Tác giả nộp bài

---

## 🔴 ADMIN (Quản trị viên hệ thống)

### Quyền truy cập:
- Có tất cả quyền của **Chair**
- Quản lý toàn bộ hệ thống

### Chức năng chính:

#### 1. Quản lý Người dùng
- ✅ Xem danh sách tất cả người dùng
- ✅ Tạo người dùng mới
- ✅ Cập nhật thông tin người dùng
- ✅ Xóa người dùng
- ✅ Set role cho người dùng (chỉ 1 role/user)
- ✅ Xem thông tin chi tiết người dùng
- ✅ Tìm kiếm người dùng

#### 2. Quản lý Hệ thống
- ✅ Cấu hình SMTP (email server)
- ✅ Cấu hình Quota (giới hạn submissions, reviews, file size)
- ✅ Xem System Health (trạng thái database, hệ thống)
- ✅ Quản lý Tenants (nếu có multi-tenant)
- ✅ Cấu hình AI Feature Flags

#### 3. Quản lý Hội nghị
- ✅ Tạo hội nghị mới
- ✅ Cập nhật thông tin hội nghị
- ✅ Xóa hội nghị
- ✅ Xem tất cả hội nghị
- ✅ Cập nhật CFP (Call for Papers)
- ✅ Cập nhật Workflow Settings (rebuttal, camera-ready deadlines)

#### 4. Quản lý Submissions
- ✅ Xem tất cả submissions
- ✅ Xem chi tiết submission
- ✅ Download PDF submissions
- ✅ Cập nhật submission (title, abstract, status)
- ✅ Xóa submission

#### 5. Quản lý Reviews
- ✅ Assign reviewer cho submission
- ✅ Auto-assign reviewers
- ✅ Unassign reviewer
- ✅ Xem tất cả assignments
- ✅ Xem tất cả reviews
- ✅ Xem review progress của conference
- ✅ Xem COI (Conflict of Interest) của tất cả submissions

#### 6. Quản lý Decisions
- ✅ Đưa ra quyết định cho submission (Accept/Reject/Revision)
- ✅ Xem tất cả decisions của conference
- ✅ Xem thống kê decisions

#### 7. Quản lý Notifications
- ✅ Gửi thông báo kết quả cho 1 submission
- ✅ Gửi bulk notifications cho toàn bộ submissions trong conference

#### 8. Quản lý Proceedings
- ✅ Export proceedings (danh sách papers đã accepted)

#### 9. Audit & Monitoring
- ✅ Xem audit logs (tất cả hành động trong hệ thống)
- ✅ Xem system health

#### 10. Quản lý Roles
- ✅ Xem danh sách roles
- ✅ Xem users theo role

---

## 🟡 CHAIR (Chủ tịch hội nghị)

### Quyền truy cập:
- Quản lý hội nghị và submissions
- Không có quyền quản lý users và system config

### Chức năng chính:

#### 1. Quản lý Hội nghị
- ✅ Tạo hội nghị mới
- ✅ Cập nhật thông tin hội nghị
- ✅ Xóa hội nghị
- ✅ Xem tất cả hội nghị
- ✅ Cập nhật CFP (Call for Papers)
- ✅ Cập nhật Workflow Settings (rebuttal, camera-ready deadlines)

#### 2. Quản lý Submissions
- ✅ Xem tất cả submissions trong conference
- ✅ Xem chi tiết submission
- ✅ Download PDF submissions
- ✅ Cập nhật submission (title, abstract, status)
- ✅ Xóa submission

#### 3. Quản lý Reviews
- ✅ Assign reviewer cho submission
- ✅ Auto-assign reviewers
- ✅ Unassign reviewer
- ✅ Xem tất cả assignments
- ✅ Xem tất cả reviews
- ✅ Xem review progress của conference
- ✅ Xem COI (Conflict of Interest) của tất cả submissions

#### 4. Quản lý Decisions
- ✅ Đưa ra quyết định cho submission (Accept/Reject/Revision)
- ✅ Xem tất cả decisions của conference
- ✅ Xem thống kê decisions

#### 5. Quản lý Notifications
- ✅ Gửi thông báo kết quả cho 1 submission
- ✅ Gửi bulk notifications cho toàn bộ submissions trong conference

#### 6. Quản lý Proceedings
- ✅ Export proceedings (danh sách papers đã accepted)

#### 7. Quản lý Reviewers
- ✅ Xem danh sách reviewers
- ✅ Quản lý assignments

#### 8. Quản lý Schedule
- ✅ Quản lý lịch trình hội nghị

#### 9. Quản lý Email Templates
- ✅ Tạo và chỉnh sửa email templates
- ✅ Sử dụng AI để tạo email templates

#### 10. Audit & Monitoring
- ✅ Xem audit logs (chỉ liên quan đến conference của họ)

#### 11. Discussion
- ✅ Tham gia internal discussion với reviewers về submissions

---

## 🟢 REVIEWER (Người đánh giá)

### Quyền truy cập:
- Chỉ xem và thao tác với assignments/reviews được giao cho mình

### Chức năng chính:

#### 1. Quản lý Assignments
- ✅ Xem danh sách assignments được giao cho mình
- ✅ Xem chi tiết assignment
- ❌ Không thể tự assign/unassign

#### 2. Quản lý Reviews
- ✅ Submit review cho submission được assign
- ✅ Xem reviews của chính mình
- ✅ Cập nhật review (nếu chưa quá deadline)
- ❌ Không thể xem reviews của reviewers khác (trừ khi là admin/chair)

#### 3. Quản lý COI (Conflict of Interest)
- ✅ Declare COI cho submissions
- ✅ Xem COI của chính mình
- ✅ Check COI trước khi review

#### 4. Bidding
- ✅ Place bid cho submissions (want to review / cannot review / no preference)
- ✅ Xem bids của chính mình

#### 5. Rebuttal
- ✅ Xem rebuttal từ authors
- ✅ Phản hồi rebuttal (nếu được phép)

#### 6. Discussion
- ✅ Tham gia internal discussion với chair và reviewers khác về submissions

#### 7. Download
- ✅ Download PDF của submissions được assign

---

## 🔵 AUTHOR (Tác giả)

### Quyền truy cập:
- Chỉ xem và thao tác với submissions của chính mình

### Chức năng chính:

#### 1. Quản lý Submissions
- ✅ Tạo submission mới (nộp bài báo)
  - Upload PDF file
  - Nhập title, abstract
  - Chọn conference và track
  - Thêm co-authors
- ✅ Xem danh sách submissions của mình
- ✅ Xem chi tiết submission
- ✅ Cập nhật submission (title, abstract, file)
  - Chỉ được update trước deadline
- ✅ Xóa/withdraw submission
- ✅ Download PDF của submissions của mình

#### 2. Camera-Ready
- ✅ Upload camera-ready version (sau khi được accept)
- ✅ Xem camera-ready đã upload

#### 3. Rebuttal
- ✅ Submit rebuttal cho submission của mình
- ✅ Cập nhật rebuttal (nếu chưa quá deadline)
- ✅ Xem rebuttal đã submit

#### 4. Xem Kết quả
- ✅ Xem decision (Accept/Reject/Revision)
- ✅ Xem reviews (nếu được phép)
- ✅ Xem kết quả cuối cùng

#### 5. Profile
- ✅ Cập nhật profile (full_name, affiliation, phone, website, avatar)
- ✅ Đổi mật khẩu

#### 6. Search
- ✅ Tìm kiếm users để thêm làm co-author

---

## So Sánh Quyền Truy Cập

| Chức năng | Admin | Chair | Reviewer | Author |
|-----------|-------|-------|----------|--------|
| **Quản lý Users** | ✅ | ❌ | ❌ | ❌ |
| **System Config** | ✅ | ❌ | ❌ | ❌ |
| **Tạo Conference** | ✅ | ✅ | ❌ | ❌ |
| **Assign Reviewers** | ✅ | ✅ | ❌ | ❌ |
| **Make Decisions** | ✅ | ✅ | ❌ | ❌ |
| **Submit Review** | ❌ | ❌ | ✅ | ❌ |
| **Submit Paper** | ❌ | ❌ | ❌ | ✅ |
| **View All Submissions** | ✅ | ✅ | ❌ | ❌ |
| **View Own Submissions** | ✅ | ✅ | ❌ | ✅ |
| **View All Reviews** | ✅ | ✅ | ❌ | ❌ |
| **View Own Reviews** | ✅ | ✅ | ✅ | ❌ |
| **Export Proceedings** | ✅ | ✅ | ❌ | ❌ |
| **Send Notifications** | ✅ | ✅ | ❌ | ❌ |
| **View Audit Logs** | ✅ | ✅ | ❌ | ❌ |

---

## Lưu ý Quan Trọng

1. **Mỗi user chỉ có 1 role**: Hệ thống đã được cấu hình để mỗi user chỉ có thể có 1 role duy nhất.

2. **Admin có quyền cao nhất**: Admin có thể làm tất cả những gì Chair có thể làm, cộng thêm quyền quản lý users và system.

3. **Chair quản lý conference**: Chair có quyền quản lý toàn bộ conference, submissions, reviews, và decisions.

4. **Reviewer chỉ xem assignments của mình**: Reviewer không thể xem assignments/reviews của reviewers khác (trừ khi là admin/chair).

5. **Author chỉ quản lý submissions của mình**: Author không thể xem hoặc chỉnh sửa submissions của authors khác.

6. **Deadline enforcement**: Nhiều chức năng bị giới hạn bởi deadline (submission deadline, review deadline, rebuttal deadline).

7. **COI checking**: Hệ thống tự động kiểm tra COI trước khi assign reviewer.

8. **Blind review**: Tùy vào cấu hình conference (double-blind), reviewer có thể không thấy thông tin author.

---

## API Endpoints Theo Role

### Admin Only
- `GET /users` - List all users
- `POST /users` - Create user
- `PUT /users/{id}` - Update user
- `DELETE /users/{id}` - Delete user
- `PUT /users/{id}/roles` - Set user role
- `GET /admin/smtp-config` - Get SMTP config
- `PUT /admin/smtp-config` - Update SMTP config
- `GET /admin/quotas` - Get quota config
- `PUT /admin/quotas` - Update quota config
- `GET /admin/system-health` - Get system health

### Admin or Chair
- `POST /conferences` - Create conference
- `PUT /conferences/{id}` - Update conference
- `DELETE /conferences/{id}` - Delete conference
- `POST /reviews/assignments` - Assign reviewer
- `POST /reviews/assignments/auto` - Auto-assign reviewers
- `DELETE /reviews/assignments/{submission_id}/{reviewer_id}` - Unassign reviewer
- `POST /decisions` - Make decision
- `GET /decisions/conferences/{id}` - Get decisions
- `POST /notifications/send-result/{id}` - Send notification
- `POST /notifications/send-results/conferences/{id}` - Bulk notifications
- `GET /proceedings/conferences/{id}/export` - Export proceedings
- `GET /audit-logs` - View audit logs

### Reviewer Only
- `GET /reviews/assignments/my-assignments` - Get my assignments
- `POST /reviews/submit/{submission_id}` - Submit review
- `GET /reviews/my-reviews` - Get my reviews
- `POST /reviews/coi` - Declare COI
- `GET /reviews/coi/my-cois` - Get my COIs
- `GET /reviews/coi/check/{submission_id}` - Check COI
- `POST /reviews/bids` - Place bid
- `GET /reviews/bids/my-bids` - Get my bids

### Author Only
- `POST /submissions` - Submit paper
- `GET /submissions/me` - Get my submissions
- `PUT /submissions/{id}` - Update my submission
- `DELETE /submissions/{id}` - Delete my submission
- `POST /camera-ready/upload` - Upload camera-ready
- `POST /rebuttals` - Submit rebuttal

### All Authenticated Users
- `GET /users/me` - Get my profile
- `PUT /users/me` - Update my profile
- `GET /conferences` - List conferences
- `GET /conferences/{id}` - Get conference details
- `GET /submissions/{id}` - Get submission (with permission check)
- `GET /submissions/{id}/download` - Download PDF (with permission check)

---

## Frontend Routes Theo Role

### Admin Routes (`/dashboard/admin/*`)
- `/dashboard/admin` - Admin dashboard
- `/dashboard/admin/users` - User management
- `/dashboard/admin/smtp-config` - SMTP configuration
- `/dashboard/admin/quota-config` - Quota configuration
- `/dashboard/admin/system-health` - System health
- `/dashboard/admin/tenants` - Tenant management

### Chair Routes (`/dashboard/chair/*`)
- `/dashboard/chair/dashboard` - Chair dashboard
- `/dashboard/chair/conferences` - Conference management
- `/dashboard/chair/assignments/:conferenceId` - Assignment management
- `/dashboard/chair/decisions/:conferenceId` - Decision management
- `/dashboard/chair/reviewers/:conferenceId` - Reviewer management
- `/dashboard/chair/review-progress/:conferenceId` - Review progress
- `/dashboard/chair/coi/:conferenceId` - COI management
- `/dashboard/chair/schedule/:conferenceId` - Schedule management
- `/dashboard/chair/proceedings/:conferenceId` - Proceedings export
- `/dashboard/chair/notifications/:conferenceId` - Bulk notifications
- `/dashboard/chair/email-templates/:conferenceId` - Email templates

### Reviewer Routes (`/dashboard/reviewer/*`)
- `/dashboard/reviewer/dashboard` - Reviewer dashboard
- `/dashboard/reviewer/assignments` - My assignments
- `/dashboard/reviewer/reviews` - My reviews
- `/dashboard/reviewer/review/:submissionId` - Review form
- `/dashboard/reviewer/bidding/:conferenceId` - Bidding & COI
- `/dashboard/reviewer/check-coi` - Check COI
- `/dashboard/reviewer/rebuttal/:submissionId` - View rebuttal

### Author Routes (`/dashboard/*`)
- `/dashboard/overview` - Author dashboard
- `/dashboard/my-submissions` - My submissions
- `/dashboard/submission` - Submit new paper
- `/dashboard/submission/:id` - Submission detail
- `/dashboard/submission/edit/:paperId` - Edit submission
- `/dashboard/submission/:id/camera-ready` - Upload camera-ready
- `/dashboard/results` - View results
- `/dashboard/profile` - My profile
- `/dashboard/rebuttal/:submissionId` - Submit rebuttal

### Shared Routes
- `/dashboard/audit-logs` - Audit logs (Admin/Chair)
- `/dashboard/submission/:id/discussion` - Internal discussion (Chair/Reviewer/Admin)

---

*Tài liệu này được tạo tự động dựa trên phân tích codebase. Cập nhật lần cuối: 2026-01-24*

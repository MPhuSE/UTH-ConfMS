# UTH-ConfMS - Cấu trúc Pages và Components

## Tổng quan

Tài liệu này mô tả cấu trúc đầy đủ các pages và components cho hệ thống UTH-ConfMS theo các vai trò.

## Cấu trúc thư mục

```
client/src/
├── features/
│   ├── author/
│   │   └── pages/
│   │       ├── MySubmissionsPage.jsx ✅
│   │       ├── SubmissionDetailPage.jsx ✅
│   │       ├── CameraReadyUploadPage.jsx (cần tạo)
│   │       └── ViewResultsPage.jsx (cần tạo)
│   ├── reviewer/
│   │   └── pages/
│   │       ├── ReviewerDashboard.jsx ✅
│   │       ├── ReviewFormPage.jsx (đã có, cần cập nhật)
│   │       ├── COIDeclarationPage.jsx (cần tạo)
│   │       └── BiddingPage.jsx (cần tạo)
│   ├── chair/
│   │   └── pages/
│   │       ├── AssignmentManagementPage.jsx ✅
│   │       ├── DecisionManagementPage.jsx ✅
│   │       ├── ConferenceManagementPage.jsx (cần tạo)
│   │       ├── TrackManagementPage.jsx (đã có - TrackTopicManagement)
│   │       ├── PCManagementPage.jsx (đã có - PcManagement)
│   │       ├── BulkDecisionPage.jsx (đã có - BulkDecision)
│   │       └── BulkNotificationPage.jsx (cần tạo)
│   └── admin/
│       └── pages/
│           ├── UserManagementPage.jsx ✅
│           ├── SystemHealthPage.jsx (cần tạo)
│           ├── SMTPConfigPage.jsx (đã có - SmtpConfig)
│           ├── QuotaConfigPage.jsx (cần tạo)
│           └── AuditLogsPage.jsx (đã có - auditLogs)
├── components/
│   ├── Modal.jsx ✅
│   ├── Table.jsx ✅
│   ├── Alert.jsx ✅
│   ├── Button.jsx (đã có)
│   └── Input.jsx (đã có)
└── services/
    └── (đã có đầy đủ các services)
```

## Pages theo vai trò

### 1. Author (Tác giả)

#### Pages đã tạo:
- ✅ `MySubmissionsPage.jsx` - Danh sách bài nộp của tôi
- ✅ `SubmissionDetailPage.jsx` - Chi tiết bài nộp

#### Pages cần tạo/cập nhật:
- 📝 `PaperSubmissionPage.jsx` - Nộp bài mới (đã có, cần kiểm tra)
- 📝 `CameraReadyUploadPage.jsx` - Upload camera-ready version
- 📝 `ViewResultsPage.jsx` - Xem kết quả và reviews

#### Chức năng Author:
1. ✅ Xem danh sách bài nộp
2. ✅ Xem chi tiết bài nộp
3. 📝 Nộp bài mới (title, abstract, file PDF)
4. 📝 Chỉnh sửa bài nộp (trước deadline)
5. 📝 Rút bài nộp
6. 📝 Xem kết quả (accepted/rejected)
7. 📝 Xem reviews (anonymized)
8. 📝 Upload camera-ready (khi accepted)

### 2. Reviewer/PC Member

#### Pages đã tạo:
- ✅ `ReviewerDashboard.jsx` - Dashboard reviewer

#### Pages cần tạo/cập nhật:
- 📝 `ReviewFormPage.jsx` - Form đánh giá (đã có, cần cập nhật)
- 📝 `AssignedPapersPage.jsx` - Danh sách bài được phân công (đã có, cần cập nhật)
- 📝 `COIDeclarationPage.jsx` - Khai báo xung đột lợi ích
- 📝 `BiddingPage.jsx` - Bidding trên các bài nộp

#### Chức năng Reviewer:
1. ✅ Xem dashboard với stats
2. ✅ Xem danh sách bài được phân công
3. 📝 Đánh giá bài nộp (score, comment)
4. 📝 Khai báo COI
5. 📝 Bidding
6. 📝 Internal discussion

### 3. Chair (Program/Track Chair)

#### Pages đã tạo:
- ✅ `AssignmentManagementPage.jsx` - Quản lý phân công reviewer
- ✅ `DecisionManagementPage.jsx` - Quản lý quyết định

#### Pages cần tạo/cập nhật:
- 📝 `ConferenceManagementPage.jsx` - Quản lý hội nghị
- 📝 `TrackManagementPage.jsx` - Quản lý tracks (có sẵn như TrackTopicManagement)
- 📝 `PCManagementPage.jsx` - Quản lý PC members (có sẵn như PcManagement)
- 📝 `BulkDecisionPage.jsx` - Quyết định hàng loạt (đã có)
- 📝 `BulkNotificationPage.jsx` - Gửi thông báo hàng loạt

#### Chức năng Chair:
1. ✅ Phân công reviewers (manual/auto)
2. ✅ Quản lý quyết định
3. 📝 Quản lý conference (CRUD)
4. 📝 Quản lý tracks
5. 📝 Quản lý PC members
6. 📝 Theo dõi tiến độ review
7. 📝 Quyết định hàng loạt
8. 📝 Gửi thông báo hàng loạt
9. 📝 Mở camera-ready round

### 4. Admin (Site Administrator)

#### Pages đã tạo:
- ✅ `UserManagementPage.jsx` - Quản lý người dùng

#### Pages cần tạo/cập nhật:
- 📝 `SystemHealthPage.jsx` - Sức khỏe hệ thống
- 📝 `SMTPConfigPage.jsx` - Cấu hình SMTP (đã có như SmtpConfig)
- 📝 `QuotaConfigPage.jsx` - Cấu hình quotas
- 📝 `AuditLogsPage.jsx` - Xem audit logs (đã có)

#### Chức năng Admin:
1. ✅ Quản lý người dùng (CRUD, roles)
2. 📝 Cấu hình SMTP
3. 📝 Cấu hình quotas
4. 📝 Xem audit logs
5. 📝 Xem system health
6. 📝 Backup/restore (nếu có)

## Routing cần cập nhật

Cần thêm các routes sau vào `app/router/index.jsx`:

```jsx
// Author routes
<Route path="my-submissions" element={<MySubmissionsPage />} />
<Route path="submission/:id" element={<SubmissionDetailPage />} />
<Route path="submission/:id/camera-ready" element={<CameraReadyUploadPage />} />

// Reviewer routes
<Route path="reviewer/dashboard" element={<ReviewerDashboard />} />
<Route path="review/:submissionId" element={<ReviewFormPage />} />
<Route path="coi" element={<COIDeclarationPage />} />
<Route path="bidding" element={<BiddingPage />} />

// Chair routes
<Route path="chair/conferences" element={<ConferenceManagementPage />} />
<Route path="chair/assignments/:conferenceId" element={<AssignmentManagementPage />} />
<Route path="chair/decisions/:conferenceId" element={<DecisionManagementPage />} />
<Route path="chair/bulk-decision" element={<BulkDecisionPage />} />
<Route path="chair/bulk-notification" element={<BulkNotificationPage />} />

// Admin routes
<Route path="admin/users" element={<UserManagementPage />} />
<Route path="admin/system-health" element={<SystemHealthPage />} />
<Route path="admin/quota-config" element={<QuotaConfigPage />} />
```

## API Services đã có

Tất cả các services đã được tạo trong `src/services/`:
- ✅ authService
- ✅ conferenceService
- ✅ userService
- ✅ submissionService
- ✅ reviewService
- ✅ decisionService
- ✅ adminService
- ✅ trackService
- ✅ auditLogService
- ✅ cameraReadyService
- ✅ reportsService
- ✅ emailTemplateService
- ✅ aiService
- ✅ scheduleService
- ✅ notificationService

## Components đã có

- ✅ Modal.jsx
- ✅ Table.jsx
- ✅ Alert.jsx
- ✅ Button.jsx
- ✅ Input.jsx

## Notes

1. Tất cả các pages cần sử dụng services từ `src/services/`
2. Sử dụng toast từ `react-hot-toast` cho notifications
3. Sử dụng các components shared từ `src/components/`
4. Kiểm tra quyền truy cập bằng ProtectedRoute với allowRoles
5. Tất cả API calls đều đã có interceptors trong axios.js (auto refresh token)

## Tiếp theo

Cần tạo các pages còn thiếu và cập nhật routing để hoàn thiện hệ thống.

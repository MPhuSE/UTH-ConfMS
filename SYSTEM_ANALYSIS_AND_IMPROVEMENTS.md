# Phân Tích Hệ Thống và Đề Xuất Cải Thiện

## Tổng Quan

Tài liệu này phân tích hệ thống UTH-ConfMS dựa trên yêu cầu và đề xuất các cải thiện cần thiết.

---

## ✅ CÁC CHỨC NĂNG ĐÃ CÓ

### 1. Core Features
- ✅ User Management (Admin)
- ✅ Conference Management (Admin/Chair)
- ✅ Submission Management (Author/Admin/Chair)
- ✅ Review Management (Reviewer/Admin/Chair)
- ✅ Decision Making (Admin/Chair)
- ✅ Camera-Ready Upload (Author)
- ✅ Rebuttal (Author/Reviewer)
- ✅ PC Invitations (Admin/Chair)
- ✅ Schedule Management (Admin/Chair)
- ✅ Reports & Analytics (Admin/Chair)
- ✅ Notifications (Admin/Chair)
- ✅ Proceedings Export (Admin/Chair)
- ✅ Audit Logs (Admin/Chair)

### 2. AI Features
- ✅ Spell Check & Grammar Check
- ✅ Summary Generation
- ✅ Keyword Extraction
- ✅ Similarity Calculation
- ✅ Email Template Generation
- ✅ AI Feature Flags

### 3. Security & Access Control
- ✅ RBAC (Role-Based Access Control)
- ✅ JWT Authentication
- ✅ Password Hashing
- ✅ COI (Conflict of Interest) Checking
- ✅ Audit Trails

### 4. System Configuration
- ✅ SMTP Configuration (Admin)
- ✅ Quota Configuration (Admin)
- ✅ System Health Monitoring (Admin)
- ✅ Tenant Management (Admin)

---

## ❌ CÁC CHỨC NĂNG THIẾU SÓT

### 1. Public Portal (Quan trọng - Thiếu)
**Yêu cầu:** Public portal for CFP, program, accepted papers (if enabled)

**Hiện trạng:**
- ❌ CFP Public Page chưa kết nối API (chỉ có UI placeholder)
- ❌ Public Program Page (chưa có)
- ❌ Public Accepted Papers Page (chưa có)
- ❌ Public API endpoints không yêu cầu authentication

**Cần bổ sung:**
- [ ] API endpoint: `GET /conferences/{id}/cfp/public` (đã có nhưng cần kiểm tra)
- [ ] API endpoint: `GET /conferences/{id}/program/public`
- [ ] API endpoint: `GET /conferences/{id}/accepted-papers/public`
- [ ] Frontend: Public Program Page
- [ ] Frontend: Public Accepted Papers Page
- [ ] Frontend: CFP Public Page kết nối API thực tế

### 2. PC Member Decline Invitation (Thiếu)
**Yêu cầu:** Reviewer/PC member có thể decline invitation

**Hiện trạng:**
- ❌ Chỉ có accept invitation, không có decline
- ❌ Không có endpoint để decline PC invitation

**Cần bổ sung:**
- [ ] API endpoint: `POST /pc/invitations/decline`
- [ ] Frontend: Decline button trong invitation email/page
- [ ] Update invitation status: "DECLINED"

### 3. OpenAPI/Swagger Documentation (Thiếu)
**Yêu cầu:** OpenAPI/Swagger for standardized REST

**Hiện trạng:**
- ❌ FastAPI có sẵn Swagger nhưng chưa được cấu hình đầy đủ
- ❌ Thiếu API documentation page

**Cần bổ sung:**
- [ ] Cấu hình FastAPI docs tại `/docs` và `/redoc`
- [ ] Thêm descriptions và examples cho tất cả endpoints
- [ ] Export OpenAPI schema

### 4. Backup & Restore (Thiếu)
**Yêu cầu:** Backup/restore functionality for Admin

**Hiện trạng:**
- ❌ Không có backup/restore functionality
- ❌ Không có script backup database

**Cần bổ sung:**
- [ ] API endpoint: `POST /admin/backup` (tạo backup)
- [ ] API endpoint: `POST /admin/restore` (restore từ backup)
- [ ] Script backup database (PostgreSQL)
- [ ] Frontend: Backup/Restore page (Admin)

### 5. SSO Support (Thiếu - Optional nhưng nên có)
**Yêu cầu:** Single sign-on (SSO) support

**Hiện trạng:**
- ❌ Chỉ có JWT authentication, chưa có SSO
- ❌ Không có OAuth2/SAML integration

**Cần bổ sung:**
- [ ] OAuth2 provider integration (Google, Microsoft, etc.)
- [ ] SAML 2.0 support (optional)
- [ ] SSO configuration page (Admin)

### 6. Multi-Conference Operations (Cần cải thiện)
**Yêu cầu:** Multi-conference operations for Admin

**Hiện trạng:**
- ⚠️ Có tenant management nhưng cần kiểm tra multi-conference support
- ⚠️ Cần đảm bảo Admin có thể quản lý nhiều conferences

**Cần cải thiện:**
- [ ] Admin dashboard hiển thị tất cả conferences
- [ ] Filter/search conferences
- [ ] Bulk operations cho multiple conferences

### 7. Reviewer Decline Assignment (Thiếu)
**Yêu cầu:** Reviewer có thể decline assignment

**Hiện trạng:**
- ❌ Reviewer chỉ có thể submit review, không thể decline assignment
- ❌ Không có endpoint để decline assignment

**Cần bổ sung:**
- [ ] API endpoint: `POST /reviews/assignments/{submission_id}/{reviewer_id}/decline`
- [ ] Frontend: Decline button trong My Assignments
- [ ] Notification cho Chair khi reviewer decline

### 8. Public Program View (Thiếu)
**Yêu cầu:** Public portal for program

**Hiện trạng:**
- ❌ Schedule management có nhưng chưa có public view
- ❌ Không có public program page

**Cần bổ sung:**
- [ ] API endpoint: `GET /schedule/conferences/{id}/public`
- [ ] Frontend: Public Program Page
- [ ] Hiển thị schedule với accepted papers

### 9. Acceptance Rate Report (Cần kiểm tra)
**Yêu cầu:** Reports: submissions by school/track, acceptance rate

**Hiện trạng:**
- ✅ Có reports controller với một số reports
- ⚠️ Cần kiểm tra xem có đủ các reports yêu cầu không

**Cần kiểm tra/bổ sung:**
- [ ] Acceptance rate by school (có trong reports_controller)
- [ ] Acceptance rate by track (cần kiểm tra)
- [ ] Review SLA (có trong reports_controller)
- [ ] Activity logs (có trong reports_controller)

### 10. AI Governance Controls (Cần cải thiện)
**Yêu cầu:** AI governance: preview before apply, per-feature enable/disable, audit entries

**Hiện trạng:**
- ✅ Có AI feature flags
- ⚠️ Cần kiểm tra audit entries cho AI operations
- ⚠️ Cần đảm bảo preview before apply

**Cần cải thiện:**
- [ ] Audit log cho mỗi AI operation (prompt, model, timestamp, input hash)
- [ ] Preview mode cho AI suggestions (không tự động apply)
- [ ] Per-conference AI feature flags

---

## 🗑️ CÁC CHỨC NĂNG THỪA THÃI (Cần xem xét xóa)

### 1. Tenant Management (Có thể thừa nếu không dùng multi-tenant)
**Phân tích:**
- Có `tenant_controller.py` và `TenantManagementPage.jsx`
- Nếu không cần multi-tenant, có thể xóa hoặc disable

**Đề xuất:**
- [ ] Xác nhận với stakeholder có cần multi-tenant không
- [ ] Nếu không cần: Xóa tenant management, giữ lại cho tương lai

### 2. AI Feature Flags Page (Có thể thừa nếu đã có trong admin config)
**Phân tích:**
- Có `AIFeatureFlagsPage.jsx` riêng
- Có thể merge vào admin config page

**Đề xuất:**
- [ ] Merge AI feature flags vào Admin System Config page
- [ ] Hoặc giữ lại nếu cần quản lý riêng

### 3. Duplicate Routes/Pages
**Phân tích:**
- Cần kiểm tra xem có routes/pages trùng lặp không

**Đề xuất:**
- [ ] Review tất cả routes trong `router/index.jsx`
- [ ] Xóa các routes không sử dụng
- [ ] Consolidate các pages có chức năng tương tự

---

## 📋 KẾ HOẠCH THỰC HIỆN

### Phase 1: Critical Missing Features (Ưu tiên cao)
1. **Public Portal**
   - [ ] Kết nối CFP Public Page với API
   - [ ] Tạo Public Program Page
   - [ ] Tạo Public Accepted Papers Page
   - [ ] Tạo public API endpoints (không cần auth)

2. **PC Invitation Decline**
   - [ ] Thêm decline endpoint
   - [ ] Update frontend

3. **OpenAPI/Swagger**
   - [ ] Cấu hình FastAPI docs
   - [ ] Thêm descriptions cho endpoints

### Phase 2: Important Features (Ưu tiên trung bình)
4. **Backup & Restore**
   - [ ] Tạo backup script
   - [ ] Tạo restore API
   - [ ] Frontend backup/restore page

5. **Reviewer Decline Assignment**
   - [ ] Thêm decline assignment endpoint
   - [ ] Update frontend

6. **AI Governance Improvements**
   - [ ] Audit logging cho AI operations
   - [ ] Preview mode cho AI suggestions

### Phase 3: Optional Features (Ưu tiên thấp)
7. **SSO Support**
   - [ ] OAuth2 integration
   - [ ] SSO config page

8. **Multi-Conference Improvements**
   - [ ] Admin dashboard improvements
   - [ ] Bulk operations

### Phase 4: Cleanup
9. **Remove Unused Features**
   - [ ] Review và xóa tenant management (nếu không cần)
   - [ ] Consolidate duplicate pages
   - [ ] Remove unused routes

---

## 🔍 CHI TIẾT CẦN KIỂM TRA

### 1. API Endpoints Cần Kiểm Tra
- [ ] `GET /conferences/{id}/cfp/public` - Đã có trong conference_controller
- [ ] `GET /conferences/{id}/program/public` - Cần tạo
- [ ] `GET /conferences/{id}/accepted-papers/public` - Cần tạo
- [ ] `POST /pc/invitations/decline` - Cần tạo
- [ ] `POST /reviews/assignments/{submission_id}/{reviewer_id}/decline` - Cần tạo
- [ ] `GET /schedule/conferences/{id}/public` - Cần tạo
- [ ] `POST /admin/backup` - Cần tạo
- [ ] `POST /admin/restore` - Cần tạo

### 2. Frontend Pages Cần Kiểm Tra
- [ ] `/cfp-public` - Đã có nhưng cần kết nối API
- [ ] `/program-public/:conferenceId` - Cần tạo
- [ ] `/accepted-papers-public/:conferenceId` - Cần tạo
- [ ] `/dashboard/admin/backup-restore` - Cần tạo
- [ ] `/dashboard/pc/accept?token=...` - Cần thêm decline button

### 3. Database Schema Cần Kiểm Tra
- [ ] PCInvitationModel có field `status` với giá trị "DECLINED"?
- [ ] ReviewAssignmentModel có field `status` để track declined?
- [ ] AuditLogModel có đủ fields cho AI audit (prompt, model, input_hash)?

---

## 📝 GHI CHÚ

1. **Public Portal** là feature quan trọng nhất còn thiếu - cần ưu tiên cao
2. **PC Decline** và **Reviewer Decline** là features cơ bản cần có
3. **OpenAPI/Swagger** rất quan trọng cho documentation và integration
4. **Backup/Restore** cần thiết cho production system
5. **SSO** là optional nhưng nên có cho enterprise deployment

---

*Tài liệu này được tạo dựa trên phân tích codebase và yêu cầu. Cập nhật lần cuối: 2026-01-24*

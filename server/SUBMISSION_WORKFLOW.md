# Quy Trình Submission: Status và Decision

## 📋 Tóm Tắt Nhanh

| Giai Đoạn | Status | Decision | Mô Tả |
|-----------|--------|----------|-------|
| **1. Nộp bài** | `submitted` | `null` | Tác giả vừa nộp bài |
| **2. Đang review** | `under_review` | `null` | Đang được reviewers đánh giá |
| **3a. Chấp nhận** | `accepted` | `accepted` | Đã được chấp nhận |
| **3b. Từ chối** | `rejected` | `rejected` | Đã bị từ chối |
| **3c. Yêu cầu sửa** | `under_review` | `minor_revision` / `major_revision` | Cần sửa lại |
| **4. Camera-ready** | `published` | `accepted` | Đã upload camera-ready |
| **5. Rút bài** | `withdrawn` | `null` | Tác giả đã rút bài |

**🔑 Quy tắc quan trọng:**
- **Camera-ready chỉ upload được khi `decision = "accepted"`**
- **Status và Decision là 2 trường riêng biệt, không phải luôn giống nhau**

---

## Tổng Quan

Hệ thống sử dụng 2 trường để quản lý trạng thái bài nộp:
- **`status`**: Trạng thái hiện tại của bài nộp trong quy trình
- **`decision`**: Quyết định cuối cùng từ reviewer/chair (có thể null)

## Các Giá Trị Hợp Lệ

### Status Values
```
submitted      → Bài nộp mới được tạo
under_review   → Đang trong quá trình review
accepted       → Đã được chấp nhận (sau khi có decision)
rejected       → Đã bị từ chối (sau khi có decision)
published      → Đã upload camera-ready và sẵn sàng xuất bản
withdrawn      → Tác giả đã rút bài
```

### Decision Values
```
null           → Chưa có quyết định
accepted       → Chấp nhận bài
rejected       → Từ chối bài
minor_revision → Yêu cầu sửa nhỏ
major_revision → Yêu cầu sửa lớn
```

## Quy Trình Chi Tiết

### 1. Submission (Nộp Bài)
**Khi tác giả nộp bài mới:**
- `status` = `"submitted"`
- `decision` = `null`
- File được upload lên Cloudinary

**Code:** `submission_repo_impl.py:41`

---

### 2. Under Review (Đang Review)
**Khi chair assign reviewers:**
- `status` = `"under_review"` (cần implement logic này)
- `decision` = `null`
- Reviewers bắt đầu review

**Note:** Hiện tại chưa có logic tự động chuyển sang `under_review`. Có thể thêm khi assign reviewer đầu tiên.

---

### 3. Decision (Quyết Định)
**Khi chair/reviewer đưa ra quyết định:**
- `decision` = `"accepted"` | `"rejected"` | `"minor_revision"` | `"major_revision"`
- **Mapping decision → status:**
  - `decision = "accepted"` → `status = "accepted"`
  - `decision = "rejected"` → `status = "rejected"`
  - `decision = "minor_revision"` → `status = "under_review"` (để tác giả sửa)
  - `decision = "major_revision"` → `status = "under_review"` (để tác giả sửa)

**Code:** `decision_service.py:76-95`

**Lưu ý:** 
- `minor_revision` và `major_revision` không phải là status cuối cùng
- Sau khi tác giả sửa và nộp lại, có thể chuyển về `under_review` hoặc `accepted`
- Status và Decision được set riêng biệt theo mapping ở trên

---

### 4. Camera-Ready Upload
**Khi tác giả upload camera-ready (chỉ khi đã accepted):**
- **Điều kiện:** `decision` = `"accepted"` (hoặc `"accept"`)
- `status` = `"published"` (tự động cập nhật sau khi upload thành công)
- `camera_ready_submission` = ID của file camera-ready
- File camera-ready được lưu vào `submission_files` với `write_type = "Camera-Ready"`

**Code:** `camera_ready_service.py:83-93`

**Lưu ý:** 
- Sau khi upload camera-ready thành công, status tự động chuyển từ `"accepted"` → `"published"`
- Điều này đánh dấu bài đã sẵn sàng để xuất bản

---

### 5. Withdrawn (Rút Bài)
**Khi tác giả rút bài:**
- `status` = `"withdrawn"`
- `decision` = `null` (hoặc giữ nguyên)
- `is_withdrawn` = `true`
- Submission bị hard delete khỏi database

**Code:** `delete_submission.py`

---

## Mapping Status ↔ Decision

| Status | Decision | Mô Tả |
|--------|----------|-------|
| `submitted` | `null` | Bài mới nộp |
| `under_review` | `null` | Đang review |
| `under_review` | `minor_revision` | Yêu cầu sửa nhỏ |
| `under_review` | `major_revision` | Yêu cầu sửa lớn |
| `accepted` | `accepted` | Đã chấp nhận |
| `published` | `accepted` | Đã upload camera-ready |
| `rejected` | `rejected` | Đã từ chối |
| `withdrawn` | `null` | Đã rút bài |

## Quy Tắc Quan Trọng

1. **Camera-Ready chỉ upload được khi:**
   - `decision = "accepted"` (hoặc `"accept"`)
   - Không cần kiểm tra `camera_ready_open` flag
   - Chỉ kiểm tra `camera_ready_deadline` nếu có

2. **Status không bao giờ là:**
   - `"minor_revision"` hoặc `"major_revision"` (đây là decision, không phải status)

3. **Decision có thể là:**
   - `null` (chưa có quyết định)
   - `"accepted"`, `"rejected"`, `"minor_revision"`, `"major_revision"`

4. **Khi make_decision (decision_service.py):**
   - `decision = "accepted"` → `status = "accepted"`
   - `decision = "rejected"` → `status = "rejected"`
   - `decision = "minor_revision"` → `status = "under_review"` (để tác giả sửa)
   - `decision = "major_revision"` → `status = "under_review"` (để tác giả sửa)
   
   **Quan trọng:** Status và Decision là 2 trường riêng biệt, không phải luôn giống nhau!

## Code References

- **Model:** `infrastructure/models/submission_model.py:21`
- **Create:** `infrastructure/repositories/submission_repo_impl.py:41`
- **Decision:** `services/decision/decision_service.py:47-94`
- **Camera-Ready:** `services/camera_ready/camera_ready_service.py:21-93`
- **Delete/Withdraw:** `services/submission/delete_submission.py`

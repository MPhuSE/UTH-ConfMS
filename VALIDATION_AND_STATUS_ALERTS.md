# Hướng dẫn sử dụng Validation và Status Alerts

## Tổng quan

Đã thêm các component và utilities để hiển thị thông báo khi không thể thao tác:

1. **StatusAlert Component** (`src/components/StatusAlert.jsx`)
   - Hiển thị thông báo với các loại: error, warning, info, success, deadline, locked
   
2. **Validation Utils** (`src/utils/validationUtils.js`)
   - Các hàm kiểm tra điều kiện (deadline, status, permissions)
   - Các hàm lấy thông báo lý do không thể thao tác

## Cách sử dụng

### 1. Import các utilities

```javascript
import StatusAlert from "../../../components/StatusAlert";
import {
  canEditSubmission,
  canSubmitReview,
  canSubmitRebuttal,
  canUploadCameraReady,
  getSubmissionBlockReason,
  getReviewBlockReason,
  getRebuttalBlockReason,
  getCameraReadyBlockReason,
} from "../../../utils/validationUtils";
```

### 2. Sử dụng trong component

#### Example: EditSubmissionPage

```javascript
// Load conference data
const [conference, setConference] = useState(null);

// Check if can edit
const canEdit = canEditSubmission(currentSubmission, conference);
const blockReason = getSubmissionBlockReason(conference);

// In JSX
{!canEdit && blockReason && (
  <StatusAlert
    type="error"
    title="Không thể chỉnh sửa bài nộp"
    message={blockReason}
  />
)}

<button
  disabled={!canEdit}
  className={!canEdit ? "opacity-50 cursor-not-allowed" : ""}
>
  Cập nhật
</button>
```

#### Example: ReviewForm

```javascript
// Load assignment and conference
const [assignment, setAssignment] = useState(null);
const [conference, setConference] = useState(null);

// Check if can submit review
const canSubmit = canSubmitReview(assignment, conference);
const blockReason = getReviewBlockReason(assignment, conference);

// In JSX
{!canSubmit && blockReason && (
  <StatusAlert
    type="warning"
    title="Không thể gửi review"
    message={blockReason}
  />
)}
```

#### Example: AuthorRebuttalForm

```javascript
// Check if can submit rebuttal
const canSubmit = canSubmitRebuttal(submission, conference);
const blockReason = getRebuttalBlockReason(submission, conference);

// In JSX
{!canSubmit && blockReason && (
  <StatusAlert
    type="error"
    title="Không thể gửi rebuttal"
    message={blockReason}
  />
)}

<button disabled={!canSubmit}>
  {canSubmit ? "Submit Rebuttal" : "Không thể gửi"}
</button>
```

#### Example: CameraReadyUploadPage

```javascript
// Check if can upload camera-ready
const canUpload = canUploadCameraReady(submission, conference);
const blockReason = getCameraReadyBlockReason(submission, conference);

// In JSX
{!canUpload && blockReason && (
  <StatusAlert
    type="error"
    title="Không thể upload camera-ready"
    message={blockReason}
  />
)}
```

## Các validation functions

### Deadline checks
- `isSubmissionDeadlinePassed(conference)`
- `isReviewDeadlinePassed(conference)`
- `isRebuttalDeadlinePassed(conference)`
- `isCameraReadyDeadlinePassed(conference)`

### Status checks
- `isConferenceOpen(conference)`
- `isRebuttalOpen(conference)`
- `isCameraReadyOpen(conference)`

### Combined checks
- `canEditSubmission(submission, conference)`
- `canSubmitReview(assignment, conference)`
- `canSubmitRebuttal(submission, conference)`
- `canUploadCameraReady(submission, conference)`

### Get block reasons
- `getSubmissionBlockReason(conference)`
- `getReviewBlockReason(assignment, conference)`
- `getRebuttalBlockReason(submission, conference)`
- `getCameraReadyBlockReason(submission, conference)`

## StatusAlert Props

```javascript
<StatusAlert
  type="error"        // "error" | "warning" | "info" | "success" | "deadline" | "locked"
  title="Tiêu đề"    // Optional
  message="Nội dung"  // Required
  showIcon={true}     // Optional, default: true
  className=""        // Optional CSS classes
/>
```

## Best Practices

1. **Luôn check trước khi submit**: Sử dụng validation functions trước khi gọi API
2. **Hiển thị thông báo rõ ràng**: Dùng StatusAlert để user biết lý do không thể thao tác
3. **Disable buttons**: Disable buttons khi không thể thao tác
4. **Load conference data**: Cần load conference data để check deadlines và status
5. **Real-time updates**: Có thể dùng useEffect để check lại khi data thay đổi

## Files cần cập nhật

1. ✅ `src/components/StatusAlert.jsx` - Component đã tạo
2. ✅ `src/utils/validationUtils.js` - Utilities đã tạo
3. ⏳ `src/features/author/pages/EditSubmissionPage.jsx` - Cần cập nhật
4. ⏳ `src/features/reviewer/ReviewForm.jsx` - Cần cập nhật
5. ⏳ `src/features/rebuttal/AuthorRebuttalForm.jsx` - Cần cập nhật
6. ⏳ `src/features/author/pages/CameraReadyUploadPage.jsx` - Cần cập nhật
7. ⏳ `src/features/reviewer/pages/MyAssignmentsPage.jsx` - Cần cập nhật

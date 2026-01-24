/**
 * Validation Utilities
 * Các hàm kiểm tra điều kiện để hiển thị thông báo khi không thể thao tác
 */

/**
 * Kiểm tra submission deadline đã qua chưa
 */
export const isSubmissionDeadlinePassed = (conference) => {
  if (!conference || !conference.submission_deadline) return false;
  return new Date() > new Date(conference.submission_deadline);
};

/**
 * Kiểm tra review deadline đã qua chưa
 */
export const isReviewDeadlinePassed = (conference) => {
  if (!conference || !conference.review_deadline) return false;
  return new Date() > new Date(conference.review_deadline);
};

/**
 * Kiểm tra rebuttal deadline đã qua chưa
 */
export const isRebuttalDeadlinePassed = (conference) => {
  if (!conference || !conference.rebuttal_deadline) return false;
  return new Date() > new Date(conference.rebuttal_deadline);
};

/**
 * Kiểm tra camera-ready deadline đã qua chưa
 */
export const isCameraReadyDeadlinePassed = (conference) => {
  if (!conference || !conference.camera_ready_deadline) return false;
  return new Date() > new Date(conference.camera_ready_deadline);
};

/**
 * Kiểm tra conference có đang mở không
 */
export const isConferenceOpen = (conference) => {
  return conference && conference.is_open === true;
};

/**
 * Kiểm tra rebuttal có được mở không
 */
export const isRebuttalOpen = (conference) => {
  return conference && conference.rebuttal_open === true;
};

/**
 * Kiểm tra camera-ready có được mở không
 */
export const isCameraReadyOpen = (conference) => {
  return conference && conference.camera_ready_open === true;
};

/**
 * Kiểm tra submission có thể chỉnh sửa không
 */
export const canEditSubmission = (submission, conference) => {
  if (!submission || !conference) return false;
  
  // Không thể edit nếu đã quá deadline
  if (isSubmissionDeadlinePassed(conference)) return false;
  
  // Không thể edit nếu đã có decision
  const hasDecision = submission.decision && 
    ["ACCEPT", "REJECT", "REVISION"].includes(submission.decision.toUpperCase());
  if (hasDecision) return false;
  
  return true;
};

/**
 * Kiểm tra có thể submit review không
 */
export const canSubmitReview = (assignment, conference) => {
  if (!assignment || !conference) return false;
  
  // Không thể submit nếu đã completed
  if (assignment.status === "COMPLETED") return false;
  
  // Không thể submit nếu đã declined
  if (assignment.status === "DECLINED") return false;
  
  // Không thể submit nếu quá deadline
  if (isReviewDeadlinePassed(conference)) return false;
  
  return true;
};

/**
 * Kiểm tra có thể submit rebuttal không
 */
export const canSubmitRebuttal = (submission, conference) => {
  if (!submission || !conference) return false;
  
  // Phải có decision trước
  if (!submission.decision) return false;
  
  // Rebuttal phải được mở
  if (!isRebuttalOpen(conference)) return false;
  
  // Không quá deadline
  if (isRebuttalDeadlinePassed(conference)) return false;
  
  return true;
};

/**
 * Kiểm tra có thể upload camera-ready không
 */
export const canUploadCameraReady = (submission, conference) => {
  if (!submission || !conference) return false;
  
  // Phải được accept
  if (submission.decision?.toUpperCase() !== "ACCEPT") return false;
  
  // Camera-ready phải được mở
  if (!isCameraReadyOpen(conference)) return false;
  
  // Không quá deadline
  if (isCameraReadyDeadlinePassed(conference)) return false;
  
  return true;
};

/**
 * Lấy thông báo lý do không thể submit
 */
export const getSubmissionBlockReason = (conference) => {
  if (!conference) return "Không tìm thấy thông tin hội nghị";
  
  if (!isConferenceOpen(conference)) {
    return "Hội nghị hiện đang tạm đóng, không nhận bài nộp mới";
  }
  
  if (isSubmissionDeadlinePassed(conference)) {
    const deadline = new Date(conference.submission_deadline).toLocaleString('vi-VN');
    return `Đã quá hạn chót nộp bài. Hạn chót: ${deadline}`;
  }
  
  return null;
};

/**
 * Lấy thông báo lý do không thể submit review
 */
export const getReviewBlockReason = (assignment, conference) => {
  if (!assignment) return "Không tìm thấy thông tin assignment";
  if (!conference) return "Không tìm thấy thông tin hội nghị";
  
  if (assignment.status === "COMPLETED") {
    return "Bạn đã hoàn thành review cho bài báo này";
  }
  
  if (assignment.status === "DECLINED") {
    return "Bạn đã từ chối assignment này";
  }
  
  if (isReviewDeadlinePassed(conference)) {
    const deadline = new Date(conference.review_deadline).toLocaleString('vi-VN');
    return `Đã quá hạn chót đánh giá. Hạn chót: ${deadline}`;
  }
  
  return null;
};

/**
 * Lấy thông báo lý do không thể submit rebuttal
 */
export const getRebuttalBlockReason = (submission, conference) => {
  if (!submission) return "Không tìm thấy thông tin submission";
  if (!conference) return "Không tìm thấy thông tin hội nghị";
  
  if (!submission.decision) {
    return "Chưa có quyết định từ hội nghị. Vui lòng đợi quyết định trước khi gửi rebuttal";
  }
  
  if (!isRebuttalOpen(conference)) {
    return "Rebuttal hiện chưa được mở cho hội nghị này";
  }
  
  if (isRebuttalDeadlinePassed(conference)) {
    const deadline = new Date(conference.rebuttal_deadline).toLocaleString('vi-VN');
    return `Đã quá hạn chót gửi rebuttal. Hạn chót: ${deadline}`;
  }
  
  return null;
};

/**
 * Lấy thông báo lý do không thể upload camera-ready
 */
export const getCameraReadyBlockReason = (submission, conference) => {
  if (!submission) return "Không tìm thấy thông tin submission";
  if (!conference) return "Không tìm thấy thông tin hội nghị";
  
  if (submission.decision?.toUpperCase() !== "ACCEPT") {
    return "Chỉ có thể upload camera-ready khi bài báo được chấp nhận (Accept)";
  }
  
  if (!isCameraReadyOpen(conference)) {
    return "Camera-ready hiện chưa được mở cho hội nghị này";
  }
  
  if (isCameraReadyDeadlinePassed(conference)) {
    const deadline = new Date(conference.camera_ready_deadline).toLocaleString('vi-VN');
    return `Đã quá hạn chót upload camera-ready. Hạn chót: ${deadline}`;
  }
  
  return null;
};

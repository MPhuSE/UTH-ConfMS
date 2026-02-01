/**
 * Trích xuất message từ lỗi API (FastAPI) một cách an toàn
 * @param {any} error Đối tượng lỗi từ Axios
 * @param {string} defaultMessage Thông báo mặc định
 * @returns {string} Thông báo lỗi dạng chuỗi
 */
export const getErrorMessage = (error, defaultMessage = "Có lỗi xảy ra") => {
    const detail = error?.response?.data?.detail;

    if (!detail) return defaultMessage;

    if (typeof detail === 'string') return detail;

    if (Array.isArray(detail)) {
        // Xử lý lỗi validation của Pydantic: [{"type": "...", "msg": "...", ...}]
        const messages = detail.map(d => {
            if (typeof d === 'string') return d;
            const field = d.loc ? d.loc[d.loc.length - 1] : '';
            return field ? `${field}: ${d.msg}` : d.msg;
        });
        return messages.join('\n') || defaultMessage;
    }

    if (typeof detail === 'object') {
        return detail.message || detail.msg || JSON.stringify(detail);
    }

    return defaultMessage;
};

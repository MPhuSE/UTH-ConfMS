import React, { useState } from "react";
import { Sparkles, Loader2, Check, X, ArrowRight, Tags, AlertCircle, RefreshCw } from "lucide-react";
import { aiService } from "../../services";
import { toast } from "react-hot-toast";

/**
 * Author AI Support Component
 * Integrates spell check, keyword suggestions, and side-by-side diff
 */
export default function AuthorAISupport({ text, onApplyRevision }) {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [showDiff, setShowDiff] = useState(false);

    const handleFetchSupport = async () => {
        if (!text || text.trim().length < 20) {
            toast.error("Vui lòng nhập nội dung abstract ít nhất 20 ký tự để AI có đủ dữ liệu phân tích.");
            return;
        }

        try {
            setLoading(true);
            const response = await aiService.getAuthorSupport(text);
            if (response.error) {
                toast.error("AI gặp lỗi khi xử lý. Hiển thị nội dung gốc.");
            } else {
                toast.success("Đã hoàn tất phân tích AI!");
            }
            setData(response);
            setShowDiff(true);
        } catch (error) {
            toast.error("Không thể kết nối với AI Support");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptRevision = () => {
        if (data?.revised_version && onApplyRevision) {
            onApplyRevision(data.revised_version);
            setData(null);
            setShowDiff(false);
            toast.success("Đã áp dụng bản sửa đổi của AI");
        }
    };

    return (
        <div className="mt-4 border border-indigo-100 rounded-xl overflow-hidden bg-white shadow-sm">
            <div className="bg-indigo-50 px-4 py-3 flex items-center justify-between border-b border-indigo-100">
                <div className="flex items-center gap-2 font-semibold text-indigo-700">
                    <Sparkles size={18} />
                    <span>Hỗ trợ Tác giả (Gemini AI)</span>
                </div>
                <button
                    type="button"
                    onClick={handleFetchSupport}
                    disabled={loading || !text}
                    className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin" size={14} />
                            <span>Đang phân tích...</span>
                        </>
                    ) : (
                        <>
                            <RefreshCw size={14} />
                            <span>Phân tích & Tối ưu</span>
                        </>
                    )}
                </button>
            </div>

            {data && showDiff && (
                <div className="p-4 space-y-6">
                    {/* Side by Side Diff */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                                <AlertCircle size={12} /> Bản gốc
                            </div>
                            <div className="p-3 bg-red-50 text-red-900 text-sm rounded-lg border border-red-100 h-64 overflow-y-auto">
                                {text}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-xs font-bold text-green-600 uppercase flex items-center gap-1">
                                <Check size={12} /> Bản gợi ý (Đã tối ưu)
                            </div>
                            <div className="p-3 bg-green-50 text-green-900 text-sm rounded-lg border border-green-100 h-64 overflow-y-auto">
                                {data.revised_version}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setShowDiff(false)}
                            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Từ chối
                        </button>
                        <button
                            onClick={handleAcceptRevision}
                            className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                        >
                            <Check size={16} />
                            Chấp nhận thay đổi
                        </button>
                    </div>

                    {/* Keywords & Improvements */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                        {data.keywords && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                    <Tags size={16} className="text-indigo-500" />
                                    Gợi ý từ khóa
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {data.keywords.map((kw, i) => (
                                        <span key={i} className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-md border border-indigo-100">
                                            {kw}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {data.improvements && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                    <Sparkles size={16} className="text-amber-500" />
                                    Gợi ý cải thiện
                                </div>
                                <ul className="space-y-1.5">
                                    {data.improvements.map((imp, i) => (
                                        <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                                            <ArrowRight size={12} className="mt-0.5 text-indigo-400 flex-shrink-0" />
                                            {imp}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

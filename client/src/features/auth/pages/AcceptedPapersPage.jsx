import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { proceedingsService } from "../../../services";
import { Loader2, FileText, User, Tag, Calendar, ArrowLeft } from "lucide-react";

export default function AcceptedPapersPage() {
    const { conferenceId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadData();
    }, [conferenceId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await proceedingsService.getPublicAcceptedPapers(conferenceId);
            setData(res);
        } catch (err) {
            console.error("Error loading accepted papers:", err);
            setError("Không thể tải danh sách bài báo. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center">
                <div className="text-red-600 mb-4">{error || "Hội nghị không tồn tại"}</div>
                <button
                    onClick={() => navigate("/")}
                    className="text-teal-600 hover:underline flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" /> Về trang chủ
                </button>
            </div>
        );
    }

    const { conference, papers } = data;

    return (
        <div className="min-h-screen bg-gray-50 font-inter">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 -ml-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 truncate max-w-md">
                                {conference.name}
                            </h1>
                            {conference.abbreviation && (
                                <p className="text-xs text-gray-500">{conference.abbreviation}</p>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
                        Danh sách bài báo được chấp nhận
                    </h2>
                    <p className="text-gray-600">
                        Tổng số: <span className="font-semibold text-teal-600">{data.count}</span> bài báo
                    </p>
                </div>

                {papers.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                        <p className="text-gray-500">Chưa có bài báo nào được công bố.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {papers.map((paper) => (
                            <div
                                key={paper.submission_id}
                                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200"
                            >
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-3 leading-snug">
                                        {paper.title}
                                    </h3>

                                    {/* Authors */}
                                    <div className="flex flex-wrap gap-y-2 gap-x-1 mb-4 text-sm text-gray-700">
                                        {paper.authors.map((author, idx) => (
                                            <span key={idx} className="inline-flex items-center">
                                                <span className={`${author.is_corresponding ? 'font-semibold text-gray-900' : ''}`}>
                                                    {author.name}
                                                </span>
                                                {author.affiliation && (
                                                    <span className="text-gray-500 text-xs ml-1 italic">
                                                        ({author.affiliation})
                                                    </span>
                                                )}
                                                {idx < paper.authors.length - 1 && (
                                                    <span className="mx-2 text-gray-300">|</span>
                                                )}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Abstract */}
                                    <div className="bg-gray-50/50 rounded-lg p-4 text-sm text-gray-600 leading-relaxed text-justify">
                                        <p className="font-medium text-gray-900 mb-1 text-xs uppercase tracking-wider">Tóm tắt</p>
                                        {paper.abstract}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

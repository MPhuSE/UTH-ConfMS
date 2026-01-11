import React, { useState, useEffect } from 'react';
import reviewService from '../services/reviewService';
import submissionService from '../services/submissionService';

const BiddingCOIPage = ({ conferenceId }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bids, setBids] = useState({}); // Lưu trạng thái bid của user hiện tại
  const [cois, setCois] = useState(new Set()); // Lưu danh sách ID bài báo bị xung đột

  useEffect(() => {
    fetchData();
  }, [conferenceId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Lấy tất cả bài báo thuộc conference này (Giả định có API này)
      // Nếu chưa có, bạn có thể thay bằng API lấy bài báo cho Reviewer
      const subData = await api.get(`/submissions/conference/${conferenceId}`);
      setSubmissions(subData.data);

      // 2. Lấy các Bid hiện tại của Reviewer này (để hiển thị trạng thái đã chọn)
      const currentBids = await reviewService.getBidsByReviewer("me"); 
      const bidMap = {};
      currentBids.forEach(b => bidMap[b.submission_id] = b.bid);
      setBids(bidMap);

      // 3. Lấy các COI đã khai báo
      // Lưu ý: Thường COI sẽ làm ẩn hoặc vô hiệu hóa các nút Bidding
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  const onPlaceBid = async (submissionId, bidType) => {
    try {
      await reviewService.placeBid({
        submission_id: submissionId,
        bid: bidType // 'eager', 'willing', 'not_willing'
      });
      setBids({ ...bids, [submissionId]: bidType });
    } catch (err) {
      alert("Không thể đặt bid. Vui lòng thử lại.");
    }
  };

  const onDeclareCOI = async (submissionId) => {
    const reason = prompt("Nhập lý do xung đột (ví dụ: Đồng tác giả, cùng cơ quan...):");
    if (!reason) return;

    try {
      await reviewService.declareCOI({
        submission_id: submissionId,
        coi_type: reason
      });
      setCois(new Set([...cois, submissionId]));
      alert("Đã xác nhận xung đột lợi ích.");
    } catch (err) {
      alert("Lỗi khi khai báo COI.");
    }
  };

  if (loading) return <div className="p-10 text-center">Đang tải danh sách bài báo...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Bidding & Conflict of Interest</h1>
        <p className="text-gray-600 mt-2">Chọn các bài báo phù hợp với chuyên môn của bạn hoặc báo cáo xung đột lợi ích.</p>
      </div>

      <div className="grid gap-6">
        {submissions.map((sub) => {
          const isCOI = cois.has(sub.id);
          const currentBid = bids[sub.id];

          return (
            <div key={sub.id} className={`bg-white border rounded-xl p-5 shadow-sm transition-all ${isCOI ? 'opacity-50 grayscale' : 'hover:shadow-md'}`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {/* Thông tin bài báo */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">ID: #{sub.id}</span>
                    <span className="text-gray-400 text-sm">| {sub.track_name}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">{sub.title}</h3>
                  <p className="text-gray-500 text-sm mt-1 line-clamp-2">{sub.abstract}</p>
                </div>

                {/* Khu vực thao tác */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {!isCOI ? (
                    <>
                      <div className="inline-flex rounded-md shadow-sm" role="group">
                        <button
                          onClick={() => onPlaceBid(sub.id, 'eager')}
                          className={`px-4 py-2 text-sm font-medium border rounded-l-lg ${currentBid === 'eager' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                        >
                          Rất muốn
                        </button>
                        <button
                          onClick={() => onPlaceBid(sub.id, 'willing')}
                          className={`px-4 py-2 text-sm font-medium border-t border-b ${currentBid === 'willing' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                        >
                          Sẵn sàng
                        </button>
                        <button
                          onClick={() => onPlaceBid(sub.id, 'not_willing')}
                          className={`px-4 py-2 text-sm font-medium border rounded-r-lg ${currentBid === 'not_willing' ? 'bg-gray-600 text-white border-gray-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                        >
                          Không muốn
                        </button>
                      </div>

                      <button
                        onClick={() => onDeclareCOI(sub.id)}
                        className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition"
                      >
                        Báo Xung Đột (COI)
                      </button>
                    </>
                  ) : (
                    <span className="text-red-600 font-semibold italic">Đã báo cáo xung đột</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BiddingCOIPage;
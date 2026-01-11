import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import reviewService from '../services/reviewService';

const ReviewForm = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    originality: 5,
    quality: 5,
    relevance: 5,
    overall: 5,
    comments: '',
    confidence_score: 3
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await reviewService.submitReview(submissionId, formData);
      alert('Gửi bài đánh giá thành công!');
      navigate('/reviewer/dashboard');
    } catch (error) {
      console.error("Lỗi khi gửi review:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Phiếu Đánh Giá Bài Báo #{submissionId}</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {['originality', 'quality', 'relevance', 'overall'].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 capitalize">{field} (1-10)</label>
              <input
                type="number" min="1" max="10"
                value={formData[field]}
                onChange={(e) => setFormData({...formData, [field]: parseInt(e.target.value)})}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                required
              />
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Nhận xét chi tiết (Comments)</label>
          <textarea
            rows="6"
            value={formData.comments}
            onChange={(e) => setFormData({...formData, comments: e.target.value})}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            placeholder="Nhận xét ưu điểm, nhược điểm và góp ý..."
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Đang gửi...' : 'Gửi Đánh Giá'}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
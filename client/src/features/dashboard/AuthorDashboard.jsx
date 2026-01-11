import React, { useEffect } from 'react';
import { useSubmissionStore } from '../../app/store/useSubmissionStore';
import { FileText, Clock, CheckCircle, XCircle, Calendar, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AuthorDashboard() {
  const navigate = useNavigate();
  const { getMyCounts, fetchDashboardData, conferences } = useSubmissionStore();
  const counts = getMyCounts();

  useEffect(() => {
    fetchDashboardData('author');
  }, []);

  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chào mừng trở lại!</h1>
          <p className="text-gray-500 text-sm">Đây là tóm tắt trạng thái các bài nghiên cứu của bạn.</p>
        </div>
        <button 
          onClick={() => navigate('/dashboard/submission')}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center shadow-md"
        >
          Nộp bài báo mới <ArrowRight className="ml-2 w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Tổng bài nộp" count={counts.total} icon={<FileText />} color="text-blue-600" bg="bg-blue-50" />
        <StatCard label="Đang Review" count={counts.underReview} icon={<Clock />} color="text-amber-600" bg="bg-amber-50" />
        <StatCard label="Chấp nhận" count={counts.accepted} icon={<CheckCircle />} color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard label="Bị từ chối" count={counts.rejected} icon={<XCircle />} color="text-rose-600" bg="bg-rose-50" />
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-lg font-bold mb-5 flex items-center">
          <Calendar className="mr-2 text-indigo-600 w-5 h-5" /> Hạn chót nộp bài (Deadlines)
        </h3>
        <div className="space-y-4">
          {conferences && conferences.length > 0 ? conferences.map(conf => (
            <div key={conf.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-50 hover:bg-gray-50 transition">
              <span className="font-medium text-gray-800">{conf.name}</span>
              <span className="text-rose-600 font-bold bg-rose-50 px-3 py-1 rounded-lg text-sm">
                {new Date(conf.submission_deadline).toLocaleDateString('vi-VN')}
              </span>
            </div>
          )) : <div className="text-gray-400 py-4 text-center italic">Chưa có thông tin hội nghị mới.</div>}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, count, icon, color, bg }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
      <div className={`p-3.5 rounded-xl ${bg} ${color}`}>{icon}</div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className={`text-2xl font-black ${color}`}>{count}</p>
      </div>
    </div>
  );
}
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { submissionService } from '../../../services/submissionService';
import { trackService } from '../../../services/trackService';
import { 
  Trash2, 
  UserPlus, 
  FileText, 
  Loader2, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  Upload,
  Eye,
  X,
  Users,
  Building,
  Mail,
  FileCheck,
  Shield,
  Sparkles,
  HelpCircle,
  Globe,
  FileUp,
  FileWarning
} from 'lucide-react';
import { useAuthStore } from '../../../app/store/useAuthStore';

export default function PaperSubmissionPage() {
  const { paperId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  const { user } = useAuthStore();
  const [language, setLanguage] = useState('VI'); // VI/EN toggle
  
  // Tự động lấy ID từ URL (?confId=5)
  const queryParams = new URLSearchParams(location.search);
  const confIdFromUrl = queryParams.get('confId');

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [tracks, setTracks] = useState([]);
  const [filePreview, setFilePreview] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState({
    keywords: [],
    titleSuggestions: [],
    grammarCheck: []
  });
  const [showAIPanel, setShowAIPanel] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    track_id: '',
    conference_id: confIdFromUrl || '', 
    file: null,
    authors: [{ 
      name: user?.full_name || '', 
      email: user?.email || '', 
      affiliation: user?.institution || '', 
      is_main: true,
      orcid: ''
    }]
  });

  const [errors, setErrors] = useState({});
  const [wordCount, setWordCount] = useState(0);

  // 1. Luồng tải dữ liệu tự động
  useEffect(() => {
    const fetchData = async () => {
      setInitialLoading(true);
      try {
        let currentConfId = formData.conference_id;

        // Nếu đang sửa bài báo cũ, lấy thông tin bài báp đó trước
        if (paperId) {
          const paperData = await submissionService.getById(paperId);
          currentConfId = paperData.conference_id;
          setFormData({
            ...paperData,
            file: null,
            authors: paperData.authors || [{ name: '', email: '', affiliation: '', is_main: true }]
          });
          
          // Load existing file preview if any
          if (paperData.file_url) {
            setFilePreview({ name: 'Existing file', url: paperData.file_url });
          }
        }

        // Tải danh sách Tracks dựa trên conference_id hiện có
        if (currentConfId) {
          const trackList = await trackService.getByConference(currentConfId);
          setTracks(Array.isArray(trackList) ? trackList : []);
        } else {
          console.error("Không tìm thấy Conference ID để tải Tracks");
        }
      } catch (error) {
        console.error("Lỗi khởi tạo:", error);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchData();
  }, [paperId, confIdFromUrl]);

  // Count words in abstract
  useEffect(() => {
    if (formData.abstract) {
      const words = formData.abstract.trim().split(/\s+/).length;
      setWordCount(words);
    } else {
      setWordCount(0);
    }
  }, [formData.abstract]);

  // --- Quản lý tác giả ---
  const handleUpdateAuthor = (index, field, value) => {
    const newAuthors = [...formData.authors];
    newAuthors[index][field] = value;
    setFormData({ ...formData, authors: newAuthors });
  };

  const handleAddAuthor = () => {
    setFormData({
      ...formData,
      authors: [...formData.authors, { 
        name: '', 
        email: '', 
        affiliation: '', 
        is_main: false,
        orcid: '' 
      }]
    });
  };

  const handleRemoveAuthor = (index) => {
    setFormData({
      ...formData,
      authors: formData.authors.filter((_, i) => i !== index)
    });
  };

  // --- File Handling ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert(language === 'VI' ? 'Chỉ chấp nhận file PDF' : 'Only PDF files are accepted');
        return;
      }
      if (file.size > 15 * 1024 * 1024) { // 15MB
        alert(language === 'VI' ? 'File quá lớn (tối đa 15MB)' : 'File too large (max 15MB)');
        return;
      }
      
      setFormData({ ...formData, file });
      setFilePreview({
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        lastModified: new Date(file.lastModified).toLocaleDateString()
      });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const event = { target: { files: [file] } };
      handleFileChange(event);
    }
  };

  // --- AI Suggestions ---
  const getAISuggestions = () => {
    // Mock AI suggestions for demo
    setAiSuggestions({
      keywords: ['machine learning', 'deep learning', 'neural networks'],
      titleSuggestions: [`${formData.title} - An Enhanced Approach`, `${formData.title}: Novel Insights`],
      grammarCheck: [
        { original: 'imporve', suggestion: 'improve', severity: 'low' },
        { original: 'reseach', suggestion: 'research', severity: 'medium' }
      ]
    });
    setShowAIPanel(true);
  };

  const applyKeywordSuggestion = (keyword) => {
    // Add to keywords logic would go here
    console.log('Applying keyword:', keyword);
  };

  // --- Form Validation ---
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = language === 'VI' ? 'Tiêu đề không được để trống' : 'Title is required';
    }
    
    if (!formData.abstract.trim()) {
      newErrors.abstract = language === 'VI' ? 'Tóm tắt không được để trống' : 'Abstract is required';
    } else if (wordCount < 100) {
      newErrors.abstract = language === 'VI' ? 'Tóm tắt cần ít nhất 100 từ' : 'Abstract requires at least 100 words';
    }
    
    if (!formData.track_id) {
      newErrors.track_id = language === 'VI' ? 'Vui lòng chọn track' : 'Please select a track';
    }
    
    if (!formData.file && !paperId) {
      newErrors.file = language === 'VI' ? 'Vui lòng tải lên file PDF' : 'Please upload PDF file';
    }
    
    // Validate authors
    formData.authors.forEach((author, index) => {
      if (!author.name.trim()) {
        newErrors[`author_${index}_name`] = language === 'VI' ? 'Tên tác giả không được để trống' : 'Author name is required';
      }
      if (!author.email.trim() || !author.email.includes('@')) {
        newErrors[`author_${index}_email`] = language === 'VI' ? 'Email không hợp lệ' : 'Invalid email';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Gửi dữ liệu ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    const data = new FormData();
    data.append('title', formData.title.trim());
    data.append('abstract', formData.abstract.trim());
    data.append('track_id', formData.track_id);
    data.append('conference_id', formData.conference_id);
    data.append('authors', JSON.stringify(formData.authors));
    
    if (formData.file) data.append('file', formData.file);

    try {
      if (paperId) {
        await submissionService.update(paperId, data);
        alert(language === 'VI' ? 'Cập nhật thành công!' : 'Update successful!');
      } else {
        await submissionService.submit(data);
        alert(language === 'VI' ? 'Nộp bài thành công!' : 'Submission successful!');
      }
      navigate('/dashboard/my-submissions');
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 
        (language === 'VI' ? 'Lỗi hệ thống' : 'System error');
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
      <div className="relative">
        <Loader2 className="animate-spin w-16 h-16 text-[#2C7A7B]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <FileText className="w-8 h-8 text-white" />
        </div>
      </div>
      <div>
        <p className="text-lg font-bold text-gray-900 text-center">
          {language === 'VI' ? 'Đang thiết lập form nộp bài...' : 'Setting up submission form...'}
        </p>
        <p className="text-sm text-gray-600 text-center mt-2">
          {language === 'VI' ? 'Vui lòng đợi trong giây lát' : 'Please wait a moment'}
        </p>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-[#2C7A7B] hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">{language === 'VI' ? 'Quay lại' : 'Back'}</span>
          </button>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {paperId 
                ? (language === 'VI' ? 'Chỉnh sửa bài báo' : 'Edit Paper')
                : (language === 'VI' ? 'Nộp bài nghiên cứu mới' : 'New Paper Submission')
              }
            </h1>
            <p className="text-gray-600">
              {language === 'VI' 
                ? 'Điền đầy đủ thông tin bài báo và tác giả'
                : 'Fill in complete paper and author information'
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setLanguage(lang => lang === 'VI' ? 'EN' : 'VI')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-[#2C7A7B] transition-colors"
          >
            <Globe className="w-4 h-4" />
            <span className="font-medium">{language}</span>
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-[#1A365D] to-[#2C7A7B] p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <FileUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {paperId 
                        ? (language === 'VI' ? 'Chỉnh sửa bài báo' : 'Edit Paper')
                        : (language === 'VI' ? 'Thông tin bài báo mới' : 'New Paper Information')
                      }
                    </h2>
                    <p className="text-white/80 text-sm">
                      {language === 'VI' 
                        ? 'Hội nghị ID: ' + formData.conference_id
                        : 'Conference ID: ' + formData.conference_id
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/90">
                  <Shield className="w-4 h-4" />
                  <span>UTH-ConfMS</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              {/* Track Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <FileCheck className="w-4 h-4 text-[#2C7A7B]" />
                    {language === 'VI' ? 'Chọn Track nghiên cứu' : 'Select Research Track'} *
                  </label>
                  <span className="text-xs text-gray-500">
                    {language === 'VI' ? 'Bắt buộc' : 'Required'}
                  </span>
                </div>
                
                <select 
                  required 
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.track_id 
                      ? 'border-red-300 focus:ring-red-500/50 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-[#2C7A7B]/50 focus:border-[#2C7A7B]'
                  }`}
                  value={formData.track_id} 
                  onChange={(e) => {
                    setFormData({...formData, track_id: e.target.value});
                    if (errors.track_id) setErrors({...errors, track_id: ''});
                  }}
                >
                  <option value="">{language === 'VI' ? '-- Chọn Track --' : '-- Select Track --'}</option>
                  {tracks.map(track => (
                    <option key={track.id} value={track.id}>
                      {track.name}
                    </option>
                  ))}
                </select>
                
                {errors.track_id && (
                  <p className="text-sm text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {errors.track_id}
                  </p>
                )}
                
                {formData.track_id && (
                  <p className="text-sm text-gray-600">
                    {language === 'VI' ? 'Đã chọn: ' : 'Selected: '}
                    <span className="font-medium">{tracks.find(t => t.id === formData.track_id)?.name}</span>
                  </p>
                )}
              </div>

              {/* Paper Information */}
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <FileText className="w-4 h-4 text-[#2C7A7B]" />
                      {language === 'VI' ? 'Tiêu đề bài báo' : 'Paper Title'} *
                    </label>
                    <button
                      type="button"
                      onClick={getAISuggestions}
                      className="flex items-center gap-1 text-xs font-medium text-[#2C7A7B] hover:text-[#1A365D]"
                    >
                      <Sparkles className="w-3 h-3" />
                      {language === 'VI' ? 'Gợi ý AI' : 'AI Suggestions'}
                    </button>
                  </div>
                  
                  <input 
                    required 
                    placeholder={language === 'VI' ? "Tiêu đề đầy đủ của bài báo..." : "Full paper title..."}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                      errors.title 
                        ? 'border-red-300 focus:ring-red-500/50 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-[#2C7A7B]/50 focus:border-[#2C7A7B]'
                    }`}
                    value={formData.title} 
                    onChange={(e) => {
                      setFormData({...formData, title: e.target.value});
                      if (errors.title) setErrors({...errors, title: ''});
                    }} 
                  />
                  
                  {errors.title && (
                    <p className="text-sm text-red-600 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {errors.title}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <FileText className="w-4 h-4 text-[#2C7A7B]" />
                      {language === 'VI' ? 'Tóm tắt (Abstract)' : 'Abstract'} *
                    </label>
                    <span className="text-xs text-gray-500">
                      {wordCount} {language === 'VI' ? 'từ' : 'words'} 
                      {wordCount < 100 && (
                        <span className="text-red-500 ml-1">
                          ({language === 'VI' ? 'cần ít nhất 100 từ' : 'minimum 100 words'})
                        </span>
                      )}
                    </span>
                  </div>
                  
                  <textarea 
                    required 
                    rows={8}
                    placeholder={language === 'VI' ? "Tóm tắt nội dung nghiên cứu, phương pháp, kết quả chính..." : "Research summary, methodology, key findings..."}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all resize-none ${
                      errors.abstract 
                        ? 'border-red-300 focus:ring-red-500/50 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-[#2C7A7B]/50 focus:border-[#2C7A7B]'
                    }`}
                    value={formData.abstract} 
                    onChange={(e) => {
                      setFormData({...formData, abstract: e.target.value});
                      if (errors.abstract) setErrors({...errors, abstract: ''});
                    }}
                  />
                  
                  {errors.abstract && (
                    <p className="text-sm text-red-600 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {errors.abstract}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <HelpCircle className="w-4 h-4" />
                    <span>
                      {language === 'VI' 
                        ? 'Tóm tắt nên bao gồm: vấn đề, phương pháp, kết quả, kết luận'
                        : 'Abstract should include: problem, methodology, results, conclusion'
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* Authors Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#2C7A7B]" />
                    <h3 className="text-lg font-bold text-gray-900">
                      {language === 'VI' ? 'Thông tin tác giả' : 'Author Information'}
                    </h3>
                  </div>
                  <button 
                    type="button" 
                    onClick={handleAddAuthor}
                    className="flex items-center gap-2 px-4 py-2 bg-[#2C7A7B] text-white rounded-lg hover:bg-[#1A365D] transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    {language === 'VI' ? 'Thêm tác giả' : 'Add Author'}
                  </button>
                </div>
                
                <div className="space-y-4">
                  {formData.authors.map((author, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-200 relative group">
                      {author.is_main && (
                        <div className="absolute -top-2 left-6 bg-[#2C7A7B] text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                          {language === 'VI' ? 'TÁC GIẢ CHÍNH' : 'MAIN AUTHOR'}
                        </div>
                      )}
                      
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {language === 'VI' ? 'Họ và tên' : 'Full Name'} *
                          </label>
                          <input
                            required
                            value={author.name}
                            onChange={(e) => handleUpdateAuthor(index, 'name', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                              errors[`author_${index}_name`] 
                                ? 'border-red-300 focus:ring-red-500/50' 
                                : 'border-gray-300 focus:ring-[#2C7A7B]/50'
                            }`}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email *
                          </label>
                          <input
                            required
                            type="email"
                            value={author.email}
                            onChange={(e) => handleUpdateAuthor(index, 'email', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                              errors[`author_${index}_email`] 
                                ? 'border-red-300 focus:ring-red-500/50' 
                                : 'border-gray-300 focus:ring-[#2C7A7B]/50'
                            }`}
                          />
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {language === 'VI' ? 'Cơ quan/Tổ chức' : 'Institution/Organization'} *
                          </label>
                          <input
                            required
                            value={author.affiliation}
                            onChange={(e) => handleUpdateAuthor(index, 'affiliation', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C7A7B]/50"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            ORCID (Tùy chọn)
                          </label>
                          <input
                            value={author.orcid || ''}
                            onChange={(e) => handleUpdateAuthor(index, 'orcid', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C7A7B]/50"
                            placeholder="0000-0000-0000-0000"
                          />
                        </div>
                      </div>
                      
                      {!author.is_main && (
                        <button
                          type="button"
                          onClick={() => handleRemoveAuthor(index)}
                          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      
                      {(errors[`author_${index}_name`] || errors[`author_${index}_email`]) && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          {errors[`author_${index}_name`] && (
                            <p className="text-sm text-red-600">{errors[`author_${index}_name`]}</p>
                          )}
                          {errors[`author_${index}_email`] && (
                            <p className="text-sm text-red-600">{errors[`author_${index}_email`]}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* File Upload */}
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center gap-2">
                    <Upload className="w-5 h-5 text-[#2C7A7B]" />
                    <h3 className="text-lg font-bold text-gray-900">
                      {language === 'VI' ? 'Tải lên bản thảo' : 'Upload Manuscript'} *
                    </h3>
                  </div>
                  <span className="text-sm text-gray-500">
                    {language === 'VI' ? 'PDF, tối đa 15MB' : 'PDF, max 15MB'}
                  </span>
                </div>
                
                <div 
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => fileInputRef.current.click()}
                  className={`border-3 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                    errors.file 
                      ? 'border-red-300 bg-red-50 hover:bg-red-100' 
                      : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-[#2C7A7B]'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  
                  <div className="space-y-4">
                    {filePreview ? (
                      <>
                        <div className="w-16 h-16 rounded-xl bg-[#2C7A7B]/10 flex items-center justify-center mx-auto">
                          <FileText className="w-8 h-8 text-[#2C7A7B]" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{filePreview.name}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {filePreview.size} • {language === 'VI' ? 'Đã chọn' : 'Selected'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFilePreview(null);
                            setFormData({...formData, file: null});
                            if (errors.file) setErrors({...errors, file: ''});
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          <X className="w-4 h-4" />
                          {language === 'VI' ? 'Xóa file' : 'Remove file'}
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 rounded-xl bg-gray-200 flex items-center justify-center mx-auto">
                          <Upload className="w-8 h-8 text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {language === 'VI' ? 'Kéo thả file vào đây' : 'Drag & drop your file here'}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {language === 'VI' ? 'hoặc click để chọn file' : 'or click to browse'}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            PDF only • Max 15MB • {language === 'VI' ? 'Định dạng LNCS' : 'LNCS format'}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                {errors.file && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileWarning className="w-5 h-5 text-red-600" />
                      <p className="text-sm text-red-600">{errors.file}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">
                      {language === 'VI' ? 'Lưu ý quan trọng' : 'Important Note'}
                    </p>
                    <p>
                      {language === 'VI' 
                        ? 'Bài báo phải tuân thủ định dạng LNCS, không tiết lộ thông tin tác giả (double-blind review).'
                        : 'Paper must follow LNCS format, no author information (double-blind review).'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6 border-t border-gray-200">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-[#1A365D] to-[#2C7A7B] text-white rounded-xl font-bold hover:shadow-xl hover:shadow-[#2C7A7B]/30 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {language === 'VI' ? 'Đang xử lý...' : 'Processing...'}
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      {paperId 
                        ? (language === 'VI' ? 'Cập nhật bài báo' : 'Update Paper')
                        : (language === 'VI' ? 'Nộp bài báo ngay' : 'Submit Paper Now')
                      }
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Sidebar - Tips & Requirements */}
        <div className="space-y-6">
          {/* Requirements Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {language === 'VI' ? 'Yêu cầu bài báo' : 'Paper Requirements'}
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-3 h-3 text-green-600" />
                </div>
                <span className="text-sm text-gray-700">
                  {language === 'VI' 
                    ? 'Định dạng LNCS (Springer)'
                    : 'LNCS format (Springer)'
                  }
                </span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-3 h-3 text-green-600" />
                </div>
                <span className="text-sm text-gray-700">
                  {language === 'VI' 
                    ? 'Tối đa 12 trang (bao gồm references)'
                    : 'Maximum 12 pages (including references)'
                  }
                </span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-3 h-3 text-green-600" />
                </div>
                <span className="text-sm text-gray-700">
                  {language === 'VI' 
                    ? 'Phản biện mù đôi (không tiết lộ tác giả)'
                    : 'Double-blind review (anonymous)'
                  }
                </span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-3 h-3 text-green-600" />
                </div>
                <span className="text-sm text-gray-700">
                  {language === 'VI' 
                    ? 'Bài báo gốc, chưa công bố'
                    : 'Original, unpublished work'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* AI Assistance Card */}
          <div className="bg-gradient-to-br from-[#F7FAFC] to-gray-50 rounded-2xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#D4AF37]" />
              {language === 'VI' ? 'Hỗ trợ AI' : 'AI Assistance'}
            </h3>
            <p className="text-sm text-gray-700 mb-4">
              {language === 'VI' 
                ? 'Sử dụng công cụ AI để cải thiện chất lượng bài báo:'
                : 'Use AI tools to enhance paper quality:'
              }
            </p>
            <div className="space-y-3">
              <button 
                onClick={getAISuggestions}
                className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:border-[#2C7A7B] hover:bg-[#2C7A7B]/5 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    {language === 'VI' ? 'Kiểm tra ngữ pháp' : 'Grammar Check'}
                  </span>
                  <Sparkles className="w-4 h-4 text-gray-400" />
                </div>
              </button>
              <button 
                onClick={getAISuggestions}
                className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:border-[#2C7A7B] hover:bg-[#2C7A7B]/5 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    {language === 'VI' ? 'Gợi ý từ khóa' : 'Keyword Suggestions'}
                  </span>
                  <Sparkles className="w-4 h-4 text-gray-400" />
                </div>
              </button>
              <button 
                onClick={() => navigate('/dashboard/templates')}
                className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:border-[#2C7A7B] hover:bg-[#2C7A7B]/5 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    {language === 'VI' ? 'Template mẫu' : 'Sample Templates'}
                  </span>
                  <FileText className="w-4 h-4 text-gray-400" />
                </div>
              </button>
            </div>
          </div>

          {/* Conference Info Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {language === 'VI' ? 'Thông tin hội nghị' : 'Conference Info'}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{language === 'VI' ? 'ID hội nghị:' : 'Conference ID:'}</span>
                <span className="font-medium text-gray-900">{formData.conference_id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{language === 'VI' ? 'Số track:' : 'Track count:'}</span>
                <span className="font-medium text-gray-900">{tracks.length}</span>
              </div>
              <div className="pt-3 border-t border-gray-100">
                <button 
                  onClick={() => navigate(`/conferences/${formData.conference_id}`)}
                  className="w-full py-2 text-center text-[#2C7A7B] font-medium hover:bg-[#2C7A7B]/10 rounded-lg transition-colors"
                >
                  {language === 'VI' ? 'Xem chi tiết hội nghị →' : 'View conference details →'}
                </button>
              </div>
            </div>
          </div>

          {/* Contact Support */}
          <div className="bg-gradient-to-r from-[#1A365D] to-[#2C7A7B] rounded-2xl p-6 text-white">
            <h3 className="text-lg font-bold mb-4">
              {language === 'VI' ? 'Cần hỗ trợ?' : 'Need Help?'}
            </h3>
            <p className="text-white/80 text-sm mb-4">
              {language === 'VI' 
                ? 'Liên hệ với chúng tôi nếu bạn gặp vấn đề khi nộp bài.'
                : 'Contact us if you encounter issues with submission.'
              }
            </p>
            <button 
              onClick={() => navigate('/dashboard/help')}
              className="w-full py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg font-medium hover:bg-white/30 transition-colors"
            >
              {language === 'VI' ? 'Liên hệ hỗ trợ' : 'Contact Support'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
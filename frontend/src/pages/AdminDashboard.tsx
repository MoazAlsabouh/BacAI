import { useState, useEffect } from 'react';
import { UploadCloud, FileText, AlertCircle, CheckCircle2, Loader2, Plus, LogOut, Trash2, BarChart3, Database, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [subjectId, setSubjectId] = useState('');
  const [type, setType] = useState('PAST_EXAM');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });

  // Tabs state
  const [activeTab, setActiveTab] = useState<'upload' | 'questions' | 'stats'>('upload');

  // Stats state
  const [statsData, setStatsData] = useState<any>(null);
  
  // Questions state
  const [questions, setQuestions] = useState<any[]>([]);
  const [questionsFilterSubject, setQuestionsFilterSubject] = useState('');
  const [questionsLoading, setQuestionsLoading] = useState(false);

  const [subjects, setSubjects] = useState<any[]>([]);
  const [isCreatingSubject, setIsCreatingSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [subjectLoading, setSubjectLoading] = useState(false);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchSubjects();
  }, [navigate]);

  useEffect(() => {
    if (activeTab === 'stats') {
      fetchStats();
    } else if (activeTab === 'questions') {
      fetchQuestions();
    }
  }, [activeTab, questionsFilterSubject]);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/stats`);
      const data = await res.json();
      if (res.ok) setStatsData(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchQuestions = async () => {
    setQuestionsLoading(true);
    try {
      const url = new URL(`${API_URL}/api/admin/questions`);
      if (questionsFilterSubject) url.searchParams.append('subjectId', questionsFilterSubject);
      const res = await fetch(url.toString());
      const data = await res.json();
      if (res.ok) setQuestions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setQuestionsLoading(false);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا السؤال؟')) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/questions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setQuestions(questions.filter(q => q.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/subjects`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch subjects');
      setSubjects(data);
      if (data.length > 0 && !subjectId) setSubjectId(data[0].id);
    } catch (err) {
      console.error('Error fetching subjects:', err);
    }
  };

  const handleCreateSubject = async () => {
    if (!newSubjectName.trim()) return;
    setSubjectLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/subjects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSubjectName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      await fetchSubjects();
      setSubjectId(data.id);
      setIsCreatingSubject(false);
      setNewSubjectName('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubjectLoading(false);
    }
  };

  const handleDeleteSubject = async () => {
    if (!subjectId) return;
    if (!confirm('هل أنت متأكد من حذف هذه المادة؟ سيتم حذف جميع الكتب والأسئلة المرتبطة بها نهائياً!')) return;
    
    setSubjectLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/subjects/${subjectId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('فشل في حذف المادة');
      
      setSubjectId('');
      await fetchSubjects();
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء الحذف');
    } finally {
      setSubjectLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!file || !subjectId) return;

    setLoading(true);
    setUploadProgress(0);
    setStatus({ type: null, message: '' });
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('subjectId', subjectId);
    formData.append('type', type);

    try {
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API_URL}/api/admin/upload-material`);
        
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percent);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error('Upload failed'));
          }
        };
        
        xhr.onerror = () => reject(new Error('Network Error'));
        xhr.send(formData);
      });

      setUploadProgress(null);
      setStatus({ type: 'success', message: 'تم رفع الملف ومعالجته بنجاح!' });
      setFile(null);
    } catch (err: any) {
      console.error(err);
      setUploadProgress(null);
      setStatus({ type: 'error', message: err.message || 'حدث خطأ أثناء الرفع أو المعالجة' });
    } finally {
      setLoading(false);
    }
  };

  const renderUploadTab = () => (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <UploadCloud className="text-primary" />
            رفع مادة تعليمية جديدة
          </h2>
          <button 
            onClick={() => {
              localStorage.removeItem('adminToken');
              localStorage.removeItem('adminName');
              navigate('/admin/login');
            }}
            className="text-sm font-medium text-red-500 hover:text-red-700 flex items-center gap-1 bg-red-50 px-3 py-2 rounded-lg transition-colors"
          >
            <LogOut size={16} /> تسجيل الخروج
          </button>
        </div>
        
        <p className="text-gray-500 mb-8">
          قم برفع الملفات (كتاب، دورات سابقة، أو قالب وزاري) ليقوم الذكاء الاصطناعي بتحليلها، استخراج الأسئلة وتصنيفها، أو حفظ القالب الامتحاني.
        </p>

        <form onSubmit={(e) => { e.preventDefault(); handleUpload(); }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">المادة الدراسية</label>
                <button 
                  type="button" 
                  onClick={() => setIsCreatingSubject(!isCreatingSubject)}
                  className="text-xs text-primary font-medium flex items-center hover:underline"
                >
                  <Plus size={14} /> {isCreatingSubject ? 'إلغاء' : 'إضافة مادة جديدة'}
                </button>
              </div>
              
              {isCreatingSubject ? (
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    placeholder="مثال: علم الأحياء"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  />
                  <button 
                    type="button" 
                    onClick={handleCreateSubject}
                    disabled={subjectLoading}
                    className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    حفظ
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <select 
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                  >
                    {subjects.length === 0 && <option value="">لا يوجد مواد</option>}
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleDeleteSubject}
                    disabled={!subjectId || subjectLoading}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="حذف المادة"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">نوع الملف المرفوع</label>
              <select 
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              >
                <option value="PAST_EXAM">أسئلة دورات سابقة</option>
                <option value="TEMPLATE">قالب امتحاني وزاري</option>
                <option value="BOOK">كتاب المادة</option>
                <option value="SUMMARY">ملخص</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">الملف</label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer">
              <input 
                type="file" 
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden" 
                id="file-upload" 
                accept=".txt,.pdf"
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-3">
                <FileText className="w-10 h-10 text-gray-400" />
                <span className="text-gray-600 font-medium">
                  {file ? file.name : 'اضغط لاختيار ملف أو اسحب الملف هنا'}
                </span>
                <span className="text-xs text-gray-400">PDF, TXT (Max 250MB)</span>
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={!file || !subjectId || loading}
            className="w-full bg-primary text-white py-3 rounded-lg font-medium shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" />
                {uploadProgress !== null && uploadProgress < 100 
                  ? `جاري الرفع... ${uploadProgress}%` 
                  : 'جاري المعالجة عبر الذكاء الاصطناعي... (قد يستغرق وقتاً)'}
              </>
            ) : (
              'رفع ومعالجة الملف'
            )}
          </button>
        </form>

        {status.type && (
          <div className={`mt-6 p-4 rounded-lg flex items-start gap-3 ${status.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {status.type === 'success' ? <CheckCircle2 className="mt-0.5" size={20} /> : <AlertCircle className="mt-0.5" size={20} />}
            <div>
              <p className="font-medium">{status.message}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderStatsTab = () => {
    if (!statsData) return <div className="text-center py-10"><Loader2 className="animate-spin mx-auto text-primary" /></div>;
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <BookOpen className="text-blue-500 mb-3" size={32} />
          <h3 className="text-gray-500 font-medium">إجمالي المواد الدراسية</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{statsData.totalSubjects}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <Database className="text-green-500 mb-3" size={32} />
          <h3 className="text-gray-500 font-medium">الأسئلة المستخرجة</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{statsData.totalQuestions}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <FileText className="text-purple-500 mb-3" size={32} />
          <h3 className="text-gray-500 font-medium">الامتحانات المُولدة</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{statsData.totalExams}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <CheckCircle2 className="text-orange-500 mb-3" size={32} />
          <h3 className="text-gray-500 font-medium">محاولات الطلاب</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{statsData.totalAttempts}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <BarChart3 className="text-red-500 mb-3" size={32} />
          <h3 className="text-gray-500 font-medium">متوسط العلامات</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{statsData.averageScore}%</p>
        </div>
      </div>
    );
  };

  const renderQuestionsTab = () => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-gray-800">بنك الأسئلة</h2>
        <select 
          className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary w-full md:w-64"
          value={questionsFilterSubject}
          onChange={(e) => setQuestionsFilterSubject(e.target.value)}
        >
          <option value="">جميع المواد</option>
          {subjects.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {questionsLoading ? (
        <div className="text-center py-10"><Loader2 className="animate-spin mx-auto text-primary" /></div>
      ) : questions.length === 0 ? (
        <div className="text-center py-10 text-gray-500">لا يوجد أسئلة مطابقة للبحث</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-gray-200 text-gray-600">
                <th className="pb-3 px-4">السؤال</th>
                <th className="pb-3 px-4">المادة</th>
                <th className="pb-3 px-4">النوع</th>
                <th className="pb-3 px-4">الصعوبة</th>
                <th className="pb-3 px-4">المصدر</th>
                <th className="pb-3 px-4 text-left">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 max-w-xs truncate" title={q.content}>{q.content}</td>
                  <td className="py-3 px-4">{q.subject?.name}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                      {q.type}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      q.difficulty <= 2 ? 'bg-green-50 text-green-700' :
                      q.difficulty === 3 ? 'bg-yellow-50 text-yellow-700' :
                      'bg-red-50 text-red-700'
                    }`}>
                      {q.difficulty} / 5
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500 truncate max-w-[150px]" title={q.source?.title}>{q.source?.title}</td>
                  <td className="py-3 px-4 text-left">
                    <button onClick={() => handleDeleteQuestion(q.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header and Tabs Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex bg-gray-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === 'upload' ? 'bg-white text-primary shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
          >
            <UploadCloud size={18} /> إدارة المواد
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === 'questions' ? 'bg-white text-primary shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
          >
            <Database size={18} /> بنك الأسئلة
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === 'stats' ? 'bg-white text-primary shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
          >
            <BarChart3 size={18} /> الإحصائيات
          </button>
        </div>
        <button 
          onClick={() => {
            localStorage.removeItem('adminToken');
            navigate('/admin/login');
          }}
          className="text-sm font-medium text-red-500 hover:text-red-700 flex items-center gap-1 bg-red-50 px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
        >
          <LogOut size={16} /> تسجيل الخروج
        </button>
      </div>

      {/* Tab Content */}
      <div className="transition-all">
        {activeTab === 'upload' && renderUploadTab()}
        {activeTab === 'questions' && renderQuestionsTab()}
        {activeTab === 'stats' && renderStatsTab()}
      </div>
    </div>
  );
}

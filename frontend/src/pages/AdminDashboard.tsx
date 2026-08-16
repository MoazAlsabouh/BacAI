import { useState, useEffect } from 'react';
import { UploadCloud, FileText, AlertCircle, CheckCircle2, Loader2, Plus, LogOut, Trash2 } from 'lucide-react';
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

  return (
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
}

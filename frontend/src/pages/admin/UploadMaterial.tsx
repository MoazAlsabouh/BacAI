import { useState, useEffect } from 'react';
import { UploadCloud, Plus, Loader2 } from 'lucide-react';
import { API_URL } from '../../config';

export default function UploadMaterial() {
  const [file, setFile] = useState<File | null>(null);
  const [subjectId, setSubjectId] = useState('');
  const [type, setType] = useState('PAST_EXAM');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });

  const [subjects, setSubjects] = useState<any[]>([]);
  const [isCreatingSubject, setIsCreatingSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectBranch, setNewSubjectBranch] = useState('SCIENTIFIC');
  const [subjectLoading, setSubjectLoading] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, []);

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
        body: JSON.stringify({ name: newSubjectName, branch: newSubjectBranch }),
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
            try {
              const errResp = JSON.parse(xhr.responseText);
              reject(new Error(errResp.error || 'Upload failed'));
            } catch {
              reject(new Error('Upload failed'));
            }
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
        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <UploadCloud className="text-primary" />
            إدارة المواد والرفع
          </h2>
        </div>
        
        <p className="text-gray-500 mb-8">
          قم بإدارة المواد الدراسية ورفع الملفات (كتاب، دورات سابقة، أو قالب وزاري) ليقوم الذكاء الاصطناعي بمعالجتها.
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
                <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-gray-600 font-bold">اسم المادة</label>
                    <input 
                      type="text" 
                      value={newSubjectName}
                      onChange={(e) => setNewSubjectName(e.target.value)}
                      placeholder="مثال: علم الأحياء"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-gray-600 font-bold">القسم / الفرع</label>
                    <select 
                      value={newSubjectBranch}
                      onChange={(e) => setNewSubjectBranch(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white"
                    >
                      <option value="SCIENTIFIC">الفرع العلمي</option>
                      <option value="LITERARY">الفرع الأدبي</option>
                    </select>
                  </div>
                  <button 
                    type="button" 
                    onClick={handleCreateSubject}
                    disabled={subjectLoading}
                    className="w-full bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors mt-2"
                  >
                    حفظ المادة
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <select 
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    required
                    className="flex-1 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none bg-white shadow-sm"
                  >
                    {subjects.length === 0 && <option value="">لا توجد مواد مضافة</option>}
                    {subjects.map((s: any) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.branch === 'SCIENTIFIC' ? 'علمي' : 'أدبي'})
                      </option>
                    ))}
                  </select>
                  {subjects.length > 0 && (
                    <button 
                      type="button"
                      onClick={handleDeleteSubject}
                      disabled={subjectLoading}
                      className="px-4 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-medium border border-red-100 transition-colors disabled:opacity-50"
                      title="حذف المادة المحددة"
                    >
                      حذف
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">نوع الملف</label>
              <select 
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none bg-white shadow-sm"
              >
                <option value="PAST_EXAM">دورة سابقة (استخراج أسئلة)</option>
                <option value="BOOK">كتاب مقرر (استخراج أسئلة)</option>
                <option value="SUMMARY">ملخص / نوطة (استخراج أسئلة)</option>
                <option value="TEMPLATE">قالب امتحاني وزاري (حفظ القواعد)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">الملف (PDF)</label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-10 h-10 text-gray-400 mb-3" />
                  <p className="mb-2 text-sm text-gray-500 font-medium">
                    {file ? <span className="text-primary">{file.name}</span> : 'اضغط لاختيار ملف PDF'}
                  </p>
                </div>
                <input type="file" className="hidden" accept="application/pdf" onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFile(e.target.files[0]);
                  }
                }} />
              </label>
            </div>
          </div>

          {status.message && (
            <div className={`p-4 rounded-xl text-sm font-medium border ${status.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
              {status.message}
            </div>
          )}

          {uploadProgress !== null && (
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
              <div className="bg-primary h-3 rounded-full transition-all duration-300 relative" style={{ width: `${uploadProgress}%` }}>
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
              <p className="text-xs text-center mt-2 text-gray-600 font-medium">{uploadProgress}% - يرجى الانتظار، قد تستغرق المعالجة بواسطة الذكاء الاصطناعي عدة دقائق...</p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading || !file || !subjectId}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white py-4 px-4 rounded-xl hover:bg-blue-700 transition-colors font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary/20"
          >
            {loading ? <Loader2 className="animate-spin" /> : <UploadCloud />}
            {loading ? 'جاري المعالجة...' : 'بدء الرفع والمعالجة الذكية'}
          </button>
        </form>
      </div>
    </div>
  );
}

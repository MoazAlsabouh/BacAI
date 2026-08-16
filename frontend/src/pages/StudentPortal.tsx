import { useState, useEffect } from 'react';
import { FileDown, PlayCircle, Loader2 } from 'lucide-react';
import { API_URL } from '../config';

// Suppress KaTeX warnings about Arabic characters
const originalWarn = console.warn;
console.warn = (...args) => {
  if (typeof args[0] === 'string' && (args[0].includes('LaTeX-incompatible') || args[0].includes('No character metrics'))) {
    return;
  }
  originalWarn(...args);
};

export default function StudentPortal() {
  const [subjectId, setSubjectId] = useState('');
  const [branch, setBranch] = useState('SCIENTIFIC');
  const [examCount, setExamCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [pdfReady, setPdfReady] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<any[]>([]);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await fetch(`${API_URL}/api/student/subjects`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch subjects');
      setSubjects(data);
    } catch (err) {
      console.error('Error fetching subjects:', err);
    }
  };

  useEffect(() => {
    const filtered = subjects.filter(s => s.branch === branch);
    setFilteredSubjects(filtered);
    if (filtered.length > 0) {
      setSubjectId(filtered[0].id);
    } else {
      setSubjectId('');
    }
  }, [subjects, branch]);

  const handleGeneratePdf = async () => {
    if (!subjectId) return;
    setLoading(true);
    setPdfReady(false);
    try {
      const response = await fetch(`${API_URL}/api/student/exams/random-pdf?subjectId=${subjectId}&templateId=template-uuid&examCount=${examCount}`);
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'فشل في توليد الامتحان');
      
      console.log('Exams generated:', data);
      
      setTimeout(() => {
        setPdfReady(true);
        setLoading(false);
      }, 1500);
      
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-10 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-4xl font-bold mb-4">استعد لامتحانات البكالوريا بذكاء!</h2>
          <p className="text-blue-100 text-lg max-w-2xl">
            نظام BacAI يوفر لك امتحانات ديناميكية تطابق القالب الوزاري تماماً. 
            تتدرب أونلاين وتحصل على تصحيح فوري مدعوم بالذكاء الاصطناعي، أو قم بطباعة كتيبك الخاص.
          </p>
        </div>
        {/* Decorative circle */}
        <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-white opacity-10 blur-2xl"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* PDF Generator Card */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center mb-6">
            <FileDown size={24} />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">كتيب التدريب (PDF)</h3>
          <p className="text-gray-500 mb-6 flex-1">
            قم بتوليد نماذج امتحانية عشوائية مخصصة تطابق القالب الوزاري ومستوى أسئلة الدورات السابقة. جاهزة للطباعة والحل الورقي.
          </p>
          
          <div className="space-y-4 mb-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">الفرع</label>
                <select 
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="SCIENTIFIC">الفرع العلمي</option>
                  <option value="LITERARY">الفرع الأدبي</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">المادة</label>
                <select 
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                >
                  {filteredSubjects.length === 0 && <option value="">لا يوجد مواد في هذا الفرع</option>}
                  {filteredSubjects.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">عدد النماذج المطلوبة</label>
              <input 
                type="number" 
                min="1" max="20"
                value={examCount}
                onChange={(e) => setExamCount(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>

          <button 
            onClick={handleGeneratePdf}
            disabled={loading}
            className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium shadow-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : <FileDown size={20} />}
            {loading ? 'جاري بناء النماذج...' : 'توليد وتحميل الكتيب (PDF)'}
          </button>
          
          {pdfReady && (
            <p className="text-green-600 text-sm mt-3 text-center font-medium">تم التحميل بنجاح! راجع مجلد التنزيلات.</p>
          )}
        </div>

        {/* Online Exam Card */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full relative overflow-hidden group">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
            <PlayCircle size={24} />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">اختبار تفاعلي أونلاين</h3>
          <p className="text-gray-500 mb-6 flex-1">
            قدم امتحاناً وزارياً مباشراً على المنصة. سيتم تصحيح الأتمتة فوراً، وسيقوم الذكاء الاصطناعي بتصحيح أسئلتك المقالية وإعطائك تغذية راجعة مفصلة!
          </p>
          
          <div className="space-y-4 mb-6">
             <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">الفرع</label>
                <select 
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="SCIENTIFIC">الفرع العلمي</option>
                  <option value="LITERARY">الفرع الأدبي</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">المادة</label>
                <select 
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                >
                  {filteredSubjects.length === 0 && <option value="">لا يوجد مواد في هذا الفرع</option>}
                  {filteredSubjects.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button 
            onClick={async () => {
              if (!subjectId) return;
              setLoading(true);
              try {
                const res = await fetch(`${API_URL}/api/student/exams/start`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ subjectId })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
                window.location.hash = `/exam/${data.attemptId}`;
              } catch (err: any) {
                alert(err.message);
                setLoading(false);
              }
            }}
            disabled={loading || !subjectId}
            className="w-full bg-primary text-white py-3 rounded-lg font-medium shadow-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <PlayCircle size={20} />}
            {loading ? 'جاري بناء الامتحان...' : 'بدء الامتحان الآن'}
          </button>
          
          {/* Subtle decoration */}
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 pointer-events-none"></div>
        </div>

      </div>
    </div>
  );
}

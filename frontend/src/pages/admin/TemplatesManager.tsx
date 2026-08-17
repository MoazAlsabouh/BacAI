import { useState, useEffect } from 'react';
import { BookOpen, Search, Code, Loader2, Database, Trash2 } from 'lucide-react';
import { API_URL } from '../../config';

export default function TemplatesManager() {
  // Helper to fix mojibake (utf-8 read as latin-1)
  const fixEncoding = (text: string) => {
    if (!text) return '';
    try {
      // If it looks like Mojibake, try decoding it
      if (text.includes('Ø') || text.includes('Ù')) {
        return decodeURIComponent(escape(text));
      }
      return text;
    } catch (e) {
      return text;
    }
  };

  const formatName = (name: string) => {
    let clean = fixEncoding(name);
    return clean.includes('.pdf') ? clean.replace('.pdf', '') : clean;
  };

  const [subjects, setSubjects] = useState<any[]>([]);
  const [filterSubject, setFilterSubject] = useState('');
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/admin/subjects`)
      .then(res => res.json())
      .then(data => setSubjects(data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [filterSubject]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const url = new URL(`${API_URL}/api/admin/templates`);
      if (filterSubject) url.searchParams.append('subjectId', filterSubject);
      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا القالب؟')) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/templates/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        if (selectedTemplate?.id === id) setSelectedTemplate(null);
        fetchTemplates();
      } else {
        alert('حدث خطأ أثناء الحذف');
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء الحذف');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-gray-100 pb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BookOpen className="text-primary" />
            إدارة القوالب الامتحانية (Exam Templates)
          </h2>
          
          <select 
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none bg-gray-50 font-medium min-w-[200px]"
          >
            <option value="">جميع المواد</option>
            {subjects.map((s: any) => (
              <option key={s.id} value={s.id}>{s.name} ({s.branch === 'SCIENTIFIC' ? 'علمي' : 'أدبي'})</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* List of Templates */}
          <div className="lg:col-span-1 space-y-4 border-l border-gray-100 pl-6">
            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
              <Search size={18} /> القوالب المتوفرة
            </h3>
            
            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" /></div>
            ) : templates.length === 0 ? (
              <p className="text-sm text-gray-500 italic">لا توجد قوالب امتحانية مخزنة.</p>
            ) : (
              templates.map(t => (
                <div 
                  key={t.id} 
                  className={`p-4 rounded-xl border transition-all flex flex-col gap-2 ${selectedTemplate?.id === t.id ? 'border-primary bg-blue-50 shadow-sm' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}`}
                >
                  <div 
                    className="cursor-pointer flex-1"
                    onClick={() => setSelectedTemplate(t)}
                  >
                    <h4 className="font-bold text-gray-800 text-sm" dir="auto">{formatName(t.name)}</h4>
                    <p className="text-xs text-gray-500 mt-1">المادة: {t.subject?.name}</p>
                  </div>
                  <div className="flex justify-end mt-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(t.id); }}
                      className="text-red-500 hover:bg-red-100 p-2 rounded-lg transition-colors"
                      title="حذف القالب"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Template Details & Logic Explanation */}
          <div className="lg:col-span-2">
            {!selectedTemplate ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <Code size={48} className="mb-4 opacity-50" />
                <p>اختر قالباً من القائمة لعرض تفاصيله ومعماريته البرمجية</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-blue-900 mb-2" dir="auto">{formatName(selectedTemplate.name)}</h3>
                    <p className="text-sm text-blue-700">هذا القالب يحدد المعايير الدقيقة التي يقوم النظام بناءً عليها بتوليد امتحانات جديدة عشوائية ولكن مطابقة للمواصفات الوزارية.</p>
                  </div>
                  <button 
                    onClick={() => handleDeleteTemplate(selectedTemplate.id)}
                    className="bg-red-50 text-red-600 hover:bg-red-100 p-3 rounded-xl transition-colors border border-red-100 flex items-center gap-2 text-sm font-medium whitespace-nowrap"
                  >
                    <Trash2 size={16} /> حذف القالب
                  </button>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Database size={18} className="text-primary" />
                    القواعد المخزنة في قاعدة البيانات (JSON Rules)
                  </h4>
                  <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto" dir="ltr">
                    <pre className="text-green-400 text-xs font-mono">
                      {JSON.stringify(selectedTemplate.rules, null, 2)}
                    </pre>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Code size={18} className="text-primary" />
                    كيف تعمل خوارزمية توليد الامتحان؟ (المنطق البرمجي)
                  </h4>
                  <ul className="space-y-3 text-sm text-gray-700 list-decimal list-inside leading-relaxed bg-gray-50 p-5 rounded-xl">
                    <li>يبدأ النظام بقراءة مصفوفة <code className="bg-white px-1 py-0.5 rounded border text-blue-600">sections</code> من القالب أعلاه.</li>
                    <li>لكل قسم (Section)، يحدد النظام نوع الأسئلة المطلوبة (مثل <code className="bg-white px-1 py-0.5 rounded border text-red-500">MCQ, ESSAY, PROBLEM_SOLVING</code>) والمواضيع المطلوبة <code className="bg-white px-1 py-0.5 rounded border text-indigo-500">topics</code>.</li>
                    <li>يقوم النظام بالاتصال ببنك الأسئلة للمادة الحالية، ويستخرج كافة الأسئلة المطابقة لهذا النوع.</li>
                    <li>تُحسب <strong>"درجة تطابق" (Topic Score)</strong> لكل سؤال بناءً على التقاطع بين مواضيعه ومواضيع القسم المطلوب في القالب.</li>
                    <li>يستخدم النظام خوارزمية <strong>ترتيب عشوائي ذكية</strong> لاختيار أفضل الأسئلة تطابقاً، مع الحفاظ على عشوائية الاختيار بين الأسئلة المتساوية في التطابق لضمان تنوع الامتحانات.</li>
                    <li>في حال عدم توفر أسئلة كافية في البنك تغطي العدد المطلوب، يتم إرجاع خطأ <code className="bg-white px-1 py-0.5 rounded border text-red-500">400 Bad Request</code> لمنع توليد امتحان ناقص.</li>
                    <li>أخيراً، يتم إنشاء سجل جديد في جدول <code className="bg-white px-1 py-0.5 rounded border text-green-600">Exam</code> وربطه بالأسئلة المختارة بجدول وسيط يحفظ الترتيب (Order).</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

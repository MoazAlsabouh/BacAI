import { useState, useEffect } from 'react';
import { BookOpen, Search, Code, Loader2, Database } from 'lucide-react';
import { API_URL } from '../../config';

export default function TemplatesManager() {
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
      // Since we don't have a direct /api/admin/templates endpoint yet, 
      // we'll need to create one or assume it exists. Let's assume we'll build it.
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
                  onClick={() => setSelectedTemplate(t)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedTemplate?.id === t.id ? 'border-primary bg-blue-50 shadow-sm' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}`}
                >
                  <h4 className="font-bold text-gray-800 text-sm">{t.name}</h4>
                  <p className="text-xs text-gray-500 mt-1">المادة: {t.subject?.name}</p>
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
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                  <h3 className="text-xl font-bold text-blue-900 mb-2">{selectedTemplate.name}</h3>
                  <p className="text-sm text-blue-700">هذا القالب يحدد المعايير الدقيقة التي يقوم النظام بناءً عليها بتوليد امتحانات جديدة عشوائية ولكن مطابقة للمواصفات الوزارية.</p>
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
                    <li>لكل قسم (Section)، يحدد النظام نوع الأسئلة المطلوبة (مثل <code className="bg-white px-1 py-0.5 rounded border text-red-500">MCQ</code>) والعدد المطلوب (Count).</li>
                    <li>يقوم النظام بالاتصال ببنك الأسئلة للمادة الحالية، ويستخرج كافة الأسئلة المطابقة لهذا النوع.</li>
                    <li>يستخدم النظام خوارزمية ترتيب عشوائي (Random Shuffle) لاختيار العدد المطلوب من الأسئلة، مع التأكد عبر <code className="bg-white px-1 py-0.5 rounded border text-purple-600">usedQuestionIds</code> من عدم تكرار نفس السؤال في أقسام مختلفة.</li>
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

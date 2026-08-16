import { useState, useEffect } from 'react';
import { Database, Trash2, Loader2 } from 'lucide-react';
import Latex from 'react-latex-next';
import { API_URL } from '../../config';

export default function QuestionBank() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [filterSubject, setFilterSubject] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch subjects once
  useEffect(() => {
    fetch(`${API_URL}/api/admin/subjects`)
      .then(res => res.json())
      .then(data => setSubjects(data))
      .catch(err => console.error(err));
  }, []);

  // Polling for questions every 5 seconds
  useEffect(() => {
    fetchQuestions();
    const interval = setInterval(fetchQuestions, 5000);
    return () => clearInterval(interval);
  }, [filterSubject]);

  const fetchQuestions = async () => {
    try {
      const url = new URL(`${API_URL}/api/admin/questions`);
      if (filterSubject) url.searchParams.append('subjectId', filterSubject);
      const res = await fetch(url.toString());
      const data = await res.json();
      if (res.ok) {
        setQuestions(data);
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
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

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-gray-100 pb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Database className="text-primary" />
            بنك الأسئلة الشامل
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

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 bg-blue-50 p-3 rounded-lg text-blue-700">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              يتم تحديث هذه الصفحة تلقائياً كل 5 ثوانٍ لإظهار الأسئلة الجديدة فور استخراجها.
            </div>

            {questions.length === 0 ? (
              <div className="text-center text-gray-500 py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                لا توجد أسئلة مخزنة في البنك لهذه المادة.
              </div>
            ) : (
              questions.map((q: any) => (
                <div key={q.id} className="border border-gray-200 rounded-xl p-5 hover:border-primary/50 transition-colors bg-gray-50/50">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
                        {q.type}
                      </span>
                      <span className="bg-gray-200 text-gray-700 text-xs font-bold px-3 py-1 rounded-full">
                        الصعوبة: {q.difficulty}/5
                      </span>
                      <span className="text-sm font-medium text-gray-500">
                        {q.subject.name} - {q.source?.title}
                      </span>
                    </div>
                    <button 
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      title="حذف السؤال"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <h4 className="text-lg font-medium text-gray-800 mb-4 leading-relaxed" dir="ltr" style={{ textAlign: 'right' }}>
                    <Latex>{q.content}</Latex>
                  </h4>
                  
                  {q.type === 'MCQ' && q.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                      {q.options.map((opt: string, idx: number) => (
                        <div key={idx} className={`p-3 rounded-lg border text-sm flex items-center justify-end ${opt === q.correctAnswer ? 'bg-green-50 border-green-200 text-green-800 font-bold' : 'bg-white border-gray-200 text-gray-600'}`} dir="ltr" style={{ textAlign: 'right' }}>
                          <Latex>{opt}</Latex>
                        </div>
                      ))}
                    </div>
                  )}

                  {q.type !== 'MCQ' && q.rubric && (
                    <div className="mt-4 bg-yellow-50/50 p-4 rounded-lg border border-yellow-100">
                      <p className="text-xs font-bold text-yellow-800 mb-2">سلم التصحيح (Rubric):</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap"><Latex>{q.rubric}</Latex></p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

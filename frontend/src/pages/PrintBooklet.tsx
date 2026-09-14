import { useLocation, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';

// Suppress KaTeX warnings about Arabic characters
const originalWarn = console.warn;
console.warn = (...args) => {
  if (typeof args[0] === 'string' && (args[0].includes('LaTeX-incompatible') || args[0].includes('No character metrics'))) {
    return;
  }
  originalWarn(...args);
};

export default function PrintBooklet() {
  const location = useLocation();
  const { exams, subjectName, branch } = location.state || {};

  useEffect(() => {
    if (exams) {
      document.title = `نماذج_امتحانية_${subjectName}_${branch === 'SCIENTIFIC' ? 'علمي' : 'أدبي'}`;
      // Give images/fonts a moment to load before printing
      const timer = setTimeout(() => window.print(), 1000);
      return () => clearTimeout(timer);
    }
  }, [exams, subjectName, branch]);

  if (!exams) {
    return <Navigate to="/" />;
  }

  // Determine language direction based on subject name (basic heuristic)
  const isForeignLanguage = subjectName.includes('إنكليزي') || subjectName.includes('فرنسي');

  return (
    <div className="bg-white min-h-screen text-black" dir={isForeignLanguage ? "ltr" : "rtl"}>
      {/* 
        Print styles to hide UI when printing and handle page breaks
      */}
      <style>
        {`
          @media print {
            @page {
              margin: 15mm;
              size: A4;
            }
            body {
              background: white;
            }
            .no-print {
              display: none !important;
            }
            .page-break {
              page-break-before: always;
            }
            .avoid-break {
              page-break-inside: avoid;
            }
          }
        `}
      </style>

      {/* Floating button for manual printing (hidden in print) */}
      <div className="fixed bottom-8 left-8 no-print z-50 flex gap-4">
        <button 
          onClick={() => window.close()} 
          className="bg-gray-600 text-white px-6 py-3 rounded-full shadow-lg font-bold hover:bg-gray-700 transition"
        >
          إغلاق
        </button>
        <button 
          onClick={() => window.print()} 
          className="bg-blue-600 text-white px-8 py-3 rounded-full shadow-lg font-bold hover:bg-blue-700 transition"
        >
          🖨️ حفظ كـ PDF / طباعة
        </button>
      </div>

      {exams.map((exam: any, idx: number) => (
        <div key={idx} className={idx > 0 ? "page-break" : ""}>
          {/* Ministry Header - Always RTL */}
          <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6" dir="rtl">
            <div className="text-right">
              <h2 className="font-bold text-lg">الجمهورية العربية السورية</h2>
              <h2 className="font-bold text-lg">وزارة التربية والتعليم</h2>
            </div>
            
            <div className="text-center flex-1 px-4">
              <h1 className="font-bold text-xl mb-1">النموذج الاسترشادي للاختبار النهائي لمادة {subjectName}</h1>
              <h2 className="font-bold text-lg">للصف الثالث الثانوي {branch === 'SCIENTIFIC' ? 'العلمي' : 'الأدبي'}</h2>
              <h3 className="font-bold">للعام الدراسي {new Date().getFullYear()} م - {new Date().getFullYear() + 1} م</h3>
              <p className="text-sm mt-1 text-gray-700">(النموذج التدريبي رقم {exam.examNumber})</p>
            </div>

            <div className="text-right whitespace-nowrap border-r-2 border-black pr-4">
              <p className="font-bold">الاسم: ....................</p>
              <p className="font-bold">الرقم: ....................</p>
              <p className="font-bold">المدة: {isForeignLanguage ? 'ساعتان ونصف' : '3 ساعات'}</p>
              <p className="font-bold">الدرجة: {isForeignLanguage ? '400' : '600'} درجة</p>
            </div>
          </div>

          {/* Exam Body */}
          <div className="space-y-6">
            {exam.sections.map((section: any, sIdx: number) => (
              <div key={sIdx} className="avoid-break mb-8">
                {/* Section Title */}
                <h3 className="font-bold text-lg mb-4 underline decoration-2 underline-offset-4">
                  {section.title} ({section.questions.length * section.marksPerQuestion} درجة)
                </h3>

                {/* Questions */}
                <div className="space-y-4 pl-4">
                  {section.questions.map((q: any, qIdx: number) => (
                    <div key={q.id} className="avoid-break mb-4">
                      {/* Render question content with a number */}
                      <div className="flex gap-2 text-md font-semibold" dir="ltr" style={{ textAlign: 'right' }}>
                        <span className="min-w-[24px]" dir="rtl">{qIdx + 1}-</span>
                        <div className="flex-1 whitespace-pre-wrap leading-relaxed"><Latex>{q.content}</Latex></div>
                      </div>

                      {/* Render MCQ options horizontally if they exist */}
                      {q.type === 'MCQ' && q.options && (
                        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 ml-8 ${isForeignLanguage ? 'pr-8' : 'pr-8'}`} dir="ltr" style={{ textAlign: 'right' }}>
                          {q.options.map((opt: string, oIdx: number) => (
                            <div key={oIdx} className="flex gap-2">
                              <span className="font-bold" dir="rtl">{String.fromCharCode(isForeignLanguage ? 97 + oIdx : 1571 + oIdx)}-</span> 
                              <span><Latex>{opt}</Latex></span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* True / False line */}
                      {q.type === 'TRUE_FALSE' && (
                        <div className="mt-2 ml-8 italic text-sm">
                          (..........)
                        </div>
                      )}

                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center font-bold text-xl mt-12 mb-8">
            انتهت الأسئلة
          </div>
        </div>
      ))}
    </div>
  );
}

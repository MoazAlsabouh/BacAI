import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Send, CheckCircle, Bot, Award, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';
import { API_URL } from '../config';

// Suppress KaTeX warnings about Arabic characters
const originalWarn = console.warn;
console.warn = (...args) => {
  if (typeof args[0] === 'string' && (args[0].includes('LaTeX-incompatible') || args[0].includes('No character metrics'))) {
    return;
  }
  originalWarn(...args);
};

export default function ExamOnline() {
  const { attemptId } = useParams();
  const [examData, setExamData] = useState<any>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGraded, setIsGraded] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExam();
  }, [attemptId]);

  const fetchExam = async () => {
    try {
      const res = await fetch(`${API_URL}/api/student/exams/${attemptId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setExamData(data);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center mt-20"><Loader2 className="animate-spin text-primary w-10 h-10" /></div>;
  }

  if (!examData) {
    return <div className="text-center text-red-500 mt-20">لم يتم العثور على الامتحان</div>;
  }

  const questionsList = examData.exam.questions;
  const activeQuestionData = questionsList[currentQuestionIdx]?.question;
  const isLastQuestion = currentQuestionIdx === questionsList.length - 1;

  const handleAnswerChange = (val: string) => {
    setAnswers({ ...answers, [activeQuestionData.id]: val });
  };

  const handleNext = () => {
    if (!isLastQuestion) setCurrentQuestionIdx(curr => curr + 1);
  };

  const handlePrev = () => {
    if (currentQuestionIdx > 0) setCurrentQuestionIdx(curr => curr - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    let totalScore = 0;
    let questionsGraded = 0;
    let allFeedbacks: { [key: string]: string } = {};

    try {
      // Loop through all questions and submit them
      for (const qWrapper of questionsList) {
        const q = qWrapper.question;
        const studentResp = answers[q.id];
        
        // If student didn't answer, we still submit empty string to get a 0
        const res = await fetch(`${API_URL}/api/student/exams/${attemptId}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            questionId: q.id, 
            studentResponse: studentResp || ' ' 
          })
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        totalScore += data.result.earnedScore;
        questionsGraded++;
        allFeedbacks[q.id] = data.result.aiFeedback;
      }

      const maxPossibleScore = questionsList.length; // Assuming 1 point per question
      const percentage = Math.round((totalScore / maxPossibleScore) * 100);

      setFeedback({
        score: percentage,
        total: 100,
        text: "تم تصحيح كامل الامتحان.",
        details: allFeedbacks
      });
      setIsGraded(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isGraded) {
    return (
      <div className="max-w-4xl mx-auto mt-10 space-y-6">
        <div className="text-center">
          <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Award size={48} />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">تم التصحيح بنجاح!</h2>
          <div className="inline-block mt-4 text-2xl font-bold bg-blue-50 text-blue-700 px-6 py-3 rounded-xl border border-blue-100">
            علامة الاختبار: {feedback.score} %
          </div>
        </div>
        
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">مراجعة الإجابات:</h3>
          <div className="space-y-6">
            {questionsList.map((qWrapper: any, idx: number) => {
              const q = qWrapper.question;
              return (
              <div key={q.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex gap-4">
                  <div className="w-10 h-10 shrink-0 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600">
                    {idx + 1}
                  </div>
                  <div className="flex-1 space-y-4">
                    <h4 className="text-lg font-medium text-gray-800" dir="ltr" style={{ textAlign: 'right' }}>
                      <Latex>{q.content}</Latex>
                    </h4>
                    
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <span className="text-sm font-bold text-gray-500 mb-1 block">إجابتك:</span>
                      <p className="text-gray-800" dir="ltr" style={{ textAlign: 'right' }}>
                        {answers[q.id] ? <Latex>{answers[q.id]}</Latex> : <span className="text-red-500 italic" dir="rtl">لم تتم الإجابة</span>}
                      </p>
                    </div>

                    {q.type === 'MCQ' ? (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 text-green-700 border border-green-200" dir="ltr" style={{ textAlign: 'right' }}>
                        <CheckCircle size={20} className="shrink-0" />
                        <span>الإجابة الصحيحة هي: <Latex>{q.correctAnswer || 'غير متوفرة'}</Latex></span>
                      </div>
                    ) : (
                      <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-2 mb-2 text-primary font-bold">
                          <Bot size={20} />
                          ملاحظات التصحيح الدلالي (AI)
                        </div>
                        <p className="text-gray-700 leading-relaxed text-sm">
                          {feedback.details ? feedback.details[q.id] : 'غير متوفر'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )})}
          </div>
        </div>
        
        <div className="text-center pb-12 pt-6">
          <Link to="/" className="inline-block text-primary hover:underline font-medium text-lg">
            العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">{examData.exam.title}</h2>
        <div className="bg-white px-4 py-2 rounded-full shadow-sm text-sm font-medium text-gray-600 border border-gray-200">
          السؤال {currentQuestionIdx + 1} من {questionsList.length}
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <div className="mb-8">
          <span className="inline-block bg-blue-50 text-blue-600 px-3 py-1 rounded-md text-xs font-bold mb-4">
            {activeQuestionData.type === 'MCQ' ? 'سؤال أتمتة' : 'سؤال مقالي'}
          </span>
          <h3 className="text-xl text-gray-800 font-medium leading-relaxed" dir="ltr" style={{ textAlign: 'right' }}>
            <Latex>{activeQuestionData.content}</Latex>
          </h3>
        </div>

        {activeQuestionData.type === 'MCQ' ? (
          <div className="space-y-3">
            {/* Handle both array of strings or missing options nicely */}
            {Array.isArray(activeQuestionData.options) ? activeQuestionData.options.map((opt: string, idx: number) => (
              <label 
                key={idx} 
                className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${answers[activeQuestionData.id] === opt ? 'border-primary bg-blue-50/50' : 'border-gray-200 hover:bg-gray-50'}`}
              >
                <input 
                  type="radio" 
                  name={activeQuestionData.id} 
                  value={opt}
                  checked={answers[activeQuestionData.id] === opt}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  className="w-5 h-5 text-primary focus:ring-primary shrink-0"
                />
                <span className="text-gray-700" dir="ltr" style={{ textAlign: 'right' }}>
                  <Latex>{opt}</Latex>
                </span>
              </label>
            )) : <p className="text-gray-500 italic">لا توجد خيارات متاحة لهذا السؤال</p>}
          </div>
        ) : (
          <div>
            <textarea 
              rows={8}
              placeholder="اكتب إجابتك هنا بوضوح..."
              value={answers[activeQuestionData.id] || ''}
              onChange={(e) => handleAnswerChange(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none resize-none"
            ></textarea>
            <div className="mt-4 flex items-start gap-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
              <Bot className="shrink-0 mt-0.5" size={16} />
              <p>سيقوم الذكاء الاصطناعي بتصحيح إجابتك بناءً على المعنى، لذا لا تقلق إذا لم تتذكر الصياغة الحرفية للكتاب، ركز على إيصال الأفكار العلمية الصحيحة.</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <button 
          onClick={handlePrev}
          disabled={currentQuestionIdx === 0}
          className="px-6 py-3 rounded-lg font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          السابق
        </button>
        
        {!isLastQuestion ? (
          <button 
            onClick={handleNext}
            className="px-6 py-3 rounded-lg font-medium bg-primary text-white hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            التالي
            <ArrowRight size={18} />
          </button>
        ) : (
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-8 py-3 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            {isSubmitting ? <span className="animate-pulse">جاري التصحيح بالذكاء الاصطناعي...</span> : (
              <>
                <Send size={18} />
                تسليم وتصحيح الإجابات
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

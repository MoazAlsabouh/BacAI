import { useState, useEffect } from 'react';
import { BarChart3, Users, BookOpen, Database, Target, Loader2 } from 'lucide-react';
import { API_URL } from '../../config';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function Statistics() {
  const [globalStats, setGlobalStats] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [subjectStats, setSubjectStats] = useState<any>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [loadingGlobal, setLoadingGlobal] = useState(true);
  const [loadingSubject, setLoadingSubject] = useState(false);

  // Initial fetch and auto-refresh setup
  useEffect(() => {
    fetchGlobalStats();
    fetchSubjects();

    const intervalId = setInterval(() => {
      fetchGlobalStats();
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  // Fetch subject specific stats when selection changes
  useEffect(() => {
    if (selectedSubjectId) {
      fetchSubjectStats();
      const intervalId = setInterval(() => {
        fetchSubjectStats();
      }, 5000);
      return () => clearInterval(intervalId);
    } else {
      setSubjectStats(null);
    }
  }, [selectedSubjectId]);

  const fetchGlobalStats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/stats`);
      if (res.ok) {
        const data = await res.json();
        setGlobalStats(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingGlobal(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/subjects`);
      if (res.ok) {
        const data = await res.json();
        setSubjects(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSubjectStats = async () => {
    setLoadingSubject(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/stats/subject/${selectedSubjectId}`);
      if (res.ok) {
        const data = await res.json();
        setSubjectStats(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSubject(false);
    }
  };

  if (loadingGlobal) {
    return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  }

  // Formatting data for charts
  const typeChartData = subjectStats ? [
    { name: 'أتمتة (MCQ)', value: subjectStats.questionsByType.MCQ || 0 },
    { name: 'مقالي (ESSAY)', value: subjectStats.questionsByType.ESSAY || 0 },
    { name: 'مسائل (MATH)', value: subjectStats.questionsByType.MATH || 0 },
  ] : [];

  const difficultyChartData = subjectStats ? Object.keys(subjectStats.questionsByDifficulty).map(key => ({
    name: `مستوى ${key}`,
    count: subjectStats.questionsByDifficulty[key]
  })) : [];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Global Stats Overview */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-6">
          <BarChart3 className="text-primary" />
          الإحصائيات العامة للمنصة
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3">
              <BookOpen size={24} />
            </div>
            <h3 className="text-3xl font-bold text-gray-800">{globalStats.totalSubjects}</h3>
            <p className="text-sm font-medium text-gray-500 mt-1">إجمالي المواد</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-3">
              <Database size={24} />
            </div>
            <h3 className="text-3xl font-bold text-gray-800">{globalStats.totalQuestions}</h3>
            <p className="text-sm font-medium text-gray-500 mt-1">إجمالي الأسئلة المستخرجة</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-3">
              <Users size={24} />
            </div>
            <h3 className="text-3xl font-bold text-gray-800">{globalStats.totalAttempts}</h3>
            <p className="text-sm font-medium text-gray-500 mt-1">إجمالي المحاولات للامتحان</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mb-3">
              <Target size={24} />
            </div>
            <h3 className="text-3xl font-bold text-gray-800">{globalStats.averageScore}%</h3>
            <p className="text-sm font-medium text-gray-500 mt-1">متوسط علامات الطلاب</p>
          </div>
        </div>
      </div>

      <div className="h-px w-full bg-gray-200 my-8"></div>

      {/* Subject Specific Stats */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">الإحصائيات التخصصية للمواد</h2>
            <p className="text-sm text-gray-500">اختر مادة لعرض تفاصيل التوزيع البياني للأسئلة.</p>
          </div>
          <select 
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none bg-gray-50 font-medium min-w-[250px]"
          >
            <option value="">-- يرجى اختيار مادة --</option>
            {subjects.map((s: any) => (
              <option key={s.id} value={s.id}>{s.name} ({s.branch === 'SCIENTIFIC' ? 'علمي' : 'أدبي'})</option>
            ))}
          </select>
        </div>

        {!selectedSubjectId ? (
          <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">قم باختيار مادة من القائمة أعلاه لعرض المخططات البيانية</p>
          </div>
        ) : loadingSubject && !subjectStats ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" /></div>
        ) : subjectStats ? (
          <div className="space-y-6">
            {/* Total Questions for Subject */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-blue-900">إجمالي الأسئلة المتوفرة في البنك</h3>
                <p className="text-sm text-blue-700 mt-1">لهذه المادة التخصصية</p>
              </div>
              <div className="text-4xl font-bold text-primary flex items-center gap-2">
                <Database size={32} />
                {subjectStats.totalQuestions}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Pie Chart: Questions by Type */}
            <div className="border border-gray-200 rounded-2xl p-6">
              <h3 className="font-bold text-gray-800 mb-6 text-center">توزع الأسئلة حسب النمط</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={typeChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {typeChartData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar Chart: Questions by Difficulty */}
            <div className="border border-gray-200 rounded-2xl p-6">
              <h3 className="font-bold text-gray-800 mb-6 text-center">توزع الأسئلة حسب الصعوبة (1-5)</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={difficultyChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <RechartsTooltip 
                      formatter={(value) => [value, 'عدد الأسئلة']}
                      labelStyle={{ color: 'black' }} 
                    />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { User, ShieldCheck } from 'lucide-react';
import StudentPortal from './pages/StudentPortal';
import AdminLayout from './layouts/AdminLayout';
import AdminLogin from './pages/AdminLogin';
import Statistics from './pages/admin/Statistics';
import UploadMaterial from './pages/admin/UploadMaterial';
import QuestionBank from './pages/admin/QuestionBank';
import TemplatesManager from './pages/admin/TemplatesManager';

import ExamOnline from './pages/ExamOnline';

function Layout({ children }: { children: React.ReactNode }) {
  const isAdminLoggedIn = !!localStorage.getItem('adminToken');

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3 py-2">
              <Link to="/" className="flex items-center">
                <img src="/logo.jpg" alt="BacAI Logo" className="h-12 w-auto object-contain hover:opacity-90 transition-opacity" />
              </Link>
            </div>
            <div className="flex items-center gap-4">
              {isAdminLoggedIn && (
                <Link to="/admin" className="text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 shadow-sm">
                  <ShieldCheck size={18} className="text-primary" />
                  لوحة التحكم
                </Link>
              )}
              <Link to="/" className="text-sm font-medium text-white bg-primary px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
                <User size={18} />
                بوابة الطالب
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<StudentPortal />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/exam/:attemptId" element={<ExamOnline />} />
          
          <Route path="/admin" element={<AdminLayout><Statistics /></AdminLayout>} />
          <Route path="/admin/stats" element={<AdminLayout><Statistics /></AdminLayout>} />
          <Route path="/admin/upload" element={<AdminLayout><UploadMaterial /></AdminLayout>} />
          <Route path="/admin/questions" element={<AdminLayout><QuestionBank /></AdminLayout>} />
          <Route path="/admin/templates" element={<AdminLayout><TemplatesManager /></AdminLayout>} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

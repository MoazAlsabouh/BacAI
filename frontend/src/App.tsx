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

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-500 text-sm font-medium">
              جميع الحقوق محفوظة لـ <span className="text-gray-900 font-bold">معاذ الصبوح</span> &copy; {new Date().getFullYear()}
            </div>
            <div className="flex items-center gap-4" dir="ltr">
              <a href="https://github.com/MoazAlsabouh/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
              </a>
              <a href="https://www.linkedin.com/in/moazalsabouh" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </a>
              <a href="https://www.instagram.com/moazns/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="https://www.facebook.com/moazns" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
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

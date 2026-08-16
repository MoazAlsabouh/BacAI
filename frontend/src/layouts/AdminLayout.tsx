import { Link, useLocation, useNavigate } from 'react-router-dom';
import { UploadCloud, BarChart3, Database, LogOut, BookOpen } from 'lucide-react';
import { useEffect } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const navItems = [
    { path: '/admin/stats', label: 'الإحصائيات', icon: <BarChart3 size={20} /> },
    { path: '/admin/upload', label: 'إدارة المواد', icon: <UploadCloud size={20} /> },
    { path: '/admin/questions', label: 'بنك الأسئلة', icon: <Database size={20} /> },
    { path: '/admin/templates', label: 'قوالب الامتحانات', icon: <BookOpen size={20} /> },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-gray-50 border-l border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">لوحة التحكم</h2>
          <p className="text-xs text-gray-500 mt-1">مركز إدارة المنصة</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            // Determine active state: if path is /admin and we are on stats, treat stats as active
            const isRootAdmin = location.pathname === '/admin' && item.path === '/admin/stats';
            const isActive = location.pathname.startsWith(item.path) || isRootAdmin;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-primary text-white font-bold shadow-md shadow-primary/20' 
                    : 'text-gray-600 hover:bg-gray-200/50 hover:text-gray-900'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={() => {
              localStorage.removeItem('adminToken');
              navigate('/admin/login');
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium border border-transparent hover:border-red-100"
          >
            <LogOut size={18} />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 bg-gray-50/30 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

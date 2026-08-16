import { useState } from 'react';
import { Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل تسجيل الدخول');
      }

      // Store the token (in real app, we would store it in localStorage or Context)
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminName', data.admin.name);

      navigate('/admin');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 w-full max-w-md relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-blue-50 rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="w-16 h-16 bg-blue-50 text-primary rounded-2xl flex items-center justify-center mb-6 shadow-inner">
            <Lock size={32} />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-800 mb-2">تسجيل الدخول</h2>
          <p className="text-gray-500 mb-8">خاص بالمشرفين وإدارة المنصة.</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
              <div className="relative">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@bacai.com"
                  className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  required
                />
                <Mail className="absolute right-4 top-3.5 text-gray-400" size={20} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
              <div className="relative">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  required
                />
                <Lock className="absolute right-4 top-3.5 text-gray-400" size={20} />
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>
            )}

            <button 
              type="submit" 
              disabled={loading || !email || !password}
              className="w-full bg-primary text-white py-3.5 rounded-xl font-semibold shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
            >
              {loading ? <Loader2 className="animate-spin" /> : (
                <>
                  الدخول للوحة التحكم
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

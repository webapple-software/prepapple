import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Shield, GraduationCap, Key, AlertCircle } from 'lucide-react';

export default function Login({ role = 'student' }: { role?: 'student' | 'admin' }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    const cached = localStorage.getItem('currentUser');
    if (cached) {
      const user = JSON.parse(cached);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'teacher') navigate('/dashboard');
      else if (user.role === 'student') navigate('/student');
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store in localStorage
      localStorage.setItem('currentUser', JSON.stringify(data.user));

      // Redirect based on role
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else if (data.user.role === 'teacher') {
        navigate('/dashboard');
      } else {
        navigate('/student');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans select-none relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-50/50 via-slate-50 to-slate-50 z-0"></div>

      <div className="relative z-10 w-full max-w-lg bg-white backdrop-blur-md rounded-3xl border border-slate-200/80 p-8 shadow-2xl shadow-slate-100/70 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Brand/Logo Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 p-3.5 rounded-2xl text-white shadow-xl shadow-blue-500/20 mb-3.5">
            {role === 'admin' ? (
              <Shield className="w-8 h-8" />
            ) : (
              <GraduationCap className="w-8 h-8" />
            )}
          </div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-wider flex items-center">
            PrepApple <span className="text-blue-650 font-extrabold text-xs ml-1.5 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{role.toUpperCase()}</span>
          </h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1.5">{role} Login Portal</p>
        </div>

        {/* Display Errors */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3 text-xs font-semibold mb-6 animate-shake">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2.5">
              {role === 'admin' ? 'Admin ID' : 'Username'}
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                required
                placeholder={role === 'admin' ? 'mahakal' : 'Enter your username'}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-205 border-slate-200 focus:border-blue-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 font-semibold text-slate-800 text-sm placeholder-slate-400 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2.5">Password</label>
            <div className="relative">
              <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                required
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-205 border-slate-200 focus:border-blue-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 font-semibold text-slate-800 text-sm placeholder-slate-400 transition-all"
              />
            </div>
          </div>

          {role === 'admin' && (
            <div className="text-[10px] text-slate-550 bg-slate-50 border border-slate-200 p-3 rounded-xl font-semibold leading-relaxed">
              💡 Use ID: <strong className="text-slate-800 font-black">mahakal</strong> and Password: <strong className="text-slate-800 font-black">mahakal@123</strong> to login as admin.
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl tracking-wider uppercase transition-all shadow-lg shadow-blue-500/10 hover:shadow-blue-500/25 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-6"
          >
            {loading ? (
              <>
                <div className="w-4.5 h-4.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Portal Switching Links */}
        <div className="mt-8 pt-6 border-t border-slate-200/80 flex flex-col gap-2.5 text-center">
          {role !== 'student' && (
            <Link to="/login/student" className="text-xs font-bold text-blue-650 hover:text-blue-700 transition-colors uppercase tracking-wider">
              Are you a Student? Go to Student Portal
            </Link>
          )}
          {role !== 'admin' && (
            <Link to="/login/admin" className="text-xs font-bold text-blue-650 hover:text-blue-700 transition-colors uppercase tracking-wider">
              Are you an Admin? Go to Admin Portal
            </Link>
          )}
          <Link to="/" className="text-[11px] font-bold text-slate-400 hover:text-slate-600 transition-colors mt-1.5 uppercase tracking-wider">
            ← Back to Portal Selection
          </Link>
        </div>
      </div>
    </div>
  );
}


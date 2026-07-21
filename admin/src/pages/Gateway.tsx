import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, GraduationCap, Landmark, ArrowRight } from 'lucide-react';

export default function Gateway() {
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-6 font-sans select-none text-slate-800 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-50/40 via-slate-50 to-slate-50 z-0"></div>

      {/* Top Brand Header */}
      <header className="relative z-10 max-w-7xl mx-auto w-full flex justify-between items-center py-4 border-b border-slate-200/80">
        <Link to="/" className="flex items-center gap-2.5 cursor-pointer">
          <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-500/20">
            <Landmark className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="font-extrabold text-slate-800 text-lg tracking-wider uppercase">PrepApple</span>
            <span className="text-blue-600 font-extrabold text-[10px] ml-1.5 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">CBT</span>
          </div>
        </Link>
        <div className="text-[10px] uppercase tracking-widest text-slate-400 font-black hidden sm:block">
          MOCK TEST PORTAL v1.0.0
        </div>
      </header>

      {/* Main Selection Area */}
      <main className="relative z-10 max-w-6xl mx-auto w-full my-auto py-12 flex flex-col items-center">
        <div className="text-center max-w-2xl mb-12">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-800 uppercase tracking-tight leading-none">
            Choose Your Portal
          </h1>
          <p className="text-slate-500 text-sm font-semibold mt-3.5">
            Select the appropriate option below to access your mock test examination dashboard.
          </p>
        </div>

        {/* Portal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
          
          {/* Student Card */}
          <Link
            to="/login/student"
            className="group relative bg-white border border-slate-200/80 hover:border-blue-500/40 rounded-3xl p-7 shadow-xl shadow-slate-100/50 hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-300 flex flex-col justify-between h-72 hover:-translate-y-1.5"
          >
            <div>
              <div className="bg-blue-50 text-blue-600 p-4.5 rounded-2xl w-fit group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                <GraduationCap className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-extrabold mt-5 text-slate-800 tracking-wide group-hover:text-blue-650 transition-colors">Student Portal</h3>
              <p className="text-slate-500 text-xs font-semibold mt-2.5 leading-relaxed">
                Log in to attempt assigned mock examinations, view dynamic results, and review past test scores.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-blue-650 group-hover:text-blue-700 transition-colors uppercase tracking-wider mt-4">
              <span>Go to Login</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Admin Card */}
          <Link
            to="/login/admin"
            className="group relative bg-white border border-slate-200/80 hover:border-purple-500/40 rounded-3xl p-7 shadow-xl shadow-slate-100/50 hover:shadow-2xl hover:shadow-purple-500/5 transition-all duration-300 flex flex-col justify-between h-72 hover:-translate-y-1.5"
          >
            <div>
              <div className="bg-purple-50 text-purple-650 p-4.5 rounded-2xl w-fit group-hover:bg-purple-600 group-hover:text-white transition-all shadow-sm">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-extrabold mt-5 text-slate-800 tracking-wide group-hover:text-purple-650 transition-colors">Admin Control</h3>
              <p className="text-slate-500 text-xs font-semibold mt-2.5 leading-relaxed">
                System-level access. Import configuration files, manage users, seed tests, and access administrative settings.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-purple-600 group-hover:text-purple-700 transition-colors uppercase tracking-wider mt-4">
              <span>Go to Login</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

        </div>
      </main>

      {/* Footer Info */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full text-center py-4 border-t border-slate-200/80 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
        &copy; {new Date().getFullYear()} PrepApple. All rights reserved.
      </footer>
    </div>
  );
}


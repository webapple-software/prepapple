import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

const Navbar = () => {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center gap-3">
            <img src="/assets/logo-prepapple.png" alt="PrepApple Logo" className="h-12 w-auto object-contain rounded-2xl mix-blend-multiply" onError={(e) => { e.target.onerror = null; e.target.src = "/assets/logo.jpeg"; }} />
            <div className="flex flex-col">
              <span className="font-heading font-extrabold text-2xl text-[#0B1F4D] leading-none">
                Prep<span className="text-[#1E88E5]">Apple</span>
              </span>
              <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Practice Today. Excel Tomorrow.</span>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 font-medium text-slate-600">
            <Link to="/" className="hover:text-accent-start transition-colors">Home</Link>
            <Link to="/about" className="hover:text-accent-start transition-colors">About Us</Link>
          </nav>
          
          <div className="flex items-center gap-4">
            <a 
              href="/student" 
              className="border-2 border-[#0B1F4D] text-[#0B1F4D] hover:bg-slate-100 font-bold text-xs py-2.5 px-5 rounded-xl transition-all uppercase tracking-wider hidden sm:flex items-center justify-center cursor-pointer shadow-sm"
            >
              Student Login
            </a>
            <a 
              href="https://forms.gle/ML2urJTy75xXFXK18" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-[#1E88E5] hover:bg-blue-600 text-white font-extrabold text-xs py-3 px-6 rounded-xl transition-all shadow-[0_4px_14px_rgba(30,136,229,0.35)] hover:-translate-y-0.5 uppercase tracking-wider flex items-center justify-center cursor-pointer"
            >
              Subscribe ₹49
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

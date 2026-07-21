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
              className="border-2 border-[#111827] text-[#111827] hover:bg-slate-50 font-bold text-xs py-2.5 px-5 rounded-xl transition-all shadow-[2px_2px_0px_#0F766E] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#0F766E] uppercase tracking-wider hidden sm:flex items-center justify-center cursor-pointer"
            >
              Student Login
            </a>
            <a 
              href="https://forms.gle/ML2urJTy75xXFXK18" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs py-3 px-6 rounded-xl transition-all shadow-[0_4px_12px_rgba(37,99,235,0.2)] hover:shadow-[0_6px_16px_rgba(37,99,235,0.3)] hover:-translate-y-0.5 uppercase tracking-wider flex items-center justify-center cursor-pointer"
            >
              Subscribe ₹25
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

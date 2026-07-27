import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, BookOpen } from 'lucide-react';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="/assets/logo-prepapple.png" 
              alt="PrepApple Logo" 
              className="h-11 sm:h-12 w-11 sm:w-12 object-cover rounded-full mix-blend-multiply border border-slate-200/50 shadow-xs" 
              onError={(e) => { e.target.onerror = null; e.target.src = "/assets/logo.jpeg"; }} 
            />
            <div className="flex flex-col">
              <span className="font-heading font-extrabold text-xl sm:text-2xl text-[#0B1F4D] leading-none">
                Prep<span className="text-[#1E88E5]">Apple</span>
              </span>
              <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                Practice Today. Excel Tomorrow.
              </span>
            </div>
          </Link>
          
          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 font-bold text-sm text-slate-700">
            <Link to="/" className="hover:text-[#1E88E5] transition-colors">Home</Link>
            <Link to="/mock-tests" className="hover:text-[#1E88E5] transition-colors">Mock Tests</Link>
            <Link to="/pricing" className="hover:text-[#1E88E5] transition-colors flex items-center gap-1">
              <span>Pricing</span>
              <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded font-extrabold uppercase">₹49</span>
            </Link>
            <Link to="/about" className="hover:text-[#1E88E5] transition-colors">About Us</Link>
            <Link to="/contact" className="hover:text-[#1E88E5] transition-colors">Contact</Link>
          </nav>
          
          {/* Right Action Buttons & Mobile Toggle */}
          <div className="flex items-center gap-3 sm:gap-4">
            <a 
              href="/student" 
              className="border-2 border-[#0B1F4D] text-[#0B1F4D] hover:bg-slate-100 font-bold text-xs py-2.5 px-4 sm:px-5 rounded-xl transition-all uppercase tracking-wider hidden sm:flex items-center justify-center cursor-pointer shadow-sm"
            >
              Student Login
            </a>
            <a 
              href="https://forms.gle/ML2urJTy75xXFXK18" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-[#1E88E5] hover:bg-blue-600 text-white font-extrabold text-xs py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl transition-all shadow-[0_4px_14px_rgba(30,136,229,0.35)] hover:-translate-y-0.5 uppercase tracking-wider flex items-center justify-center cursor-pointer"
            >
              Subscribe ₹49
            </a>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-700 hover:text-[#1E88E5] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-4 shadow-xl">
          <nav className="flex flex-col space-y-3 font-bold text-sm text-slate-700">
            <Link 
              to="/" 
              onClick={() => setMobileMenuOpen(false)} 
              className="p-2.5 rounded-xl hover:bg-blue-50 hover:text-[#1E88E5] transition-colors"
            >
              Home
            </Link>
            <Link 
              to="/mock-tests" 
              onClick={() => setMobileMenuOpen(false)} 
              className="p-2.5 rounded-xl hover:bg-blue-50 hover:text-[#1E88E5] transition-colors"
            >
              Mock Tests
            </Link>
            <Link 
              to="/pricing" 
              onClick={() => setMobileMenuOpen(false)} 
              className="p-2.5 rounded-xl hover:bg-blue-50 hover:text-[#1E88E5] transition-colors flex items-center justify-between"
            >
              <span>Pricing & Plans</span>
              <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded font-extrabold uppercase">₹49 / Mo</span>
            </Link>
            <Link 
              to="/about" 
              onClick={() => setMobileMenuOpen(false)} 
              className="p-2.5 rounded-xl hover:bg-blue-50 hover:text-[#1E88E5] transition-colors"
            >
              About Us
            </Link>
            <Link 
              to="/contact" 
              onClick={() => setMobileMenuOpen(false)} 
              className="p-2.5 rounded-xl hover:bg-blue-50 hover:text-[#1E88E5] transition-colors"
            >
              Contact Support
            </Link>
          </nav>

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2.5">
            <a 
              href="/student" 
              className="w-full border-2 border-[#0B1F4D] text-[#0B1F4D] hover:bg-slate-100 font-bold text-xs py-3 rounded-xl uppercase tracking-wider flex items-center justify-center cursor-pointer shadow-sm text-center"
            >
              Student Portal Login
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

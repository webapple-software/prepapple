import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

const Navbar = () => {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center gap-3">
            <img src="/assets/logo.jpeg" alt="PrepApple Logo" className="h-12 w-auto mix-blend-multiply" onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/50x50?text=Logo"; }} />
            <div className="flex flex-col">
              <span className="font-heading font-extrabold text-2xl text-primary leading-none">PrepApple</span>
              <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Practice Today. Excel Tomorrow.</span>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 font-medium text-slate-600">
            <Link to="/" className="hover:text-accent-start transition-colors">Home</Link>
            <Link to="/about" className="hover:text-accent-start transition-colors">About Us</Link>
            <Link to="/my-subscription" className="hover:text-accent-start transition-colors">My Subscription</Link>
          </nav>
          
          <div className="flex items-center gap-4">
            <a href="http://localhost:5173/student" className="text-slate-600 hover:text-primary font-medium transition-colors hidden sm:block">Student Login</a>
            <a href="https://forms.gle/ML2urJTy75xXFXK18" target="_blank" rel="noopener noreferrer" className="btn-primary py-2 px-6">Subscribe ₹25</a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

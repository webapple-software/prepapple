import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface PageLoaderProps {
  children?: React.ReactNode;
}

export default function PageLoader({ children }: PageLoaderProps) {
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Quick, clean page transition loader
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
      {/* Simple, Minimalist Animated Page Loader */}
      {loading && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/95 backdrop-blur-md select-none transition-opacity duration-200">
          <div className="relative flex items-center justify-center w-32 h-32 mb-4">
            {/* Smooth Single Gradient Spinner Ring */}
            <div className="absolute inset-0 rounded-full border-4 border-slate-100 border-t-[#0052D4] border-r-[#FF2A85] animate-spin"></div>
            
            {/* Centered Larger preapple-fevicon Icon */}
            <img 
              src="/assets/preapple-fevicon.png" 
              alt="Prepapple Loading" 
              className="w-auto h-16 sm:h-20 object-contain animate-pulse drop-shadow-sm"
              onError={(e: any) => { e.target.onerror = null; e.target.src = "/preapple-fevicon.png"; }}
            />
          </div>

          <span className="text-xs font-black text-[#0B1F4D] tracking-widest uppercase">
            Loading<span className="animate-pulse">...</span>
          </span>
        </div>
      )}

      {/* Main Page Content */}
      {children}
    </>
  );
}

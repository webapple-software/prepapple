import React, { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle2, ShieldCheck, ChevronRight, GraduationCap, Landmark, BookOpen, Crosshair, Train, Stethoscope, Calculator, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { categoriesData } from '../data/mockData';
import { ChevronLeft } from 'lucide-react';

const HeroSlider = () => {
  const slides = [
    {
      image: '/assets/slider_banner_1.jpg',
      title: 'Smart Practice Platform',
      desc: 'Simulate real Exam Hall conditions with our smart Mock tests.'
    },
    {
      image: '/assets/slider_banner_2.jpg',
      title: 'Detailed Analytics & Progress',
      desc: 'Track score curves, accuracy, and section-wise analytics.'
    },
    {
      image: '/assets/slider_banner_3.jpg',
      title: 'All Competitive Exams',
      desc: 'Preparation for JEE, NEET, SSC, Railways, Defense, and Teaching.'
    }
  ];

  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handlePrev = () => {
    setActiveIdx((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setActiveIdx((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="relative w-full max-w-lg lg:max-w-xl aspect-[16/9] overflow-hidden rounded-2xl border border-slate-100 shadow-[0_20px_50px_rgba(30,136,229,0.15)] group select-none bg-slate-900">
      {/* Slides */}
      <div 
        className="flex w-full h-full transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${activeIdx * 100}%)` }}
      >
        {slides.map((slide, idx) => (
          <div key={idx} className="relative w-full h-full flex-shrink-0">
            <img 
              src={slide.image} 
              alt={slide.title} 
              className="w-full h-full object-cover opacity-90 transition-all duration-300 group-hover:scale-105" 
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/30 to-transparent flex flex-col justify-end p-6 md:p-8">
              <h3 className="text-white text-base md:text-xl font-black uppercase tracking-wide drop-shadow-md">
                {slide.title}
              </h3>
              <p className="text-blue-150 text-[10px] md:text-xs font-semibold mt-1 opacity-90 drop-shadow max-w-sm">
                {slide.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Nav Chevrons */}
      <button 
        onClick={handlePrev}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 backdrop-blur hover:bg-white/90 text-white hover:text-slate-800 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow cursor-pointer border border-white/10"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button 
        onClick={handleNext}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 backdrop-blur hover:bg-white/90 text-white hover:text-slate-800 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow cursor-pointer border border-white/10"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20 bg-slate-950/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIdx(idx)}
            className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
              activeIdx === idx ? 'bg-primary scale-125 w-4' : 'bg-white/60 hover:bg-white'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

const Home = () => {
  const [categories, setCategories] = useState(categoriesData);

  useEffect(() => {
    fetch('http://localhost:5000/api/categories')
      .then(res => {
        if (!res.ok) throw new Error('Offline');
        return res.json();
      })
      .then(data => {
        if (data && data.length > 0) {
          setCategories(data);
        }
      })
      .catch(err => {
        console.log('Using static categories fallback:', err);
      });
  }, []);
  const getIcon = (iconString) => {
    switch (iconString) {
      case 'Calculator': return <Calculator className="w-6 h-6" />;
      case 'Stethoscope': return <Stethoscope className="w-6 h-6" />;
      case 'GraduationCap': return <GraduationCap className="w-6 h-6" />;
      case 'Train': return <Train className="w-6 h-6" />;
      case 'Landmark': return <Landmark className="w-6 h-6" />;
      case 'Crosshair': return <Crosshair className="w-6 h-6" />;
      case 'BookOpen': return <BookOpen className="w-6 h-6" />;
      case 'ShieldCheck': return <ShieldCheck className="w-6 h-6" />;
      default: return <Calculator className="w-6 h-6" />;
    }
  };

  return (
    <div>
      {/* EduRev-style Hero Section */}
      <section className="relative overflow-hidden bg-white pt-16 pb-12 lg:pt-24 lg:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row gap-12 items-center justify-between">
            
            {/* Left Content */}
            <div className="w-full lg:w-1/2 order-2 lg:order-1 text-center lg:text-left">
              <h1 className="text-5xl lg:text-[64px] font-extrabold leading-tight tracking-tight text-slate-800 mb-2">
                Study <span className="inline-block bg-primary text-white px-4 py-1 rounded-xl shadow-md">Smarter</span>
              </h1>
              <h1 className="text-5xl lg:text-[64px] font-extrabold leading-tight tracking-tight text-slate-800 mb-6">
                Score <span className="text-accent-start uppercase tracking-wider relative inline-block">
                  HIGHER
                  {/* Underline Decoration */}
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 9.5C40.5 3.5 120 -1.5 197.5 9.5" stroke="#1E88E5" strokeWidth="4" strokeLinecap="round"/></svg>
                </span>
              </h1>
              
              <p className="text-xl text-slate-500 font-semibold mb-10 max-w-lg mx-auto lg:mx-0">
                PrepApple stands for Exam Excellence. Get premium mock tests at just ₹25/month.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a href="https://forms.gle/ML2urJTy75xXFXK18" target="_blank" rel="noopener noreferrer" className="btn-primary flex items-center justify-center gap-2 text-lg px-8 py-4">
                  Subscribe for ₹25/Month <ArrowRight className="w-5 h-5" />
                </a>
                <a href="http://localhost:5173/student" className="flex items-center justify-center gap-2 text-lg px-8 py-4 border-2 border-primary text-primary rounded-xl font-bold hover:bg-blue-50 transition-colors">
                  Student Login
                </a>
              </div>
            </div>
            
            {/* Right Illustration - Premium Slider */}
            <div className="w-full lg:w-1/2 order-1 lg:order-2 flex justify-center lg:justify-end">
              <HeroSlider />
            </div>
            
          </div>
        </div>
      </section>

      {/* Trust Stats Bar */}
      <section className="pb-16 -mt-4 bg-white relative z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
              
              <div className="pt-4 md:pt-0">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-3xl lg:text-4xl font-extrabold text-primary">200+</span>
                </div>
                <p className="text-slate-500 font-medium">Students Practicing Monthly</p>
              </div>
              
              <div className="pt-4 md:pt-0">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-3xl lg:text-4xl font-extrabold text-primary">8+</span>
                </div>
                <p className="text-slate-500 font-medium">Premium CBT Mock Tests</p>
              </div>
              
              <div className="pt-4 md:pt-0">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-3xl lg:text-4xl font-extrabold text-primary">100%</span>
                </div>
                <p className="text-slate-500 font-medium">Trusted Subject Teachers</p>
              </div>
              
            </div>
          </div>
          
          <div className="text-center mt-6 flex items-center justify-center gap-3 text-slate-400 font-medium text-sm">
            <ShieldCheck className="w-5 h-5 text-accent-start" />
            Most Affordable Premium Testing Platform in India
          </div>
        </div>
      </section>

      {/* Choose Your Exam Section (EduRev style grid) */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-800 mb-4">
              Choose Your <span className="relative inline-block">
                Exam Category
                <svg className="absolute -bottom-2 left-0 w-full opacity-50" viewBox="0 0 200 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 9.5C40.5 3.5 120 -1.5 197.5 9.5" stroke="#1E88E5" strokeWidth="4" strokeLinecap="round"/></svg>
              </span>
            </h2>
            <p className="text-slate-500">Select your target exam to access CBT tests for just ₹25/month.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            
            {categories.map((cat) => {
              const colorClasses = {
                blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
                green: 'bg-green-50 text-green-600 hover:bg-green-100',
                purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
                red: 'bg-red-50 text-red-600 hover:bg-red-100',
                amber: 'bg-amber-50 text-amber-600 hover:bg-amber-100',
                slate: 'bg-slate-50 text-slate-600 hover:bg-slate-100',
                orange: 'bg-orange-50 text-orange-600 hover:bg-orange-100',
                indigo: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
              };
              const activeColor = colorClasses[cat.color] || colorClasses.blue;

              return (
                <Link key={cat.id} to={`/category/${cat.id}`} className="bg-white rounded-xl p-4 border border-slate-200 hover:border-primary hover:shadow-md transition-all flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${activeColor}`}>
                      {getIcon(cat.icon)}
                    </div>
                    <div className="font-bold text-slate-800 text-base">{cat.title}</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                </Link>
              );
            })}

          </div>
        </div>
      </section>

      {/* Subscription Callout (Floating Card) */}
      <section className="pt-20 pb-10 bg-blue-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto bg-[#0B1F4D] rounded-[2.5rem] p-12 md:p-16 text-center shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
              All you need for your next exam,<br/> get it in your pocket now
            </h2>
            <p className="text-lg text-blue-200 mb-10">
              Trusted by 200+ students monthly
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a href="https://forms.gle/ML2urJTy75xXFXK18" target="_blank" rel="noopener noreferrer" className="bg-[#f97316] text-white font-bold text-lg py-3 px-8 rounded-xl shadow-lg hover:bg-orange-600 transition-colors">
                Subscribe for ₹25/Month
              </a>
              <a href="http://localhost:5173/student" className="bg-transparent border border-slate-500 text-white font-bold text-lg py-3 px-8 rounded-xl hover:bg-white/10 transition-colors">
                Student Login
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;


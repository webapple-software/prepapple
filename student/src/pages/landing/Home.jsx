import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  ChevronRight, 
  ChevronLeft,
  GraduationCap, 
  Landmark, 
  BookOpen, 
  Crosshair, 
  Train, 
  Stethoscope, 
  Calculator, 
  Shield, 
  Sparkles, 
  Award, 
  Zap, 
  BarChart3, 
  Clock, 
  Target, 
  Users, 
  ChevronDown, 
  Bookmark,
  Calendar,
  Star
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { categoriesData } from '../data/mockData';

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
    <div className="relative w-full max-w-lg aspect-[16/9] overflow-hidden rounded-[2rem] border border-slate-200/80 shadow-[0_20px_50px_rgba(37,99,235,0.12)] group select-none bg-slate-900">
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
              <h3 className="text-white text-base md:text-lg font-black uppercase tracking-wide drop-shadow-md">
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
        type="button"
        onClick={handlePrev}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 backdrop-blur hover:bg-white/90 text-white hover:text-slate-800 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow cursor-pointer border border-white/10"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button 
        type="button"
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
            type="button"
            onClick={() => setActiveIdx(idx)}
            className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
              activeIdx === idx ? 'bg-blue-600 scale-125 w-4' : 'bg-white/60 hover:bg-white'
            }`}
          />
        ))}
      </div>
    </div>
  );
};


const Home = () => {
  const [categories, setCategories] = useState(categoriesData);
  const [activeFaq, setActiveFaq] = useState(null);

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
      case 'Calculator': return <Calculator className="w-5.5 h-5.5" />;
      case 'Stethoscope': return <Stethoscope className="w-5.5 h-5.5" />;
      case 'GraduationCap': return <GraduationCap className="w-5.5 h-5.5" />;
      case 'Train': return <Train className="w-5.5 h-5.5" />;
      case 'Landmark': return <Landmark className="w-5.5 h-5.5" />;
      case 'Crosshair': return <Crosshair className="w-5.5 h-5.5" />;
      case 'BookOpen': return <BookOpen className="w-5.5 h-5.5" />;
      case 'ShieldCheck': return <ShieldCheck className="w-5.5 h-5.5" />;
      default: return <Calculator className="w-5.5 h-5.5" />;
    }
  };

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "What is included in the ₹25 monthly full pass?",
      a: "The full pass grants you unlimited attempts to all grand mock tests, topic-wise assessments, chapter-wise sectionals, and daily practice quizzes. It works across all categories including JEE, NEET, and regional exams."
    },
    {
      q: "How do I unlock premium tests after making the payment?",
      a: "Once you fill out the payment registration form and make the UPI deposit, our admin team verifies the transaction. Your login credentials (Student ID and Password) are generated and sent to your WhatsApp number and Email within 1 to 2 hours."
    },
    {
      q: "Are the mock papers updated to the latest exam syllabus?",
      a: "Yes, all test series and sectional question papers are regularly reviewed and updated by our expert subject mentors to match current examination patterns, weighting, and syllabus changes."
    },
    {
      q: "Can I review detailed solutions and explanations after submitting a test?",
      a: "Absolutely! The moment you submit a test, you get an in-depth performance analysis scorecard. You can then review each question step-by-step with correct answers, your selected options, and detailed mathematical or conceptual explanations."
    }
  ];

  return (
    <div className="min-h-screen bg-[#FCFCFC] text-[#111827] font-sans relative overflow-hidden selection:bg-blue-100 selection:text-blue-900">
      
      {/* Background Animated Gradient Blobs */}
      <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-[100px] -z-10 animate-pulse" style={{ animationDuration: '8s' }}></div>
      <div className="absolute top-[500px] left-[-200px] w-[600px] h-[600px] bg-teal-100/25 rounded-full blur-[120px] -z-10 animate-pulse" style={{ animationDuration: '12s' }}></div>

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 lg:pt-24 lg:pb-20 overflow-hidden">
        {/* Subtle Tech Background Image & Grid Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-35 -z-10"
          style={{ backgroundImage: "url('/assets/hero_bg.jpg')" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f080_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f080_1px,transparent_1px)] bg-[size:24px_24px] -z-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/80 to-[#FCFCFC] -z-10" />

        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex flex-col lg:flex-row gap-16 items-center justify-between">
            
            {/* Left Column: Copywriting */}
            <div className="w-full lg:w-[55%] text-center lg:text-left space-y-6">
              
              {/* Premium Announcement Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-blue-50/80 border border-blue-100 text-[#2563EB] text-xs font-bold uppercase tracking-wider shadow-sm">
                <Sparkles className="w-4 h-4 text-[#F59E0B] animate-pulse" />
                <span>Next-Gen CBT Practice Ecosystem</span>
              </div>

              <h1 className="text-[42px] sm:text-[56px] leading-[1.15] font-extrabold tracking-tight text-[#111827] font-heading">
                Master exams <br/>
                <span className="text-[#2563EB] relative inline-block">
                  with precision
                  <span className="absolute bottom-1 left-0 w-full h-1.5 bg-blue-100 -z-10 rounded"></span>
                </span>
              </h1>

              <p className="text-[18px] leading-[1.7] text-[#6B7280] font-normal max-w-xl mx-auto lg:mx-0">
                <span className="font-extrabold text-[#0B1F4D]">Prep<span className="text-[#1E88E5]">Apple</span></span> stands for Exam Excellence. Access authentic computer-based grand mocks, chapter-wise sectionals, and daily quizzes designed by trusted mentors. Start practicing now for just <span className="text-[#2563EB] font-bold">₹25/month</span>.
              </p>
              
              {/* Custom Non-repetitive Unique Buttons */}
              <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start pt-4">
                <a 
                  href="https://forms.gle/ML2urJTy75xXFXK18" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="bg-[#2563EB] text-white hover:bg-blue-700 font-bold text-sm py-4.5 px-9 rounded-xl transition-all shadow-[0_4px_14px_rgba(37,99,235,0.25)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.35)] flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer hover:-translate-y-0.5"
                >
                  <span>Start Learning journey</span> 
                  <ArrowRight className="w-4.5 h-4.5" />
                </a>
                
                <a 
                  href="/student" 
                  className="border-2 border-[#111827] text-[#111827] font-bold text-sm py-4 px-9 rounded-xl shadow-[4px_4px_0px_#0F766E] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#0F766E] transition-all flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer bg-white"
                >
                  <span>Student Login</span>
                </a>
              </div>

            </div>
            
            {/* Right Column: Premium Slider Illustration */}
            <div className="w-full lg:w-[45%] flex justify-center relative">
              <div className="absolute -inset-2 bg-gradient-to-tr from-blue-500 to-teal-500 rounded-[2.5rem] blur opacity-10"></div>
              <HeroSlider />
            </div>


          </div>
        </div>
      </section>

      {/* Trust Stats Bar */}
      <section className="pb-24 relative z-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.03)] border border-slate-200/80 p-8 sm:p-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center divide-y md:divide-y-0 md:divide-x divide-slate-150">
              
              <div className="pt-4 md:pt-0 space-y-1">
                <span className="text-[40px] font-extrabold text-[#111827] block font-heading">200+</span>
                <p className="text-[#6B7280] text-xs font-bold uppercase tracking-wider">Active Students</p>
                <p className="text-[#6B7280] text-xs font-normal">Attempting assessments monthly</p>
              </div>
              
              <div className="pt-8 md:pt-0 space-y-1">
                <span className="text-[40px] font-extrabold text-[#111827] block font-heading">50+</span>
                <p className="text-[#6B7280] text-xs font-bold uppercase tracking-wider">Premium Mock Tests</p>
                <p className="text-[#6B7280] text-xs font-normal">Sectionals, grand series, and quizzes</p>
              </div>
              
              <div className="pt-8 md:pt-0 space-y-1">
                <span className="text-[40px] font-extrabold text-[#111827] block font-heading">100%</span>
                <p className="text-[#6B7280] text-xs font-bold uppercase tracking-wider">Authentic Solutions</p>
                <p className="text-[#6B7280] text-xs font-normal">Drafted by expert teachers</p>
              </div>
              
            </div>
          </div>
        </div>
      </section>

      {/* Choose Your Exam Section - Interactive Course Cards */}
      <section className="py-20 bg-[#FCFCFC] border-t border-slate-150">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-[10px] font-bold text-[#0F766E] uppercase tracking-widest bg-[#0F766E]/5 border border-[#0F766E]/10 px-3 py-1 rounded-full">Active Exam Modules</span>
            <h2 className="text-[40px] leading-tight font-extrabold text-[#111827] font-heading">
              Select Your Target Exam
            </h2>
            <p className="text-[#6B7280] text-[18px] leading-[1.7] font-normal">Click on your target exam below to access subject-wise sectional quizzes and full CBT mock papers.</p>
          </div>

          {/* Cards with different non-repetitive layouts based on content */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            
            {categories.map((cat, idx) => {
              const colorClasses = {
                blue: 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-[#2563EB] hover:text-white',
                green: 'bg-teal-50 text-teal-700 border-teal-100 hover:bg-[#0F766E] hover:text-white',
                purple: 'bg-purple-50 text-purple-750 border-purple-100 hover:bg-purple-650 hover:text-white',
                red: 'bg-red-50 text-red-700 border-red-100 hover:bg-red-600 hover:text-white',
                amber: 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-[#F59E0B] hover:text-white',
                slate: 'bg-slate-50 text-slate-700 border-slate-150 hover:bg-slate-750 hover:text-white',
                orange: 'bg-orange-50 text-orange-700 border-orange-100 hover:bg-orange-600 hover:text-white',
                indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-650 hover:text-white'
              };
              const activeColor = colorClasses[cat.color] || colorClasses.blue;

              // Layout Type A (Standard Box with border)
              if (idx % 2 === 0) {
                return (
                  <Link 
                    key={cat.id} 
                    to={`/category/${cat.id}`} 
                    className="bg-white rounded-xl p-6 border border-slate-200 hover:border-blue-500/40 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group flex flex-col justify-between h-48"
                  >
                    <div className="flex justify-between items-start">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all border ${activeColor}`}>
                        {getIcon(cat.icon)}
                      </div>
                      <span className="bg-slate-50 text-[#6B7280] text-[9px] font-bold px-2 py-0.5 rounded border border-slate-150 uppercase">Active</span>
                    </div>

                    <div className="space-y-1 mt-4">
                      <h4 className="font-extrabold text-[#111827] text-base uppercase leading-tight group-hover:text-[#2563EB] transition-colors">{cat.title}</h4>
                      <p className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wider">Attempt CBT assessments</p>
                    </div>
                  </Link>
                );
              }

              // Layout Type B (Filled card with badge elements)
              return (
                <Link 
                  key={cat.id} 
                  to={`/category/${cat.id}`} 
                  className="bg-slate-50/50 rounded-xl p-6 border border-slate-200/80 hover:border-[#0F766E]/40 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group flex flex-col justify-between h-48 relative overflow-hidden"
                >
                  <div className="absolute right-0 top-0 w-16 h-16 bg-[#0F766E]/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                  
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all border bg-white ${activeColor}`}>
                      {getIcon(cat.icon)}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-[#111827] text-base uppercase leading-tight">{cat.title}</h4>
                      <span className="text-[#0F766E] text-[9px] font-black uppercase tracking-wider block mt-0.5">Premium pass</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-200/80 pt-3 mt-4 text-[11px] font-extrabold text-[#6B7280] group-hover:text-[#0F766E]">
                    <span>Grand Test Series</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}

          </div>
        </div>
      </section>

      {/* Learning Journey / Student Success Timeline Section */}
      <section className="py-20 bg-[#FCFCFC] border-t border-slate-150">
        <div className="max-w-5xl mx-auto px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-[10px] font-bold text-[#F59E0B] uppercase tracking-widest bg-[#F59E0B]/5 border border-[#F59E0B]/10 px-3 py-1 rounded-full">Learning Journey</span>
            <h2 className="text-[40px] leading-tight font-extrabold text-[#111827] font-heading">
              Your Path To Success
            </h2>
            <p className="text-[#6B7280] text-[18px] leading-[1.7] font-normal">How PrepApple prepares you step-by-step for absolute exam excellence.</p>
          </div>

          {/* Timeline Layout */}
          <div className="relative border-l border-slate-200 ml-4 md:ml-32 space-y-12 pb-4">
            
            {/* Step 1 */}
            <div className="relative pl-8 group">
              {/* Bullet Node */}
              <div className="absolute -left-3.5 top-1.5 w-7 h-7 rounded-full bg-white border-2 border-[#2563EB] flex items-center justify-center shadow-sm group-hover:bg-[#2563EB] transition-colors">
                <span className="w-2 h-2 rounded-full bg-[#2563EB] group-hover:bg-white"></span>
              </div>
              <div className="absolute -left-4 md:-left-32 top-1 text-xs font-bold text-[#6B7280] uppercase tracking-wider hidden md:block w-24 text-right">
                Step 01
              </div>
              <div className="bg-white border border-slate-200 p-6 rounded-xl hover:shadow-md transition-shadow">
                <h4 className="font-extrabold text-base text-[#111827] uppercase tracking-wide">Register Account</h4>
                <p className="text-xs text-[#6B7280] font-normal leading-relaxed mt-2">
                  Complete the secure UPI deposit and registration details. You will receive your official Student ID and Password on WhatsApp/Email within 1-2 hours.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative pl-8 group">
              {/* Bullet Node */}
              <div className="absolute -left-3.5 top-1.5 w-7 h-7 rounded-full bg-white border-2 border-[#0F766E] flex items-center justify-center shadow-sm group-hover:bg-[#0F766E] transition-colors">
                <span className="w-2 h-2 rounded-full bg-[#0F766E] group-hover:bg-white"></span>
              </div>
              <div className="absolute -left-4 md:-left-32 top-1 text-xs font-bold text-[#6B7280] uppercase tracking-wider hidden md:block w-24 text-right">
                Step 02
              </div>
              <div className="bg-white border border-slate-200 p-6 rounded-xl hover:shadow-md transition-shadow">
                <h4 className="font-extrabold text-base text-[#111827] uppercase tracking-wide">Daily Micro-Quizzes</h4>
                <p className="text-xs text-[#6B7280] font-normal leading-relaxed mt-2">
                  Attempt short practice quizzes (under 30 questions) everyday. This helps build core topic precision and memory recall without causing burnout.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative pl-8 group">
              {/* Bullet Node */}
              <div className="absolute -left-3.5 top-1.5 w-7 h-7 rounded-full bg-white border-2 border-[#F59E0B] flex items-center justify-center shadow-sm group-hover:bg-[#F59E0B] transition-colors">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B] group-hover:bg-white"></span>
              </div>
              <div className="absolute -left-4 md:-left-32 top-1 text-xs font-bold text-[#6B7280] uppercase tracking-wider hidden md:block w-24 text-right">
                Step 03
              </div>
              <div className="bg-white border border-slate-200 p-6 rounded-xl hover:shadow-md transition-shadow">
                <h4 className="font-extrabold text-base text-[#111827] uppercase tracking-wide">Weakness Tracking & Analysis</h4>
                <p className="text-xs text-[#6B7280] font-normal leading-relaxed mt-2">
                  Review your performance curves and subject analytics on the student dashboard. Implement recommended topic focus tips directly into your schedule.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative pl-8 group">
              {/* Bullet Node */}
              <div className="absolute -left-3.5 top-1.5 w-7 h-7 rounded-full bg-white border-2 border-[#22C55E] flex items-center justify-center shadow-sm group-hover:bg-[#22C55E] transition-colors">
                <span className="w-2 h-2 rounded-full bg-[#22C55E] group-hover:bg-white"></span>
              </div>
              <div className="absolute -left-4 md:-left-32 top-1 text-xs font-bold text-[#6B7280] uppercase tracking-wider hidden md:block w-24 text-right">
                Step 04
              </div>
              <div className="bg-white border border-slate-200 p-6 rounded-xl hover:shadow-md transition-shadow">
                <h4 className="font-extrabold text-base text-[#111827] uppercase tracking-wide">Grand CBT Simulations</h4>
                <p className="text-xs text-[#6B7280] font-normal leading-relaxed mt-2">
                  Attempt full-length exam series containing 40 to 50+ questions to master time management, pacing, and stress control for the actual examination.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Student Testimonials Section */}
      <section className="py-20 bg-[#FCFCFC] border-t border-slate-150">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-[10px] font-bold text-[#0F766E] uppercase tracking-widest bg-[#0F766E]/5 border border-[#0F766E]/10 px-3 py-1 rounded-full">Student Voice</span>
            <h2 className="text-[40px] leading-tight font-extrabold text-[#111827] font-heading">
              Our Success Stories
            </h2>
            <p className="text-[#6B7280] text-[18px] leading-[1.7] font-normal">Real stories from students who achieved their goals using PrepApple.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Testimonial 1 */}
            <div className="bg-white border border-slate-200 p-8 rounded-xl shadow-sm space-y-6 hover:shadow-md transition-shadow relative">
              <span className="text-[64px] leading-none text-slate-100 absolute left-4 top-2 font-black select-none -z-10">“</span>
              <div className="flex gap-1 text-[#F59E0B]">
                {[1, 2, 3, 4, 5].map(n => <Star key={n} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-sm text-[#6B7280] font-normal leading-relaxed italic relative z-10">
                "The CBT layout on PrepApple is identical to the actual exam screen. By attempting five grand mock tests here before the JEE Main, I completely conquered my screen anxiety. The score analytics also helped me focus on torque concepts in Physics which boosted my percentile!"
              </p>
              <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs font-heading">
                  SN
                </div>
                <div>
                  <h5 className="font-extrabold text-xs text-[#111827] uppercase tracking-wider">Soham Nandanwar</h5>
                  <span className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wider block mt-0.5">JEE Main (99.2 Percentile)</span>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white border border-slate-200 p-8 rounded-xl shadow-sm space-y-6 hover:shadow-md transition-shadow relative">
              <span className="text-[64px] leading-none text-slate-100 absolute left-4 top-2 font-black select-none -z-10">“</span>
              <div className="flex gap-1 text-[#F59E0B]">
                {[1, 2, 3, 4, 5].map(n => <Star key={n} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-sm text-[#6B7280] font-normal leading-relaxed italic relative z-10">
                "At just ₹25 per month, this platform is an absolute lifesaver. I was able to practice daily short quizzes for biology topics, and the detailed step-by-step solution review guides are exceptionally detailed. I highly recommend the full pass to all NEET candidates."
              </p>
              <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center font-black text-xs font-heading">
                  PK
                </div>
                <div>
                  <h5 className="font-extrabold text-xs text-[#111827] uppercase tracking-wider">Priya Kulkarni</h5>
                  <span className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wider block mt-0.5">NEET Candidate (640 Score)</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-20 bg-[#FCFCFC] border-t border-slate-150">
        <div className="max-w-4xl mx-auto px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-[10px] font-bold text-[#0F766E] uppercase tracking-widest bg-[#0F766E]/5 border border-[#0F766E]/10 px-3 py-1 rounded-full">Got Questions?</span>
            <h2 className="text-[40px] leading-tight font-extrabold text-[#111827] font-heading">
              Frequently Asked Questions
            </h2>
            <p className="text-[#6B7280] text-[18px] leading-[1.7] font-normal">Everything you need to know about the PrepApple mock exam subscription.</p>
          </div>

          {/* Interactive Accordion Layout */}
          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div 
                  key={idx} 
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden transition-all duration-300 shadow-sm"
                >
                  <button 
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-6 py-4.5 text-left flex justify-between items-center gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                  >
                    <span className="font-extrabold text-sm sm:text-base text-[#111827] uppercase tracking-wide leading-tight">{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-350 ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
                  </button>

                  <div 
                    className={`transition-all duration-350 ease-in-out overflow-hidden ${
                      isOpen ? 'max-h-52 border-t border-slate-100 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <p className="p-6 text-xs sm:text-sm text-[#6B7280] font-normal leading-relaxed bg-[#FCFCFC]">
                      {faq.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Subscription CTA Section with Trust Elements */}
      <section className="py-20 bg-[#FCFCFC] border-t border-slate-150">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200/80 rounded-[2.5rem] p-10 md:p-14 text-center shadow-xl relative overflow-hidden group">
            
            {/* Glowing accents */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/5 rounded-full blur-[100px] -z-10"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#0F766E]/5 rounded-full blur-[100px] -z-10"></div>

            <div className="relative z-10 max-w-3xl mx-auto space-y-6">
              
              <span className="bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 text-[9px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider select-none">
                Risk-Free Mock Pass
              </span>

              <h2 className="text-[40px] leading-tight font-extrabold text-[#111827] font-heading uppercase tracking-tight">
                Unlock Premium CBT Mock Papers Today
              </h2>
              
              <p className="text-[18px] leading-[1.7] text-[#6B7280] font-normal max-w-xl mx-auto">
                Gain instant credentials for JEE, NEET, and regional boards. Pay ₹25/month with secure UPI, and prepare with 100% confidence.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-5 pt-4">
                <a 
                  href="https://forms.gle/ML2urJTy75xXFXK18" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-sm py-4.5 px-9 rounded-xl transition-all shadow-[0_4px_14px_rgba(37,99,235,0.25)] uppercase tracking-wider cursor-pointer hover:-translate-y-0.5"
                >
                  Subscribe Pass (₹25/Month)
                </a>
                <a 
                  href="/student" 
                  className="border-2 border-[#111827] text-[#111827] font-bold text-sm py-4 px-9 rounded-xl shadow-[4px_4px_0px_#0F766E] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#0F766E] transition-all flex items-center justify-center gap-2 uppercase tracking-wider bg-white cursor-pointer"
                >
                  Student Login
                </a>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-3 pt-8 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider border-t border-slate-200/60 mt-10">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#22C55E]" /> Verified UPI Payment
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#2563EB]" /> 1-2 Hours Activation
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#0F766E]" /> Cancel Pass Anytime
                </span>
              </div>

            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;

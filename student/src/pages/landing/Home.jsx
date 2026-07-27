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
  Star,
  Check,
  TrendingUp,
  Activity,
  Layers,
  ExternalLink,
  ArrowUpRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { categoriesData } from '../data/mockData';

const HeroSlider = () => {
  const slides = [
    {
      image: '/assets/slider_banner_1.jpg',
      title: 'Smart CBT Practice Platform',
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
      desc: 'Preparation for JEE, NEET, SSC, Railways, Defense, and Banking.'
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
    <div className="relative w-full aspect-[16/9] overflow-hidden rounded-[2.5rem] border border-slate-200/80 shadow-2xl shadow-slate-200 group select-none bg-slate-900">
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
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent flex flex-col justify-end p-6 md:p-8">
              <h3 className="text-white text-base md:text-xl font-black uppercase tracking-wide drop-shadow-md">
                {slide.title}
              </h3>
              <p className="text-blue-100 text-xs md:text-sm font-semibold mt-1 opacity-90 drop-shadow max-w-md">
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
        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/20 backdrop-blur hover:bg-white/90 text-white hover:text-slate-800 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow cursor-pointer border border-white/20 z-10"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button 
        type="button"
        onClick={handleNext}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/20 backdrop-blur hover:bg-white/90 text-white hover:text-slate-800 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow cursor-pointer border border-white/20 z-10"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Slide Indicators (Dots) */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
        {slides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setActiveIdx(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
              activeIdx === idx ? 'bg-blue-500 scale-125 w-5' : 'bg-white/60 hover:bg-white w-1.5'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default function Home() {
  const [categories, setCategories] = useState(categoriesData);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  useEffect(() => {
    // Attempt dynamic categories fetch from backend
    fetch('/api/categories')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Fallback to static categories');
      })
      .then((data) => {
        if (data && data.length > 0) {
          setCategories(data);
        }
      })
      .catch((err) => {
        console.log('Using static categories fallback:', err);
      });
  }, []);

  const getCategoryIcon = (iconName) => {
    switch (iconName) {
      case 'Calculator': return <Calculator className="w-8 h-8" />;
      case 'Stethoscope': return <Stethoscope className="w-8 h-8" />;
      case 'GraduationCap': return <GraduationCap className="w-8 h-8" />;
      case 'Train': return <Train className="w-8 h-8" />;
      case 'Landmark': return <Landmark className="w-8 h-8" />;
      case 'Crosshair': return <Crosshair className="w-8 h-8" />;
      default: return <BookOpen className="w-8 h-8" />;
    }
  };

  const faqs = [
    {
      q: "Are the mock tests based on latest exam patterns?",
      a: "Yes, our expert panel updates all mock tests within 24 hours of any official NTA, UPSC, SSC, or board notification regarding changes in exam patterns or syllabi."
    },
    {
      q: "What is included in the ₹49 monthly subscription pass?",
      a: "The ₹49 full pass grants you unlimited access and attempts to all full-length grand mock tests, chapter-wise sectionals, topic quizzes, and detailed AI analytics across all categories."
    },
    {
      q: "Can I attempt tests on mobile devices?",
      a: "Absolutely! PrepApple is fully responsive on all Android smartphones, iPhones, tablets, and desktop browsers."
    },
    {
      q: "Is there a free trial available?",
      a: "Yes! Every exam category includes free mock tests and quizzes so you can experience our authentic CBT environment before subscribing."
    },
    {
      q: "How accurate is the Rank Predictor & Analytics?",
      a: "Our Smart Analytics engine uses data from thousands of real test attempts to predict your percentile and rank within a 5-10% variance range of actual exam results."
    }
  ];

  return (
    <div className="min-h-screen bg-[#f7f9fb] font-sans text-slate-800 overflow-x-hidden">
      
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        {/* Subtle radial background glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-100/30 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Hero Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 font-semibold text-xs uppercase tracking-wider shadow-sm">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Trusted by 1M+ Students Nationwide</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-tight tracking-tight">
              Master Your Exams with <span className="text-[#00685d] relative inline-block">Precision & Confidence</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl font-medium">
              The ultimate CBT mock preparation platform for <strong className="text-slate-800 font-extrabold">SSC, UPSC, Banking, JEE, & NEET</strong>. Data-driven insights and expert-curated mock tests to help you rank higher. Start practicing today for just <span className="font-black text-[#00685d] bg-teal-50 px-2 py-0.5 rounded border border-teal-200">₹49/month</span>.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link 
                to="/student"
                className="bg-[#00685d] hover:bg-[#005048] text-white font-extrabold text-sm py-4 px-8 rounded-2xl shadow-lg shadow-teal-700/20 hover:shadow-teal-700/30 transition-all active:scale-95 flex items-center gap-2 uppercase tracking-wider cursor-pointer"
              >
                <span>Start Free Mock Test</span>
                <ArrowRight className="w-4.5 h-4.5" />
              </Link>
              <a 
                href="#categories"
                className="border-2 border-slate-300 hover:border-[#00685d] text-slate-700 hover:text-[#00685d] font-bold text-sm py-4 px-8 rounded-2xl hover:bg-teal-50/50 transition-all active:scale-95 uppercase tracking-wider cursor-pointer"
              >
                Explore All Courses
              </a>
            </div>

            {/* Micro proof tags */}
            <div className="pt-4 flex items-center gap-6 text-xs text-slate-500 font-semibold border-t border-slate-200/80">
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>NTA CBT Interface</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Instant Score Analytics</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>24/7 Access</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Slider */}
          <div className="relative">
            <div className="absolute -inset-6 bg-[#00685d]/10 blur-3xl rounded-full -z-10"></div>
            
            <div className="relative">
              <HeroSlider />
            </div>
          </div>

        </div>
      </section>

      {/* Features Grid: Why Students Choose PrepApple */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200/80">
        <div className="text-center mb-14 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Why Students Choose PrepApple</h2>
          <p className="text-slate-600 font-medium text-base max-w-2xl mx-auto">Designed by exam toppers, powered by smart analytics, and built for your ultimate success.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 hover:border-[#00685d] transition-all hover:-translate-y-1">
            <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-[#00685d]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">Expert Content</h4>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">Questions curated by former examiners and top rankers.</p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 hover:border-blue-600 transition-all hover:-translate-y-1">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">Smart Insights</h4>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">AI-driven analysis of your speed, accuracy, and weak areas.</p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 hover:border-amber-600 transition-all hover:-translate-y-1">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">Daily Updates</h4>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">Fresh content every day aligned with the latest NTA exam patterns.</p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 hover:border-emerald-600 transition-all hover:-translate-y-1">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
              <Zap className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">Affordable Plans</h4>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">High-quality preparation accessible to everyone, starting from <strong className="text-emerald-700">₹49/month</strong>.</p>
          </div>
        </div>
      </section>

      {/* Exam Categories Section */}
      <section id="categories" className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-14 gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Popular Exam Categories</h2>
              <p className="text-slate-600 font-medium text-base mt-2">Over 2000+ mock tests across 50+ competitive national exams.</p>
            </div>
            <Link to="/student" className="text-[#00685d] hover:text-[#005048] font-bold text-sm flex items-center gap-1.5 uppercase tracking-wider hover:underline">
              <span>View All Categories</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.slice(0, 6).map((cat) => (
              <Link 
                key={cat.id} 
                to={`/category/${cat.id}`}
                className="bg-slate-50 p-8 rounded-3xl border border-slate-200/80 flex flex-col items-start gap-6 hover:border-[#00685d] hover:bg-white transition-all hover:shadow-xl group"
              >
                <div className="p-4 bg-teal-50 text-[#00685d] rounded-2xl group-hover:bg-[#00685d] group-hover:text-white transition-colors">
                  {getCategoryIcon(cat.icon)}
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900 group-hover:text-[#00685d] transition-colors">{cat.title}</h3>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">
                    {cat.subcategories ? cat.subcategories.map(s => s.title).join(', ') : 'Complete grand mocks and chapter-wise tests.'}
                  </p>
                </div>
                <div className="mt-auto pt-4 flex items-center justify-between w-full border-t border-slate-200/80">
                  <span className="text-xs font-black text-[#00685d] uppercase tracking-wider">Explore Tests</span>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-[#00685d] group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Community Learning Section (Study Better, Together) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          <div className="relative order-2 lg:order-1">
            <div className="absolute -inset-8 bg-blue-100/40 blur-3xl rounded-full -z-10"></div>
            <img 
              src="/assets/slider_banner_2.jpg" 
              alt="Students studying together" 
              className="w-full h-auto rounded-[2.5rem] shadow-2xl border border-slate-200"
            />
          </div>

          <div className="order-1 lg:order-2 space-y-6">
            <span className="text-xs font-extrabold text-[#00685d] uppercase tracking-widest bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Community Learning
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Study Better, Together
            </h2>
            <p className="text-slate-600 font-medium text-base leading-relaxed">
              Preparation doesn't have to be a lonely journey. Connect with lakhs of aspirants, participate in group challenges, and analyze live attempt trends in real-time.
            </p>

            <div className="space-y-6 pt-2">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-teal-50 text-[#00685d] rounded-2xl">
                  <Users className="w-6 h-6 flex-shrink-0" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900">Discussion Forums & Mentorship</h4>
                  <p className="text-sm text-slate-600 font-medium mt-1 leading-relaxed">Clear your doubts within minutes with our 24/7 active student community and mentors.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-teal-50 text-[#00685d] rounded-2xl">
                  <Award className="w-6 h-6 flex-shrink-0" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900">Live All-India Leaderboards</h4>
                  <p className="text-sm text-slate-600 font-medium mt-1 leading-relaxed">Compete in nationwide live tests and see where you rank among top rankers.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Performance Analytics Section */}
      <section className="bg-slate-900 text-white py-20 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
          
          <div className="space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Data-Driven Success with Performance Insights
            </h2>
            <p className="text-slate-300 font-medium text-base leading-relaxed">
              Our proprietary Smart Analytics engine breaks down your test performance into granular, actionable insights. Identify your weak spots, track your speed per question, and see where you stand against lakhs of aspirants nationwide.
            </p>
            <ul className="space-y-4 pt-2">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-teal-400 flex-shrink-0" />
                <span className="text-sm font-semibold text-slate-200">Personalized study roadmap based on individual weaknesses</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-teal-400 flex-shrink-0" />
                <span className="text-sm font-semibold text-slate-200">Detailed time-spent analysis per question type</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-teal-400 flex-shrink-0" />
                <span className="text-sm font-semibold text-slate-200">All India Percentile and Real-time Rank Predictor</span>
              </li>
            </ul>
          </div>

          <div>
            <div className="bg-slate-800/90 p-8 sm:p-10 rounded-[2.5rem] border border-slate-700 shadow-2xl space-y-8 relative backdrop-blur">
              <div className="absolute -top-4 -right-4 bg-[#00685d] text-white text-xs font-black uppercase tracking-wider px-4 py-1.5 rounded-full shadow-lg">
                New AI Engine
              </div>
              <div className="flex items-center justify-between">
                <h4 className="text-2xl font-black text-white">Performance Analytics</h4>
                <span className="text-xs font-bold bg-teal-500/20 text-teal-300 px-3 py-1 rounded-full border border-teal-500/30">Active Session</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm font-extrabold">
                  <span className="text-slate-300">Overall Readiness</span>
                  <span className="text-teal-400">84%</span>
                </div>
                <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-400 w-[84%] rounded-full shadow-inner"></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estimated Rank</p>
                  <p className="text-2xl font-black text-teal-400 mt-1">#18</p>
                </div>
                <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accuracy</p>
                  <p className="text-2xl font-black text-amber-400 mt-1">94.2%</p>
                </div>
              </div>
              <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-700 space-y-3">
                <p className="text-xs font-extrabold text-slate-200 uppercase tracking-wider">Subject Mastery</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-xs font-bold border border-teal-500/30">Math (Expert)</span>
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-bold border border-blue-500/30">Reasoning (Pro)</span>
                  <span className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-bold border border-amber-500/30">English (High)</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Your Success Story Starts Here */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          <div className="space-y-6">
            <span className="text-xs font-extrabold text-[#00685d] uppercase tracking-widest bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Real Results
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Your Success Story Starts Here
            </h2>
            <p className="text-slate-600 font-medium text-base leading-relaxed">
              Join the ranks of thousands of successful candidates who used PrepApple to crack their dream competitive exams. From realistic mock environments to instant solutions, we provide everything you need.
            </p>
            <div className="grid grid-cols-2 gap-8 pt-2">
              <div>
                <p className="text-4xl font-black text-[#00685d]">15k+</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Selections in 2024</p>
              </div>
              <div>
                <p className="text-4xl font-black text-blue-600">98%</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Student Satisfaction</p>
              </div>
            </div>
            <div className="pt-2">
              <Link 
                to="/student"
                className="inline-flex items-center gap-2 bg-[#00685d] text-white font-extrabold text-xs py-3.5 px-6 rounded-xl shadow-md hover:bg-[#005048] uppercase tracking-wider"
              >
                <span>Read All Success Stories</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-8 bg-teal-100/40 blur-3xl rounded-full -z-10"></div>
            <img 
              src="/assets/slider_banner_3.jpg" 
              alt="Successful student" 
              className="w-full h-auto rounded-[2.5rem] shadow-2xl border border-slate-200"
            />
          </div>

        </div>
      </section>

      {/* How it Works Section (Your Roadmap to Success) */}
      <section className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Your Roadmap to Success</h2>
            <p className="text-slate-600 font-medium text-base">Three simple steps to transform your exam preparation.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="relative space-y-4 text-center p-6 bg-slate-50 rounded-3xl border border-slate-200/80 shadow-sm">
              <div className="w-16 h-16 bg-[#00685d] text-white rounded-2xl flex items-center justify-center font-black text-2xl mx-auto shadow-lg shadow-teal-700/20">
                1
              </div>
              <h4 className="text-xl font-extrabold text-slate-900">Choose Your Goal</h4>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">Select the exam series you are targeting from our wide range of categories (SSC, Banking, UPSC, JEE, NEET, Teaching).</p>
            </div>

            <div className="relative space-y-4 text-center p-6 bg-slate-50 rounded-3xl border border-slate-200/80 shadow-sm">
              <div className="w-16 h-16 bg-[#00685d] text-white rounded-2xl flex items-center justify-center font-black text-2xl mx-auto shadow-lg shadow-teal-700/20">
                2
              </div>
              <h4 className="text-xl font-extrabold text-slate-900">Practice & Analyze</h4>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">Attempt full-length grand mocks and get instant, detailed AI performance and speed reports.</p>
            </div>

            <div className="relative space-y-4 text-center p-6 bg-slate-50 rounded-3xl border border-slate-200/80 shadow-sm">
              <div className="w-16 h-16 bg-[#00685d] text-white rounded-2xl flex items-center justify-center font-black text-2xl mx-auto shadow-lg shadow-teal-700/20">
                3
              </div>
              <h4 className="text-xl font-extrabold text-slate-900">Improve & Win</h4>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">Work on your weak areas with targeted sectionals and ace your dream competitive examination.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-14 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Frequently Asked Questions</h2>
          <p className="text-slate-600 font-medium text-base">Everything you need to know about PrepApple.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div 
                key={idx} 
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                  className="w-full text-left p-6 flex justify-between items-center gap-4 cursor-pointer focus:outline-none"
                >
                  <span className="font-extrabold text-slate-900 text-base sm:text-lg">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#00685d]' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 text-sm text-slate-600 font-medium leading-relaxed border-t border-slate-100 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto bg-[#00685d] rounded-[3rem] p-10 md:p-20 text-center relative overflow-hidden shadow-2xl text-white">
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-700/30 rounded-full blur-3xl -ml-48 -mb-48 pointer-events-none"></div>
          
          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">Ready to reach your target?</h2>
            <p className="text-teal-100 font-medium text-base sm:text-xl max-w-2xl mx-auto leading-relaxed">
              Join thousands of successful candidates. Start your subscription today for just <span className="font-black text-white bg-white/20 px-3 py-1 rounded-xl">₹49/month</span> and experience the difference precision makes.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
              <a 
                href="https://forms.gle/ML2urJTy75xXFXK18"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-[#00685d] font-black text-sm uppercase tracking-wider px-10 py-4.5 rounded-2xl hover:bg-teal-50 transition-all active:scale-95 shadow-xl cursor-pointer"
              >
                Subscribe for ₹49/Month
              </a>
              <Link 
                to="/student"
                className="bg-teal-700/60 border border-teal-400/40 text-white font-extrabold text-sm uppercase tracking-wider px-10 py-4.5 rounded-2xl hover:bg-teal-700 transition-all active:scale-95 cursor-pointer"
              >
                Get Started for Free
              </Link>
            </div>
            <p className="text-xs font-bold text-teal-200/80 tracking-widest uppercase pt-2">Instant CBT Access • Auto-renews monthly</p>
          </div>
        </div>
      </section>

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  BookOpen, 
  Clock, 
  Award, 
  Sparkles, 
  ChevronRight, 
  Lock, 
  Play, 
  ShieldCheck, 
  ArrowRight,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { categoriesData } from '../data/mockData';

const sampleTestSeries = [
  {
    id: "jee-main-grand-mock-1",
    name: "JEE Main 2026 Full Length Grand Mock 01",
    category: "JEE",
    subcategoryId: "jee-main",
    question_count: 90,
    duration: 180,
    total_marks: 300,
    is_free: true,
    difficulty: "Advanced"
  },
  {
    id: "neet-full-mock-1",
    name: "NEET UG 2026 Biology & Physics All India Mock",
    category: "NEET",
    subcategoryId: "neet-ug",
    question_count: 200,
    duration: 200,
    total_marks: 720,
    is_free: true,
    difficulty: "Moderate"
  },
  {
    id: "ssc-cgl-tier1-mock",
    name: "SSC CGL 2026 Tier-1 Complete Grand Mock",
    category: "SSC",
    subcategoryId: "ssc-cgl",
    question_count: 100,
    duration: 60,
    total_marks: 200,
    is_free: false,
    difficulty: "Exam Standard"
  },
  {
    id: "rrb-ntpc-stage1-mock",
    name: "Railways RRB NTPC Stage-1 CBT Full Mock Test",
    category: "Railways",
    subcategoryId: "rrb-ntpc",
    question_count: 100,
    duration: 90,
    total_marks: 100,
    is_free: true,
    difficulty: "Moderate"
  },
  {
    id: "ibps-po-prelims-mock",
    name: "Banking IBPS PO Prelims Speed Practice Series 01",
    category: "Banking",
    subcategoryId: "ibps-po",
    question_count: 100,
    duration: 60,
    total_marks: 100,
    is_free: false,
    difficulty: "Speed Focus"
  },
  {
    id: "upsc-cse-gs-paper1",
    name: "UPSC Civil Services Prelims GS Paper-1 Mock",
    category: "UPSC",
    subcategoryId: "upsc-cse",
    question_count: 100,
    duration: 120,
    total_marks: 200,
    is_free: true,
    difficulty: "High Ranker"
  },
  {
    id: "mht-pcm-grand-test",
    name: "MHT CET PCM Physics Chemistry Math Full Test",
    category: "MHT CET",
    subcategoryId: "mht-pcm",
    question_count: 150,
    duration: 180,
    total_marks: 200,
    is_free: true,
    difficulty: "State Standard"
  },
  {
    id: "nda-maths-full-mock",
    name: "Defence NDA & NA Mathematics Full Mock Series",
    category: "Defence",
    subcategoryId: "nda",
    question_count: 120,
    duration: 150,
    total_marks: 300,
    is_free: false,
    difficulty: "Advanced"
  }
];

const MockTests = () => {
  const [apiTests, setApiTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'free' | 'pro'

  useEffect(() => {
    const fetchAdminTests = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/tests');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const formatted = data.map((t) => ({
              id: t.id,
              name: t.name || t.title || 'CBT Grand Mock Test',
              category: t.category || t.exam || 'JEE',
              subcategoryId: t.subcategory_id || '',
              question_count: t.question_count || (t.questions ? t.questions.length : 90),
              duration: t.duration || 180,
              total_marks: t.total_marks || ((t.question_count || 90) * 4),
              is_free: t.is_free === 1 || t.is_free === true,
              difficulty: t.difficulty || 'NTA Pattern'
            }));
            setApiTests(formatted);
          } else {
            setApiTests(sampleTestSeries);
          }
        } else {
          setApiTests(sampleTestSeries);
        }
      } catch (err) {
        console.error('Error fetching admin mock tests:', err);
        setApiTests(sampleTestSeries);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminTests();
  }, []);

  const allTests = apiTests.length > 0 ? apiTests : sampleTestSeries;
  const categories = ['All', ...Array.from(new Set(allTests.map(t => t.category))).filter(Boolean)];

  const filteredTests = allTests.filter(test => {
    const matchesCategory = selectedCategory === 'All' || test.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = (test.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (test.category || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || (filterType === 'free' && test.is_free) || (filterType === 'pro' && !test.is_free);
    return matchesCategory && matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#0B1F4D] font-extrabold text-xs uppercase tracking-wider shadow-sm">
            <Sparkles className="w-4 h-4 text-[#1E88E5]" />
            <span>Comprehensive Test Library</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-[#0B1F4D] tracking-tight">
            Explore All <span className="bg-gradient-to-r from-[#0052D4] via-[#6B11B0] to-[#FF2A85] bg-clip-text text-transparent">Mock Test Series</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
            Attempt official pattern CBT mock tests across 50+ national exams with real-time score analytics and rank predictions.
          </p>
        </div>

        {/* Filter & Search Bar Controls */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search mock test series (e.g. JEE, SSC CGL)..." 
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold outline-none focus:border-[#6B11B0] focus:ring-2 focus:ring-purple-100 transition-all text-slate-800"
              />
            </div>

            {/* Type Filter Buttons */}
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto select-none">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-4 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                  filterType === 'all' ? 'bg-[#0B1F4D] text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Tests
              </button>
              <button
                type="button"
                onClick={() => setFilterType('free')}
                className={`px-4 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterType === 'free' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Free Trials</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterType('pro')}
                className={`px-4 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterType === 'pro' ? 'bg-gradient-to-r from-[#0052D4] to-[#6B11B0] text-white shadow-sm' : 'bg-blue-50 text-[#0052D4] hover:bg-blue-100'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Pro Full Pass (₹49)</span>
              </button>
            </div>

          </div>

          {/* Category Chips Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 border-t border-slate-100">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-[#0052D4] via-[#6B11B0] to-[#FF2A85] text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Test Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTests.map((test) => (
            <div 
              key={test.id} 
              className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-[#1E88E5] transition-all flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-3 py-1 bg-blue-50 text-[#1E88E5] font-extrabold text-[10px] rounded-full uppercase tracking-wider border border-blue-100">
                    {test.category}
                  </span>
                  {test.is_free ? (
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-extrabold text-[10px] rounded-full uppercase tracking-wider border border-emerald-200 flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      Free Attempt
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-amber-50 text-amber-700 font-extrabold text-[10px] rounded-full uppercase tracking-wider border border-amber-200 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Pro Pass ₹49
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-extrabold text-[#0B1F4D] group-hover:text-[#1E88E5] transition-colors leading-snug">
                  {test.name}
                </h3>

                <div className="grid grid-cols-3 gap-2 py-3 bg-slate-50 rounded-2xl p-3 text-center border border-slate-100 text-xs font-semibold text-slate-600">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">Questions</p>
                    <p className="font-extrabold text-slate-900 mt-0.5">{test.question_count}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">Duration</p>
                    <p className="font-extrabold text-slate-900 mt-0.5">{test.duration}m</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">Marks</p>
                    <p className="font-extrabold text-slate-900 mt-0.5">{test.total_marks}</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-100 flex items-center gap-3">
                {test.is_free ? (
                  <Link
                    to="/login"
                    className="w-full py-3 bg-[#0B1F4D] hover:bg-slate-900 text-white font-extrabold text-xs rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Attempt Free Test</span>
                  </Link>
                ) : (
                  <a
                    href="https://forms.gle/ML2urJTy75xXFXK18"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-[#1E88E5] hover:bg-blue-600 text-white font-extrabold text-xs rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md"
                  >
                    <span>Unlock Pass ₹49</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="bg-[#0B1F4D] rounded-3xl p-8 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-black text-white">Can't find your target exam?</h3>
            <p className="text-sm font-medium text-blue-200">
              We add new grand mock test series every week based on student requests.
            </p>
          </div>
          <Link 
            to="/contact"
            className="bg-[#1E88E5] hover:bg-blue-600 text-white font-extrabold text-xs py-3.5 px-6 rounded-xl uppercase tracking-wider shadow-md whitespace-nowrap"
          >
            Request Test Series
          </Link>
        </div>

      </div>
    </div>
  );
};

export default MockTests;

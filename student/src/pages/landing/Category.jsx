import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { categoriesData, generateMockTests } from '../data/mockData';
import { ChevronRight, ArrowLeft, FileText, Clock, BarChart, Lock, User, ShieldCheck, Landmark, Crosshair, BookOpen, Train, Stethoscope, GraduationCap, Calculator, Shield } from 'lucide-react';

const Category = () => {
  const { categoryId, subcategoryId } = useParams();
  const navigate = useNavigate();
  
  const [categories, setCategories] = useState(categoriesData);
  const [tests, setTests] = useState([]);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'subscribe'

  // Find the requested category
  const category = categories.find(c => c.id === categoryId) || categoriesData.find(c => c.id === categoryId);
  const subcategory = category?.subcategories?.find(s => s.id === subcategoryId);

  useEffect(() => {
    window.scrollTo(0, 0);
    setShowAuthForm(false);

    // Fetch Categories
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
      .catch(err => console.log('Category list offline, using fallback:', err));

    // Fetch dynamic published tests
    fetch('http://localhost:5000/api/tests?published=true')
      .then(res => {
        if (!res.ok) throw new Error('Offline');
        return res.json();
      })
      .then(data => {
        const titleMatch = category?.title || 'JEE';
        const filtered = data.filter(t => 
          (t.category || 'JEE').toUpperCase() === titleMatch.toUpperCase()
        );
        if (filtered.length > 0) {
          // Normalize to match schema fields
          const normalized = filtered.map(t => ({
            id: t.id,
            title: t.name,
            questions: t.question_count || 10,
            duration: t.duration || 15,
            difficulty: t.test_type === 'quiz' ? 'Easy' : 'Medium',
            is_free: t.is_free
          }));
          setTests(normalized);
        } else {
          setTests(generateMockTests(4));
        }
      })
      .catch(err => {
        console.log('Using generated mock tests fallback:', err);
        setTests(generateMockTests(4));
      });
  }, [categoryId, subcategoryId, category?.title]);

  if (!category) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center flex-col gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Category Not Found</h2>
        <Link to="/" className="text-primary font-bold hover:underline">Go back home</Link>
      </div>
    );
  }

  // Determine if we need to show the sub-category grid (Explore mode)
  const isExploreMode = category.hasSubcategories && !subcategoryId;

  // View 1: Explore Sub-categories
  if (isExploreMode) {
    return (
      <div className="bg-slate-50 min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          
          <div className="mb-10 flex items-center gap-4">
            <button onClick={() => navigate('/')} className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-200 hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <h1 className="text-3xl font-extrabold text-slate-900">Explore {category.title}</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {category.subcategories.map(sub => (
              <Link 
                key={sub.id} 
                to={`/category/${category.id}/${sub.id}`}
                className="bg-white rounded-xl p-5 border border-slate-200 hover:border-primary hover:shadow-md transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full bg-${category.color}-50 text-${category.color}-600 flex items-center justify-center flex-shrink-0`}>
                     {category.icon === 'Landmark' && <Landmark className="w-6 h-6" />}
                     {category.icon === 'Train' && <Train className="w-6 h-6" />}
                     {category.icon === 'Crosshair' && <Crosshair className="w-6 h-6" />}
                     {category.icon === 'BookOpen' && <BookOpen className="w-6 h-6" />}
                     {category.icon === 'ShieldCheck' && <ShieldCheck className="w-6 h-6" />}
                  </div>
                  <div className="font-bold text-slate-800 text-lg group-hover:text-primary transition-colors">{sub.title}</div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
              </Link>
            ))}
          </div>

        </div>
      </div>
    );
  }

  // View 2: Test List & Subscription Wall
  const pageTitle = subcategory ? subcategory.title : category.title;

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        <div className="mb-8 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-200 hover:bg-slate-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">{pageTitle} Mock Tests</h1>
            <p className="text-slate-500 font-medium">{category.title} &gt; {subcategory ? subcategory.title : 'All Tests'}</p>
          </div>
        </div>

        {/* List of Mock Tests */}
        <div className="space-y-4 mb-12">
          {tests.map((test, index) => (
            <div key={test.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary transition-colors">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded">Test {index + 1}</span>
                  <h3 className="font-bold text-slate-800 text-xl">{test.title}</h3>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-slate-500 font-medium">
                  <span className="flex items-center gap-1"><FileText className="w-4 h-4" /> {test.questions} Qs</span>
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {test.duration} Mins</span>
                  <span className="flex items-center gap-1"><BarChart className="w-4 h-4" /> {test.difficulty}</span>
                </div>
              </div>
              
              {/* Only the first test is free, the rest are locked */}
              {(test.is_free === 1 || index === 0) ? (
                <Link to="/login" className="btn-primary py-3 px-8 whitespace-nowrap text-center font-bold">
                  Start Free Test
                </Link>
              ) : (
                <button onClick={() => setShowAuthForm(true)} className="bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-300 py-3 px-8 rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
                  <Lock className="w-4 h-4" /> Locked
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Subscription Wall */}
        <div className="bg-[#0B1F4D] rounded-[2rem] p-8 md:p-12 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <Lock className="w-12 h-12 mx-auto text-blue-300 mb-4 opacity-80" />
            <h2 className="text-3xl font-extrabold mb-4">Unlock {pageTitle} Premium Tests</h2>
            <p className="text-blue-200 mb-8 max-w-xl mx-auto text-lg">
              Get unlimited access to all mock tests, previous year papers, and detailed analytics for {pageTitle}.
            </p>
            
            {!showAuthForm ? (
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button 
                  onClick={() => { setAuthMode('subscribe'); setShowAuthForm(true); }}
                  className="bg-[#f97316] text-white font-bold text-lg py-4 px-10 rounded-xl shadow-lg hover:bg-orange-600 transition-colors"
                >
                  Buy Subscription @ ₹25/month
                </button>
                <button 
                  onClick={() => { setAuthMode('login'); setShowAuthForm(true); }}
                  className="bg-transparent border border-slate-500 text-white font-bold text-lg py-4 px-10 rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                >
                  <User className="w-5 h-5" /> Login
                </button>
              </div>
            ) : (
              <div className="bg-white text-slate-800 rounded-2xl p-6 md:p-8 max-w-md mx-auto text-left shadow-xl mt-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-extrabold">{authMode === 'login' ? 'Welcome Back' : 'Complete Purchase'}</h3>
                  <button onClick={() => setShowAuthForm(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">Cancel</button>
                </div>
                
                <form className="space-y-4">
                  {authMode === 'subscribe' && (
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                      <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="John Doe" />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
                    <input type="email" className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="you@example.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
                    <input type="password" className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="••••••••" />
                  </div>
                  
                  {authMode === 'subscribe' && (
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mt-4">
                      <div className="flex justify-between items-center font-bold text-slate-800 mb-2">
                        <span>Total Payable:</span>
                        <span className="text-xl text-primary">₹49</span>
                      </div>
                      <p className="text-xs text-slate-500">Auto-renews monthly. Cancel anytime.</p>
                    </div>
                  )}

                  <button type="button" className={`w-full font-bold text-lg py-4 rounded-xl shadow-lg transition-transform hover:-translate-y-1 mt-6 ${authMode === 'subscribe' ? 'bg-[#f97316] hover:bg-orange-600 text-white' : 'bg-primary hover:bg-blue-900 text-white'}`}>
                    {authMode === 'subscribe' ? 'Pay ₹49 & Unlock' : 'Login Securely'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Category;

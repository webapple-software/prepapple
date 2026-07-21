import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Clock, 
  HelpCircle, 
  Award, 
  ChevronRight, 
  Lock, 
  ShieldCheck, 
  ChevronLeft, 
  Landmark, 
  Sparkles, 
  ExternalLink,
  ArrowRight,
  CheckCircle2,
  X
} from 'lucide-react';

interface Test {
  id: number;
  name: string;
  duration: number;
  question_count: number;
  attempt_count: number;
  category?: 'JEE' | 'NEET';
  is_free?: number;
  test_type?: 'mock' | 'quiz';
}

const SLIDES = [
  {
    title: 'Crack NTA JEE Mains & Advanced 2026',
    description: 'Attempt realistic CBT mock tests designed by expert educators. Build speed, master time-management, and minimize negative marking.',
    badge: 'JEE PREPARATION',
    theme: 'from-blue-600 to-indigo-850',
    stats: '150+ Total Tests • Detailed Analytics',
    image: '/jee_prep.png'
  },
  {
    title: 'Ace NEET-UG with National Rank Predictor',
    description: 'High-yield Physics, Chemistry, and Biology question banks compiled from previous years and NTA exam patterns.',
    badge: 'NEET MEDICAL',
    theme: 'from-emerald-600 to-teal-850',
    stats: '20,000+ Questions • NCERT-Aligned',
    image: '/neet_prep.png'
  },
  {
    title: 'Real Computer Based Test (CBT) Environment',
    description: 'Get familiar with the exact NTA exam interface, marking scheme, question palettes, and instructions before you step into the center.',
    badge: 'CBT SIMULATOR',
    theme: 'from-purple-600 to-indigo-900',
    stats: 'Instant Reports • Speed & Error Analysis',
    image: '/cbt_prep.png'
  }
];

export default function LandingPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('JEE');
  
  // Subscription Modal State
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedTestToBuy, setSelectedTestToBuy] = useState<Test | null>(null);
  


  // Read current user
  const cached = localStorage.getItem('currentUser');
  const currentUser = cached ? JSON.parse(cached) : null;

  useEffect(() => {
    fetchTests();
  }, []);

  // Auto slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/tests?published=true');
      if (!response.ok) throw new Error('Failed to fetch tests');
      const data = await response.json();
      setTests(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    window.location.reload();
  };

  const openBuyModal = (test: Test) => {
    setSelectedTestToBuy(test);
    setShowBuyModal(true);
  };

  const categories = Array.from(new Set(tests.map(test => (test.category || 'JEE').toUpperCase())));
  if (!categories.includes('JEE')) categories.push('JEE');
  if (!categories.includes('NEET')) categories.push('NEET');

  const filteredQuizzes = tests.filter(test => test.test_type === 'quiz' && (test.category || 'JEE').toUpperCase() === selectedCategory.toUpperCase());
  const filteredMocks = tests.filter(test => (test.test_type || 'mock') === 'mock' && (test.category || 'JEE').toUpperCase() === selectedCategory.toUpperCase());

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans select-none">
       {/* Premium Header */}
      <header className="bg-white text-slate-800 shadow-sm sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-md shadow-blue-500/10">
              <Landmark className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="font-extrabold text-gray-800 text-lg tracking-wider uppercase">PrepApple</span>
              <span className="text-blue-600 font-extrabold text-[10px] ml-1.5 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">CBT</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-sm font-bold text-slate-500">
            <a href="#tests" className="hover:text-blue-600 transition-colors">Courses</a>
            <a href="#tests" className="hover:text-blue-600 transition-colors">JEE Series</a>
            <a href="#tests" className="hover:text-blue-600 transition-colors">NEET Series</a>
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors font-extrabold">How to Buy?</a>
          </nav>

          <div className="flex items-center gap-4">
            {currentUser && (
              <div className="flex items-center gap-3">
                <div className="text-right leading-none hidden sm:block">
                  <p className="text-xs font-bold text-slate-800">{currentUser.name}</p>
                  <span className="text-[8px] font-black text-blue-600 uppercase mt-0.5 inline-block bg-blue-50 px-1.5 py-0.5 rounded border border-blue-250">
                    {currentUser.role}
                  </span>
                </div>
                {currentUser.role === 'admin' ? (
                  <Link to="/admin" className="px-4 py-2 bg-blue-600 hover:bg-blue-750 text-white text-xs font-bold rounded-xl transition-all shadow-md">
                    Admin Panel
                  </Link>
                ) : currentUser.role === 'teacher' ? (
                  <Link to="/dashboard" className="px-4 py-2 bg-blue-600 hover:bg-blue-750 text-white text-xs font-bold rounded-xl transition-all shadow-md">
                    Teacher Dashboard
                  </Link>
                ) : (
                  <Link to="/student" className="px-4 py-2 bg-blue-600 hover:bg-blue-750 text-white text-xs font-bold rounded-xl transition-all shadow-md">
                    Student Portal
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 border border-gray-250 text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Carousel Slider Section */}
      <section className="relative w-full h-[360px] md:h-[420px] bg-slate-950 overflow-hidden">
        {SLIDES.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 w-full h-full bg-gradient-to-r ${slide.theme} flex items-center transition-all duration-700 ease-in-out ${
              idx === currentSlide ? 'opacity-100 translate-x-0 z-10' : 'opacity-0 translate-x-full z-0'
            }`}
          >
            <div className="max-w-7xl mx-auto px-6 sm:px-12 w-full text-white relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center h-full">
              {/* Left Column: Text & CTA */}
              <div className="lg:col-span-7 flex flex-col justify-center">
                <span className="bg-white/25 border border-white/20 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest w-fit">
                  {slide.badge}
                </span>
                <h1 className="text-3xl md:text-5xl font-black mt-4 leading-tight uppercase tracking-tight">
                  {slide.title}
                </h1>
                <p className="text-white/85 text-sm md:text-base mt-3 max-w-xl font-medium leading-relaxed">
                  {slide.description}
                </p>
                <div className="flex items-center gap-3.5 mt-5 font-bold text-xs text-white/90">
                  <span className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                    <Sparkles className="w-4 h-4 text-yellow-300" /> {slide.stats}
                  </span>
                </div>
                <div className="mt-6">
                  <a
                    href="#tests"
                    className="px-6 py-3 bg-white text-slate-900 font-extrabold text-xs rounded-xl tracking-wider uppercase transition-all shadow-lg hover:bg-slate-100 flex items-center gap-1.5 w-fit"
                  >
                    <span>Explore Test Series</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Right Column: Illustration Image */}
              <div className="lg:col-span-5 hidden lg:flex justify-center items-center h-full max-h-[340px] overflow-hidden select-none">
                <img
                  src={(slide as any).image}
                  alt={slide.title}
                  className="max-h-[280px] object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.3)] rounded-3xl border border-white/10 bg-white/5 hover:scale-102 transition-transform duration-300"
                />
              </div>
            </div>
          </div>
        ))}

        {/* Carousel controls */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 border border-white/15 p-2 rounded-full text-white z-20 cursor-pointer hidden sm:block"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % SLIDES.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 border border-white/15 p-2 rounded-full text-white z-20 cursor-pointer hidden sm:block"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Carousel indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                idx === currentSlide ? 'bg-white scale-120' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Main Content Area */}
      <main id="tests" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
        
        {/* Test Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pb-6 border-b border-slate-200/80">
          <div>
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
              Practice Dashboard
            </h2>
            <p className="text-slate-500 text-sm font-semibold mt-1">
              Select your course filter to view available tests and daily quizzes.
            </p>
          </div>

          {/* JEE vs NEET Toggle Filters */}
          <div className="flex bg-slate-200/60 p-1.5 rounded-2xl border border-slate-300/20 flex-wrap gap-1.5 justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  selectedCategory.toUpperCase() === cat.toUpperCase()
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
                }`}
              >
                {cat} Test Series
              </button>
            ))}
          </div>
        </div>

        {/* Loading and Error States */}
        {loading ? (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm animate-pulse h-56"></div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl text-sm font-semibold">
            Failed to load tests. Error details: {error}
          </div>
        ) : (
          <div className="space-y-16">
            {/* DAILY PRACTICE QUIZZES */}
            <div>
              <div className="mb-6">
                <h3 className="text-xl font-black text-slate-850 uppercase tracking-tight flex items-center gap-2">
                  <span>Daily Practice Quizzes</span>
                  <span className="bg-[#10b981] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Free Access
                  </span>
                </h3>
                <p className="text-slate-500 text-xs font-semibold">Short topic quizzes. All students can attempt these for free.</p>
              </div>

              {filteredQuizzes.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center text-slate-500 font-semibold text-xs">
                  No Daily Practice Quizzes uploaded yet for {selectedCategory}.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredQuizzes.map((test) => (
                    <div
                      key={test.id}
                      className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group relative overflow-hidden border-l-4 border-l-[#10b981]"
                    >
                      <div>
                        <div className="flex justify-between items-start gap-4 mb-4">
                          <h4 className="font-extrabold text-sm text-slate-800 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2 uppercase min-h-[40px]">
                            {test.name}
                          </h4>
                          <span className="bg-emerald-50 text-emerald-700 text-[9px] font-black px-2 py-0.5 rounded border border-emerald-150 uppercase flex-shrink-0">
                            Free Quiz
                          </span>
                        </div>

                        <div className="space-y-2 mb-8 text-xs text-slate-600 font-semibold">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span>Duration: <strong className="text-slate-800">{test.duration} Min</strong></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <HelpCircle className="w-4 h-4 text-slate-400" />
                            <span>Questions: <strong className="text-slate-800">{test.question_count} Qs</strong></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-slate-400" />
                            <span>Total Marks: <strong className="text-slate-800">{test.question_count * 4} Marks</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Link
                          to="/login/student"
                          className="flex-1 bg-[#10b981] hover:bg-[#059669] text-white font-extrabold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/10"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          <span>Attempt Free Quiz</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* MOCK TEST SERIES */}
            <div>
              <div className="mb-6">
                <h3 className="text-xl font-black text-slate-850 uppercase tracking-tight">
                  Mock Test Series
                </h3>
                <p className="text-slate-500 text-xs font-semibold">Full-length Mock Exams. Requires a student subscription unless marked free.</p>
              </div>

              {filteredMocks.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center text-slate-500 font-semibold text-xs">
                  No Mock Test Series published yet for {selectedCategory}.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredMocks.map((test) => (
                    <div
                      key={test.id}
                      className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
                    >
                      <div>
                        <div className="flex justify-between items-start gap-4 mb-4">
                          <h4 className="font-extrabold text-sm text-slate-800 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2 uppercase min-h-[40px]">
                            {test.name}
                          </h4>
                          <div className="flex flex-col gap-1.5 items-end flex-shrink-0">
                            {test.is_free === 1 && (
                              <span className="bg-[#10b981] text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                                Free Mock
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2 mb-8 text-xs text-slate-600 font-semibold">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span>Duration: <strong className="text-slate-800">{test.duration} Min</strong></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <HelpCircle className="w-4 h-4 text-slate-400" />
                            <span>Questions: <strong className="text-slate-800">{test.question_count} Qs</strong></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-slate-400" />
                            <span>Total Marks: <strong className="text-slate-800">{test.question_count * 4} Marks</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {test.is_free === 1 ? (
                          <Link
                            to="/login/student"
                            className="flex-1 bg-[#10b981] hover:bg-[#059669] text-white font-extrabold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                            <span>Attempt Free Quiz</span>
                          </Link>
                        ) : (
                          <button
                            onClick={() => openBuyModal(test)}
                            className="flex-1 bg-slate-900 hover:bg-slate-950 text-white font-extrabold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            <span>Buy Subscription</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* How It Works Section */}
        <section id="how-it-works" className="mt-20 bg-white text-slate-800 rounded-3xl p-8 md:p-12 relative overflow-hidden border border-gray-200 shadow-sm">
          <div className="absolute top-0 right-0 w-80 h-80 opacity-5 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-600 to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <span className="text-[10px] font-black bg-blue-50 border border-blue-200 text-blue-600 px-3 py-1 rounded-full uppercase tracking-widest">
              SUBSCRIPTION WORKFLOW
            </span>
            <h2 className="text-2xl md:text-3xl font-black mt-4 mb-8 uppercase tracking-tight text-slate-800">How to Get Subscription Access?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm text-white shadow-sm">1</div>
                <h4 className="font-extrabold text-sm mt-1 uppercase text-slate-800">Fill Google Form</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">Click "Buy Subscription" and fill out the registration form with your name, phone, and selected course.</p>
              </div>

              <div className="flex flex-col gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm text-white shadow-sm">2</div>
                <h4 className="font-extrabold text-sm mt-1 uppercase text-slate-800">Verification & Seeding</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">Our admin team will review your registration, verify the payment details, and seed a unique Student ID and Password.</p>
              </div>

              <div className="flex flex-col gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm text-white shadow-sm">3</div>
                <h4 className="font-extrabold text-sm mt-1 uppercase text-slate-800">Log In & Attempt</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">Use the provided credentials in the student portal, select your course category, and start taking unlimited mock tests.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Subscription/Buy Now Modal */}
      {showBuyModal && selectedTestToBuy && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in select-none">
          <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl border border-slate-200 animate-slide-up">
            
            {/* Modal Header */}
            <div className="bg-slate-50 text-slate-800 px-6 py-4 flex items-center justify-between border-b border-gray-150">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5.5 h-5.5 text-blue-650" />
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-800">Subscription Registration</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowBuyModal(false);
                  setSelectedTestToBuy(null);
                }}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-gray-700">
              <div>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">SELECTED EXAM SERIES</p>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mt-1">
                  <h4 className="text-xl font-black text-slate-800 uppercase">{selectedTestToBuy.name}</h4>
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-250 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm select-none">
                    ₹25 / Month
                  </span>
                </div>
                <div className="flex gap-4 mt-2 text-xs font-semibold text-slate-500">
                  <span>Category: <strong className="text-slate-750 text-slate-850 text-slate-700">{(selectedTestToBuy.category || 'JEE')}</strong></span>
                  <span>Duration: <strong className="text-slate-750 text-slate-850 text-slate-700">{selectedTestToBuy.duration} Mins</strong></span>
                  <span>Questions: <strong className="text-slate-750 text-slate-850 text-slate-700">{selectedTestToBuy.question_count} Qs</strong></span>
                </div>
              </div>

              {/* Steps Info */}
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl space-y-3.5">
                <h5 className="font-extrabold text-xs text-blue-800 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" /> Follow these steps to unlock:
                </h5>
                <ol className="list-decimal pl-4 text-xs font-semibold text-blue-900/95 space-y-2.5">
                  <li>
                    Fill out the Google Registration form (Name, Phone number, and course details) and complete the ₹25 monthly fee payment.
                  </li>
                  <li>
                    Once submitted, our Admin team will verify payment and generate your unique <strong className="underline text-blue-950">Student ID and Password</strong>.
                  </li>
                  <li>
                    You will receive your credentials on your WhatsApp number and Email within 1-2 hours to get unlimited mock test access.
                  </li>
                </ol>
              </div>

              {/* Instructions Prompt */}
              <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                Clicking the button below will open the Google Form to complete your ₹25 registration.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 bg-slate-50 border-t border-gray-150 flex flex-col sm:flex-row gap-3">
              <a
                href="https://forms.gle/ML2urJTy75xXFXK18" // Custom Google Form link
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl tracking-wider uppercase transition-colors shadow-md flex items-center justify-center gap-1.5 cursor-pointer text-center"
              >
                <span>Buy Now (₹25/Month)</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <button
                type="button"
                onClick={() => {
                  setShowBuyModal(false);
                  setSelectedTestToBuy(null);
                }}
                className="px-5 py-3 border border-gray-250 text-gray-700 hover:bg-gray-100 font-bold text-xs rounded-xl uppercase tracking-wider transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-100 text-slate-700 py-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-md">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-gray-800 text-base tracking-wider uppercase">PrepApple</span>
              <span className="text-blue-600 font-extrabold text-[9px] ml-1.5 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">CBT</span>
            </div>
          </div>
          <div className="text-xs font-bold text-slate-500 text-center md:text-right uppercase tracking-widest leading-relaxed">
            &copy; {new Date().getFullYear()} PrepApple portal. All rights reserved. <br/>
            <span className="text-[10px] text-slate-400 mt-1 inline-block">Designed for NTA JEE & NEET Medical Mock Test Prep</span>
          </div>
        </div>
      </footer>
    </div>
  );
}


import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ChevronLeft, ChevronRight, User, Star, Layers, FileText, X, ExternalLink, ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';

interface Test {
  id: number;
  name: string;
  duration: number;
  question_count: number;
  attempt_count: number;
  category?: string;
  is_free?: number;
  test_type?: 'mock' | 'quiz';
}

export default function StudentPortal() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [studentName, setStudentName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('JEE');
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedTestToBuy, setSelectedTestToBuy] = useState<any | null>(null);
  
  const mockScrollRef = useRef<HTMLDivElement>(null);
  const quizScrollRef = useRef<HTMLDivElement>(null);
  const assignedScrollRef = useRef<HTMLDivElement>(null);
  const [assignedTests, setAssignedTests] = useState<Test[]>([]);
  const navigate = useNavigate();

  const scrollContainer = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const { scrollLeft, clientWidth } = ref.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth * 0.75 
        : scrollLeft + clientWidth * 0.75;
      ref.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const fetchAssignedTests = async (studentId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tests/student/${studentId}/assigned`);
      if (response.ok) {
        const data = await response.json();
        setAssignedTests(data);
      }
    } catch (err) {
      console.error('Error fetching assigned tests:', err);
    }
  };

  useEffect(() => {
    fetchTests();
    const cached = localStorage.getItem('currentUser');
    if (cached) {
      const user = JSON.parse(cached);
      if (user.role === 'student') {
        setStudentName(user.name || '');
        setRollNumber(user.rollNumber || '');
        setIsSubscribed(user.isSubscribed === true);
        fetchStudentAttempts(user.name || '');
        fetchAssignedTests(user.id);
      } else if (user.role === 'admin') {
        setStudentName('Admin Preview');
        setRollNumber('VU1FADMIN');
        setIsSubscribed(true);
        fetchStudentAttempts('Admin Preview');
      }
    }
  }, []);

  const fetchStudentAttempts = async (name: string) => {
    try {
      setLoadingAttempts(true);
      const response = await fetch(`http://localhost:5000/api/attempts/student/${encodeURIComponent(name)}`);
      if (!response.ok) throw new Error('Failed to fetch student attempts');
      const data = await response.json();
      setAttempts(data);
    } catch (err) {
      console.error('Error fetching attempts:', err);
    } finally {
      setLoadingAttempts(false);
    }
  };

  useEffect(() => {
    if (selectedTest) {
      const cached = localStorage.getItem('currentUser');
      if (cached) {
        const user = JSON.parse(cached);
        if (user.role === 'student') {
          setStudentName(user.name || '');
          setRollNumber(user.rollNumber || '');
        } else if (user.role === 'admin') {
          setStudentName('Admin Preview');
          setRollNumber('VU1FADMIN');
        }
      }
    }
  }, [selectedTest]);

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

  const handleStartTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) return;
    if (selectedTest) {
      // Redirect to test attempt page, passing studentName and rollNumber
      navigate(`/attempt/${selectedTest.id}`, { 
        state: { 
          studentName: studentName.trim(),
          rollNumber: rollNumber.trim() || 'VU1F2122'
        } 
      });
    }
  };

  const categories = Array.from(new Set(tests.map(test => (test.category || 'JEE').toUpperCase())));
  if (!categories.includes('JEE')) categories.push('JEE');
  if (!categories.includes('NEET')) categories.push('NEET');

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header Banner styling from screenshot */}
      <div className="text-center mb-10 select-none">
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight uppercase">Quizzes</h1>
          <span className="bg-[#10b981] text-white text-xs font-black px-2.5 py-1 rounded-md uppercase tracking-wider">Free</span>
        </div>
        <div className="h-0.5 bg-slate-300 w-16 mx-auto mt-3 mb-3"></div>
        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest leading-relaxed">Daily Updated Free Quizzes For Practice</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 uppercase tracking-tight">Practice Dashboard</h2>
          <p className="text-slate-500 text-xs font-semibold">Choose your target course to view quizzes and series tests.</p>
        </div>
        
        {/* Category Dropdown Filter */}
        <div className="flex items-center gap-3 bg-white border border-gray-200 px-4 py-2 rounded-2xl shadow-sm">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Selected Course</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="focus:outline-none bg-white font-extrabold text-sm text-gray-800 cursor-pointer"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat} {cat === 'JEE' ? '(Mains & Advanced)' : cat === 'NEET' ? '(UG Medical)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-12">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-slate-200 rounded w-1/4"></div>
            <div className="flex gap-6 overflow-x-auto py-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="w-[300px] flex-shrink-0 bg-white rounded-3xl p-6 border border-slate-200 h-60"></div>
              ))}
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          Failed to load mock tests. Please check if backend is running. Error: {error}
        </div>
      ) : (
        <div className="space-y-12">
          {/* ASSIGNED TESTS */}
          {assignedTests.length > 0 && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                  <span>Assigned Tests For You</span>
                  <span className="bg-blue-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                    Assigned Task
                  </span>
                </h2>
                <p className="text-slate-500 text-xs font-semibold">Mock tests specifically assigned to you by your teacher.</p>
              </div>

              <div className="relative flex items-center w-full px-2">
                <button
                  onClick={() => scrollContainer(assignedScrollRef, 'left')}
                  className="absolute -left-4 z-10 w-9 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md hover:scale-105"
                  title="Scroll Left"
                >
                  <ChevronLeft className="w-5 h-5 stroke-[3]" />
                </button>

                <div
                  ref={assignedScrollRef}
                  className="flex gap-6 overflow-x-auto scroll-smooth py-4 px-2 w-full snap-x scrollbar-hide"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {assignedTests
                    .filter(test => (test.category || 'JEE').toUpperCase() === selectedCategory.toUpperCase())
                    .map((test) => (
                      <div
                        key={test.id}
                        className="w-[310px] md:w-[330px] flex-shrink-0 bg-white rounded-3xl p-6 border border-blue-200/80 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 snap-start flex flex-col justify-between h-[230px] relative overflow-hidden group"
                      >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-300"></div>
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider">
                              {test.category || 'JEE'}
                            </span>
                            <span className="flex items-center gap-1.5 text-slate-500 font-extrabold text-[10px] uppercase">
                              <Clock className="w-3.5 h-3.5 text-blue-500" />
                              {test.duration} Mins
                            </span>
                          </div>

                          <h3 className="font-black text-slate-800 text-base mt-4 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                            {test.name}
                          </h3>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                            {test.question_count} Questions
                          </span>

                          <button
                            onClick={() => {
                              setSelectedTest(test);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[10px] uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
                          >
                            Start Test
                          </button>
                        </div>
                      </div>
                    ))}
                </div>

                <button
                  onClick={() => scrollContainer(assignedScrollRef, 'right')}
                  className="absolute -right-4 z-10 w-9 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md hover:scale-105"
                  title="Scroll Right"
                >
                  <ChevronRight className="w-5 h-5 stroke-[3]" />
                </button>
              </div>
            </div>
          )}

          {/* DAILY PRACTICE QUIZZES (100% FREE) */}
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                <span>Daily Practice Quizzes</span>
                <span className="bg-[#10b981] text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Free Access
                </span>
              </h2>
              <p className="text-slate-500 text-xs font-semibold">Short topic quizzes. All students can attempt these for free.</p>
            </div>

            {tests.filter(test => test.test_type === 'quiz' && (test.category || 'JEE') === selectedCategory).length === 0 ? (
              <div className="bg-slate-50/50 border border-slate-100 rounded-3xl p-10 text-center text-slate-400 font-semibold text-xs">
                No Daily Practice Quizzes uploaded yet for {selectedCategory}.
              </div>
            ) : (
              <div className="relative flex items-center w-full px-2">
                <button
                  onClick={() => scrollContainer(quizScrollRef, 'left')}
                  className="absolute -left-4 z-10 w-9 h-9 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md hover:scale-105"
                  title="Scroll Left"
                >
                  <ChevronLeft className="w-5 h-5 stroke-[3]" />
                </button>

                <div
                  ref={quizScrollRef}
                  className="flex gap-6 overflow-x-auto scroll-smooth py-4 px-2 w-full snap-x scrollbar-hide"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {tests
                    .filter(test => test.test_type === 'quiz' && (test.category || 'JEE') === selectedCategory)
                    .map((test) => (
                      <div
                        key={test.id}
                        className="w-[290px] sm:w-[320px] flex-shrink-0 snap-start bg-white rounded-3xl p-5 border border-slate-200/85 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group border-l-4 border-l-[#10b981]"
                      >
                        <div>
                          <div className="flex justify-between items-start gap-4 mb-4">
                            <h3 className="font-extrabold text-sm text-slate-800 group-hover:text-emerald-600 transition-colors leading-snug line-clamp-2 uppercase min-h-[40px]">
                              {test.name}
                            </h3>
                            <span className="bg-emerald-50 text-emerald-700 text-[9px] font-black px-2 py-0.5 rounded border border-emerald-150 uppercase flex-shrink-0">
                              Free Quiz
                            </span>
                          </div>

                          <div className="space-y-3 mt-4 border-t border-slate-100 pt-3.5 text-xs font-semibold text-slate-500">
                            <div className="flex justify-between items-center">
                              <span>Questions</span>
                              <span className="text-slate-800 font-bold">{test.question_count} Qs</span>
                            </div>
                            <div className="h-px bg-slate-100 w-full"></div>
                            <div className="flex justify-between items-center">
                              <span>Marks</span>
                              <span className="text-slate-800 font-bold">{test.question_count * 4} Marks</span>
                            </div>
                            <div className="h-px bg-slate-100 w-full"></div>
                            <div className="flex justify-between items-center">
                              <span>Duration</span>
                              <span className="text-slate-800 font-bold">{test.duration} Min</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedTest(test)}
                          className="w-full mt-6 bg-[#10b981] hover:bg-[#059669] text-white font-extrabold py-3.5 px-4 rounded-xl transition-all text-xs uppercase tracking-wider cursor-pointer shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20"
                        >
                          Start Quiz
                        </button>
                      </div>
                    ))}
                </div>

                <button
                  onClick={() => scrollContainer(quizScrollRef, 'right')}
                  className="absolute -right-4 z-10 w-9 h-9 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md hover:scale-105"
                  title="Scroll Right"
                >
                  <ChevronRight className="w-5 h-5 stroke-[3]" />
                </button>
              </div>
            )}
          </div>

          {/* MOCK TEST SERIES */}
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
                Mock Test Series
              </h2>
              <p className="text-slate-500 text-xs font-semibold">Full-length tests. Requires a premium student subscription unless marked free.</p>
            </div>

            {tests.filter(test => (test.test_type || 'mock') === 'mock' && (test.category || 'JEE') === selectedCategory).length === 0 ? (
              <div className="bg-slate-50/50 border border-slate-100 rounded-3xl p-10 text-center text-slate-400 font-semibold text-xs">
                No Mock Test Series published yet for {selectedCategory}.
              </div>
            ) : (
              <div className="relative flex items-center w-full px-2">
                <button
                  onClick={() => scrollContainer(mockScrollRef, 'left')}
                  className="absolute -left-4 z-10 w-9 h-9 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md hover:scale-105"
                  title="Scroll Left"
                >
                  <ChevronLeft className="w-5 h-5 stroke-[3]" />
                </button>

                <div
                  ref={mockScrollRef}
                  className="flex gap-6 overflow-x-auto scroll-smooth py-4 px-2 w-full snap-x scrollbar-hide"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {tests
                    .filter(test => (test.test_type || 'mock') === 'mock' && (test.category || 'JEE') === selectedCategory)
                    .map((test) => (
                      <div
                        key={test.id}
                        className="w-[290px] sm:w-[320px] flex-shrink-0 snap-start bg-white rounded-3xl p-5 border border-slate-200/85 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                      >
                        <div>
                          <div className="flex justify-between items-start gap-4 mb-4">
                            <h3 className="font-extrabold text-sm text-slate-800 group-hover:text-emerald-600 transition-colors leading-snug line-clamp-2 uppercase min-h-[40px]">
                              {test.name}
                            </h3>
                            {test.is_free === 1 ? (
                              <span className="bg-emerald-50 text-emerald-700 text-[9px] font-black px-2 py-0.5 rounded border border-emerald-150 uppercase flex-shrink-0">
                                Free Mock
                              </span>
                            ) : !isSubscribed ? (
                              <span className="bg-red-50 text-red-600 p-1.5 rounded-lg border border-red-150 flex-shrink-0" title="Locked Mock Quiz">
                                <Lock className="w-3.5 h-3.5" />
                              </span>
                            ) : (
                              <Clock className="w-4.5 h-4.5 text-slate-400 flex-shrink-0" />
                            )}
                          </div>

                          <div className="space-y-3 mt-4 border-t border-slate-100 pt-3.5 text-xs font-semibold text-slate-500">
                            <div className="flex justify-between items-center">
                              <span>Questions</span>
                              <span className="text-slate-800 font-bold">{test.question_count} Qs</span>
                            </div>
                            <div className="h-px bg-slate-100 w-full"></div>
                            <div className="flex justify-between items-center">
                              <span>Marks</span>
                              <span className="text-slate-800 font-bold">{test.question_count * 4} Marks</span>
                            </div>
                            <div className="h-px bg-slate-100 w-full"></div>
                            <div className="flex justify-between items-center">
                              <span>Duration</span>
                              <span className="text-slate-800 font-bold">{test.duration} Min</span>
                            </div>
                          </div>
                        </div>

                        {(test.is_free === 1 || isSubscribed) ? (
                          <button
                            onClick={() => setSelectedTest(test)}
                            className="w-full mt-6 bg-[#10b981] hover:bg-[#059669] text-white font-extrabold py-3.5 px-4 rounded-xl transition-all text-xs uppercase tracking-wider cursor-pointer shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20"
                          >
                            Start Quiz
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedTestToBuy(test);
                              setShowBuyModal(true);
                            }}
                            className="w-full mt-6 bg-slate-900 hover:bg-slate-950 text-white font-extrabold py-3.5 px-4 rounded-xl transition-all text-xs uppercase tracking-wider cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            <span>Unlock with Subscription</span>
                          </button>
                        )}
                      </div>
                    ))}
                </div>

                <button
                  onClick={() => scrollContainer(mockScrollRef, 'right')}
                  className="absolute -right-4 z-10 w-9 h-9 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md hover:scale-105"
                  title="Scroll Right"
                >
                  <ChevronRight className="w-5 h-5 stroke-[3]" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Start Test Name Modal */}
      {selectedTest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in select-none">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-200 animate-slide-up">
            {/* Header Banner */}
            <div className="bg-[#0f294a] text-white px-6 py-4 flex items-center justify-between border-b border-blue-950">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center border-2 border-white/20 bg-blue-600/30 rounded text-[#fbbf24] rotate-180 flex-shrink-0">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 3l10 18H2L12 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base md:text-lg tracking-tight uppercase flex items-center gap-2">
                    <span className="text-[#fbbf24] font-black">{selectedTest.name}</span>
                  </h3>
                  <p className="text-[10px] text-gray-300 font-bold uppercase tracking-wider">Mock Test — 2025</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedTest(null);
                  setStudentName('');
                  setRollNumber('');
                }}
                className="text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Metadata Stats Row */}
            <div className="bg-[#f8fafc] border-b border-gray-150 py-3 px-6 grid grid-cols-4 text-center divide-x divide-gray-200 select-none">
              <div>
                <div className="flex items-center justify-center gap-1.5 text-[#0f294a] text-xs font-black">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span>{selectedTest.duration >= 60 ? `${Math.floor(selectedTest.duration / 60)} Hours` : `${selectedTest.duration} Mins`}</span>
                </div>
                <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">DURATION</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1.5 text-[#0f294a] text-xs font-black">
                  <FileText className="w-3.5 h-3.5 text-gray-400" />
                  <span>{selectedTest.question_count} Qs</span>
                </div>
                <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">QUESTIONS</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1.5 text-[#0f294a] text-xs font-black">
                  <Star className="w-3.5 h-3.5 text-gray-400" />
                  <span>{selectedTest.question_count * 4} Marks</span>
                </div>
                <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">MAX MARKS</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1.5 text-[#0f294a] text-xs font-black">
                  <Layers className="w-3.5 h-3.5 text-gray-400" />
                  <span>3 Subjects</span>
                </div>
                <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">SECTIONS</p>
              </div>
            </div>

            <form onSubmit={handleStartTest} className="mt-4">
              {/* Form Title */}
              <div className="px-6">
                <h4 className="text-[#0f294a] text-base font-black tracking-tight">Student Login</h4>
                <p className="text-[11px] text-gray-400 font-medium">Enter your details to begin the test. These will be shown throughout the exam.</p>
              </div>

              {/* Input Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6 mt-4">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-gray-600 mb-2">
                    <User className="w-4 h-4 text-purple-600" />
                    <span>Full Name</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Soham Nandanwar"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-gray-800 text-sm bg-white"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-gray-600 mb-2">
                    <span className="w-4 h-4 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center text-[10px] font-black font-mono">ID</span>
                    <span>Roll Number</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VU1F2122"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-gray-800 text-sm bg-white"
                  />
                </div>
              </div>

              {/* Instructions Yellow Panel */}
              <div className="bg-amber-50/75 border border-amber-200/60 p-4 rounded-xl text-xs text-amber-800 mx-6 mt-6">
                <p className="font-bold flex items-center gap-1.5 mb-2">
                  <span>⚠️</span> Before you begin:
                </p>
                <ul className="space-y-1.5 pl-3 font-semibold text-[11px] text-amber-700/90">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">&rsaquo;</span>
                    <span>Ensure a stable internet connection.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">&rsaquo;</span>
                    <span>Do <strong className="underline text-red-700">not</strong> refresh or close the browser during the test.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">&rsaquo;</span>
                    <span>The timer starts as soon as you click Start Test.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">&rsaquo;</span>
                    <span>Mark answers carefully — negative marking applies.</span>
                  </li>
                </ul>
              </div>

              {/* Action Button */}
              <div className="px-6 py-6">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#0f294a] hover:bg-[#153a66] text-white font-extrabold text-sm rounded-xl tracking-wider transition-colors shadow-md uppercase cursor-pointer"
                >
                  Start Test &rarr;
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student's Practice History & Performance Section */}
      <div className="mt-16 border-t border-slate-200 pt-12 select-none">
        <div className="mb-6">
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
            Practice History & Performance
          </h2>
          <p className="text-slate-500 text-sm font-semibold">Review your past quiz attempts and analyze your strengths and weaknesses.</p>
        </div>

        {loadingAttempts ? (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-8 text-center text-slate-400 font-bold text-sm animate-pulse">
            Loading performance record...
          </div>
        ) : attempts.length === 0 ? (
          <div className="bg-white border border-slate-200/80 border-dashed rounded-3xl p-12 text-center text-slate-400">
            <Layers className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-extrabold text-slate-700 uppercase tracking-tight">No Quiz History Yet</p>
            <p className="text-[11px] font-semibold mt-1">Start a mock quiz from the list above to generate your first analysis report!</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs md:text-sm font-semibold text-slate-600">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-black text-[10px] uppercase tracking-wider">
                    <th className="p-4 pl-6">Quiz Name</th>
                    <th className="p-4">Score</th>
                    <th className="p-4">Accuracy</th>
                    <th className="p-4">Breakdown</th>
                    <th className="p-4">Time Taken</th>
                    <th className="p-4">Date</th>
                    <th className="p-4 text-center pr-6">Analysis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                  {attempts.map((attempt) => {
                    const formattedDate = new Date(attempt.submitted_at).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });
                    
                    const durationMins = Math.floor(attempt.time_taken / 60);
                    const durationSecs = attempt.time_taken % 60;
                    
                    return (
                      <tr key={attempt.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 pl-6 font-extrabold text-slate-800 text-sm uppercase max-w-xs truncate" title={attempt.test_name}>
                          {attempt.test_name}
                        </td>
                        <td className="p-4 text-slate-900 font-black">
                          {attempt.score} <span className="text-[10px] text-slate-400 font-bold">/ {attempt.total_questions * 4}</span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                            attempt.accuracy >= 75 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-150' 
                              : attempt.accuracy >= 45 
                                ? 'bg-amber-50 text-amber-700 border-amber-150' 
                                : 'bg-red-50 text-red-700 border-red-150'
                          }`}>
                            {attempt.accuracy}%
                          </span>
                        </td>
                        <td className="p-4 text-xs font-semibold text-slate-500">
                          <span className="text-emerald-600">{attempt.correct_count} ✔</span> • <span className="text-red-500">{attempt.wrong_count} ✖</span>
                        </td>
                        <td className="p-4 text-slate-600 font-mono text-xs">
                          {durationMins > 0 ? `${durationMins}m ${durationSecs}s` : `${durationSecs}s`}
                        </td>
                        <td className="p-4 text-xs font-medium text-slate-400">
                          {formattedDate}
                        </td>
                        <td className="p-4 text-center pr-6">
                          <button
                            onClick={() => navigate(`/results/${attempt.id}`)}
                            className="px-4 py-2 border border-slate-350 hover:bg-slate-900 hover:border-slate-900 hover:text-white text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer uppercase tracking-wider"
                          >
                            Review Analysis
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      {/* Registration Buy Modal Overlay */}
      {showBuyModal && selectedTestToBuy && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in select-none">
          <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl border border-slate-200 animate-slide-up">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5.5 h-5.5 text-blue-500" />
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-100">Subscription Registration</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowBuyModal(false);
                  setSelectedTestToBuy(null);
                }}
                className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-1.5 rounded-lg transition-colors cursor-pointer"
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
                  <span>Category: <strong className="text-slate-700">{(selectedTestToBuy.category || 'JEE')}</strong></span>
                  <span>Duration: <strong className="text-slate-700">{selectedTestToBuy.duration} Mins</strong></span>
                  <span>Questions: <strong className="text-slate-700">{selectedTestToBuy.question_count} Qs</strong></span>
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
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

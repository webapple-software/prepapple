import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ChevronLeft, ChevronRight, User, Star, Layers, FileText, X, ExternalLink, ShieldCheck, Lock, CheckCircle2, LayoutDashboard, BookOpen, FileSpreadsheet, Activity, LogOut, CreditCard, ArrowRight, Menu, AlertTriangle, Trophy, Sparkles, XCircle } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title as ChartTitle, Tooltip, Legend, ArcElement } from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ChartTitle,
  Tooltip,
  Legend,
  ArcElement
);

interface Test {
  id: number;
  name: string;
  duration: number;
  question_count: number;
  attempt_count: number;
  category?: string;
  is_free?: number;
  test_type?: string;
}

export default function StudentPortal() {
  const [tests, setTests] = useState<Test[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [studentName, setStudentName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('JEE');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'assigned' | 'quizzes' | 'mocks' | 'history' | 'subscription'>('dashboard');
  const [attempts, setAttempts] = useState<any[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [loadingAttempts, setLoadingAttempts] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedTestToBuy, setSelectedTestToBuy] = useState<any | null>(null);
  
  const mockScrollRef = useRef<HTMLDivElement>(null);
  const quizScrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const scrollContainer = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const { scrollLeft, clientWidth } = ref.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth * 0.75 
        : scrollLeft + clientWidth * 0.75;
      ref.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };


  useEffect(() => {
    fetchTests();
    fetchCategories();
    const cached = localStorage.getItem('currentUser');
    if (cached) {
      const user = JSON.parse(cached);
      if (user.role === 'student') {
        setStudentName(user.name || '');
        setRollNumber(user.rollNumber || '');
        
        const expiryTime = user.subscriptionExpiresAt ? new Date(user.subscriptionExpiresAt).getTime() : null;
        const now = Date.now();
        const valid = user.isSubscribed === true && (expiryTime === null || expiryTime > now);
        setIsSubscribed(valid);

        setSelectedCategory((user.course || 'JEE').toUpperCase());
        fetchStudentAttempts(user.name || '');
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
      const response = await fetch(`/api/attempts/student/${encodeURIComponent(name)}`);
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
      const response = await fetch('/api/tests?published=true');
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

  // Stats Aggregation for ChartJS
  const totalAttemptsCount = attempts.length;
  const avgAccuracy = totalAttemptsCount > 0 
    ? Math.round(attempts.reduce((sum, item) => sum + (item.accuracy || 0), 0) / totalAttemptsCount) 
    : 0;
  
  const totalCorrect = attempts.reduce((sum, item) => sum + (item.correct_count || 0), 0);
  const totalWrong = attempts.reduce((sum, item) => sum + (item.wrong_count || 0), 0);
  const totalQuestions = attempts.reduce((sum, item) => sum + (item.total_questions || 0), 0);
  const totalSkipped = Math.max(0, totalQuestions - (totalCorrect + totalWrong));

  // Progression Line Chart Data
  const lineChartData = {
    labels: [...attempts].reverse().map((_, idx) => `Test ${idx + 1}`),
    datasets: [
      {
        label: 'Accuracy Score (%)',
        data: [...attempts].reverse().map(item => item.accuracy || 0),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#2563eb',
        pointHoverRadius: 7,
      }
    ]
  };

  // Answer Breakdown Doughnut Chart Data
  const doughnutChartData = {
    labels: ['Correct Solutions', 'Wrong Answers', 'Skipped/Unanswered'],
    datasets: [
      {
        data: [totalCorrect, totalWrong, totalSkipped],
        backgroundColor: ['#10b981', '#ef4444', '#94a3b8'],
        hoverBackgroundColor: ['#059669', '#dc2626', '#64748b'],
        borderWidth: 2,
        borderColor: '#ffffff',
      }
    ]
  };

  // Subject Accuracy Mapping Engine
  const subjectStats: Record<string, { correct: number; total: number }> = {
    'Physics': { correct: 0, total: 0 },
    'Chemistry': { correct: 0, total: 0 },
    'Mathematics': { correct: 0, total: 0 },
    'Biology': { correct: 0, total: 0 }
  };

  attempts.forEach(att => {
    const name = (att.test_name || '').toUpperCase();
    let subj = 'General';
    if (name.includes('PHYSICS') || name.includes('PHY')) subj = 'Physics';
    else if (name.includes('CHEMISTRY') || name.includes('CHEM')) subj = 'Chemistry';
    else if (name.includes('MATHEMATICS') || name.includes('MATH') || name.includes('INTEGRAL') || name.includes('CALCULUS') || name.includes('ALGEBRA')) subj = 'Mathematics';
    else if (name.includes('BIOLOGY') || name.includes('BIO') || name.includes('ZOOLOGY') || name.includes('BOTANY')) subj = 'Biology';

    if (subj !== 'General') {
      subjectStats[subj].correct += att.correct_count || 0;
      subjectStats[subj].total += att.total_questions || 0;
    }
  });

  const subjectScores = Object.keys(subjectStats).map(subject => {
    const { correct, total } = subjectStats[subject];
    const accuracy = total > 0 ? Math.round((correct / total) * 105) : null; // Scale accuracy
    const normalizedAcc = accuracy !== null ? Math.min(100, accuracy) : null;
    return { subject, accuracy: normalizedAcc, totalQuestions: total };
  });

  const attemptedSubjects = subjectScores.filter(s => s.accuracy !== null);
  const weakestSubject = attemptedSubjects.length > 0 
    ? [...attemptedSubjects].sort((a, b) => (a.accuracy || 0) - (b.accuracy || 0))[0] 
    : null;
  const strongestSubject = attemptedSubjects.length > 0 
    ? [...attemptedSubjects].sort((a, b) => (b.accuracy || 0) - (a.accuracy || 0))[0] 
    : null;

  const subjectChartData = {
    labels: subjectScores.map(s => s.subject),
    datasets: [
      {
        label: 'Accuracy %',
        data: subjectScores.map(s => s.accuracy ?? 0),
        backgroundColor: [
          'rgba(59, 130, 246, 0.75)', // Physics
          'rgba(245, 158, 11, 0.75)', // Chemistry
          'rgba(139, 92, 246, 0.75)', // Mathematics
          'rgba(16, 185, 129, 0.75)'  // Biology
        ],
        borderRadius: 8,
        borderWidth: 0,
      }
    ]
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* Mobile Backdrop Overlay */}
      {!isSidebarCollapsed && (
        <div 
          onClick={() => setIsSidebarCollapsed(true)}
          className="md:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-35"
        />
      )}

      {/* Sidebar Panel */}
      <aside 
        className={`bg-[#0c1e38] text-white flex flex-col transition-all duration-300 z-40 select-none ${
          isSidebarCollapsed 
            ? 'w-0 md:w-20 -translate-x-full md:translate-x-0 overflow-hidden' 
            : 'w-64 fixed md:relative inset-y-0 left-0 shadow-2xl md:shadow-none'
        }`}
      >
        {/* Brand Header & Toggle */}
        <div className={`p-4 border-b border-blue-950 flex items-center justify-between gap-3 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
          <div className="flex items-center gap-3">
            <img 
              src="/assets/logo-prepapple.png" 
              alt="PrepApple Logo" 
              onClick={() => isSidebarCollapsed && setIsSidebarCollapsed(false)}
              className={`h-9 w-auto object-contain flex-shrink-0 bg-white/10 p-1 rounded-2xl ${isSidebarCollapsed ? 'cursor-pointer hover:bg-white/20' : ''}`}
              title={isSidebarCollapsed ? "Expand Sidebar" : undefined}
              onError={(e: any) => { e.target.onerror = null; e.target.src = "/assets/logo.jpeg"; }}
            />
            {!isSidebarCollapsed && (
              <div className="animate-fade-in">
                <h2 className="font-black text-sm tracking-widest text-white uppercase leading-none">Prep<span className="text-sky-400">Apple</span></h2>
                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest block mt-1">CBT Prep Portal</span>
              </div>
            )}
          </div>
          
          {/* Toggle Trigger */}
          <button
            type="button"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="text-blue-300 hover:text-white p-1 rounded-lg hover:bg-blue-950 transition-colors cursor-pointer"
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? (
              <Menu className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Sidebar Tabs */}
        <div className={`flex-1 overflow-y-auto space-y-1.5 ${isSidebarCollapsed ? 'p-2' : 'p-4'}`}>
          {!isSidebarCollapsed && (
            <span className="text-[9px] font-black text-blue-400/80 uppercase tracking-widest px-4 block mb-2 animate-fade-in">Student Center</span>
          )}
          
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              isSidebarCollapsed ? 'justify-center w-12 h-12 mx-auto px-0 py-0' : 'w-full gap-3 px-4 py-3'
            } ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow shadow-blue-500/10'
                : 'text-slate-300 hover:bg-[#1a3a60] hover:text-white'
            }`}
            title={isSidebarCollapsed ? "Dashboard" : undefined}
          >
            <LayoutDashboard className="w-4.5 h-4.5" />
            {!isSidebarCollapsed && <span className="animate-fade-in">Dashboard</span>}
          </button>

          <button
            onClick={() => setActiveTab('quizzes')}
            className={`flex items-center rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              isSidebarCollapsed ? 'justify-center w-12 h-12 mx-auto px-0 py-0' : 'w-full gap-3 px-4 py-3'
            } ${
              activeTab === 'quizzes'
                ? 'bg-blue-600 text-white shadow shadow-blue-500/10'
                : 'text-slate-300 hover:bg-[#1a3a60] hover:text-white'
            }`}
            title={isSidebarCollapsed ? "Practice Quizzes" : undefined}
          >
            <BookOpen className="w-4.5 h-4.5" />
            {!isSidebarCollapsed && <span className="animate-fade-in">Practice Quizzes</span>}
          </button>

          <button
            onClick={() => setActiveTab('mocks')}
            className={`flex items-center rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              isSidebarCollapsed ? 'justify-center w-12 h-12 mx-auto px-0 py-0' : 'w-full gap-3 px-4 py-3'
            } ${
              activeTab === 'mocks'
                ? 'bg-blue-600 text-white shadow shadow-blue-500/10'
                : 'text-slate-300 hover:bg-[#1a3a60] hover:text-white'
            }`}
            title={isSidebarCollapsed ? "Mock Test Series" : undefined}
          >
            <Activity className="w-4.5 h-4.5" />
            {!isSidebarCollapsed && <span className="animate-fade-in">Mock Test Series</span>}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              isSidebarCollapsed ? 'justify-center w-12 h-12 mx-auto px-0 py-0' : 'w-full gap-3 px-4 py-3'
            } ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white shadow shadow-blue-500/10'
                : 'text-slate-300 hover:bg-[#1a3a60] hover:text-white'
            }`}
            title={isSidebarCollapsed ? "Practice History" : undefined}
          >
            <FileSpreadsheet className="w-4.5 h-4.5" />
            {!isSidebarCollapsed && <span className="animate-fade-in">Practice History</span>}
          </button>

          <button
            onClick={() => setActiveTab('subscription')}
            className={`flex items-center rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              isSidebarCollapsed ? 'justify-center w-12 h-12 mx-auto px-0 py-0' : 'w-full gap-3 px-4 py-3'
            } ${
              activeTab === 'subscription'
                ? 'bg-blue-600 text-white shadow shadow-blue-500/10'
                : 'text-slate-300 hover:bg-[#1a3a60] hover:text-white'
            }`}
            title={isSidebarCollapsed ? "My Subscription" : undefined}
          >
            <CreditCard className="w-4.5 h-4.5" />
            {!isSidebarCollapsed && <span className="animate-fade-in">My Subscription</span>}
          </button>
        </div>

        {/* Sidebar Footer */}
        <div className={`border-t border-blue-950 ${isSidebarCollapsed ? 'p-2' : 'p-4'}`}>
          <button
            onClick={() => {
              localStorage.removeItem('currentUser');
              navigate('/');
            }}
            className={`flex items-center rounded-xl text-xs font-bold uppercase tracking-wider text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all cursor-pointer ${
              isSidebarCollapsed ? 'justify-center w-12 h-12 mx-auto px-0 py-0' : 'w-full gap-3 px-4 py-3'
            }`}
            title={isSidebarCollapsed ? "Logout" : undefined}
          >
            <LogOut className="w-4.5 h-4.5" />
            {!isSidebarCollapsed && <span className="animate-fade-in">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Viewport Content */}
      <div className="flex-grow flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-8 py-3.5 sm:py-4.5 flex justify-between items-center shadow-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Toggle Button */}
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="md:hidden p-2 text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Toggle Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-500/10 text-emerald-700 flex items-center justify-center font-extrabold text-xs sm:text-sm border border-emerald-250">
              {rollNumber ? rollNumber.substring(0, 2).toUpperCase() : 'G'}
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-gray-800 uppercase flex items-center gap-2 leading-none">
                <span>{studentName || 'Guest Student'}</span>
                <span className="bg-emerald-50 text-emerald-700 text-[8px] font-black px-1.5 py-0.5 rounded border border-emerald-250 uppercase">
                  Active Student
                </span>
              </h2>
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-0.5 inline-block">
                Roll: {rollNumber || 'GUEST-101'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Target Category Pill */}
            {studentName && studentName !== 'Admin Preview' ? (
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl shadow-sm text-blue-700">
                <span className="text-[9px] font-black uppercase tracking-wider text-blue-400">Target</span>
                <span className="font-extrabold text-xs uppercase">{selectedCategory}</span>
              </div>
            ) : (
              <div className="flex items-center gap-3 bg-white border border-gray-200 px-4 py-2 rounded-2xl shadow-sm">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Course</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="focus:outline-none bg-white font-extrabold text-xs text-gray-800 cursor-pointer"
                >
                  <optgroup label="Defence Exams">
                    <option value="NDA">NDA</option>
                    <option value="CDS">CDS</option>
                    <option value="AFCAT">AFCAT</option>
                  </optgroup>
                  <optgroup label="MHT CET">
                    <option value="MHT PCM">MHT PCM</option>
                    <option value="MHT PCB">MHT PCB</option>
                  </optgroup>
                  <optgroup label="Police">
                    <option value="UP POLICE CONSTABLE">UP POLICE CONSTABLE</option>
                    <option value="UP SI">UP SI</option>
                    <option value="MAHARASHTRA POLICE">MAHARASHTRA POLICE</option>
                    <option value="BIHAR POLICE">BIHAR POLICE</option>
                  </optgroup>
                  <optgroup label="Railway">
                    <option value="RRB GROUP D">RRB GROUP D</option>
                    <option value="RRB JE">RRB JE</option>
                    <option value="RRB NTPC">RRB NTPC</option>
                    <option value="RRB ALP">RRB ALP</option>
                  </optgroup>
                  <optgroup label="SSC">
                    <option value="SSC CGL">SSC CGL</option>
                    <option value="SSC CHSL">SSC CHSL</option>
                    <option value="SSC CPO">SSC CPO</option>
                    <option value="SSC MTS">SSC MTS</option>
                    <option value="SSC GD">SSC GD</option>
                    <option value="SSC JE">SSC JE</option>
                  </optgroup>
                  <optgroup label="Teaching">
                    <option value="CTET">CTET</option>
                    <option value="UPTET">UPTET</option>
                    <option value="KVS">KVS</option>
                  </optgroup>
                  <optgroup label="Other Categories">
                    <option value="JEE">JEE</option>
                    <option value="NEET">NEET</option>
                    {categories.filter(c => !['DEFENCE EXAMS', 'MHT CET', 'POLICE', 'RAILWAYS', 'SSC', 'TEACHING', 'JEE', 'NEET'].includes(c.title?.toUpperCase())).map((cat) => (
                      <option key={cat.id} value={cat.title}>
                        {cat.title}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            )}
          </div>
        </header>

        {/* Content Pane */}
        <main className="flex-grow p-4 sm:p-6 lg:p-8">
          
          {/* DASHBOARD TAB PANEL */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              
              {/* Recommendations & Focus Guidance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {weakestSubject && weakestSubject.accuracy !== null && (
                  <div className="bg-rose-50 border border-rose-100 rounded-3xl p-6 shadow-sm flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-rose-800 uppercase tracking-tight">Improvement Area Recommendation</h4>
                      <p className="text-xs text-rose-700/90 font-semibold mt-1 leading-relaxed">
                        Your average accuracy in <strong className="font-black text-rose-900">{weakestSubject.subject}</strong> is currently <strong className="font-black text-rose-900">{weakestSubject.accuracy}%</strong>. 
                        We recommend attempting chapter-wise practice tests and daily quizzes under <strong className="font-black text-rose-900">{weakestSubject.subject}</strong> to focus on weak topics.
                      </p>
                    </div>
                  </div>
                )}

                {strongestSubject && strongestSubject.accuracy !== null && strongestSubject.accuracy >= 65 ? (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 shadow-sm flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-emerald-800 uppercase tracking-tight">Strong Subject Highlight</h4>
                      <p className="text-xs text-emerald-700/90 font-semibold mt-1 leading-relaxed">
                        Keep it up! Your performance in <strong className="font-black text-emerald-900">{strongestSubject.subject}</strong> is excellent, boasting an average accuracy score of <strong className="font-black text-emerald-900">{strongestSubject.accuracy}%</strong>.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 shadow-sm flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-blue-800 uppercase tracking-tight">Study Tip</h4>
                      <p className="text-xs text-blue-700/90 font-semibold mt-1 leading-relaxed">
                        Consistently complete free practice quizzes and sectional papers to establish accuracy statistics across Mathematics, Physics, Chemistry, and Biology.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic Statistics Grid & Charts */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm select-none">
                <div className="flex flex-col lg:flex-row gap-8">
                  
                  {/* Left Column: Stats & Breakdown */}
                  <div className="w-full lg:w-5/12 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-black text-slate-800 uppercase tracking-tight mb-2">Practice Overview</h3>
                      <p className="text-xs text-slate-400 font-semibold mb-6">Real-time performance analytics across all mock tests.</p>
                      
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                          <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-1">Total Attempted</span>
                          <span className="text-xl font-black text-slate-800">{totalAttemptsCount} Tests</span>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                          <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-1">Average Accuracy</span>
                          <span className={`text-xl font-black ${
                            avgAccuracy >= 75 ? 'text-emerald-600' : avgAccuracy >= 45 ? 'text-amber-500' : 'text-red-500'
                          }`}>{avgAccuracy}%</span>
                        </div>
                      </div>
                    </div>

                    {totalAttemptsCount > 0 ? (
                      <div className="h-[180px] flex items-center justify-center relative">
                        <div className="w-[180px] h-[180px]">
                          <Doughnut 
                            data={doughnutChartData} 
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: { display: false },
                                tooltip: {
                                  callbacks: {
                                    label: (context) => ` ${context.label}: ${context.raw} Qs`
                                  }
                                }
                              },
                              cutout: '70%'
                            }} 
                          />
                        </div>
                        <div className="absolute flex flex-col items-center justify-center leading-none">
                          <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Correct Qs</span>
                          <span className="text-lg font-black text-emerald-600 mt-1">{totalCorrect}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-center text-slate-400 text-xs font-semibold">
                        No question breakdown available yet.
                      </div>
                    )}
                  </div>

                  {/* Right Column: Line Chart Progression */}
                  <div className="w-full lg:w-7/12 border-t lg:border-t-0 lg:border-l border-slate-100 pt-8 lg:pt-0 lg:pl-8 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-black text-slate-800 uppercase tracking-tight mb-2">Score Progression Curve</h3>
                      <p className="text-xs text-slate-400 font-semibold mb-6">Percentage progress across your most recent test attempts.</p>
                    </div>

                    {totalAttemptsCount > 0 ? (
                      <div className="h-[230px] w-full">
                        <Line 
                          data={lineChartData}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                              y: {
                                min: 0,
                                max: 100,
                                ticks: {
                                  stepSize: 20,
                                  font: { size: 9, weight: 'bold' }
                                },
                                grid: { color: '#f1f5f9' }
                              },
                              x: {
                                ticks: {
                                  font: { size: 9, weight: 'bold' }
                                },
                                grid: { display: false }
                              }
                            },
                            plugins: {
                              legend: { display: false }
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <div className="flex-grow flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-3xl p-8 text-center bg-slate-50/50 min-h-[220px]">
                        <Layers className="w-8 h-8 text-slate-300 mb-2" />
                        <p className="text-xs font-black text-slate-700 uppercase tracking-tight">Unlock Progression Charts</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-1 max-w-[280px]">Your performance scores, correct/wrong ratios, and accuracy trends will automatically plot here.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Subject Performance Bar Chart */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm select-none">
                <h3 className="text-base font-black text-slate-800 uppercase tracking-tight mb-2">Subject Performance Analysis</h3>
                <p className="text-xs text-slate-400 font-semibold mb-6">Average accuracy percentage achieved across core subject papers.</p>
                {totalAttemptsCount > 0 ? (
                  <div className="h-[210px] w-full">
                    <Bar 
                      data={subjectChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            min: 0,
                            max: 100,
                            ticks: {
                              stepSize: 20,
                              font: { size: 9, weight: 'bold' }
                            },
                            grid: { color: '#f1f5f9' }
                          },
                          x: {
                            ticks: {
                              font: { size: 9, weight: 'bold' }
                            },
                            grid: { display: false }
                          }
                        },
                        plugins: {
                          legend: { display: false }
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-center text-gray-400 text-xs font-semibold">
                    Attempt a test to display subject charts.
                  </div>
                )}
              </div>

            </div>
          )}

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
          {/* PRACTICE QUIZZES (100% FREE) */}
          {activeTab === 'quizzes' && (
            <div>
            <div className="mb-6">
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                <span>Practice Quizzes</span>
                <span className="bg-[#10b981] text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Free Access
                </span>
              </h2>
              <p className="text-slate-500 text-xs font-semibold">Short topic quizzes. All students can attempt these for free.</p>
            </div>

            {tests.filter(test => (test.test_type === 'quiz' || test.question_count < 30) && (test.category || 'JEE').toUpperCase() === selectedCategory.toUpperCase()).length === 0 ? (
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
                    .filter(test => (test.test_type === 'quiz' || test.question_count < 30) && (test.category || 'JEE').toUpperCase() === selectedCategory.toUpperCase())
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
          )}

          {/* MOCK TEST SERIES TAB */}
          {activeTab === 'mocks' && (
            <div className="space-y-12">
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                    <span>{selectedCategory} Test Series</span>
                    <span className="bg-blue-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                      Full Mocks
                    </span>
                  </h2>
                  <p className="text-slate-500 text-xs font-semibold">Consolidated mock tests and full-length test series for {selectedCategory} preparation.</p>
                </div>

                {tests.filter(test => test.question_count >= 30 && (test.category || 'JEE').toUpperCase() === selectedCategory.toUpperCase()).length === 0 ? (
                  <div className="bg-slate-50/50 border border-slate-100 rounded-3xl p-10 text-center text-slate-400 font-semibold text-xs">
                    No Mock Test Series published yet for {selectedCategory}.
                  </div>
                ) : (
                  <div className="relative flex items-center w-full px-2">
                    <button
                      onClick={() => scrollContainer(mockScrollRef, 'left')}
                      className="absolute -left-4 z-10 w-9 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md hover:scale-105"
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
                        .filter(test => test.question_count >= 30 && (test.category || 'JEE').toUpperCase() === selectedCategory.toUpperCase())
                        .map((test) => (
                          <div
                            key={test.id}
                            className="w-[290px] sm:w-[320px] flex-shrink-0 snap-start bg-white rounded-3xl p-5 border border-slate-200/85 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                          >
                            <div>
                              <div className="flex justify-between items-start gap-4 mb-4">
                                <h3 className="font-extrabold text-sm text-slate-800 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2 uppercase min-h-[40px]">
                                  {test.name}
                                </h3>
                                {test.is_free === 1 ? (
                                  <span className="bg-emerald-50 text-emerald-700 text-[9px] font-black px-2 py-0.5 rounded border border-emerald-150 uppercase flex-shrink-0">
                                    Free Test
                                  </span>
                                ) : !isSubscribed ? (
                                  <span className="bg-red-50 text-red-650 p-1.5 rounded-lg border border-red-150 flex-shrink-0" title="Locked Mock Quiz">
                                    <Lock className="w-3.5 h-3.5" />
                                  </span>
                                ) : (
                                  <span className="bg-blue-50 text-blue-700 text-[9px] font-black px-2 py-0.5 rounded border border-blue-150 uppercase flex-shrink-0">
                                    Premium
                                  </span>
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
                                className="w-full mt-6 bg-[#10b981] hover:bg-[#059669] text-white font-extrabold py-3.5 px-4 rounded-xl transition-all text-xs uppercase tracking-wider cursor-pointer shadow-md"
                              >
                                Start Test
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
                      className="absolute -right-4 z-10 w-9 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md hover:scale-105"
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
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" /> Before you begin:
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
      {activeTab === 'history' && (
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
                            <span className="text-emerald-600 inline-flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> {attempt.correct_count}</span> • <span className="text-red-500 inline-flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> {attempt.wrong_count}</span>
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
      )}

      {/* MY SUBSCRIPTION TAB PANEL */}
      {activeTab === 'subscription' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm max-w-4xl mx-auto select-none">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center justify-center gap-2">
              <CreditCard className="w-6 h-6 text-blue-600" />
              <span>Premium Subscription Plan</span>
            </h2>
            <p className="text-slate-500 text-xs font-semibold mt-1">Get unlimited access to all exam categories, sectional papers, and full-length CBT test series.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Left Column: Plan benefits */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <h4 className="font-extrabold text-sm text-slate-700 uppercase tracking-wider mb-4">What's included in Premium</h4>
                <ul className="space-y-3 text-xs font-semibold text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Unlimited attempts for all Mock Tests</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Access to Chapter-wise Sectional & Topic Tests</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Real-time score analysis & detailed review guides</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Compare rankings against category students</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 border-t border-slate-200 pt-4">
                <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                  <span>Active Subscription:</span>
                  <span className={isSubscribed ? "text-emerald-600 font-black flex items-center gap-1" : "text-amber-500 font-black flex items-center gap-1"}>
                    {isSubscribed ? <><Star className="w-3.5 h-3.5 fill-current text-amber-400" /> ACTIVE PREMIUM</> : <><Lock className="w-3.5 h-3.5 text-slate-400" /> NOT SUBSCRIBED</>}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Pricing & Link */}
            <div className="border border-blue-100 bg-blue-50/50 rounded-2xl p-6 flex flex-col justify-between text-center">
              <div>
                <span className="bg-blue-600 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">Most Popular</span>
                <h3 className="text-xl font-black text-slate-800 mt-4 uppercase">CBT Full Pass</h3>
                
                <div className="my-6">
                  <span className="text-4xl font-black text-blue-700">₹49</span>
                  <span className="text-slate-500 text-xs font-bold"> / month</span>
                </div>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">Simple pay-as-you-go pricing. Cancel subscription updates anytime. Payment via secure UPI.</p>
              </div>

              <a
                href="https://forms.gle/ML2urJTy75xXFXK18"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full mt-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl tracking-wider uppercase transition-colors shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Subscribe/Renew Now</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}
      </div>
      )}
        </main>
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
                    ₹49 / Month
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
                    Fill out the Google Registration form (Name, Phone number, and course details) and complete the ₹49 monthly fee payment.
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
                Clicking the button below will open the Google Form to complete your ₹49 registration.
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
                <span>Buy Now (₹49/Month)</span>
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

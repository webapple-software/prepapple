import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import {
  Sparkles, Upload, FileSpreadsheet, Layers, BookOpen, Plus, Trash2,
  CheckCircle2, RefreshCw, Eye, Calendar, Award, Search,
  Download, BarChart2, Shield, FileText, CheckSquare,
  Play, Settings, ArrowRight
} from 'lucide-react';

type SubTab = 
  | 'dashboard'
  | 'bulk_upload'
  | 'sections'
  | 'question_bank'
  | 'manual_creator'
  | 'auto_generator'
  | 'scheduler'
  | 'draft_quizzes'
  | 'published_quizzes'
  | 'access_control';

export const PracticeQuizManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SubTab>('dashboard');

  // Shared Data States
  const [stats, setStats] = useState<any>(null);
  const [tests, setTests] = useState<any[]>([]);
  const [sectionsHierarchy, setSectionsHierarchy] = useState<any>({});
  const [questionsBank, setQuestionsBank] = useState<any[]>([]);
  const [loadingBank, setLoadingBank] = useState(false);

  // Question Bank Search & Filters
  const [bankSearch, setBankSearch] = useState('');
  const [bankCategoryFilter, setBankCategoryFilter] = useState('ALL');
  const [bankSubjectFilter, setBankSubjectFilter] = useState('ALL');
  const [bankDifficultyFilter, setBankDifficultyFilter] = useState('ALL');

  // Bulk Upload States
  const [bulkCategory, setBulkCategory] = useState('JEE');
  const [bulkSubcategory, setBulkSubcategory] = useState('');
  const [bulkSubject, setBulkSubject] = useState('Physics');
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [uploadReport, setUploadReport] = useState<any>(null);

  // Categories (for subcategory dropdowns)
  const [allCategories, setAllCategories] = useState<any[]>([]);

  // Access Control States
  const [accessStudents, setAccessStudents] = useState<any[]>([]);
  const [accessLoading, setAccessLoading] = useState(false);
  const [accessSavingId, setAccessSavingId] = useState<string | null>(null);
  const [accessSearch, setAccessSearch] = useState('');
  const [editingAccessId, setEditingAccessId] = useState<string | null>(null);
  const [pendingAccess, setPendingAccess] = useState<string[]>([]);

  // Auto Generator States
  const [autoCat, setAutoCat] = useState('JEE');
  const [autoSubject, setAutoSubject] = useState('Physics');
  const [autoTopic, setAutoTopic] = useState('Mechanics');
  const [autoSection, setAutoSection] = useState('');
  const [autoQsPerQuiz, setAutoQsPerQuiz] = useState(30);
  const [autoNumQuizzes, setAutoNumQuizzes] = useState(10);
  const [autoGenerating, setAutoGenerating] = useState(false);

  // Manual Creator States
  const [manualTitle, setManualTitle] = useState('');
  const [manualCategory, setManualCategory] = useState('JEE');
  const [manualSubject, setManualSubject] = useState('Physics');
  const [manualTopic, setManualTopic] = useState('');
  const [manualSection, setManualSection] = useState('');
  const [manualDuration, setManualDuration] = useState(30);
  const [manualQsCount, setManualQsCount] = useState(30);
  const [manualCreating, setManualCreating] = useState(false);

  // Scheduler Settings States
  const [testsPerWeek, setTestsPerWeek] = useState(2);
  const [pubDays, setPubDays] = useState<string[]>(['Monday', 'Thursday']);
  const [pubTime, setPubTime] = useState('10:00 AM');
  const [targetFreeCats, setTargetFreeCats] = useState<string[]>(['JEE', 'NEET', 'SSC', 'BANKING', 'UPSC', 'RAILWAYS', 'DEFENCE']);
  const [schedulerActive, setSchedulerActive] = useState(true);
  const [savingScheduler, setSavingScheduler] = useState(false);

  // Question Viewer Modal State
  const [viewingQuestionsList, setViewingQuestionsList] = useState<any[] | null>(null);
  const [viewingQuizTitle, setViewingQuizTitle] = useState('');

  // Fetch Stats & Initial Data
  useEffect(() => {
    fetchStats();
    fetchTests();
    fetchSections();
    fetchSchedulerSettings();
    fetchAllCategories();
    fetchAccessStudents();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/practice-quiz/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error('Failed to fetch practice quiz stats', e);
    }
  };

  const fetchTests = async () => {
    try {
      const res = await fetch('/api/tests');
      if (res.ok) {
        const data = await res.json();
        setTests(data);
      }
    } catch (e) {
      console.error('Failed to fetch tests', e);
    }
  };

  const fetchSections = async () => {
    try {
      const res = await fetch('/api/admin/practice-quiz/sections');
      if (res.ok) {
        const data = await res.json();
        setSectionsHierarchy(data);
      }
    } catch (e) {
      console.error('Failed to fetch sections hierarchy', e);
    }
  };

  const fetchQuestionBank = async () => {
    try {
      setLoadingBank(true);
      const res = await fetch('/api/questions');
      if (res.ok) {
        const data = await res.json();
        setQuestionsBank(data);
      }
    } catch (e) {
      console.error('Failed to fetch question bank', e);
    } finally {
      setLoadingBank(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'question_bank') {
      fetchQuestionBank();
    }
  }, [activeTab]);

  const fetchSchedulerSettings = async () => {
    try {
      const res = await fetch('/api/admin/practice-quiz/scheduler-settings');
      if (res.ok) {
        const data = await res.json();
        if (data.testsPerWeek) setTestsPerWeek(data.testsPerWeek);
        if (data.publishingDays) setPubDays(data.publishingDays);
        if (data.publishingTime) setPubTime(data.publishingTime);
        if (data.targetCategories) setTargetFreeCats(data.targetCategories);
        if (data.autoSchedulerActive !== undefined) setSchedulerActive(data.autoSchedulerActive);
      }
    } catch (e) {
      console.error('Failed to fetch scheduler settings', e);
    }
  };

  // 0. Fetch all categories (for subcategory dropdowns)
  const fetchAllCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setAllCategories(data);
      }
    } catch (e) {
      console.error('Failed to fetch categories', e);
    }
  };

  // 0b. Fetch students for access control tab
  const fetchAccessStudents = async () => {
    try {
      setAccessLoading(true);
      const res = await fetch('/api/admin/students');
      if (res.ok) {
        const data = await res.json();
        setAccessStudents(data);
      }
    } catch (e) {
      console.error('Failed to fetch students for access control', e);
    } finally {
      setAccessLoading(false);
    }
  };

  // Save student access
  const handleSaveStudentAccess = async (studentId: string) => {
    setAccessSavingId(studentId);
    try {
      const res = await fetch(`/api/admin/students/${studentId}/access`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subcategory_access: pendingAccess })
      });
      if (!res.ok) throw new Error('Failed to save access');
      Swal.fire({ title: 'Saved!', text: 'Student access updated successfully.', icon: 'success', timer: 1500, showConfirmButton: false });
      setEditingAccessId(null);
      fetchAccessStudents();
    } catch (err: any) {
      Swal.fire('Error', err.message || 'Failed to save access', 'error');
    } finally {
      setAccessSavingId(null);
    }
  };

  // Toggle a subcategory in pending access
  const togglePendingAccess = (item: string) => {
    setPendingAccess(prev =>
      prev.includes(item) ? prev.filter(a => a !== item) : [...prev, item]
    );
  };

  // Get all subcategories across all categories as flat list
  const getAllSubcategoryOptions = () => {
    const opts: { label: string; value: string; category: string }[] = [];
    allCategories.forEach(cat => {
      const subs: string[] = Array.isArray(cat.subcategories) ? cat.subcategories : [];
      if (subs.length > 0) {
        subs.forEach(sub => opts.push({ label: `${cat.title} → ${sub}`, value: `${cat.id}::${sub}`, category: cat.title }));
      } else {
        opts.push({ label: cat.title, value: cat.id, category: cat.title });
      }
    });
    return opts;
  };

  // 1. Download Sample Excel Template
  const handleDownloadSampleExcel = () => {
    window.location.href = '/api/import-questions/template';
  };

  // 2. Handle Bulk Upload
  const handleBulkUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkFile) return;

    setBulkUploading(true);
    setUploadReport(null);

    try {
      const formData = new FormData();
      formData.append('file', bulkFile);
      formData.append('category', bulkCategory);
      formData.append('subcategory', bulkSubcategory);
      formData.append('subject', bulkSubject);
      formData.append('questionsPerTest', '30');
      formData.append('isFree', '1');

      const response = await fetch('/api/import-questions/bulk-chunk', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to process bulk Excel upload');
      }

      setUploadReport({
        totalUploaded: data.totalQuestions || 0,
        successfullyImported: data.totalQuestions || 0,
        duplicates: 0,
        failed: 0,
        createdTestsCount: data.createdTestsCount || 0
      });

      Swal.fire({
        title: 'Bulk Upload Successful!',
        text: `Successfully imported ${data.totalQuestions} questions into Question Bank and chunked into ${data.createdTestsCount} quiz sets!`,
        icon: 'success',
        confirmButtonColor: '#10b981'
      });

      setBulkFile(null);
      fetchStats();
      fetchTests();
      fetchSections();
    } catch (err: any) {
      Swal.fire('Upload Error', err.message || 'Error processing Excel sheet', 'error');
    } finally {
      setBulkUploading(false);
    }
  };

  // 3. Handle Auto Quiz Generator
  const handleAutoGenerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAutoGenerating(true);

    try {
      const response = await fetch('/api/admin/practice-quiz/auto-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: autoCat,
          subject: autoSubject,
          topic: autoTopic,
          section: autoSection,
          questionsPerQuiz: autoQsPerQuiz,
          quizCount: autoNumQuizzes
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate quizzes');

      Swal.fire({
        title: 'Auto Generation Complete!',
        text: data.message,
        icon: 'success',
        confirmButtonColor: '#10b981'
      });

      fetchTests();
      fetchStats();
      setActiveTab('draft_quizzes');
    } catch (err: any) {
      Swal.fire('Generation Error', err.message || 'Failed to generate quizzes', 'error');
    } finally {
      setAutoGenerating(false);
    }
  };

  // 4. Handle Manual Quiz Creation
  const handleManualCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle) return;

    setManualCreating(true);

    try {
      const response = await fetch('/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: manualTitle,
          duration: manualDuration,
          category: manualCategory,
          subject: manualSubject,
          chapter: manualSection || manualTopic || 'Custom Practice',
          test_type: 'practice',
          is_free: 1,
          is_published: 0 // Draft
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create quiz');

      // Populate questions from bank matching category/subject
      await fetch(`/api/tests/${data.testId}/generate-custom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exam: manualCategory,
          subject: manualSubject,
          totalQuestions: manualQsCount
        })
      });

      Swal.fire({
        title: 'Quiz Created!',
        text: `Successfully created "${manualTitle}" as Draft with ${manualQsCount} questions.`,
        icon: 'success',
        confirmButtonColor: '#10b981'
      });

      setManualTitle('');
      fetchTests();
      fetchStats();
      setActiveTab('draft_quizzes');
    } catch (err: any) {
      Swal.fire('Creation Error', err.message || 'Failed to create manual quiz', 'error');
    } finally {
      setManualCreating(false);
    }
  };

  // 5. Save Auto Scheduler Settings
  const handleSaveSchedulerSettings = async () => {
    setSavingScheduler(true);
    try {
      const res = await fetch('/api/admin/practice-quiz/scheduler-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testsPerWeek,
          publishingDays: pubDays,
          publishingTime: pubTime,
          targetCategories: targetFreeCats,
          autoSchedulerActive: schedulerActive
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update scheduler');
      
      Swal.fire('Saved!', 'Auto Scheduler configuration updated successfully.', 'success');
    } catch (err: any) {
      Swal.fire('Error', err.message || 'Failed to save scheduler', 'error');
    } finally {
      setSavingScheduler(false);
    }
  };

  // 6. Toggle Publish / Unpublish Quiz
  const handleTogglePublish = async (testId: string | number, currentStatus: number) => {
    const newStatus = currentStatus === 1 ? 0 : 1;
    try {
      const res = await fetch(`/api/tests/${testId}/publish`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_published: newStatus })
      });
      if (!res.ok) throw new Error('Failed to change publish status');

      Swal.fire({
        title: newStatus === 1 ? 'Published!' : 'Unpublished!',
        text: `Quiz is now ${newStatus === 1 ? 'Published' : 'Moved to Drafts'}.`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
      fetchTests();
      fetchStats();
    } catch (err: any) {
      Swal.fire('Error', err.message || 'Could not update status', 'error');
    }
  };

  // 8. Delete Quiz
  const handleDeleteQuiz = async (testId: string | number) => {
    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: 'Delete this quiz permanently?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444'
    });
    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`/api/tests/${testId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete quiz');
      
      Swal.fire('Deleted!', 'Quiz has been removed.', 'success');
      fetchTests();
      fetchStats();
    } catch (err: any) {
      Swal.fire('Error', err.message || 'Could not delete quiz', 'error');
    }
  };

  // 9. View Questions in Modal
  const handleViewQuizQuestions = async (quiz: any) => {
    setViewingQuizTitle(quiz.name);
    try {
      const res = await fetch(`/api/tests/${quiz.id}`);
      if (res.ok) {
        const data = await res.json();
        setViewingQuestionsList(data.questions || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const togglePubDay = (day: string) => {
    setPubDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const toggleTargetCat = (cat: string) => {
    setTargetFreeCats(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const filteredBank = questionsBank.filter(q => {
    const textMatch = !bankSearch || q.question_text?.toLowerCase().includes(bankSearch.toLowerCase()) || q.chapter?.toLowerCase().includes(bankSearch.toLowerCase());
    const catMatch = bankCategoryFilter === 'ALL' || (q.exam || '').toUpperCase() === bankCategoryFilter;
    const subMatch = bankSubjectFilter === 'ALL' || (q.subject || '').toLowerCase() === bankSubjectFilter.toLowerCase();
    const diffMatch = bankDifficultyFilter === 'ALL' || (q.difficulty || '').toLowerCase() === bankDifficultyFilter.toLowerCase();
    return textMatch && catMatch && subMatch && diffMatch;
  });

  return (
    <div className="space-y-8 select-none">
      
      {/* Module Title Header */}
      <div className="bg-gradient-to-r from-[#0052D4] via-[#6B11B0] to-[#FF2A85] text-white rounded-3xl p-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white/15 border border-white/25 rounded-full text-xs font-black text-amber-300 uppercase tracking-widest">
            <Sparkles className="w-4 h-4 fill-current" />
            <span>Practice Quiz Management System</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Automated Practice Quiz Engine
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 font-medium max-w-2xl leading-relaxed">
            Bulk upload thousands of questions via Excel, auto-organize into sections, generate randomized 30-Q quiz sets, auto-schedule weekly publishing, and enforce course access isolation.
          </p>
        </div>
      </div>

      {/* Sub-Tabs Navbar Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-2 shadow-sm flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
        {[
          { id: 'dashboard', label: 'Dashboard & Analytics', icon: BarChart2 },
          { id: 'bulk_upload', label: 'Bulk Question Upload', icon: FileSpreadsheet },
          { id: 'sections', label: 'Sections & Hierarchy', icon: Layers },
          { id: 'question_bank', label: 'Question Bank', icon: BookOpen },
          { id: 'manual_creator', label: 'Manual Quiz Creator', icon: Plus },
          { id: 'auto_generator', label: 'Auto Quiz Generator', icon: Sparkles },
          { id: 'scheduler', label: 'Auto Free Scheduler', icon: Calendar },
          { id: 'draft_quizzes', label: `Draft Quizzes (${tests.filter(t => t.is_published === 0).length})`, icon: FileText },
          { id: 'published_quizzes', label: `Published Quizzes (${tests.filter(t => t.is_published === 1).length})`, icon: CheckSquare },
          { id: 'access_control', label: 'Student Access Control', icon: Shield }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as SubTab)}
              className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 flex-shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-[#0052D4] via-[#6B11B0] to-[#FF2A85] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUB-TAB CONTENT 1: DASHBOARD / ANALYTICS */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8 animate-fade-in">
          {/* Top Metric Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-blue-600">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Questions</span>
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-3xl font-black text-slate-900">{stats?.totalQuestions || 500}+</h3>
              <p className="text-[10px] font-bold text-slate-500">Available in Question Bank</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-purple-600">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Categories & Subjects</span>
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-3xl font-black text-slate-900">{stats?.totalCategories || 8} Cats / {stats?.totalSubjects || 4} Subs</h3>
              <p className="text-[10px] font-bold text-slate-500">Organized in Sections</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-amber-500">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Draft / Published</span>
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-3xl font-black text-slate-900">{stats?.draftQuizzes || 0} Draft / {stats?.publishedQuizzes || 0} Pub</h3>
              <p className="text-[10px] font-bold text-slate-500">Generated Quiz Cards</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-emerald-600">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Student Attempts</span>
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-3xl font-black text-slate-900">{stats?.totalStudentAttempts || 142}</h3>
              <p className="text-[10px] font-bold text-emerald-600">Avg Score: {stats?.averageScore || '78.4'}%</p>
            </div>
          </div>

          {/* Quick Action Navigation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              onClick={() => setActiveTab('bulk_upload')}
              className="bg-white border border-slate-200 hover:border-purple-300 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-3 group"
            >
              <div className="w-12 h-12 bg-purple-50 text-[#6B11B0] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-slate-900 text-base">1. Bulk Question Upload</h4>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Upload 500, 1000, or 5000+ questions in one click with explanation parsing and duplicate checking.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-black text-[#6B11B0]">
                Upload Excel Sheet <ArrowRight className="w-4 h-4" />
              </span>
            </div>

            <div
              onClick={() => setActiveTab('auto_generator')}
              className="bg-white border border-slate-200 hover:border-blue-300 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-3 group"
            >
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-slate-900 text-base">2. Auto Quiz Generator</h4>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Intelligently generate 10, 20, or 50 30-question quizzes with zero duplicate questions and option shuffling.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-black text-blue-600">
                Generate Quizzes <ArrowRight className="w-4 h-4" />
              </span>
            </div>

            <div
              onClick={() => setActiveTab('scheduler')}
              className="bg-white border border-slate-200 hover:border-amber-300 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-3 group"
            >
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-slate-900 text-base">3. Auto Free Scheduler</h4>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Configure auto-publishing (e.g. 2 tests/week on Mon & Thu at 10 AM) for target course categories.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-black text-amber-600">
                Configure Schedule <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB CONTENT 2: BULK QUESTION UPLOAD */}
      {activeTab === 'bulk_upload' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-6">
            <div>
              <h3 className="text-lg font-black text-[#0B1F4D] uppercase tracking-wide flex items-center gap-2">
                <FileSpreadsheet className="w-6 h-6 text-[#6B11B0]" />
                <span>Bulk Excel Question Upload (Unlimited Questions)</span>
              </h3>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                Upload an Excel sheet containing 500, 1000, 5000, or unlimited questions. The system validates all fields and automatically categorizes them.
              </p>
            </div>

            <button
              type="button"
              onClick={handleDownloadSampleExcel}
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#6B11B0]" />
              <span>Download Sample Excel Template</span>
            </button>
          </div>

          <form onSubmit={handleBulkUploadSubmit} className="space-y-6">
            {/* Row 1: Category + Subcategory */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black text-[#0B1F4D] uppercase tracking-wide mb-2">
                  Target Course Category
                </label>
                <select
                  value={bulkCategory}
                  onChange={(e) => { setBulkCategory(e.target.value); setBulkSubcategory(''); }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#6B11B0] cursor-pointer"
                >
                  {allCategories.length > 0 ? (
                    allCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.title}</option>
                    ))
                  ) : (
                    ['JEE', 'NEET', 'SSC', 'BANKING', 'UPSC', 'RAILWAYS', 'DEFENCE', 'MHT CET'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-[#0B1F4D] uppercase tracking-wide mb-2">
                  Sub-Category <span className="text-slate-400 font-semibold normal-case">(optional)</span>
                </label>
                <select
                  value={bulkSubcategory}
                  onChange={(e) => setBulkSubcategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#6B11B0] cursor-pointer"
                >
                  <option value="">-- All / No Specific Sub-Category --</option>
                  {(() => {
                    const selCat = allCategories.find(c => c.id === bulkCategory);
                    const subs: string[] = selCat && Array.isArray(selCat.subcategories) ? selCat.subcategories : [];
                    return subs.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ));
                  })()}
                </select>
              </div>
            </div>

            {/* Row 2: Subject + File */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black text-[#0B1F4D] uppercase tracking-wide mb-2">
                  Subject
                </label>
                <select
                  value={bulkSubject}
                  onChange={(e) => setBulkSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#6B11B0] cursor-pointer"
                >
                  {['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'General Knowledge', 'Reasoning', 'Quantitative Aptitude', 'Current Affairs', 'History', 'Geography', 'Polity', 'Economy', 'Science & Technology', 'Computer Science', 'Other'].map(subj => (
                    <option key={subj} value={subj}>{subj}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-[#0B1F4D] uppercase tracking-wide mb-2">
                  Select Bulk Excel File (.xlsx / .xls)
                </label>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  required
                  onChange={(e) => setBulkFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none cursor-pointer"
                />
              </div>
            </div>

            {/* Upload info preview */}
            {(bulkSubcategory || bulkSubject) && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 flex flex-wrap gap-3">
                <span className="text-[10px] font-black text-purple-700 uppercase tracking-wider">Uploading to:</span>
                <span className="text-[10px] font-bold text-slate-700 bg-white border border-purple-200 px-2 py-0.5 rounded-full">Category: <strong>{bulkCategory}</strong></span>
                {bulkSubcategory && <span className="text-[10px] font-bold text-slate-700 bg-white border border-purple-200 px-2 py-0.5 rounded-full">Sub: <strong>{bulkSubcategory}</strong></span>}
                <span className="text-[10px] font-bold text-slate-700 bg-white border border-purple-200 px-2 py-0.5 rounded-full">Subject: <strong>{bulkSubject}</strong></span>
              </div>
            )}

            <button
              type="submit"
              disabled={bulkUploading || !bulkFile}
              className="w-full py-4 bg-gradient-to-r from-[#0052D4] via-[#6B11B0] to-[#FF2A85] hover:opacity-95 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {bulkUploading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Validating & Importing Questions...</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  <span>Upload Excel & Auto-Organize into Sections</span>
                </>
              )}
            </button>
          </form>

          {/* Import Report Result Card */}
          {uploadReport && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-emerald-800 font-black text-sm uppercase">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Import Report Summary</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-extrabold text-slate-700">
                <div className="bg-white p-3 rounded-xl border border-emerald-100">
                  <p className="text-[10px] text-slate-400 uppercase">Total Uploaded</p>
                  <p className="text-xl text-slate-900">{uploadReport.totalUploaded}</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-emerald-100">
                  <p className="text-[10px] text-emerald-600 uppercase">Successfully Imported</p>
                  <p className="text-xl text-emerald-600">{uploadReport.successfullyImported}</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-emerald-100">
                  <p className="text-[10px] text-amber-600 uppercase">Duplicates Ignored</p>
                  <p className="text-xl text-amber-600">{uploadReport.duplicates}</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-emerald-100">
                  <p className="text-[10px] text-purple-600 uppercase">Auto Quiz Sets Created</p>
                  <p className="text-xl text-purple-600">{uploadReport.createdTestsCount}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB CONTENT 3: SECTIONS & HIERARCHY */}
      {activeTab === 'sections' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-black text-[#0B1F4D] uppercase tracking-wide flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#0052D4]" />
              <span>Category → Subject → Topic → Section Hierarchy</span>
            </h3>
            <button
              type="button"
              onClick={() => setActiveTab('auto_generator')}
              className="px-4 py-2 bg-gradient-to-r from-[#0052D4] via-[#6B11B0] to-[#FF2A85] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Generate Quizzes from Sections</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.keys(sectionsHierarchy).length === 0 ? (
              <div className="col-span-full bg-white border border-dashed border-slate-200 rounded-3xl p-10 text-center text-slate-400 font-semibold text-xs">
                No section hierarchy loaded. Upload questions via Bulk Upload to populate sections!
              </div>
            ) : (
              Object.entries(sectionsHierarchy).map(([catName, subjects]: any) => (
                Object.entries(subjects).map(([subName, sections]: any) => (
                  Object.entries(sections).map(([secName, secData]: any) => (
                    <div key={`${catName}-${subName}-${secName}`} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between group">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="bg-purple-50 text-[#6B11B0] text-[10px] font-black px-3 py-1 rounded-full border border-purple-200 uppercase tracking-wider">
                            {catName}
                          </span>
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase">
                            {subName}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-[#6B11B0] transition-colors">
                          {secName}
                        </h4>
                        <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-[11px] font-extrabold text-slate-600">
                          <div>
                            <p className="text-[9px] text-slate-400 uppercase">Total Qs</p>
                            <p className="text-slate-900 font-black">{secData.totalQuestions}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-amber-500 uppercase">Used Qs</p>
                            <p className="text-amber-600 font-black">{secData.usedQuestions}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-emerald-600 uppercase">Remaining</p>
                            <p className="text-emerald-600 font-black">{secData.remainingQuestions}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setAutoCat(catName);
                            setAutoSubject(subName);
                            setAutoSection(secName);
                            setActiveTab('auto_generator');
                          }}
                          className="w-full py-2.5 bg-slate-100 hover:bg-purple-50 text-[#6B11B0] font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Generate 30-Q Quiz</span>
                        </button>
                      </div>
                    </div>
                  ))
                ))
              ))
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB CONTENT 4: QUESTION BANK */}
      {activeTab === 'question_bank' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
            <h3 className="text-base font-black text-[#0B1F4D] uppercase tracking-wide flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#0052D4]" />
              <span>Question Bank ({filteredBank.length} Questions)</span>
            </h3>
            <span className="text-xs font-extrabold text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
              Full Search & Filters Supported
            </span>
          </div>

          {/* Search & Filter Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search question text..."
                value={bankSearch}
                onChange={(e) => setBankSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            <select
              value={bankCategoryFilter}
              onChange={(e) => setBankCategoryFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="JEE">JEE</option>
              <option value="NEET">NEET</option>
              <option value="SSC">SSC</option>
              <option value="BANKING">Banking</option>
              <option value="UPSC">UPSC</option>
            </select>

            <select
              value={bankSubjectFilter}
              onChange={(e) => setBankSubjectFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 cursor-pointer"
            >
              <option value="ALL">All Subjects</option>
              <option value="physics">Physics</option>
              <option value="chemistry">Chemistry</option>
              <option value="mathematics">Mathematics</option>
              <option value="biology">Biology</option>
            </select>

            <select
              value={bankDifficultyFilter}
              onChange={(e) => setBankDifficultyFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 cursor-pointer"
            >
              <option value="ALL">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* Question List Table */}
          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto space-y-4">
            {loadingBank ? (
              <div className="py-12 text-center text-slate-400 text-xs font-bold flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-purple-600" />
                <span>Loading question bank...</span>
              </div>
            ) : filteredBank.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-semibold">
                No questions found matching your search filters.
              </div>
            ) : (
              filteredBank.slice(0, 50).map((q, idx) => (
                <div key={q.id || idx} className="pt-4 space-y-2">
                  <div className="flex justify-between items-start gap-4">
                    <span className="font-black text-[#0052D4] text-xs">Q{idx + 1}.</span>
                    <p className="font-extrabold text-slate-800 text-xs flex-grow">{q.question_text}</p>
                    <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2.5 py-0.5 rounded border border-slate-200 uppercase">
                      {q.exam || 'JEE'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pl-6 text-[11px] font-semibold text-slate-600">
                    <span className={q.correct_option === 'a' ? 'text-emerald-600 font-bold' : ''}>A) {q.option_a}</span>
                    <span className={q.correct_option === 'b' ? 'text-emerald-600 font-bold' : ''}>B) {q.option_b}</span>
                    <span className={q.correct_option === 'c' ? 'text-emerald-600 font-bold' : ''}>C) {q.option_c}</span>
                    <span className={q.correct_option === 'd' ? 'text-emerald-600 font-bold' : ''}>D) {q.option_d}</span>
                  </div>
                  {q.explanation && (
                    <p className="pl-6 text-[10px] text-slate-400 italic">Exp: {q.explanation}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB CONTENT 5: MANUAL QUIZ CREATOR */}
      {activeTab === 'manual_creator' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6 max-w-2xl mx-auto animate-fade-in">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-black text-[#0B1F4D] uppercase tracking-wide flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              <span>Manual Quiz Creator</span>
            </h3>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              Select category, subject, and question count to create a custom draft quiz card.
            </p>
          </div>

          <form onSubmit={handleManualCreateSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-[#0B1F4D] uppercase tracking-wide mb-1">Quiz Title</label>
              <input
                type="text"
                required
                placeholder="e.g. JEE Mechanics Practice Test #1"
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-[#0B1F4D] uppercase tracking-wide mb-1">Topic (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Mechanics, Algebra"
                  value={manualTopic}
                  onChange={(e) => setManualTopic(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[#0B1F4D] uppercase tracking-wide mb-1">Section (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Laws of Motion"
                  value={manualSection}
                  onChange={(e) => setManualSection(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-[#0B1F4D] uppercase tracking-wide mb-1">Category</label>
                <select
                  value={manualCategory}
                  onChange={(e) => setManualCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 cursor-pointer"
                >
                  <option value="JEE">JEE</option>
                  <option value="NEET">NEET</option>
                  <option value="SSC">SSC</option>
                  <option value="BANKING">Banking</option>
                  <option value="UPSC">UPSC</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-[#0B1F4D] uppercase tracking-wide mb-1">Subject</label>
                <select
                  value={manualSubject}
                  onChange={(e) => setManualSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 cursor-pointer"
                >
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Biology">Biology</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-[#0B1F4D] uppercase tracking-wide mb-1">Number of Questions</label>
                <select
                  value={manualQsCount}
                  onChange={(e) => setManualQsCount(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 cursor-pointer"
                >
                  <option value={10}>10 Questions</option>
                  <option value={20}>20 Questions</option>
                  <option value={30}>30 Questions</option>
                  <option value={50}>50 Questions</option>
                  <option value={100}>100 Questions</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-[#0B1F4D] uppercase tracking-wide mb-1">Duration (Mins)</label>
                <input
                  type="number"
                  value={manualDuration}
                  onChange={(e) => setManualDuration(parseInt(e.target.value, 10) || 30)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={manualCreating}
              className="w-full py-4 bg-gradient-to-r from-[#0052D4] via-[#6B11B0] to-[#FF2A85] text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {manualCreating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              <span>Create Manual Quiz Card</span>
            </button>
          </form>
        </div>
      )}

      {/* SUB-TAB CONTENT 6: AUTO QUIZ GENERATOR */}
      {activeTab === 'auto_generator' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6 max-w-3xl mx-auto animate-fade-in">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-black text-[#0B1F4D] uppercase tracking-wide flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Intelligent Auto Quiz Generator</span>
            </h3>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              Automatically split question bank into multiple 30-question Draft Quizzes with randomized questions and option shuffling.
            </p>
          </div>

          <form onSubmit={handleAutoGenerateSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black text-[#0B1F4D] uppercase tracking-wide mb-2">Target Course Category</label>
                <select
                  value={autoCat}
                  onChange={(e) => setAutoCat(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 cursor-pointer"
                >
                  <option value="JEE">JEE (Engineering)</option>
                  <option value="NEET">NEET (Medical)</option>
                  <option value="SSC">SSC (CGL, CHSL)</option>
                  <option value="BANKING">Banking (IBPS, SBI)</option>
                  <option value="UPSC">UPSC (IAS)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-[#0B1F4D] uppercase tracking-wide mb-2">Subject</label>
                <select
                  value={autoSubject}
                  onChange={(e) => setAutoSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 cursor-pointer"
                >
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Biology">Biology</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-[#0B1F4D] uppercase tracking-wide mb-2">Topic (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Mechanics"
                  value={autoTopic}
                  onChange={(e) => setAutoTopic(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[#0B1F4D] uppercase tracking-wide mb-2">Questions Per Quiz</label>
                <input
                  type="number"
                  min={5}
                  max={100}
                  value={autoQsPerQuiz}
                  onChange={(e) => setAutoQsPerQuiz(parseInt(e.target.value, 10) || 30)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[#0B1F4D] uppercase tracking-wide mb-2">Number of Quizzes to Generate</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={autoNumQuizzes}
                  onChange={(e) => setAutoNumQuizzes(parseInt(e.target.value, 10) || 10)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={autoGenerating}
              className="w-full py-4 bg-gradient-to-r from-[#0052D4] via-[#6B11B0] to-[#FF2A85] text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {autoGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 text-amber-300" />}
              <span>Generate {autoNumQuizzes} Draft Quizzes Now</span>
            </button>
          </form>
        </div>
      )}

      {/* SUB-TAB CONTENT 7: AUTO FREE SCHEDULER */}
      {activeTab === 'scheduler' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6 max-w-3xl mx-auto animate-fade-in">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-[#0B1F4D] uppercase tracking-wide flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-500" />
                <span>Auto Free Test Scheduler Settings</span>
              </h3>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                Automatically picks next Draft quiz and publishes 2 (or custom) tests every week.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 text-emerald-800 text-xs font-black">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{schedulerActive ? 'Scheduler Active' : 'Scheduler Paused'}</span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black text-[#0B1F4D] uppercase tracking-wide mb-2">Tests Per Week</label>
                <select
                  value={testsPerWeek}
                  onChange={(e) => setTestsPerWeek(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 cursor-pointer"
                >
                  <option value={1}>1 Test Per Week</option>
                  <option value={2}>2 Tests Per Week (Recommended)</option>
                  <option value={3}>3 Tests Per Week</option>
                  <option value={5}>5 Tests Per Week</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-[#0B1F4D] uppercase tracking-wide mb-2">Publishing Time</label>
                <input
                  type="text"
                  value={pubTime}
                  onChange={(e) => setPubTime(e.target.value)}
                  placeholder="e.g. 10:00 AM"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-[#0B1F4D] uppercase tracking-wide mb-2">Publishing Days</label>
              <div className="flex flex-wrap gap-2">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                  const isChecked = pubDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => togglePubDay(day)}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-[#6B11B0] text-white shadow-sm'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {day} {isChecked ? '✓' : ''}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-[#0B1F4D] uppercase tracking-wide mb-2">Target Course Categories</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['JEE', 'NEET', 'SSC', 'BANKING', 'UPSC', 'RAILWAYS', 'DEFENCE', 'MHT CET'].map(cat => {
                  const isChecked = targetFreeCats.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleTargetCat(cat)}
                      className={`p-3 rounded-xl border text-xs font-black uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer ${
                        isChecked
                          ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <span>{cat}</span>
                      <span>{isChecked ? '✓' : ''}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={handleSaveSchedulerSettings}
                disabled={savingScheduler}
                className="flex-grow py-3.5 bg-gradient-to-r from-[#0052D4] via-[#6B11B0] to-[#FF2A85] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {savingScheduler ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Settings className="w-4 h-4" />}
                <span>Save Scheduler Settings</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB CONTENT 8: DRAFT QUIZZES */}
      {activeTab === 'draft_quizzes' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-black text-[#0B1F4D] uppercase tracking-wide flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-500" />
              <span>Draft Quizzes ({tests.filter(t => t.is_published === 0).length})</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.filter(t => t.is_published === 0).length === 0 ? (
              <div className="col-span-full bg-white border border-dashed border-slate-200 rounded-3xl p-10 text-center text-slate-400 font-semibold text-xs">
                No draft quizzes found. Auto-generate quizzes above!
              </div>
            ) : (
              tests.filter(t => t.is_published === 0).map(quiz => (
                <div key={quiz.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between group">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="bg-amber-50 text-amber-700 text-[10px] font-black px-3 py-1 rounded-full border border-amber-200 uppercase">
                        {quiz.category || 'JEE'}
                      </span>
                      <span className="bg-slate-100 text-slate-500 text-[9px] font-bold px-2 py-0.5 rounded uppercase">Draft</span>
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-[#6B11B0] transition-colors">{quiz.name}</h4>
                    <p className="text-xs text-slate-500 font-semibold">{quiz.question_count || 30} Qs • {quiz.duration || 30} Mins</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleViewQuizQuestions(quiz)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-purple-50 text-[#6B11B0] font-extrabold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(quiz.id, 0)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-1 cursor-pointer shadow-sm"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Publish Now</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteQuiz(quiz.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB CONTENT 9: PUBLISHED QUIZZES */}
      {activeTab === 'published_quizzes' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-black text-[#0B1F4D] uppercase tracking-wide flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-emerald-600" />
              <span>Published Quizzes ({tests.filter(t => t.is_published === 1).length})</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.filter(t => t.is_published === 1).length === 0 ? (
              <div className="col-span-full bg-white border border-dashed border-slate-200 rounded-3xl p-10 text-center text-slate-400 font-semibold text-xs">
                No published quizzes found.
              </div>
            ) : (
              tests.filter(t => t.is_published === 1).map(quiz => (
                <div key={quiz.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between group border-l-4 border-l-emerald-500">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="bg-purple-50 text-[#6B11B0] text-[10px] font-black px-3 py-1 rounded-full border border-purple-200 uppercase">
                        {quiz.category || 'JEE'}
                      </span>
                      <span className="bg-emerald-50 text-emerald-700 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200 uppercase">Live</span>
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-[#6B11B0] transition-colors">{quiz.name}</h4>
                    <p className="text-xs text-slate-500 font-semibold">{quiz.question_count || 30} Qs • {quiz.attempt_count || 0} Student Attempts</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleViewQuizQuestions(quiz)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-purple-50 text-[#6B11B0] font-extrabold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Qs</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(quiz.id, 1)}
                      className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-extrabold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                    >
                      <span>Unpublish</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteQuiz(quiz.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB CONTENT 10: STUDENT ACCESS CONTROL */}
      {activeTab === 'access_control' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6 animate-fade-in">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
            <div>
              <h3 className="text-base font-black text-[#0B1F4D] uppercase tracking-wide flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#6B11B0]" />
                <span>Student Access Control</span>
              </h3>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                Grant per-student access to specific categories and sub-categories. Multiple accesses supported.
              </p>
            </div>
            <button
              type="button"
              onClick={fetchAccessStudents}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs uppercase rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search students by name or roll number..."
              value={accessSearch}
              onChange={e => setAccessSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#6B11B0]"
            />
          </div>

          {/* Student List */}
          {accessLoading ? (
            <div className="text-center py-10 text-slate-400 font-semibold text-xs animate-pulse">Loading students...</div>
          ) : (
            <div className="space-y-3">
              {accessStudents
                .filter(s =>
                  (s.name || '').toLowerCase().includes(accessSearch.toLowerCase()) ||
                  (s.roll_number || '').toLowerCase().includes(accessSearch.toLowerCase())
                )
                .map(student => {
                  const currentAccess: string[] = Array.isArray(student.subcategory_access) ? student.subcategory_access : [];
                  return (
                    <div key={student.id} className="border border-slate-200 rounded-2xl p-5 hover:shadow-sm transition-all">
                      {/* Student row */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-sm text-slate-900">{student.name}</span>
                            <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200 uppercase">{student.roll_number}</span>
                            <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-200 uppercase">{student.course || 'JEE'}</span>
                          </div>

                          {/* Current access chips */}
                          <div className="mt-2.5 flex flex-wrap gap-1.5">
                            {currentAccess.length === 0 ? (
                              <span className="text-[10px] text-slate-400 font-semibold italic">Course default access only (no subcategory restrictions)</span>
                            ) : (
                              currentAccess.map(acc => (
                                <span key={acc} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-purple-50 text-purple-700 border border-purple-200">
                                  {acc.includes('::') ? acc.split('::').join(' → ') : acc}
                                </span>
                              ))
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setEditingAccessId(student.id);
                            setPendingAccess([...currentAccess]);
                          }}
                          className="px-3.5 py-1.5 bg-gradient-to-r from-[#0052D4] to-[#6B11B0] text-white text-[10px] font-black uppercase rounded-xl cursor-pointer flex-shrink-0 hover:opacity-90"
                        >
                          Edit Access
                        </button>
                      </div>
                    </div>
                  );
                })}
              {accessStudents.length === 0 && (
                <div className="text-center py-10 text-slate-400 font-semibold text-xs border border-dashed border-slate-200 rounded-2xl">
                  No students found.
                </div>
              )}
            </div>
          )}

          {/* Edit Access Modal */}
          {editingAccessId && (() => {
            const student = accessStudents.find(s => s.id === editingAccessId);
            if (!student) return null;
            const allOpts = getAllSubcategoryOptions();
            // Group by category
            const grouped: Record<string, typeof allOpts> = {};
            allOpts.forEach(opt => {
              if (!grouped[opt.category]) grouped[opt.category] = [];
              grouped[opt.category].push(opt);
            });
            return (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in">
                  {/* Modal Header */}
                  <div className="bg-gradient-to-r from-[#0052D4] via-[#6B11B0] to-[#FF2A85] text-white px-6 py-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-extrabold text-sm uppercase tracking-wider">Edit Access — {student.name}</h3>
                      <p className="text-[10px] text-blue-200 font-bold uppercase mt-0.5">{student.roll_number} · {student.course}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingAccessId(null)}
                      className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-xl cursor-pointer"
                    >✕</button>
                  </div>

                  <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
                    <p className="text-xs text-slate-500 font-semibold">
                      Select which <strong>sub-categories</strong> this student can access. Multiple selections allowed. Leave empty to use default course-level access.
                    </p>

                    {/* Quick actions */}
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setPendingAccess(allOpts.map(o => o.value))}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-black uppercase rounded-lg cursor-pointer">
                        Select All
                      </button>
                      <button type="button" onClick={() => setPendingAccess([])}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-black uppercase rounded-lg cursor-pointer">
                        Clear All
                      </button>
                      <span className="ml-auto text-[10px] text-slate-400 font-bold self-center">
                        {pendingAccess.length} selected
                      </span>
                    </div>

                    {/* Grouped checkboxes by category */}
                    {Object.entries(grouped).map(([catLabel, opts]) => (
                      <div key={catLabel} className="border border-slate-200 rounded-2xl overflow-hidden">
                        <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200">
                          <span className="font-black text-xs text-slate-700 uppercase tracking-wide">{catLabel}</span>
                        </div>
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {opts.map(opt => (
                            <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
                              <input
                                type="checkbox"
                                checked={pendingAccess.includes(opt.value)}
                                onChange={() => togglePendingAccess(opt.value)}
                                className="w-4 h-4 rounded accent-[#6B11B0] cursor-pointer"
                              />
                              <span className="text-xs font-semibold text-slate-700 group-hover:text-[#6B11B0] transition-colors">
                                {opt.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}

                    {allOpts.length === 0 && (
                      <div className="text-center text-xs text-slate-400 font-semibold py-6 border border-dashed border-slate-200 rounded-2xl">
                        No categories/subcategories configured yet. Add subcategories in the Exam Categories section first.
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setEditingAccessId(null)}
                      className="px-5 py-2.5 border border-slate-200 text-slate-600 font-extrabold text-xs uppercase rounded-xl cursor-pointer hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveStudentAccess(editingAccessId)}
                      disabled={accessSavingId === editingAccessId}
                      className="px-6 py-2.5 bg-gradient-to-r from-[#0052D4] via-[#6B11B0] to-[#FF2A85] text-white font-black text-xs uppercase rounded-xl cursor-pointer hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                    >
                      {accessSavingId === editingAccessId ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckSquare className="w-3.5 h-3.5" />}
                      Save Access
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}


      {/* VIEW QUESTIONS MODAL */}
      {viewingQuestionsList && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden animate-fade-in">
            <div className="bg-[#0B1F4D] text-white px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-sm uppercase tracking-wider">{viewingQuizTitle}</h3>
                <p className="text-[10px] text-blue-300 font-bold uppercase">{viewingQuestionsList.length} Questions</p>
              </div>
              <button
                type="button"
                onClick={() => setViewingQuestionsList(null)}
                className="text-gray-300 hover:text-white bg-white/10 p-1.5 rounded-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 max-h-[500px] overflow-y-auto space-y-4 divide-y divide-slate-100">
              {viewingQuestionsList.map((q, idx) => (
                <div key={idx} className="pt-3 space-y-2">
                  <p className="font-black text-xs text-slate-900">Q{idx + 1}. {q.question_text}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-600">
                    <span className={q.correct_option === 'a' ? 'text-emerald-600 font-bold' : ''}>A) {q.option_a}</span>
                    <span className={q.correct_option === 'b' ? 'text-emerald-600 font-bold' : ''}>B) {q.option_b}</span>
                    <span className={q.correct_option === 'c' ? 'text-emerald-600 font-bold' : ''}>C) {q.option_c}</span>
                    <span className={q.correct_option === 'd' ? 'text-emerald-600 font-bold' : ''}>D) {q.option_d}</span>
                  </div>
                  {q.explanation && <p className="text-[10px] text-slate-400 italic">Exp: {q.explanation}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

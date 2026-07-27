import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import TeacherDashboard from './TeacherDashboard';
import ImportQuestions from './ImportQuestions';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title as ChartTitle, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ChartTitle,
  Tooltip,
  Legend,
  ArcElement
);
import { User, Shield, GraduationCap, Plus, Trash2, LogOut, BookOpen, Key, Eye, EyeOff, UploadCloud, RefreshCw, X, Check, CheckCircle2, AlertTriangle, FileSpreadsheet, BarChart2, Layers, Activity, Download, Search, Calendar, Upload, CheckSquare, Menu, ChevronLeft, HelpCircle, Sparkles, Zap, Target, Award } from 'lucide-react';



interface Student {
  id: number | string;
  name: string;
  roll_number: string;
  username: string;
  password?: string;
  is_subscribed?: number;
  is_active?: number;
  course?: string;
  created_at: string;
  subscription_expires_at?: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'students' | 'question_bank' | 'categories' | 'mock_tests' | 'import_questions' | 'auto_free'>('analytics');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Lists
  const [students, setStudents] = useState<Student[]>([]);
  const [chapterSets, setChapterSets] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [allAttempts, setAllAttempts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSets, setLoadingSets] = useState(false);
  const [loadingAttempts, setLoadingAttempts] = useState(false);

  // Student Form State
  const [sName, setSName] = useState('');
  const [sRollNumber, setSRollNumber] = useState('');
  const [sUsername, setSUsername] = useState('');
  const [sPassword, setSPassword] = useState('');
  const [sCourse, setSCourse] = useState('JEE');
  const [sError, setSError] = useState('');
  const [sSuccess, setSSuccess] = useState('');

  // Dynamic Category Form States
  const [newCatId, setNewCatId] = useState('');
  const [newCatTitle, setNewCatTitle] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('BookOpen');
  const [newCatColor, setNewCatColor] = useState('blue');

  // Password visibility states
  const [showSPassword, setShowSPassword] = useState(false);

  const navigate = useNavigate();

  // Category bank selection state
  const [bankCategory, setBankCategory] = useState<'JEE' | 'NEET'>('JEE');

  // Student Search, Pagination, and Dialog States
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [studentCurrentPage, setStudentCurrentPage] = useState(1);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [customExpiryStudentId, setCustomExpiryStudentId] = useState<string | null>(null);
  const [customExpiryDate, setCustomExpiryDate] = useState('');
  const [showCustomExpiryModal, setShowCustomExpiryModal] = useState(false);

  // Student Bulk Actions and Filter States
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [filterCourse, setFilterCourse] = useState('ALL');
  const [filterSubscription, setFilterSubscription] = useState('ALL');
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [bulkImportText, setBulkImportText] = useState('');

  // Category Search, Pagination, and Dialog States
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [categoryCurrentPage, setCategoryCurrentPage] = useState(1);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);

  // Modal states for Add Set
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalExam, setModalExam] = useState<'JEE' | 'NEET'>('JEE');
  const [modalSubject, setModalSubject] = useState<string>('Physics');
  const [modalChapter, setModalChapter] = useState('');
  const [modalDifficulty, setModalDifficulty] = useState('hard');
  const [modalYear, setModalYear] = useState(new Date().getFullYear().toString());
  const [modalFile, setModalFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto Free Test Automation State
  const [questionsPerAutoTest, setQuestionsPerAutoTest] = useState(30);
  const [targetFreeCourses, setTargetFreeCourses] = useState<string[]>([
    'JEE', 'NEET', 'SSC', 'Railways', 'Banking', 'UPSC', 'Defence', 'MHT CET'
  ]);
  const [generatingAutoTest, setGeneratingAutoTest] = useState(false);

  const toggleCourseTarget = (course: string) => {
    setTargetFreeCourses(prev => 
      prev.includes(course) ? prev.filter(c => c !== course) : [...prev, course]
    );
  };

  const handleTriggerAutoFreeTest = async () => {
    if (targetFreeCourses.length === 0) {
      Swal.fire('Select Course', 'Please select at least one target course for the weekly auto free test.', 'warning');
      return;
    }
    setGeneratingAutoTest(true);
    try {
      const chosenCourse = targetFreeCourses[Math.floor(Math.random() * targetFreeCourses.length)];
      const testTitle = `${chosenCourse} Weekly Free Speed Test #${Math.floor(Math.random() * 90) + 10}`;
      
      const payload = {
        name: testTitle,
        category: chosenCourse,
        duration: 30,
        question_count: Math.min(questionsPerAutoTest, 30),
        is_free: 1,
        test_type: 'mock',
        is_published: 1,
        created_at: new Date().toISOString()
      };

      const response = await fetch('/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to create auto free test.');
      }

      Swal.fire({
        title: 'Auto Free Test Published! ⚡',
        html: `Created <b>${testTitle}</b> for <b>${chosenCourse}</b> with <b>${payload.question_count} questions</b> (30 mins). Published live to /mock-tests page!`,
        icon: 'success',
        confirmButtonColor: '#1E88E5'
      });

    } catch (err: any) {
      Swal.fire('Auto-Generate Error', err.message || 'Failed to auto-generate free test', 'error');
    } finally {
      setGeneratingAutoTest(false);
    }
  };

  // View questions modal states
  const [selectedSetQuestions, setSelectedSetQuestions] = useState<{ exam: string; subject: string; chapter: string } | null>(null);
  const [questionsList, setQuestionsList] = useState<any[]>([]);
  const [loadingQuestionsList, setLoadingQuestionsList] = useState(false);
  const [questionsListError, setQuestionsListError] = useState('');

  const fetchSetQuestions = async (exam: string, subject: string, chapter: string) => {
    try {
      setLoadingQuestionsList(true);
      setQuestionsListError('');
      const response = await fetch(`/api/questions?exam=${encodeURIComponent(exam)}&subject=${encodeURIComponent(subject)}&chapter=${encodeURIComponent(chapter)}`);
      if (!response.ok) throw new Error('Failed to fetch questions for this chapter');
      const data = await response.json();
      
      // Filter only general questions (test_id is null)
      const filtered = data.filter((q: any) => q.test_id === null || q.test_id === undefined);
      setQuestionsList(filtered);
    } catch (err: any) {
      setQuestionsListError(err.message || 'Error fetching questions.');
    } finally {
      setLoadingQuestionsList(false);
    }
  };

  const handleOpenQuestionsModal = (exam: string, subject: string, chapter: string) => {
    setSelectedSetQuestions({ exam, subject, chapter });
    fetchSetQuestions(exam, subject, chapter);
  };

  const handleDeleteQuestionFromSet = async (id: number) => {
    const confirmDelete = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this question? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#374151',
      confirmButtonText: 'Yes, delete it!'
    });
    if (!confirmDelete.isConfirmed) return;

    try {
      const response = await fetch(`/api/questions/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete question');
      
      // Remove from state
      setQuestionsList(prev => prev.filter(q => q.id !== id));
      
      // Refresh general sets count on dashboard
      fetchChapterSets();

      Swal.fire({
        title: 'Deleted!',
        text: 'Question deleted successfully.',
        icon: 'success',
        confirmButtonColor: '#10b981'
      });
    } catch (err: any) {
      Swal.fire({
        title: 'Error',
        text: err.message || 'Error deleting question',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  const openAddModal = (exam: 'JEE' | 'NEET', subject: string) => {
    setModalExam(exam);
    setModalSubject(subject === 'Math' || subject === 'Mathematics' ? 'Mathematics' : subject);
    setModalChapter('');
    setModalFile(null);
    setUploadError('');
    setUploadSuccess('');
    setIsAddModalOpen(true);
  };

  const handleModalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const ext = selectedFile.name.split('.').pop()?.toLowerCase();
      if (ext === 'xlsx' || ext === 'xls' || ext === 'pdf') {
        setModalFile(selectedFile);
        setUploadError('');
      } else {
        setUploadError('Unsupported format! Please upload Excel (.xlsx, .xls) or PDF (.pdf).');
        setModalFile(null);
      }
    }
  };

  const handleUploadSet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalFile) {
      setUploadError('Please select an Excel or PDF file to upload.');
      return;
    }
    if (!modalChapter.trim()) {
      setUploadError('Please enter a Chapter Name.');
      return;
    }

    try {
      setUploadLoading(true);
      setUploadError('');
      setUploadSuccess('');

      const formData = new FormData();
      formData.append('file', modalFile);
      formData.append('exam', modalExam);
      formData.append('subject', modalSubject);
      formData.append('chapter', modalChapter.trim());
      formData.append('difficulty', modalDifficulty);
      formData.append('year', modalYear);
      formData.append('forceMetadata', 'true');

      const response = await fetch('/api/import-questions', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload and save question set.');
      }

      setUploadSuccess(`Successfully imported ${data.inserted} questions for ${modalExam} - ${modalSubject} - ${modalChapter.trim()}!`);
      
      // Refresh the sets list
      fetchChapterSets();
      
      // Close modal after a short delay
      setTimeout(() => {
        setIsAddModalOpen(false);
        setModalFile(null);
        setModalChapter('');
        setUploadSuccess('');
      }, 1500);

    } catch (err: any) {
      setUploadError(err.message || 'Something went wrong during file upload.');
    } finally {
      setUploadLoading(false);
    }
  };

  // Route security check
  useEffect(() => {
    const cached = localStorage.getItem('currentUser');
    if (!cached) {
      navigate('/');
      return;
    }
    const user = JSON.parse(cached);
    if (user.role !== 'admin') {
      navigate('/');
    } else {
      fetchData();
      fetchTests();
      fetchAttempts();
    }
  }, [navigate]);

  useEffect(() => {
    if (activeTab === 'question_bank') {
      fetchChapterSets();
    } else if (activeTab === 'analytics') {
      fetchAttempts();
      fetchTests();
    }
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchStudents(),
        fetchCategories()
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

  const openAddCategoryModal = () => {
    setNewCatId('');
    setNewCatTitle('');
    setNewCatIcon('BookOpen');
    setNewCatColor('blue');
    setShowAddCategoryModal(true);
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatId.trim() || !newCatTitle.trim()) {
      Swal.fire('Error', 'Category ID and Title are required.', 'error');
      return;
    }

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newCatId.trim().toLowerCase(),
          title: newCatTitle.trim(),
          icon: newCatIcon,
          color: newCatColor
        })
      });

      if (response.ok) {
        Swal.fire({
          title: 'Success!',
          text: 'Category created/updated successfully.',
          icon: 'success',
          confirmButtonColor: '#10b981'
        });
        setNewCatId('');
        setNewCatTitle('');
        setShowAddCategoryModal(false);
        fetchCategories();
      } else {
        throw new Error('Failed to save category');
      }
    } catch (err: any) {
      Swal.fire('Error', err.message || 'Failed to save category', 'error');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const confirmDelete = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete category "${id}"? This will not delete questions or tests of this category, but they won't list dynamically.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    });

    if (!confirmDelete.isConfirmed) return;

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        Swal.fire('Deleted!', 'Category deleted successfully.', 'success');
        fetchCategories();
      } else {
        throw new Error('Failed to delete category');
      }
    } catch (err: any) {
      Swal.fire('Error', err.message || 'Failed to delete category', 'error');
    }
  };

  const fetchTests = async () => {
    try {
      const response = await fetch('/api/tests');
      if (response.ok) {
        const data = await response.json();
        setTests(data);
      }
    } catch (err) {
      console.error('Error fetching tests:', err);
    }
  };

  const fetchAttempts = async () => {
    try {
      setLoadingAttempts(true);
      const response = await fetch('/api/attempts');
      if (response.ok) {
        const data = await response.json();
        setAllAttempts(data);
      }
    } catch (err) {
      console.error('Error fetching attempts:', err);
    } finally {
      setLoadingAttempts(false);
    }
  };

  const handleToggleSubscription = async (id: number | string) => {
    try {
      const response = await fetch(`/api/admin/students/${id}/subscription`, {
        method: 'PUT'
      });
      if (!response.ok) throw new Error('Failed to toggle student subscription');
      const data = await response.json();
      
      setStudents(prev => prev.map(s => s.id === id ? { 
        ...s, 
        is_subscribed: data.isSubscribed ? 1 : 0, 
        subscription_expires_at: data.subscription_expires_at 
      } : s));
      Swal.fire({
        title: 'Success!',
        text: data.message || 'Subscription toggled successfully.',
        icon: 'success',
        confirmButtonColor: '#10b981'
      });
    } catch (err: any) {
      Swal.fire({
        title: 'Error',
        text: err.message || 'Error occurred toggling subscription.',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  const handleSaveExpiry = async (studentId: string | number, dateStr: string) => {
    try {
      const response = await fetch(`/api/admin/students/${studentId}/subscription-expiry`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expires_at: dateStr || null }),
      });
      if (response.ok) {
        const data = await response.json();
        setStudents(prev => prev.map(s => s.id === studentId ? {
          ...s,
          is_subscribed: data.isSubscribed ? 1 : 0,
          subscription_expires_at: data.subscription_expires_at
        } : s));
        Swal.fire('Success', 'Subscription expiry updated successfully', 'success');
        setShowCustomExpiryModal(false);
        setCustomExpiryStudentId(null);
        setCustomExpiryDate('');
        fetchStudents();
      } else {
        const data = await response.json();
        Swal.fire('Error', data.error || 'Failed to update subscription expiry', 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to update subscription expiry', 'error');
    }
  };

  const handleToggleActive = async (id: number | string) => {
    try {
      const response = await fetch(`/api/admin/students/${id}/active`, {
        method: 'PUT'
      });
      if (!response.ok) throw new Error('Failed to toggle student active status');
      const data = await response.json();
      
      setStudents(prev => prev.map(s => s.id === id ? { ...s, is_active: data.isActive ? 1 : 0 } : s));
      Swal.fire({
        title: 'Success!',
        text: data.message || 'Student active status updated successfully.',
        icon: 'success',
        confirmButtonColor: '#10b981'
      });
    } catch (err: any) {
      Swal.fire({
        title: 'Error',
        text: err.message || 'Error occurred updating status.',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  const fetchChapterSets = async () => {
    try {
      setLoadingSets(true);
      const response = await fetch('/api/admin/chapter-sets');
      if (!response.ok) throw new Error('Failed to fetch chapter sets');
      const data = await response.json();
      setChapterSets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSets(false);
    }
  };

  const handleDeleteChapterSet = async (exam: string, subject: string, chapter: string) => {
    const confirmDelete = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you really want to delete the entire question set for ${exam} - ${subject} - ${chapter}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#374151',
      confirmButtonText: 'Yes, delete it!'
    });
    if (!confirmDelete.isConfirmed) return;

    try {
      const response = await fetch(
        `/api/admin/chapter-sets?exam=${encodeURIComponent(exam)}&subject=${encodeURIComponent(subject)}&chapter=${encodeURIComponent(chapter)}`,
        { method: 'DELETE' }
      );
      if (!response.ok) throw new Error('Failed to delete chapter set');
      const data = await response.json();
      Swal.fire({
        title: 'Deleted!',
        text: data.message || 'Chapter question set deleted successfully.',
        icon: 'success',
        confirmButtonColor: '#10b981'
      });
      fetchChapterSets();
    } catch (err: any) {
      Swal.fire({
        title: 'Error',
        text: err.message || 'Error deleting chapter set.',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
    }
  };



  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/admin/students');
      if (!response.ok) throw new Error('Failed to fetch students');
      const data = await response.json();
      setStudents(data);
    } catch (err) {
      console.error(err);
    }
  };

  const openAddStudentModal = () => {
    const currentYear = new Date().getFullYear();
    const prefix = `PREPAP${currentYear}`;
    
    const matchingRollNumbers = students
      .map(s => (s.roll_number || '').toUpperCase())
      .filter(roll => roll.startsWith(prefix));
      
    let nextNum = 1;
    if (matchingRollNumbers.length > 0) {
      const nums = matchingRollNumbers.map(roll => {
        const suffix = roll.substring(prefix.length);
        const parsed = parseInt(suffix, 10);
        return isNaN(parsed) ? 0 : parsed;
      });
      nextNum = Math.max(...nums) + 1;
    }
    
    const defaultRoll = `${prefix}${nextNum.toString().padStart(3, '0')}`;
    
    setSName('');
    setSRollNumber(defaultRoll);
    setSUsername('');
    setSPassword('');
    setSError('');
    setSSuccess('');
    setShowAddStudentModal(true);
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSError('');
    setSSuccess('');

    if (!sName.trim() || !sRollNumber.trim() || !sUsername.trim() || !sPassword) return;

    try {
      const response = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: sName.trim(),
          roll_number: sRollNumber.trim(),
          username: sUsername.trim(),
          password: sPassword,
          course: sCourse
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to add student');

      setSSuccess('Student added successfully!');
      setSName('');
      setSRollNumber('');
      setSUsername('');
      setSPassword('');
      fetchStudents();
    } catch (err: any) {
      setSError(err.message || 'Error occurred');
    }
  };

  const handleDeleteStudent = async (id: number | string) => {
    const confirmDelete = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to remove this student? All their quiz history will be lost.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#374151',
      confirmButtonText: 'Yes, remove them!'
    });
    if (!confirmDelete.isConfirmed) return;

    try {
      const response = await fetch(`/api/admin/students/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete student');
      
      Swal.fire({
        title: 'Removed!',
        text: 'Student account has been removed.',
        icon: 'success',
        confirmButtonColor: '#10b981'
      });
      fetchStudents();
    } catch (err: any) {
      Swal.fire({
        title: 'Error',
        text: err.message || 'Failed to remove student',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  const handleBulkActiveStatus = async (active: number) => {
    if (selectedStudentIds.length === 0) return;

    const actionText = active === 1 ? 'activate' : 'deactivate';
    const confirmResult = await Swal.fire({
      title: 'Are you sure?',
      text: `You want to ${actionText} ${selectedStudentIds.length} selected student(s)?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#6b7280',
      confirmButtonText: `Yes, ${actionText} them!`
    });

    if (!confirmResult.isConfirmed) return;

    try {
      const response = await fetch('/api/admin/students/bulk-active', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedStudentIds, active })
      });

      if (response.ok) {
        Swal.fire({
          title: 'Updated!',
          text: `Successfully ${active === 1 ? 'activated' : 'deactivated'} selected students.`,
          icon: 'success',
          confirmButtonColor: '#10b981'
        });
        setSelectedStudentIds([]);
        fetchStudents();
      } else {
        throw new Error('Failed to update status');
      }
    } catch (err: any) {
      Swal.fire('Error', err.message || 'Bulk status update failed', 'error');
    }
  };

  const handleBulkImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkImportText.trim()) {
      Swal.fire('Error', 'Please enter some student data in CSV format.', 'error');
      return;
    }

    const lines = bulkImportText.split('\n');
    const studentsToImport: any[] = [];
    const errors: string[] = [];

    lines.forEach((line, index) => {
      const cleanLine = line.trim();
      if (!cleanLine) return; // skip empty lines

      const parts = cleanLine.split(',');
      if (parts.length < 4) {
        errors.push(`Line ${index + 1}: Expected at least 4 values (name, roll, username, password). Got: "${cleanLine}"`);
        return;
      }

      const name = parts[0].trim();
      const roll_number = parts[1].trim();
      const username = parts[2].trim();
      const password = parts[3].trim();
      const course = parts[4] ? parts[4].trim() : 'JEE';
      const subscription_expires_at = parts[5] ? parts[5].trim() : '';

      if (!name || !roll_number || !username || !password) {
        errors.push(`Line ${index + 1}: Required fields missing in "${cleanLine}"`);
        return;
      }

      studentsToImport.push({ name, roll_number, username, password, course, subscription_expires_at });
    });

    if (errors.length > 0) {
      Swal.fire({
        title: 'Formatting Errors Found',
        html: `<div class="text-left text-xs text-red-650 max-h-40 overflow-y-auto font-mono">${errors.join('<br/>')}</div>`,
        icon: 'error'
      });
      return;
    }

    if (studentsToImport.length === 0) {
      Swal.fire('Error', 'No valid students found to import.', 'error');
      return;
    }

    try {
      Swal.fire({
        title: 'Importing...',
        text: 'Please wait while student accounts are being created.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const response = await fetch('/api/admin/students/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: studentsToImport })
      });

      if (response.ok) {
        const data = await response.json();
        Swal.close();

        const summaryHTML = `
          <div class="text-left text-xs space-y-2">
            <p class="font-bold text-slate-800">Import Summary:</p>
            <ul class="list-disc pl-5">
              <li class="text-emerald-600">Successfully Imported: <b>${data.imported}</b></li>
              <li class="text-amber-600">Skipped/Duplicate: <b>${data.skipped}</b></li>
            </ul>
            ${data.errors.length > 0 ? `
              <p class="font-bold mt-2 text-slate-800">Errors/Skipped Details:</p>
              <div class="border rounded p-2 max-h-32 overflow-y-auto text-red-650 bg-red-50/50 font-mono">${data.errors.join('<br/>')}</div>
            ` : ''}
          </div>
        `;

        await Swal.fire({
          title: 'Bulk Import Finished',
          html: summaryHTML,
          icon: data.imported > 0 ? 'success' : 'info',
          confirmButtonColor: '#2563eb'
        });

        setShowBulkImportModal(false);
        setBulkImportText('');
        fetchStudents();
      } else {
        throw new Error('Bulk import request failed');
      }
    } catch (err: any) {
      Swal.fire('Error', err.message || 'Bulk import failed', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  // Chart.js data configurations for Admin Dashboard
  const categoryLabels = categories.map(cat => cat.title);
  
  const studentEnrollmentData = {
    labels: categoryLabels,
    datasets: [
      {
        label: 'Enrolled Students',
        data: categories.map(cat => students.filter(s => (s.course || 'JEE').toUpperCase() === cat.title.toUpperCase()).length),
        backgroundColor: categories.map(cat => {
          const colorMap: Record<string, string> = {
            blue: 'rgba(59, 130, 246, 0.75)',
            green: 'rgba(16, 185, 129, 0.75)',
            purple: 'rgba(139, 92, 246, 0.75)',
            red: 'rgba(239, 68, 68, 0.75)',
            amber: 'rgba(245, 158, 11, 0.75)',
            slate: 'rgba(100, 116, 139, 0.75)',
            orange: 'rgba(249, 115, 22, 0.75)',
            indigo: 'rgba(79, 70, 229, 0.75)'
          };
          return colorMap[cat.color as string] || 'rgba(59, 130, 246, 0.75)';
        }),
        borderWidth: 0,
        borderRadius: 8,
      }
    ]
  };

  const testCountData = {
    labels: categoryLabels,
    datasets: [
      {
        label: 'Tests Configured',
        data: categories.map(cat => tests.filter(t => (t.category || 'JEE').toUpperCase() === cat.title.toUpperCase()).length),
        backgroundColor: 'rgba(79, 70, 229, 0.15)',
        borderColor: 'rgba(79, 70, 229, 0.8)',
        borderWidth: 2,
        borderRadius: 8,
      }
    ]
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans select-none">
      
      {/* Sidebar Navigation */}
      <aside className={`bg-[#0B1F4D] text-white flex flex-col justify-between border-r border-[#1E88E5]/20 flex-shrink-0 select-none transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-72'}`}>
        <div>
          {/* Logo Brand & Collapse Toggle */}
          <div className={`px-4 py-6 border-b border-white/10 flex items-center justify-between gap-3 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="flex items-center gap-3">
              <img 
                src="/assets/logo-prepapple.png" 
                alt="PrepApple Logo" 
                onClick={() => isSidebarCollapsed && setIsSidebarCollapsed(false)}
                className={`h-10 w-10 object-cover flex-shrink-0 rounded-full border border-white/20 shadow-md ${isSidebarCollapsed ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
                title={isSidebarCollapsed ? "Expand Sidebar" : undefined}
                onError={(e: any) => { e.target.onerror = null; e.target.src = "/assets/logo.jpeg"; }}
              />
              {!isSidebarCollapsed && (
                <div className="animate-fade-in">
                  <h1 className="font-extrabold text-white text-base md:text-lg tracking-tight uppercase leading-none">
                    Prep<span className="text-[#1E88E5]">Apple</span>
                  </h1>
                  <span className="text-[10px] text-blue-300 font-extrabold uppercase tracking-wider block mt-1">
                    Admin Control
                  </span>
                </div>
              )}
            </div>
            
            {/* Collapse Trigger Button */}
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
          
          {/* Nav Items */}
          <nav className={`mt-6 space-y-1.5 ${isSidebarCollapsed ? 'px-2' : 'px-4'}`}>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                isSidebarCollapsed ? 'justify-center w-12 h-12 mx-auto px-0 py-0' : 'w-full gap-3 px-4 py-3'
              } ${
                activeTab === 'analytics'
                  ? 'bg-blue-600 text-white shadow shadow-blue-500/10'
                  : 'text-slate-300 hover:bg-[#1a3a60] hover:text-white'
              }`}
              title={isSidebarCollapsed ? "Dashboard Analytics" : undefined}
            >
              <BarChart2 className="w-4.5 h-4.5" />
              {!isSidebarCollapsed && <span className="animate-fade-in">Dashboard Analytics</span>}
            </button>

            <button
              onClick={() => setActiveTab('students')}
              className={`flex items-center justify-between rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                isSidebarCollapsed ? 'justify-center w-12 h-12 mx-auto px-0 py-0' : 'w-full px-4 py-3'
              } ${
                activeTab === 'students'
                  ? 'bg-blue-600 text-white shadow shadow-blue-500/10'
                  : 'text-slate-300 hover:bg-[#1a3a60] hover:text-white'
              }`}
              title={isSidebarCollapsed ? "Students Directory" : undefined}
            >
              <div className="flex items-center gap-3">
                <GraduationCap className="w-4.5 h-4.5" />
                {!isSidebarCollapsed && <span className="animate-fade-in">Students Directory</span>}
              </div>
              {!isSidebarCollapsed && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black animate-fade-in ${
                  activeTab === 'students'
                    ? 'bg-white/20 text-white border border-white/20'
                    : 'bg-[#1a3a60] text-blue-300 border border-blue-900/40'
                }`}>
                  {students.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`flex items-center justify-between rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                isSidebarCollapsed ? 'justify-center w-12 h-12 mx-auto px-0 py-0' : 'w-full px-4 py-3'
              } ${
                activeTab === 'categories'
                  ? 'bg-blue-600 text-white shadow shadow-blue-500/10'
                  : 'text-slate-300 hover:bg-[#1a3a60] hover:text-white'
              }`}
              title={isSidebarCollapsed ? "Manage Categories" : undefined}
            >
              <div className="flex items-center gap-3">
                <Layers className="w-4.5 h-4.5" />
                {!isSidebarCollapsed && <span className="animate-fade-in">Manage Categories</span>}
              </div>
              {!isSidebarCollapsed && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black animate-fade-in ${
                  activeTab === 'categories'
                    ? 'bg-white/20 text-white border border-white/20'
                    : 'bg-[#1a3a60] text-blue-300 border border-blue-900/40'
                }`}>
                  {categories.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('mock_tests')}
              className={`flex items-center rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                isSidebarCollapsed ? 'justify-center w-12 h-12 mx-auto px-0 py-0' : 'w-full gap-3 px-4 py-3'
              } ${
                activeTab === 'mock_tests'
                  ? 'bg-blue-600 text-white shadow shadow-blue-500/10'
                  : 'text-slate-300 hover:bg-[#1a3a60] hover:text-white'
              }`}
              title={isSidebarCollapsed ? "Manage Mock Tests" : undefined}
            >
              <Layers className="w-4.5 h-4.5" />
              {!isSidebarCollapsed && <span className="animate-fade-in">Manage Mock Tests</span>}
            </button>

            <button
              onClick={() => setActiveTab('auto_free')}
              className={`flex items-center rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                isSidebarCollapsed ? 'justify-center w-12 h-12 mx-auto px-0 py-0' : 'w-full gap-3 px-4 py-3'
              } ${
                activeTab === 'auto_free'
                  ? 'bg-blue-600 text-white shadow shadow-blue-500/10'
                  : 'text-slate-300 hover:bg-[#1a3a60] hover:text-white'
              }`}
              title={isSidebarCollapsed ? "Auto Free Test Automation" : undefined}
            >
              <Sparkles className="w-4.5 h-4.5 text-amber-300" />
              {!isSidebarCollapsed && <span className="animate-fade-in">Auto Free Scheduler</span>}
            </button>
          </nav>
        </div>

        {/* Bottom Sidebar Action Items */}
        <div className={`border-t border-blue-950 space-y-1.5 ${isSidebarCollapsed ? 'p-2' : 'p-4'}`}>
          <button
            onClick={handleLogout}
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

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Header Bar */}
        <header className="bg-white border-b border-gray-200 px-8 py-4.5 flex justify-between items-center shadow-sm flex-shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-gray-800 uppercase tracking-tight">
              {activeTab === 'analytics' && 'Dashboard Analytics'}
              {activeTab === 'students' && 'Students Account Directory'}
              {activeTab === 'question_bank' && 'Question Pool Sets'}
              {activeTab === 'categories' && 'Dynamic Exam Categories'}
              {activeTab === 'mock_tests' && 'Manage Mock Tests'}
              {activeTab === 'import_questions' && 'Bulk Import Questions'}
            </h2>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Logged in as:</span>
            <span className="bg-[#0f294a]/5 border border-[#0f294a]/15 text-[#0f294a] text-xs font-bold px-3 py-1 rounded-lg">
              mahakal (Admin)
            </span>
          </div>
        </header>

        {/* Content Pane */}
        <main className="flex-grow p-8">        {/* Tab Contents: Dashboard Analytics */}
        {activeTab === 'analytics' && (
          <div className="space-y-8 animate-fade-in select-none">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
                <div>
                  <p className="text-xs text-gray-400 font-extrabold uppercase tracking-widest">Enrolled Students</p>
                  <h3 className="text-3xl font-black text-[#0f294a] mt-1">{loading ? '...' : students.length}</h3>
                  <p className="text-[10px] text-emerald-600 font-bold mt-1.5 flex items-center gap-0.5">
                    <span>Active accounts</span>
                  </p>
                </div>
                <div className="bg-blue-50 text-blue-600 p-4 rounded-2xl">
                  <GraduationCap className="w-7 h-7" />
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
                <div>
                  <p className="text-xs text-gray-400 font-extrabold uppercase tracking-widest">Total Mock Tests</p>
                  <h3 className="text-3xl font-black text-[#0f294a] mt-1">{loading ? '...' : tests.length}</h3>
                  <p className="text-[10px] text-purple-600 font-bold mt-1.5">
                    JEE / NEET papers
                  </p>
                </div>
                <div className="bg-purple-50 text-purple-600 p-4 rounded-2xl">
                  <Layers className="w-7 h-7" />
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
                <div>
                  <p className="text-xs text-gray-400 font-extrabold uppercase tracking-widest">Question Pools</p>
                  <h3 className="text-3xl font-black text-[#0f294a] mt-1">{loadingSets ? '...' : chapterSets.length}</h3>
                  <p className="text-[10px] text-blue-600 font-bold mt-1.5">
                    Chapter sets uploaded
                  </p>
                </div>
                <div className="bg-amber-50 text-amber-600 p-4 rounded-2xl">
                  <BookOpen className="w-7 h-7" />
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
                <div>
                  <p className="text-xs text-gray-400 font-extrabold uppercase tracking-widest">Student Attempts</p>
                  <h3 className="text-3xl font-black text-[#0f294a] mt-1">{loadingAttempts ? '...' : allAttempts.length}</h3>
                  <p className="text-[10px] text-slate-500 font-bold mt-1.5">
                    Submissions completed
                  </p>
                </div>
                <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl">
                  <Activity className="w-7 h-7" />
                </div>
              </div>
            </div>

            {/* Detailed Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Attempts Activity Feed */}
              <div className="lg:col-span-2 bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                <h3 className="text-base font-black text-gray-800 mb-5 flex items-center gap-1.5 uppercase tracking-tight">
                  <Activity className="w-5 h-5 text-emerald-600 animate-pulse" /> Recent Exam Submissions Feed
                </h3>

                {loadingAttempts ? (
                  <div className="text-center py-12 text-gray-400 font-semibold text-sm">
                    Loading student submission logs...
                  </div>
                ) : allAttempts.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 border border-dashed border-gray-200 rounded-2xl">
                    No mock test attempts recorded yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-gray-100 rounded-2xl">
                    <table className="w-full text-left border-collapse text-xs select-none">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-150 text-gray-400 font-bold uppercase text-[9px] tracking-wider">
                          <th className="p-3 pl-4">Student</th>
                          <th className="p-3">Exam Quiz</th>
                          <th className="p-3">Score</th>
                          <th className="p-3">Accuracy</th>
                          <th className="p-3">Time</th>
                          <th className="p-3 text-right pr-4">Review</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-semibold text-gray-600">
                        {allAttempts.slice(0, 5).map((att) => {
                          const date = new Date(att.submitted_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short'
                          });
                          const mins = Math.floor(att.time_taken / 60);
                          const secs = att.time_taken % 60;
                          return (
                            <tr key={att.id} className="hover:bg-slate-50/50">
                              <td className="p-3 pl-4 font-bold text-gray-850">{att.student_name}</td>
                              <td className="p-3 text-gray-700 truncate max-w-[120px] uppercase font-bold text-[11px]" title={att.test_name}>{att.test_name}</td>
                              <td className="p-3 text-gray-900 font-black">{att.score} / {att.total_questions * 4}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-black border ${
                                  att.accuracy >= 75 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-150' 
                                    : att.accuracy >= 45 
                                      ? 'bg-amber-50 text-amber-700 border-amber-150' 
                                      : 'bg-red-50 text-red-700 border-red-150'
                                }`}>
                                  {att.accuracy}%
                                </span>
                              </td>
                              <td className="p-3 font-mono text-[10px] text-gray-500">{mins > 0 ? `${mins}m ${secs}s` : `${secs}s`} • {date}</td>
                              <td className="p-3 text-right pr-4">
                                <button
                                  onClick={() => navigate(`/results/${att.id}`)}
                                  className="px-2.5 py-1 text-[9px] bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold uppercase tracking-wider cursor-pointer"
                                >
                                  Review
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Course & Subscriptions breakdown */}
              <div className="lg:col-span-1 space-y-6">
                {/* Course Enrollment Distribution Chart */}
                <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-base font-black text-gray-800 mb-2 flex items-center gap-1.5 uppercase tracking-tight">
                    Course Enrollments
                  </h3>
                  <p className="text-[10px] text-gray-400 font-semibold mb-6">Distribution of enrolled students by target exam course.</p>
                  
                  {categories.length > 0 ? (
                    <div className="h-[210px] w-full">
                      <Bar 
                        data={studentEnrollmentData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            y: {
                              min: 0,
                              ticks: {
                                stepSize: 1,
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
                    <p className="text-xs text-gray-400 font-semibold text-center py-8">No exam categories configured yet.</p>
                  )}
                </div>

                {/* Test Count Distribution Chart */}
                <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-base font-black text-gray-800 mb-2 flex items-center gap-1.5 uppercase tracking-tight">
                    Exams Configured
                  </h3>
                  <p className="text-[10px] text-gray-400 font-semibold mb-6">Total number of mock/practice tests set up per course.</p>
                  
                  {categories.length > 0 ? (
                    <div className="h-[210px] w-full">
                      <Bar 
                        data={testCountData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            y: {
                              min: 0,
                              ticks: {
                                stepSize: 1,
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
                    <p className="text-xs text-gray-400 font-semibold text-center py-8">No tests available yet.</p>
                  )}
                </div>

                {/* Subscriptions overview */}
                <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-base font-black text-gray-800 mb-4 flex items-center gap-1.5 uppercase tracking-tight">
                    Subscriptions
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0 text-purple-600 border border-purple-100">
                      <Shield className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-gray-800">
                        {students.filter(s => s.is_subscribed === 1).length} / {students.length}
                      </h4>
                      <p className="text-xs text-gray-400 font-semibold mt-0.5">
                        Students hold active premium subscriptions
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Contents: Manage Students */}
        {activeTab === 'students' && (() => {
          // Expiry status calculator
          const getExpiryInfo = (student: Student) => {
            if (student.is_subscribed !== 1 || !student.subscription_expires_at) {
              return { label: 'FREE ACCESS', color: 'bg-slate-100 text-slate-500 border-slate-200', order: 3, daysLeft: null, isExpired: false };
            }
            const now = Date.now();
            const expiryTime = new Date(student.subscription_expires_at).getTime();
            const diff = expiryTime - now;
            if (diff < 0) {
              return { label: 'EXPIRED', color: 'bg-rose-50 text-rose-700 border-rose-250 font-black', order: 1, daysLeft: 0, isExpired: true };
            }
            const fiveDaysMs = 5 * 24 * 60 * 60 * 1000;
            if (diff < fiveDaysMs) {
              const daysLeft = Math.max(1, Math.ceil(diff / (24 * 60 * 60 * 1000)));
              return { label: `EXPIRING (${daysLeft}d left)`, color: 'bg-amber-50 text-amber-700 border-amber-300 font-black animate-pulse', order: 1, daysLeft, isExpired: false };
            }
            return { label: 'SUBSCRIBED', color: 'bg-emerald-50 text-emerald-700 border-emerald-250', order: 2, daysLeft: Math.ceil(diff / (24 * 60 * 60 * 1000)), isExpired: false };
          };

          // Filtering
          const filteredStudents = students.filter(s => {
            const matchesQuery =
              (s.name || '').toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
              (s.roll_number || '').toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
              (s.username || '').toLowerCase().includes(studentSearchQuery.toLowerCase());

            if (!matchesQuery) return false;

            // Course filter
            if (filterCourse !== 'ALL') {
              if ((s.course || 'JEE').toUpperCase() !== filterCourse.toUpperCase()) return false;
            }

            // Subscription status filter
            if (filterSubscription !== 'ALL') {
              const subInfo = getExpiryInfo(s);
              const isActive = s.is_active !== 0;

              if (filterSubscription === 'ACTIVE_ACC' && !isActive) return false;
              if (filterSubscription === 'INACTIVE_ACC' && isActive) return false;

              if (filterSubscription === 'ACTIVE_PREM' && subInfo.label !== 'SUBSCRIBED' && !subInfo.label.startsWith('EXPIRING')) return false;
              if (filterSubscription === 'EXPIRED_PREM' && subInfo.label !== 'EXPIRED') return false;
              if (filterSubscription === 'FREE_ACC' && subInfo.label !== 'FREE ACCESS') return false;
            }

            return true;
          });

          // Sorting (Expiring/Expired first, then Active Subscriptions, then Free Access. Sub-sort by created_at desc)
          const sortedStudents = [...filteredStudents].sort((a, b) => {
            const infoA = getExpiryInfo(a);
            const infoB = getExpiryInfo(b);
            if (infoA.order !== infoB.order) {
              return infoA.order - infoB.order;
            }
            const timeA = new Date(a.created_at || 0).getTime();
            const timeB = new Date(b.created_at || 0).getTime();
            return timeB - timeA;
          });

          // Pagination
          const studentsPerPage = 10;
          const totalStudentPages = Math.ceil(sortedStudents.length / studentsPerPage);
          const currentStudentPage = Math.min(studentCurrentPage, totalStudentPages || 1);
          const startIndex = (currentStudentPage - 1) * studentsPerPage;
          const paginatedStudents = sortedStudents.slice(startIndex, startIndex + studentsPerPage);

          const urgentStudents = sortedStudents.filter(s => getExpiryInfo(s).order === 1);

          return (
            <div className="space-y-6">
              {/* Top Urgent Attention Alert Banner for Expiring/Expired Subscriptions */}
              {urgentStudents.length > 0 && (
                <div className="bg-amber-50 border border-amber-250 rounded-3xl p-5 shadow-sm flex items-start gap-4 animate-pulse">
                  <div className="bg-amber-500 text-white p-2 rounded-xl">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-800 uppercase tracking-wide">Action Required: Subscriptions Expiring Soon / Expired</h4>
                    <p className="text-slate-500 text-xs font-semibold mt-1">
                      There are {urgentStudents.length} student account(s) whose subscription is ending within 5 days or has expired. They have been temporarily floated to the top of your list for priority review.
                    </p>
                  </div>
                </div>
              )}

              {/* Main Directory Container */}
              <div className="bg-white border border-gray-250 rounded-3xl p-6 shadow-sm">
                
                {/* Search Bar & Action Buttons Header Row */}
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <GraduationCap className="w-6 h-6 text-blue-600" />
                    <div>
                      <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Students Directory</h3>
                      <p className="text-slate-400 text-xs font-semibold mt-0.5">Manage enrolled student profiles, target courses, and custom billing rules.</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Search Field */}
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search student name, roll, username..."
                        value={studentSearchQuery}
                        onChange={(e) => {
                          setStudentSearchQuery(e.target.value);
                          setStudentCurrentPage(1);
                        }}
                        className="w-full pl-11 pr-4 py-2.5 border border-gray-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-xs text-gray-800 bg-slate-50/50"
                      />
                    </div>

                    {/* Course Filter */}
                    <select
                      value={filterCourse}
                      onChange={(e) => {
                        setFilterCourse(e.target.value);
                        setStudentCurrentPage(1);
                      }}
                      className="px-3.5 py-2.5 border border-gray-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-xs text-gray-700 bg-white cursor-pointer"
                    >
                      <option value="ALL">All Courses</option>
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
                        <option value="CTETE">CTETE</option>
                        <option value="UPTET">UPTET</option>
                        <option value="KVS">KVS</option>
                      </optgroup>
                      <optgroup label="Other">
                        <option value="JEE">JEE</option>
                        <option value="NEET">NEET</option>
                      </optgroup>
                    </select>

                    {/* Subscription Status Filter */}
                    <select
                      value={filterSubscription}
                      onChange={(e) => {
                        setFilterSubscription(e.target.value);
                        setStudentCurrentPage(1);
                      }}
                      className="px-3.5 py-2.5 border border-gray-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-xs text-gray-700 bg-white cursor-pointer"
                    >
                      <option value="ALL">All Account Statuses</option>
                      <option value="ACTIVE_ACC">Active Accounts</option>
                      <option value="INACTIVE_ACC">Inactive Accounts</option>
                      <option value="EXPIRED_PREM">Expired Subscribers</option>
                    </select>

                    {/* Bulk Import Button */}
                    <button
                      onClick={() => setShowBulkImportModal(true)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase px-5 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Bulk Import</span>
                    </button>

                    {/* Add Student Button */}
                    <button
                      onClick={openAddStudentModal}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase px-5 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Student</span>
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-12 text-gray-500 font-semibold animate-pulse">Loading students directory...</div>
                ) : sortedStudents.length === 0 ? (
                  <div className="border border-dashed border-gray-200 rounded-3xl p-12 text-center text-gray-400 select-none">
                    <GraduationCap className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    <p className="text-sm font-extrabold text-slate-700 uppercase tracking-tight">No Students Found</p>
                    <p className="text-[11px] font-semibold mt-1">Try matching another query or add a new student account profile.</p>
                  </div>
                ) : (
                  <div>
                    {/* Bulk Action Alert Banner */}
                    {selectedStudentIds.length > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in mb-6 select-none">
                        <div className="flex items-center gap-2">
                          <CheckSquare className="w-5 h-5 text-blue-600" />
                          <span className="text-xs font-extrabold text-slate-800 uppercase">
                            Selected <span className="text-blue-700 font-black">{selectedStudentIds.length}</span> Student(s)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleBulkActiveStatus(1)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-705 text-white text-xs font-black uppercase rounded-lg shadow-sm transition-all cursor-pointer"
                          >
                            Mark Active
                          </button>
                          <button
                            onClick={() => handleBulkActiveStatus(0)}
                            className="px-4 py-2 bg-red-600 hover:bg-red-705 text-white text-xs font-black uppercase rounded-lg shadow-sm transition-all cursor-pointer"
                          >
                            Mark Inactive
                          </button>
                          <button
                            onClick={() => setSelectedStudentIds([])}
                            className="px-4 py-2 bg-slate-105 hover:bg-slate-200 text-slate-700 text-xs font-black uppercase rounded-lg transition-all cursor-pointer"
                          >
                            Clear Selection
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="overflow-x-auto border border-gray-150 rounded-2xl">
                      <table className="w-full text-left border-collapse text-xs md:text-sm">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-150 text-gray-500 font-black uppercase text-[10px] tracking-wider select-none">
                            <th className="p-4 pl-6 w-10">
                              <input
                                type="checkbox"
                                checked={paginatedStudents.length > 0 && paginatedStudents.every(s => selectedStudentIds.includes(String(s.id)))}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    const idsToAdd = paginatedStudents.map(s => String(s.id));
                                    setSelectedStudentIds(prev => Array.from(new Set([...prev, ...idsToAdd])));
                                  } else {
                                    const idsToRemove = paginatedStudents.map(s => String(s.id));
                                    setSelectedStudentIds(prev => prev.filter(id => !idsToRemove.includes(id)));
                                  }
                                }}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                              />
                            </th>
                            <th className="p-4">Student Name</th>
                            <th className="p-4">Roll Number</th>
                            <th className="p-4">Username / Password</th>
                            <th className="p-4">Target Course</th>
                            <th className="p-4">Subscription Plan</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Expires At</th>
                            <th className="p-4 text-center pr-6">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                          {paginatedStudents.map((student) => {
                            const expiryInfo = getExpiryInfo(student);
                            return (
                              <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-4 pl-6 w-10">
                                  <input
                                    type="checkbox"
                                    checked={selectedStudentIds.includes(String(student.id))}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedStudentIds(prev => [...prev, String(student.id)]);
                                      } else {
                                        setSelectedStudentIds(prev => prev.filter(id => id !== String(student.id)));
                                      }
                                    }}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                  />
                                </td>
                                <td className="p-4 font-bold text-gray-900">{student.name}</td>
                                <td className="p-4 text-slate-700 font-bold">{student.roll_number}</td>
                                <td className="p-4">
                                  <div className="space-y-0.5">
                                    <span className="text-blue-600 font-bold">{student.username}</span>
                                    <span className="block text-[10px] font-mono text-gray-400 font-bold">Pass: {student.password || '—'}</span>
                                  </div>
                                </td>
                                <td className="p-4 font-bold text-gray-800 uppercase">{student.course || 'JEE'}</td>
                                <td className="p-4">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleToggleSubscription(student.id)}
                                      className={`px-3 py-1 text-[9px] font-black rounded-lg border transition-all cursor-pointer ${expiryInfo.color} shadow-sm`}
                                      title="Toggle default 30-day access subscription"
                                    >
                                      {expiryInfo.label}
                                    </button>
                                    <button
                                      onClick={() => {
                                        setCustomExpiryStudentId(String(student.id));
                                        setCustomExpiryDate(student.subscription_expires_at ? student.subscription_expires_at.split('T')[0] : '');
                                        setShowCustomExpiryModal(true);
                                      }}
                                      className="p-1 text-slate-450 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                                      title="Set custom expiry date"
                                    >
                                      <Calendar className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center gap-3 select-none">
                                    <label className="inline-flex items-center gap-1 cursor-pointer">
                                      <input
                                        type="radio"
                                        name={`status-${student.id}`}
                                        checked={student.is_active !== 0}
                                        onChange={() => {
                                          if (student.is_active === 0) {
                                            handleToggleActive(student.id);
                                          }
                                        }}
                                        className="w-3.5 h-3.5 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                                      />
                                      <span className={`text-[10px] font-black uppercase tracking-wider ${student.is_active !== 0 ? 'text-blue-700 font-extrabold' : 'text-slate-400'}`}>Active</span>
                                    </label>
                                    <label className="inline-flex items-center gap-1 cursor-pointer">
                                      <input
                                        type="radio"
                                        name={`status-${student.id}`}
                                        checked={student.is_active === 0}
                                        onChange={() => {
                                          if (student.is_active !== 0) {
                                            handleToggleActive(student.id);
                                          }
                                        }}
                                        className="w-3.5 h-3.5 text-red-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                                      />
                                      <span className={`text-[10px] font-black uppercase tracking-wider ${student.is_active === 0 ? 'text-red-700 font-extrabold' : 'text-slate-400'}`}>Inactive</span>
                                    </label>
                                  </div>
                                </td>
                                <td className="p-4 text-slate-500 font-bold">
                                  {student.subscription_expires_at ? new Date(student.subscription_expires_at).toLocaleDateString('en-IN', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                  }) : '—'}
                                </td>
                                <td className="p-4 text-center pr-6">
                                  <button
                                    onClick={() => handleDeleteStudent(student.id)}
                                    className="text-gray-400 hover:text-red-650 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                                    title="Remove Student"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Controls Footer block */}
                    {totalStudentPages > 1 && (
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                        <div className="text-slate-400 text-xs font-semibold select-none">
                          Showing <span className="font-bold text-slate-600">{startIndex + 1}</span> to{' '}
                          <span className="font-bold text-slate-600">
                            {Math.min(startIndex + studentsPerPage, sortedStudents.length)}
                          </span>{' '}
                          of <span className="font-bold text-slate-600">{sortedStudents.length}</span> students
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setStudentCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentStudentPage === 1}
                            className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent rounded-xl text-xs font-extrabold transition-all cursor-pointer"
                          >
                            Previous
                          </button>

                          <div className="flex items-center gap-1 select-none">
                            {Array.from({ length: totalStudentPages }, (_, i) => i + 1).map(page => (
                              <button
                                key={page}
                                onClick={() => setStudentCurrentPage(page)}
                                className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${
                                  currentStudentPage === page
                                    ? 'bg-blue-600 text-white shadow shadow-blue-500/15'
                                    : 'text-slate-650 hover:bg-slate-100'
                                }`}
                              >
                                {page}
                              </button>
                            ))}
                          </div>

                          <button
                            onClick={() => setStudentCurrentPage(prev => Math.min(totalStudentPages, prev + 1))}
                            disabled={currentStudentPage === totalStudentPages}
                            className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent rounded-xl text-xs font-extrabold transition-all cursor-pointer"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Add New Student Dialog / Modal */}
              {showAddStudentModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in select-none">
                  <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 animate-slide-up">
                    {/* Modal Header */}
                    <div className="bg-[#0f294a] text-white px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Plus className="w-5 h-5 text-purple-400" />
                        <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-100">Add New Student Account</h3>
                      </div>
                      <button
                        onClick={() => setShowAddStudentModal(false)}
                        className="text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleAddStudent} className="p-6 space-y-4">
                      {sError && (
                        <div className="bg-red-50 text-red-700 text-xs font-semibold p-3.5 rounded-xl border border-red-200 animate-shake">
                          {sError}
                        </div>
                      )}
                      {sSuccess && (
                        <div className="bg-green-50 text-green-700 text-xs font-semibold p-3.5 rounded-xl border border-green-200">
                          {sSuccess}
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Student Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Soham Nandanwar"
                          value={sName}
                          onChange={(e) => setSName(e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-sm text-gray-800"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Roll Number</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. PREPAP2026001"
                          value={sRollNumber}
                          onChange={(e) => setSRollNumber(e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-sm text-gray-800"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Username</label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                          <input
                            type="text"
                            required
                            placeholder="soham_student"
                            value={sUsername}
                            onChange={(e) => setSUsername(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 border border-gray-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-sm text-gray-800"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Password</label>
                        <div className="relative">
                          <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                          <input
                            type={showSPassword ? 'text' : 'password'}
                            required
                            placeholder="Create password"
                            value={sPassword}
                            onChange={(e) => setSPassword(e.target.value)}
                            className="w-full pl-11 pr-10 py-2.5 border border-gray-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-sm text-gray-800"
                          />
                          <button
                            type="button"
                            onClick={() => setShowSPassword(!showSPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-650 cursor-pointer flex items-center justify-center"
                          >
                            {showSPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Target Course / Category</label>
                        <select
                          value={sCourse}
                          onChange={(e) => setSCourse(e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-sm text-gray-700 bg-white cursor-pointer"
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
                            <option value="CTETE">CTETE</option>
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

                      <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setShowAddStudentModal(false)}
                          className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl uppercase tracking-wider shadow-md hover:shadow-lg transition-colors cursor-pointer"
                        >
                          Create Account
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Bulk Student Import Modal Dialog */}
              {showBulkImportModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in select-none">
                  <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 animate-slide-up">
                    {/* Modal Header */}
                    <div className="bg-[#0f294a] text-white px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Upload className="w-5 h-5 text-blue-400" />
                        <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-100">Bulk Import Students</h3>
                      </div>
                      <button
                        onClick={() => setShowBulkImportModal(false)}
                        className="text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleBulkImportSubmit} className="p-6 space-y-4">
                      {/* Explanatory Info Alert */}
                      <div className="bg-slate-50 border border-slate-205 rounded-xl p-3.5 text-[11px] text-slate-500 font-semibold leading-relaxed">
                        <p className="font-bold text-slate-700 mb-1">CSV Format / Copy-Paste Rules:</p>
                        <p>Provide student credentials, one line per student. Separate columns with commas:</p>
                        <p className="font-mono text-[10px] bg-slate-100 px-2 py-1 rounded text-blue-700 mt-1 select-all font-bold">
                          Name, Roll Number, Username, Password, Target Course, Expiry Date (YYYY-MM-DD)
                        </p>
                        <p className="mt-2 text-slate-500 font-bold">* Course options: e.g. JEE, NEET, NDA, CTET, SSC CGL.</p>
                        <p className="text-emerald-600 font-bold">* Expiry Date format: YYYY-MM-DD. If omitted or empty, account defaults to Free Access.</p>
                      </div>

                      <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Paste CSV Data</label>
                        <textarea
                          rows={6}
                          required
                          placeholder="e.g.&#10;Amit Kumar,VU1F2026101,amit,password123,JEE,2026-08-30&#10;Priya Sharma,VU1F2026102,priya,pass456,NEET"
                          value={bulkImportText}
                          onChange={(e) => setBulkImportText(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-xs text-gray-800 font-mono leading-normal bg-slate-50/50"
                        />
                      </div>

                      {/* File upload option helper */}
                      <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Or Choose CSV File</label>
                        <input
                          type="file"
                          accept=".csv, .txt"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (evt) => {
                                const text = evt.target?.result;
                                if (typeof text === 'string') {
                                  setBulkImportText(text);
                                }
                              };
                              reader.readAsText(file);
                            }
                          }}
                          className="w-full text-xs font-semibold text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setShowBulkImportModal(false)}
                          className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl uppercase tracking-wider shadow-md hover:shadow-lg transition-colors cursor-pointer"
                        >
                          Import Accounts
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Set Custom Expiry Modal Dialog */}
              {showCustomExpiryModal && customExpiryStudentId && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in select-none">
                  <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-200 animate-slide-up">
                    <div className="bg-[#0f294a] text-white px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-400" />
                        <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-100">Set Custom Expiry Date</h3>
                      </div>
                      <button
                        onClick={() => {
                          setShowCustomExpiryModal(false);
                          setCustomExpiryStudentId(null);
                        }}
                        className="text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-6 space-y-4">
                      <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Subscription Expires On</label>
                        <input
                          type="date"
                          value={customExpiryDate}
                          onChange={(e) => setCustomExpiryDate(e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-sm text-gray-800"
                        />
                        <p className="text-[10px] text-gray-450 font-semibold mt-1">
                          Leave blank or clear the date picker to cancel subscription access completely.
                        </p>
                      </div>

                      <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => {
                            setShowCustomExpiryModal(false);
                            setCustomExpiryStudentId(null);
                          }}
                          className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveExpiry(customExpiryStudentId, customExpiryDate)}
                          className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl uppercase tracking-wider shadow-md hover:shadow-lg transition-colors cursor-pointer"
                        >
                          Save Expiry
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Tab Contents: Question Bank Sets */}
        {activeTab === 'question_bank' && (() => {
          const categorySubjects = {
            JEE: ['Physics', 'Chemistry', 'Math'],
            NEET: ['Physics', 'Chemistry', 'Biology']
          };
          const activeSubjects = categorySubjects[bankCategory];
          const getFilteredSets = (subject: string) => {
            return chapterSets.filter(
              (set) => 
                (set.exam?.toUpperCase() === bankCategory) && 
                (set.subject?.toLowerCase() === subject.toLowerCase() ||
                 (subject === 'Math' && (set.subject?.toLowerCase()?.includes('math') || set.subject?.toLowerCase()?.includes('mathematics'))) ||
                 (subject === 'Biology' && (set.subject?.toLowerCase()?.includes('bio') || set.subject?.toLowerCase()?.includes('botany') || set.subject?.toLowerCase()?.includes('zoology'))))
            );
          };

          return (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              {/* Question Bank Header and Controls */}
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 border-b border-slate-100 pb-6">
                <div>
                  <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                    <BookOpen className="w-5.5 h-5.5 text-blue-600" />
                    <span>Question Bank Repository</span>
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold mt-1">
                    Manage and upload chapter-wise question sets loaded in the general pool.
                  </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                  {/* Category Tabs */}
                  <div className="bg-slate-100/80 p-1 rounded-2xl flex border border-slate-200 shadow-inner w-full sm:w-auto">
                    <button
                      onClick={() => {
                        setBankCategory('JEE');
                        if (modalSubject === 'Biology') setModalSubject('Physics');
                      }}
                      className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                        bankCategory === 'JEE'
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/10'
                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${bankCategory === 'JEE' ? 'bg-blue-300' : 'bg-slate-400'}`} />
                      JEE Bank
                    </button>
                    <button
                      onClick={() => {
                        setBankCategory('NEET');
                        if (modalSubject === 'Mathematics') setModalSubject('Physics');
                      }}
                      className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                        bankCategory === 'NEET'
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/10'
                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${bankCategory === 'NEET' ? 'bg-emerald-300' : 'bg-slate-400'}`} />
                      NEET Bank
                    </button>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => openAddModal(bankCategory, 'Physics')}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-905 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer uppercase tracking-wider border border-slate-700/10"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Sets</span>
                    </button>

                    <button
                      onClick={fetchChapterSets}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-extrabold text-xs rounded-xl shadow-sm transition-all cursor-pointer bg-white"
                      title="Refresh lists"
                    >
                      <RefreshCw className={`w-4 h-4 ${loadingSets ? 'animate-spin' : ''}`} />
                      <span>Refresh</span>
                    </button>
                  </div>
                </div>
              </div>

              {loadingSets ? (
                <div className="text-center py-24 text-slate-500 font-semibold flex flex-col items-center justify-center gap-3">
                  <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
                  <span className="text-sm font-bold tracking-wide">Retrieving Question Bank sets...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {activeSubjects.map((subject) => {
                    const sets = getFilteredSets(subject);
                    // Determine subject theme color
                    const isJEE = bankCategory === 'JEE';
                    
                    return (
                      <div key={subject} className="bg-slate-50/50 border border-slate-200/80 rounded-3xl p-5 flex flex-col h-[540px]">
                        {/* Subject Column Header */}
                        <div className="flex justify-between items-center mb-5 pb-4 border-b border-slate-200">
                          <div className="flex items-center gap-2.5">
                            <span className={`w-3 h-3 rounded-full ${
                              isJEE ? 'bg-blue-600' : 'bg-emerald-600'
                            }`} />
                            <h4 className="font-black text-slate-800 text-sm uppercase tracking-wider">
                              {subject}
                            </h4>
                            <span className="text-[10px] bg-slate-200 text-slate-650 font-black px-2.5 py-0.5 rounded-full border border-slate-300/40">
                              {sets.length} {sets.length === 1 ? 'Set' : 'Sets'}
                            </span>
                          </div>
                          
                          <button
                            onClick={() => openAddModal(bankCategory, subject)}
                            className={`flex items-center gap-1 px-3 py-1.5 text-white font-extrabold text-[10px] uppercase rounded-xl shadow-sm hover:shadow transition-all cursor-pointer ${
                              isJEE ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'
                            }`}
                            title={`Add new ${subject} set`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Set</span>
                          </button>
                        </div>

                        {/* Sets list scrollable area */}
                        <div className="flex-1 overflow-y-auto pr-1 space-y-3.5 custom-scrollbar">
                          {sets.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 border border-dashed border-slate-200 rounded-2xl bg-white/50">
                              <BookOpen className="w-9 h-9 text-slate-300 mb-2" />
                              <p className="text-xs font-black text-slate-500">No question sets uploaded</p>
                              <p className="text-[10px] text-slate-400 mt-0.5 max-w-[180px]">Upload an Excel file to get started with this subject.</p>
                              <button
                                onClick={() => openAddModal(bankCategory, subject)}
                                className={`text-[10px] font-black mt-3 hover:underline cursor-pointer ${
                                  isJEE ? 'text-blue-600' : 'text-emerald-600'
                                }`}
                              >
                                Upload First Set
                              </button>
                            </div>
                          ) : (
                            sets.map((set, idx) => (
                              <div
                                key={idx}
                                onClick={() => handleOpenQuestionsModal(set.exam, set.subject, set.chapter)}
                                className="bg-white border border-slate-150 hover:border-slate-350 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow transition-all group cursor-pointer hover:bg-slate-50/40"
                              >
                                <div className="flex-1 min-w-0 pr-3">
                                  <p className="font-extrabold text-slate-800 text-xs truncate" title={set.chapter}>
                                    {set.chapter}
                                  </p>
                                  <div className="flex items-center gap-2.5 mt-1.5">
                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${
                                      isJEE 
                                        ? 'bg-blue-50 text-blue-700 border-blue-100' 
                                        : 'bg-emerald-50 text-emerald-750 border-emerald-100'
                                    }`}>
                                      {set.question_count} Qs
                                    </span>
                                    {set.year && (
                                      <span className="text-[9px] text-slate-400 font-bold bg-slate-50 px-1.5 py-0.5 rounded border border-slate-150/50">
                                        Yr {set.year}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteChapterSet(set.exam, set.subject, set.chapter);
                                  }}
                                  className="text-slate-400 hover:text-red-650 hover:bg-red-50 p-2 rounded-xl transition-colors cursor-pointer opacity-80 group-hover:opacity-100"
                                  title="Delete Set"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

        {/* Tab Contents: Manage Categories */}
        {activeTab === 'categories' && (() => {
          // Filter categories
          const filteredCategories = categories.filter(cat =>
            (cat.title || '').toLowerCase().includes(categorySearchQuery.toLowerCase()) ||
            (cat.id || '').toLowerCase().includes(categorySearchQuery.toLowerCase())
          );

          // Sort by created_at desc
          const sortedCategories = [...filteredCategories].sort((a, b) => {
            const timeA = new Date(a.created_at || 0).getTime();
            const timeB = new Date(b.created_at || 0).getTime();
            return timeB - timeA;
          });

          // Pagination
          const categoriesPerPage = 8;
          const totalCategoryPages = Math.ceil(sortedCategories.length / categoriesPerPage);
          const currentCategoryPage = Math.min(categoryCurrentPage, totalCategoryPages || 1);
          const startCategoryIndex = (currentCategoryPage - 1) * categoriesPerPage;
          const paginatedCategories = sortedCategories.slice(startCategoryIndex, startCategoryIndex + categoriesPerPage);

          return (
            <div className="space-y-6">
              {/* Main Directory Card */}
              <div className="bg-white border border-gray-250 rounded-3xl p-6 shadow-sm">
                
                {/* Search Bar & Header Buttons */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <Layers className="w-6 h-6 text-blue-600" />
                    <div>
                      <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Exam Categories</h3>
                      <p className="text-slate-400 text-xs font-semibold mt-0.5">Manage and organize dynamic courses, target streams, and theme setups.</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Search Field */}
                    <div className="relative w-full sm:w-80">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search categories..."
                        value={categorySearchQuery}
                        onChange={(e) => {
                          setCategorySearchQuery(e.target.value);
                          setCategoryCurrentPage(1);
                        }}
                        className="w-full pl-11 pr-4 py-2.5 border border-gray-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-xs text-gray-800 bg-slate-50/50"
                      />
                    </div>

                    {/* Create Category Button */}
                    <button
                      onClick={openAddCategoryModal}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase px-5 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create Category</span>
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-12 text-gray-500 font-semibold animate-pulse">Loading exam categories...</div>
                ) : sortedCategories.length === 0 ? (
                  <div className="border border-dashed border-gray-200 rounded-3xl p-12 text-center text-gray-400 select-none">
                    <Layers className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    <p className="text-sm font-extrabold text-slate-700 uppercase tracking-tight">No Categories Found</p>
                    <p className="text-[11px] font-semibold mt-1">Try another search string or create a new category.</p>
                  </div>
                ) : (
                  <div>
                    {/* Categories Grid List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {paginatedCategories.map((cat) => (
                        <div
                          key={cat.id}
                          className="bg-white border border-slate-205 rounded-3xl p-5 hover:shadow-md transition-all flex items-center justify-between group relative overflow-hidden"
                          style={{
                            borderLeftWidth: '5px',
                            borderLeftColor: cat.color === 'emerald' ? '#10b981' : cat.color === 'red' ? '#ef4444' : cat.color === 'amber' ? '#f59e0b' : '#3b82f6'
                          }}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-extrabold text-sm text-slate-800 group-hover:text-blue-600 transition-colors uppercase leading-snug">
                                {cat.title}
                              </h4>
                              <span className="bg-slate-100 text-slate-600 text-[8px] font-black px-1.5 py-0.5 rounded border border-slate-150 uppercase tracking-wider">
                                {cat.id}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-semibold mt-2.5">
                              Theme Icon: <span className="text-slate-600 font-bold uppercase">{cat.icon || 'BookOpen'}</span>
                            </p>
                            <p className="text-[10px] text-slate-405 font-medium mt-1">
                              Created at: <span className="font-bold text-slate-500">{cat.created_at ? new Date(cat.created_at).toLocaleDateString() : 'System Seed'}</span>
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="p-2 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-650 transition-colors cursor-pointer"
                            title="Delete Category"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Pagination Footer */}
                    {totalCategoryPages > 1 && (
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                        <div className="text-slate-400 text-xs font-semibold select-none">
                          Showing <span className="font-bold text-slate-600">{startCategoryIndex + 1}</span> to{' '}
                          <span className="font-bold text-slate-600">
                            {Math.min(startCategoryIndex + categoriesPerPage, sortedCategories.length)}
                          </span>{' '}
                          of <span className="font-bold text-slate-600">{sortedCategories.length}</span> categories
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setCategoryCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentCategoryPage === 1}
                            className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent rounded-xl text-xs font-extrabold transition-all cursor-pointer"
                          >
                            Previous
                          </button>

                          <div className="flex items-center gap-1 select-none">
                            {Array.from({ length: totalCategoryPages }, (_, i) => i + 1).map(page => (
                              <button
                                key={page}
                                onClick={() => setCategoryCurrentPage(page)}
                                className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${
                                  currentCategoryPage === page
                                    ? 'bg-blue-600 text-white shadow shadow-blue-500/15'
                                    : 'text-slate-650 hover:bg-slate-100'
                                }`}
                              >
                                {page}
                              </button>
                            ))}
                          </div>

                          <button
                            onClick={() => setCategoryCurrentPage(prev => Math.min(totalCategoryPages, prev + 1))}
                            disabled={currentCategoryPage === totalCategoryPages}
                            className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent rounded-xl text-xs font-extrabold transition-all cursor-pointer"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Create Category Modal / Dialog */}
              {showAddCategoryModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in select-none">
                  <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 animate-slide-up">
                    {/* Modal Header */}
                    <div className="bg-[#0f294a] text-white px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Plus className="w-5 h-5 text-blue-400" />
                        <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-100">Create Exam Category</h3>
                      </div>
                      <button
                        onClick={() => setShowAddCategoryModal(false)}
                        className="text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleCreateCategory} className="p-6 space-y-4">
                      <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Category ID (Unique, lowercase)</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. ssc, banking, jee, cat"
                          value={newCatId}
                          onChange={(e) => setNewCatId(e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-sm text-gray-800"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Category Title (Display Name)</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. SSC CGL, Banking Exams"
                          value={newCatTitle}
                          onChange={(e) => setNewCatTitle(e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-sm text-gray-800"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Theme Icon</label>
                        <select
                          value={newCatIcon}
                          onChange={(e) => setNewCatIcon(e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-sm text-gray-700 bg-white cursor-pointer"
                        >
                          <option value="BookOpen">BookOpen (Teaching)</option>
                          <option value="GraduationCap">GraduationCap (Education)</option>
                          <option value="Activity">Activity (Medical/NEET)</option>
                          <option value="Shield">Shield (Defence/Police)</option>
                          <option value="Layers">Layers (General)</option>
                          <option value="BarChart2">BarChart2 (Finance/SSC)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Theme Color Accent</label>
                        <select
                          value={newCatColor}
                          onChange={(e) => setNewCatColor(e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-sm text-gray-700 bg-white cursor-pointer"
                        >
                          <option value="blue">Blue</option>
                          <option value="emerald">Emerald Green</option>
                          <option value="red">Ruby Red</option>
                          <option value="amber">Amber Yellow</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setShowAddCategoryModal(false)}
                          className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl uppercase tracking-wider shadow-md hover:shadow-lg transition-colors cursor-pointer"
                        >
                          Save Category
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {activeTab === 'mock_tests' && (
          <TeacherDashboard isEmbedded={true} />
        )}

        {activeTab === 'import_questions' && (
          <ImportQuestions isEmbedded={true} />
        )}

        {activeTab === 'auto_free' && (
          <div className="space-y-8 select-none">
            {/* Top Banner Header */}
            <div className="bg-gradient-to-r from-[#0B1F4D] via-[#0B1F4D] to-[#1E88E5] text-white rounded-3xl p-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
              <div className="space-y-2 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs font-black text-amber-300 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>Automated Free Test Scheduler</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Auto-Publish 2 Free Tests / Week
                </h2>
                <p className="text-xs sm:text-sm text-blue-100 font-medium max-w-xl leading-relaxed">
                  Automatically selects random questions (under 30 Qs per test) from your 500+ question bank pool and publishes 2 Free Mock Tests every week for chosen course categories.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 relative z-10 w-full md:w-auto">
                <button
                  type="button"
                  onClick={handleTriggerAutoFreeTest}
                  disabled={generatingAutoTest}
                  className="w-full sm:w-auto px-6 py-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-xl hover:shadow-2xl active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {generatingAutoTest ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Generating Free Test...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-current" />
                      <span>Trigger Auto-Generate Free Test Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Config & Status Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Automation Config Card */}
              <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <h3 className="text-base font-black text-[#0B1F4D] uppercase tracking-wide flex items-center gap-2">
                    <Target className="w-5 h-5 text-[#1E88E5]" />
                    <span>Target Course Access Settings</span>
                  </h3>
                  <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 text-emerald-800 text-xs font-black">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Active 2 Tests / Week</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-xs text-slate-600 font-bold">
                    Select which course categories should receive automated weekly free tests:
                  </p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['JEE', 'NEET', 'SSC', 'Railways', 'Banking', 'UPSC', 'Defence', 'MHT CET'].map((course) => {
                      const isChecked = targetFreeCourses.includes(course);
                      return (
                        <button
                          key={course}
                          type="button"
                          onClick={() => toggleCourseTarget(course)}
                          className={`p-4 rounded-2xl border text-xs font-black uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer ${
                            isChecked 
                              ? 'bg-blue-50 border-[#1E88E5] text-[#0B1F4D] shadow-sm' 
                              : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'
                          }`}
                        >
                          <span>{course}</span>
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                            isChecked ? 'bg-[#1E88E5] text-white' : 'bg-slate-200 text-transparent'
                          }`}>✓</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-[#0B1F4D] uppercase tracking-wide mb-2">
                      Questions Limit Per Test (Max 30 Qs)
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={30}
                      value={questionsPerAutoTest}
                      onChange={(e) => setQuestionsPerAutoTest(Math.min(30, Math.max(5, parseInt(e.target.value) || 30)))}
                      className="w-full text-sm font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                    <p className="text-[10px] text-slate-400 font-semibold mt-1">
                      Ensures speed tests remain concise (under 30 questions limit).
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-[#0B1F4D] uppercase tracking-wide mb-2">
                      Automated Schedule Frequency
                    </label>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-[#0B1F4D] flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-[#1E88E5]" />
                        2 Tests / Week (Every Mon & Thu)
                      </span>
                      <span className="text-[9px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded uppercase font-bold">Auto</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Question Bank Status Card */}
              <div className="bg-[#0B1F4D] text-white rounded-3xl p-6 sm:p-8 border border-blue-950 shadow-md space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-amber-300">
                    <Award className="w-5 h-5" />
                    <h4 className="font-black text-sm uppercase tracking-wide">Question Bank Pool</h4>
                  </div>
                  
                  <div className="bg-white/10 rounded-2xl p-5 border border-white/15 space-y-3">
                    <p className="text-[10px] font-extrabold uppercase text-blue-200 tracking-wider">Available Question Pool</p>
                    <h3 className="text-3xl font-black text-white">500+ Questions</h3>
                    <p className="text-xs text-blue-200 font-medium">Ready for automated rotation across all selected course categories.</p>
                  </div>

                  <div className="space-y-2 text-xs text-blue-100 font-medium">
                    <div className="flex justify-between py-1 border-b border-white/10">
                      <span>Tests Published / Week:</span>
                      <strong className="text-white font-extrabold">2 Free Tests</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/10">
                      <span>Questions / Test:</span>
                      <strong className="text-amber-300 font-extrabold">{questionsPerAutoTest} Qs (Under 30)</strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Target Courses:</span>
                      <strong className="text-emerald-300 font-extrabold">{targetFreeCourses.length} Courses Selected</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={handleTriggerAutoFreeTest}
                    disabled={generatingAutoTest}
                    className="w-full py-3.5 bg-[#1E88E5] hover:bg-blue-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Generate Free Test Now</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>

      {/* Add Set Modal Overlay */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-[#0f294a] text-white px-6 py-4.5 flex justify-between items-center border-b border-blue-950">
              <div className="flex items-center gap-2.5">
                <div className="bg-blue-600/30 p-2 rounded-xl border border-blue-400/30 text-white flex items-center justify-center">
                  <UploadCloud className="w-5 h-5 text-blue-300" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-white">
                    Add Question Set
                  </h3>
                  <p className="text-[9px] text-blue-300/80 font-bold uppercase tracking-widest mt-0.5">Bulk Excel Upload</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleUploadSet} className="p-6 space-y-4 max-h-[calc(100vh-160px)] overflow-y-auto">
              {uploadError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-start gap-2.5 text-xs font-semibold animate-shake">
                  <AlertTriangle className="w-4.5 h-4.5 text-red-500 flex-shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {uploadSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-start gap-2.5 text-xs font-semibold animate-pulse">
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 flex-shrink-0" />
                  <span>{uploadSuccess}</span>
                </div>
              )}

              {/* Template Download & Format Info */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2.5">
                  <span className="font-extrabold text-slate-700 uppercase tracking-wider text-[10px]">Excel Upload Template Format</span>
                  <a
                    href="/api/import-questions/template"
                    download="questions_template.xlsx"
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-3 py-1.5 rounded-xl tracking-wider uppercase text-[9px] shadow-sm hover:shadow transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Template</span>
                  </a>
                </div>
                <p className="text-[10px] text-slate-500 font-semibold leading-relaxed mb-2.5">
                  Excel sheet must have row 1 as header, row 2 as instructions, and questions starting from row 3.
                </p>
                <div className="bg-white border border-slate-200 rounded-xl p-2.5 overflow-x-auto whitespace-nowrap scrollbar-thin">
                  <table className="w-full text-left text-[9px] font-mono border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400">
                        <th className="pr-3 pb-1">Col 1</th>
                        <th className="pr-3 pb-1">Col 2</th>
                        <th className="pr-3 pb-1">Col 3</th>
                        <th className="pr-3 pb-1">Col 4</th>
                        <th className="pr-3 pb-1">Col 5-8</th>
                        <th className="pr-3 pb-1">Col 9</th>
                        <th className="pr-3 pb-1">Col 10</th>
                        <th className="pr-3 pb-1">Col 11</th>
                        <th className="pr-3 pb-1">Col 12</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="text-slate-700 font-extrabold">
                        <td className="pr-3 pt-1">Exam</td>
                        <td className="pr-3 pt-1">Subject</td>
                        <td className="pr-3 pt-1">Chapter</td>
                        <td className="pr-3 pt-1">Question Text</td>
                        <td className="pr-3 pt-1">Option A-D</td>
                        <td className="pr-3 pt-1">Correct Option (a/b/c/d)</td>
                        <td className="pr-3 pt-1">Difficulty</td>
                        <td className="pr-3 pt-1">Year</td>
                        <td className="pr-3 pt-1">Explanation</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Exam Category */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Category (Exam)
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 rounded-2xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setModalExam('JEE');
                      if (modalSubject === 'Biology') setModalSubject('Physics');
                    }}
                    className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                      modalExam === 'JEE'
                        ? 'bg-blue-600 text-white shadow shadow-blue-500/10'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
                    }`}
                  >
                    JEE
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setModalExam('NEET');
                      if (modalSubject === 'Mathematics') setModalSubject('Physics');
                    }}
                    className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                      modalExam === 'NEET'
                        ? 'bg-emerald-600 text-white shadow shadow-emerald-500/10'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
                    }`}
                  >
                    NEET
                  </button>
                </div>
              </div>

              {/* Subject Selector */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                  Subject
                </label>
                <select
                  value={modalSubject}
                  onChange={(e) => setModalSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                >
                  {modalExam === 'JEE' ? (
                    <>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Mathematics">Math</option>
                    </>
                  ) : (
                    <>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Biology">Biology</option>
                    </>
                  )}
                </select>
              </div>

              {/* Chapter Name */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                  Chapter Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Optics, Electrochemistry"
                  value={modalChapter}
                  onChange={(e) => setModalChapter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder-slate-400 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Difficulty */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    Difficulty
                  </label>
                  <select
                    value={modalDifficulty}
                    onChange={(e) => setModalDifficulty(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                  >
                    <option value="hard">Hard (Mock Default)</option>
                    <option value="medium">Medium</option>
                    <option value="easy">Easy</option>
                  </select>
                </div>

                {/* Year */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    Year
                  </label>
                  <input
                    type="number"
                    required
                    value={modalYear}
                    onChange={(e) => setModalYear(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold"
                  />
                </div>
              </div>

              {/* File Upload Zone */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                  Questions File (Excel/PDF)
                </label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
                    modalFile 
                      ? 'border-emerald-500 bg-emerald-50/10' 
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-350'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".xlsx,.xls,.pdf"
                    onChange={handleModalFileChange}
                  />
                  {modalFile ? (
                    <>
                      <FileSpreadsheet className="w-9 h-9 text-emerald-600 mb-1" />
                      <p className="text-xs font-black text-emerald-700 truncate max-w-full">
                        {modalFile.name}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1 font-bold">
                        {(modalFile.size / 1024).toFixed(1)} KB • Click to change file
                      </p>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-9 h-9 text-slate-400 mb-1" />
                      <p className="text-xs font-extrabold text-slate-700">
                        Click to select Excel sheet
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                        Accepts .xlsx, .xls or .pdf format templates
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-150 mt-5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={uploadLoading}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold text-xs rounded-xl uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-55"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadLoading || !modalFile || !modalChapter.trim()}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl uppercase tracking-wider transition-all cursor-pointer shadow hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  {uploadLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving Set...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save & Return</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Questions Modal Overlay */}
      {selectedSetQuestions && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-3xl h-[85vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-[#0f294a] text-white px-6 py-4.5 flex justify-between items-center border-b border-blue-950 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="bg-blue-600/30 p-2 rounded-xl border border-blue-400/30 text-white flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-blue-300" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-white">
                    Questions in {selectedSetQuestions.chapter}
                  </h3>
                  <p className="text-[9px] text-blue-300/80 font-bold uppercase tracking-widest mt-0.5">
                    {selectedSetQuestions.exam} • {selectedSetQuestions.subject}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSetQuestions(null)}
                className="text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Questions Container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/50">
              {loadingQuestionsList ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500 font-semibold">
                  <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
                  <span>Loading questions from set...</span>
                </div>
              ) : questionsListError ? (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-start gap-2.5 text-xs font-semibold animate-shake">
                  <AlertTriangle className="w-4.5 h-4.5 text-red-500 flex-shrink-0" />
                  <span>{questionsListError}</span>
                </div>
              ) : questionsList.length === 0 ? (
                <div className="text-center py-20 text-slate-400">
                  <BookOpen className="w-12 h-12 mx-auto mb-2 text-slate-350" />
                  <p className="font-bold">No questions found in this set.</p>
                </div>
              ) : (
                questionsList.map((q, idx) => {
                  const correctOpt = q.correct_option?.toLowerCase();
                  
                  // Helper to parse options
                  let options = [q.option_a, q.option_b, q.option_c, q.option_d];
                  if (q.options) {
                    try {
                      const parsed = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
                      if (Array.isArray(parsed) && parsed.length >= 4) {
                        options = parsed;
                      }
                    } catch (e) {}
                  }

                  return (
                    <div key={q.id} className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm hover:shadow transition-all relative group/q">
                      {/* Top Bar for Question Details and Delete */}
                      <div className="flex justify-between items-start gap-4 mb-3 border-b border-slate-100 pb-2.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="bg-[#0f294a] text-white text-[10px] font-black px-2.5 py-0.5 rounded-md">
                            Q {idx + 1}
                          </span>
                          {q.difficulty && (
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${
                              q.difficulty === 'hard'
                                ? 'bg-red-50 text-red-650 border-red-100'
                                : q.difficulty === 'medium'
                                  ? 'bg-amber-50 text-amber-700 border-amber-100'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            }`}>
                              {q.difficulty}
                            </span>
                          )}
                          {q.year && (
                            <span className="text-[9px] text-slate-400 font-bold bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                              Yr {q.year}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteQuestionFromSet(q.id)}
                          className="text-slate-355 text-slate-400 hover:text-red-600 p-1.5 rounded-xl hover:bg-red-50 transition-colors cursor-pointer opacity-0 group-hover/q:opacity-100"
                          title="Delete Question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Question Text */}
                      <p className="text-slate-800 text-sm font-bold leading-relaxed mb-4 whitespace-pre-wrap">
                        {q.question_text}
                      </p>

                      {/* Options Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        {[
                          { key: 'a', val: options[0] || '' },
                          { key: 'b', val: options[1] || '' },
                          { key: 'c', val: options[2] || '' },
                          { key: 'd', val: options[3] || '' }
                        ].map((opt) => {
                          const isCorrect = correctOpt === opt.key;
                          return (
                            <div 
                              key={opt.key}
                              className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs font-semibold leading-relaxed transition-all ${
                                isCorrect 
                                  ? 'bg-emerald-50/70 border-emerald-300 text-emerald-800 font-bold' 
                                  : 'bg-slate-50/30 border-slate-150 text-slate-700'
                              }`}
                            >
                              <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black uppercase flex-shrink-0 ${
                                isCorrect 
                                  ? 'bg-emerald-600 text-white' 
                                  : 'bg-slate-150 text-slate-500 border border-slate-250'
                              }`}>
                                {opt.key}
                              </span>
                              <span className="break-words">{opt.val}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      {q.explanation && (
                        <div className="bg-blue-50/40 border border-blue-100 rounded-xl p-3.5 text-xs text-slate-700 font-medium whitespace-pre-wrap leading-relaxed">
                          <p className="font-extrabold text-[#0f294a] text-[10px] uppercase tracking-wide mb-1 flex items-center gap-1">
                            <HelpCircle className="w-3.5 h-3.5 text-[#1E88E5]" /> Explanation
                          </p>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="bg-slate-50 border-t border-slate-150 px-6 py-4.5 flex justify-end flex-shrink-0">
              <button
                type="button"
                onClick={() => setSelectedSetQuestions(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl uppercase tracking-wider shadow transition-colors cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


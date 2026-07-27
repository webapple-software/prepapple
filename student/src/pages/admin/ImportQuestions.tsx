import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowLeft, 
  RefreshCw, 
  Download, 
  HelpCircle,
  BookOpen,
  Eye,
  Sparkles
} from 'lucide-react';

interface User {
  name: string;
  role: 'admin' | 'teacher' | 'student';
}

export const EXAM_PATTERNS: Record<string, {
  name: string;
  category: string;
  duration: number; // minutes
  totalQuestions: number;
  totalMarks: number;
  marksPerQ: number;
  negativeMarks: number;
  sections: string[];
  description: string;
  sampleRows: {
    question: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_option: string;
    subject: string;
    marks: number;
    negative_marks: number;
    explanation: string;
  }[];
}> = {
  'JEE': {
    name: 'JEE Main 2026',
    category: 'JEE',
    duration: 180,
    totalQuestions: 90,
    totalMarks: 300,
    marksPerQ: 4,
    negativeMarks: 1,
    sections: ['Physics', 'Chemistry', 'Mathematics'],
    description: '180 Minutes (3 Hours) • 90 Questions (30 Physics, 30 Chemistry, 30 Maths) • +4 for Correct, -1 for Negative.',
    sampleRows: [
      {
        question: 'Two masses 2kg and 3kg are connected by a light string over a frictionless pulley. Find acceleration.',
        option_a: '2.5 m/s²',
        option_b: '1.96 m/s²',
        option_c: '4.9 m/s²',
        option_d: '9.8 m/s²',
        correct_option: 'b',
        subject: 'Physics',
        marks: 4,
        negative_marks: 1,
        explanation: 'a = (m2 - m1)g / (m1 + m2) = (3 - 2)*9.8 / 5 = 1.96 m/s².'
      },
      {
        question: 'Which of the following complexes exhibits optical isomerism?',
        option_a: '[Co(NH3)6]3+',
        option_b: 'cis-[Co(en)2Cl2]+',
        option_c: 'trans-[Co(en)2Cl2]+',
        option_d: '[Pt(NH3)2Cl2]',
        correct_option: 'b',
        subject: 'Chemistry',
        marks: 4,
        negative_marks: 1,
        explanation: 'cis-[Co(en)2Cl2]+ lacks a plane of symmetry and is non-superimposable on its mirror image.'
      },
      {
        question: 'Evaluate the definite integral ∫₀^(π/2) (sin x / (sin x + cos x)) dx.',
        option_a: 'π/2',
        option_b: 'π/4',
        option_c: 'π',
        option_d: '1',
        correct_option: 'b',
        subject: 'Mathematics',
        marks: 4,
        negative_marks: 1,
        explanation: 'Using property ∫₀^a f(x)dx = ∫₀^a f(a-x)dx, 2I = ∫₀^(π/2) 1 dx = π/2 => I = π/4.'
      }
    ]
  },
  'NEET': {
    name: 'NEET UG 2026',
    category: 'NEET',
    duration: 200,
    totalQuestions: 200,
    totalMarks: 720,
    marksPerQ: 4,
    negativeMarks: 1,
    sections: ['Physics', 'Chemistry', 'Botany', 'Zoology'],
    description: '200 Minutes (3 Hours 20 Mins) • 200 Questions (50 Physics, 50 Chem, 50 Botany, 50 Zoology) • +4 for Correct, -1 for Negative.',
    sampleRows: [
      {
        question: 'Which organelle is known as the powerhouse of the cell?',
        option_a: 'Golgi Apparatus',
        option_b: 'Mitochondria',
        option_c: 'Endoplasmic Reticulum',
        option_d: 'Lysosome',
        correct_option: 'b',
        subject: 'Zoology',
        marks: 4,
        negative_marks: 1,
        explanation: 'Mitochondria generate ATP through oxidative phosphorylation.'
      },
      {
        question: 'During photosynthesis, oxygen is evolved from which molecule?',
        option_a: 'Carbon Dioxide',
        option_b: 'Water (H2O)',
        option_c: 'Glucose',
        option_d: 'Chlorophyll',
        correct_option: 'b',
        subject: 'Botany',
        marks: 4,
        negative_marks: 1,
        explanation: 'Oxygen is released during the photolysis of water in light reaction of photosynthesis.'
      }
    ]
  },
  'SSC CGL': {
    name: 'SSC CGL Tier-1 2026',
    category: 'SSC',
    duration: 60,
    totalQuestions: 100,
    totalMarks: 200,
    marksPerQ: 2,
    negativeMarks: 0.5,
    sections: ['General Intelligence', 'General Awareness', 'Quantitative Aptitude', 'English Comprehension'],
    description: '60 Minutes (1 Hour) • 100 Questions (25 Reasoning, 25 GA, 25 Quant, 25 English) • +2 for Correct, -0.5 for Negative.',
    sampleRows: [
      {
        question: 'If A:B = 2:3 and B:C = 4:5, find A:B:C.',
        option_a: '8:12:15',
        option_b: '6:9:15',
        option_c: '2:3:5',
        option_d: '4:6:15',
        correct_option: 'a',
        subject: 'Quantitative Aptitude',
        marks: 2,
        negative_marks: 0.5,
        explanation: 'Multiply A:B by 4 and B:C by 3 => A:B:C = 8:12:15.'
      },
      {
        question: 'Who was the first Governor-General of independent India?',
        option_a: 'C. Rajagopalachari',
        option_b: 'Lord Mountbatten',
        option_c: 'Dr. Rajendra Prasad',
        option_d: 'Jawaharlal Nehru',
        correct_option: 'b',
        subject: 'General Awareness',
        marks: 2,
        negative_marks: 0.5,
        explanation: 'Lord Mountbatten was the first Governor-General of independent India (1947–1948).'
      }
    ]
  },
  'RRB NTPC': {
    name: 'Railways RRB NTPC Stage-1',
    category: 'Railways',
    duration: 90,
    totalQuestions: 100,
    totalMarks: 100,
    marksPerQ: 1,
    negativeMarks: 0.33,
    sections: ['General Awareness', 'Mathematics', 'General Intelligence & Reasoning'],
    description: '90 Minutes (1.5 Hours) • 100 Questions (40 GA, 30 Maths, 30 Reasoning) • +1 for Correct, -0.33 for Negative.',
    sampleRows: [
      {
        question: 'Where is the headquarters of ISRO located?',
        option_a: 'New Delhi',
        option_b: 'Bengaluru',
        option_c: 'Mumbai',
        option_d: 'Hyderabad',
        correct_option: 'b',
        subject: 'General Awareness',
        marks: 1,
        negative_marks: 0.33,
        explanation: 'ISRO headquarters is located in Bengaluru, Karnataka.'
      }
    ]
  },
  'IBPS PO': {
    name: 'Banking IBPS PO Prelims',
    category: 'Banking',
    duration: 60,
    totalQuestions: 100,
    totalMarks: 100,
    marksPerQ: 1,
    negativeMarks: 0.25,
    sections: ['English Language', 'Quantitative Aptitude', 'Reasoning Ability'],
    description: '60 Minutes • 100 Questions (30 English, 35 Quant, 35 Reasoning) • +1 for Correct, -0.25 for Negative.',
    sampleRows: [
      {
        question: 'A train 150m long passes a telegraph pole in 10 seconds. Find speed of train in km/h.',
        option_a: '45 km/h',
        option_b: '54 km/h',
        option_c: '60 km/h',
        option_d: '36 km/h',
        correct_option: 'b',
        subject: 'Quantitative Aptitude',
        marks: 1,
        negative_marks: 0.25,
        explanation: 'Speed = 150/10 = 15 m/s = 15 * (18/5) = 54 km/h.'
      }
    ]
  },
  'UPSC CSE': {
    name: 'UPSC Civil Services GS-1',
    category: 'UPSC',
    duration: 120,
    totalQuestions: 100,
    totalMarks: 200,
    marksPerQ: 2,
    negativeMarks: 0.66,
    sections: ['Polity & History', 'Geography & Environment', 'Economy & Current Affairs'],
    description: '120 Minutes (2 Hours) • 100 GS Questions • +2 for Correct, -0.66 for Negative.',
    sampleRows: [
      {
        question: 'Which Article of the Indian Constitution deals with Fundamental Duties?',
        option_a: 'Article 51A',
        option_b: 'Article 32',
        option_c: 'Article 21',
        option_d: 'Article 44',
        correct_option: 'a',
        subject: 'Polity & History',
        marks: 2,
        negative_marks: 0.66,
        explanation: 'Fundamental Duties were incorporated into Article 51A by the 42nd Amendment in 1976.'
      }
    ]
  },
  'MHT PCM': {
    name: 'MHT CET PCM',
    category: 'MHT CET',
    duration: 180,
    totalQuestions: 150,
    totalMarks: 200,
    marksPerQ: 1,
    negativeMarks: 0,
    sections: ['Physics', 'Chemistry', 'Mathematics'],
    description: '180 Minutes • 150 Questions (50 Physics, 50 Chem, 50 Maths) • No Negative Marking.',
    sampleRows: [
      {
        question: 'The unit of magnetic dipole moment is:',
        option_a: 'A m²',
        option_b: 'A / m',
        option_c: 'J / T',
        option_d: 'Both A and C',
        correct_option: 'd',
        subject: 'Physics',
        marks: 1,
        negative_marks: 0,
        explanation: 'Magnetic dipole moment = Current * Area (A m²) = Energy / Magnetic Field (J / T).'
      }
    ]
  }
};

export default function ImportQuestions({ isEmbedded = false }: { isEmbedded?: boolean }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Selected Exam Pattern State
  const [selectedPatternKey, setSelectedPatternKey] = useState<string>('JEE');
  const [showSampleModal, setShowSampleModal] = useState<boolean>(false);

  // File states
  const [file, setFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  
  // Default values form state
  const [exam, setExam] = useState('JEE Main 2026');
  const [subject, setSubject] = useState('Physics');
  const [chapter, setChapter] = useState('General');
  const [difficulty, setDifficulty] = useState('medium');
  const [year] = useState(new Date().getFullYear().toString());
  
  // Status states
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    inserted: number;
    skipped: number;
    errors: string[];
    message: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const activePattern = EXAM_PATTERNS[selectedPatternKey] || EXAM_PATTERNS['JEE'];

  useEffect(() => {
    const cached = localStorage.getItem('currentUser');
    if (!cached) {
      navigate('/');
      return;
    }
    const user = JSON.parse(cached);
    if (user.role !== 'admin' && user.role !== 'teacher') {
      navigate('/');
    } else {
      setCurrentUser(user);
    }
  }, [navigate]);

  const handlePatternChange = (key: string) => {
    setSelectedPatternKey(key);
    const pat = EXAM_PATTERNS[key];
    if (pat) {
      setExam(pat.name);
      setSubject(pat.sections[0] || 'Physics');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setResult(null);
    setErrorMessage('');
    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    if (ext === 'xlsx' || ext === 'xls' || ext === 'csv' || ext === 'pdf') {
      setFile(selectedFile);
    } else {
      setErrorMessage('Unsupported file format! Please upload an Excel (.xlsx, .xls), CSV (.csv), or PDF (.pdf) file.');
      setFile(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMessage('Please select an Excel or PDF file to upload.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('defaultExam', exam);
    formData.append('defaultSubject', subject);
    formData.append('defaultChapter', chapter);
    formData.append('defaultDifficulty', difficulty);
    formData.append('defaultYear', year);

    try {
      const response = await fetch('/api/questions/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload and parse questions file.');
      }

      setResult(data);
      if (data.success && data.inserted > 0) {
        if (data.skipped === 0) {
          setFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during import.');
    } finally {
      setLoading(false);
    }
  };

  const downloadSampleCSV = () => {
    const headers = [
      'Question',
      'Option A',
      'Option B',
      'Option C',
      'Option D',
      'Correct Option',
      'Subject/Section',
      'Marks',
      'Negative Marks',
      'Explanation'
    ];

    const rows = activePattern.sampleRows.map(r => [
      `"${r.question.replace(/"/g, '""')}"`,
      `"${r.option_a.replace(/"/g, '""')}"`,
      `"${r.option_b.replace(/"/g, '""')}"`,
      `"${r.option_c.replace(/"/g, '""')}"`,
      `"${r.option_d.replace(/"/g, '""')}"`,
      `"${r.correct_option}"`,
      `"${r.subject}"`,
      r.marks,
      r.negative_marks,
      `"${r.explanation.replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PrepApple_${activePattern.name.replace(/\s+/g, '_')}_Sample_Questions.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGoBack = () => {
    if (currentUser?.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  const renderGrid = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns (Inputs, Pattern Selector & Upload Zone) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Exam Pattern Selector Preset */}
          <div className="bg-gradient-to-r from-[#0B1F4D] to-[#1E88E5] text-white rounded-3xl p-6 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <h3 className="font-extrabold text-base uppercase tracking-tight">Select Official Exam Pattern</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSampleModal(true)}
                className="bg-white/20 hover:bg-white/30 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer backdrop-blur-md"
              >
                <Eye className="w-4 h-4" />
                <span>View Excel Sample Format</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {Object.keys(EXAM_PATTERNS).map((key) => {
                const pat = EXAM_PATTERNS[key];
                const isSelected = selectedPatternKey === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handlePatternChange(key)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-white text-[#0B1F4D] shadow-md scale-102' 
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {pat.category}
                  </button>
                );
              })}
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-[10px] font-bold text-blue-200 uppercase">Exam Pattern</p>
                <p className="text-xs font-black text-white mt-0.5">{activePattern.name}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-blue-200 uppercase">Duration</p>
                <p className="text-xs font-black text-amber-300 mt-0.5">{activePattern.duration} Mins</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-blue-200 uppercase">Total Questions</p>
                <p className="text-xs font-black text-white mt-0.5">{activePattern.totalQuestions} Qs</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-blue-200 uppercase">Marks / Negative</p>
                <p className="text-xs font-black text-emerald-300 mt-0.5">+{activePattern.marksPerQ} / -{activePattern.negativeMarks}</p>
              </div>
            </div>
          </div>

          {/* Default Metadata Form */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h2 className="text-base font-black text-[#0f294a] uppercase tracking-wide flex items-center gap-2">
                <BookOpen className="w-4.5 h-4.5 text-blue-600" />
                <span>Upload Metadata Setup</span>
              </h2>
              <button
                type="button"
                onClick={downloadSampleCSV}
                className="text-xs font-black text-[#1E88E5] hover:text-blue-700 flex items-center gap-1.5 uppercase tracking-wider hover:underline"
              >
                <Download className="w-4 h-4" />
                <span>Download Sample Excel</span>
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-[#0f294a] uppercase tracking-wide mb-1.5">Exam Name</label>
                  <input
                    type="text"
                    value={exam}
                    onChange={(e) => setExam(e.target.value)}
                    placeholder="e.g. JEE Main 2026"
                    className="w-full text-sm font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-[#0f294a] uppercase tracking-wide mb-1.5">Primary Subject / Section</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full text-sm font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer"
                  >
                    {activePattern.sections.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                    <option value="General">General / All Sections</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-[#0f294a] uppercase tracking-wide mb-1.5">Chapter / Topic</label>
                  <input
                    type="text"
                    value={chapter}
                    onChange={(e) => setChapter(e.target.value)}
                    placeholder="e.g. Kinematics, Organic Reactions"
                    className="w-full text-sm font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-[#0f294a] uppercase tracking-wide mb-1.5">Difficulty Level</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full text-sm font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard (Advanced)</option>
                  </select>
                </div>
              </div>

              {/* Drag and Drop Zone */}
              <div>
                <label className="block text-xs font-black text-[#0f294a] uppercase tracking-wide mb-1.5">
                  Upload Excel (.xlsx, .xls, .csv) or PDF Question File
                </label>
                
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
                    isDragActive 
                      ? 'border-blue-500 bg-blue-50/50 scale-101' 
                      : file 
                        ? 'border-emerald-300 bg-emerald-50/30' 
                        : 'border-gray-250 bg-gray-50/50 hover:bg-gray-100/60 hover:border-gray-300'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {file ? (
                    <div className="space-y-2">
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                        <FileSpreadsheet className="w-6 h-6" />
                      </div>
                      <h4 className="font-extrabold text-sm text-gray-800">{file.name}</h4>
                      <p className="text-xs text-gray-400 font-semibold">
                        {(file.size / 1024).toFixed(1)} KB • Ready for processing
                      </p>
                      <span className="inline-block text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                        Click or drag another file to replace
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                        <UploadCloud className="w-7 h-7" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-gray-800">
                          Drag & Drop your Excel / PDF question paper here
                        </h4>
                        <p className="text-xs text-gray-500 font-semibold mt-1">
                          Supports Excel (.xlsx, .xls, .csv) and PDF (.pdf) format files
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {errorMessage && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold p-4 rounded-2xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !file}
                className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md ${
                  loading || !file 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-[#1E88E5] hover:bg-blue-600 text-white shadow-blue-500/20 hover:shadow-lg cursor-pointer'
                }`}
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Parsing & Uploading Questions...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>Process & Import Questions to Database</span>
                  </>
                )}
              </button>
            </form>
          </div>

        </div>

        {/* Right Column: Status & Guidelines */}
        <div className="space-y-6">
          
          {/* Result Output Card */}
          {result && (
            <div className={`bg-white border rounded-3xl p-6 shadow-sm space-y-4 ${result.success ? 'border-emerald-200' : 'border-amber-200'}`}>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Import Status Results</span>
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
                  <p className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider">Inserted</p>
                  <h4 className="text-2xl font-black text-emerald-900 mt-1">{result.inserted}</h4>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-center">
                  <p className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider">Skipped</p>
                  <h4 className="text-2xl font-black text-amber-900 mt-1">{result.skipped}</h4>
                </div>
              </div>
            </div>
          )}

          {/* Excel Template Formatting Guidelines */}
          <div className="bg-[#0f294a] text-blue-100 border border-blue-950 rounded-3xl p-6 shadow-md space-y-5 select-none">
            <div className="flex justify-between items-center border-b border-blue-900 pb-3">
              <h2 className="text-sm font-black text-white uppercase tracking-wide flex items-center gap-2">
                <HelpCircle className="w-4.5 h-4.5 text-blue-300" />
                <span>Excel Column Format</span>
              </h2>
              <button
                type="button"
                onClick={downloadSampleCSV}
                className="text-[10px] font-extrabold text-amber-300 hover:text-white uppercase flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV Template</span>
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <p className="font-extrabold text-white text-xs uppercase mb-2">Required Excel Columns:</p>
                <div className="bg-blue-950/80 p-3 rounded-2xl border border-blue-800 text-[11px] font-mono space-y-1 text-blue-200">
                  <p><strong className="text-emerald-300">A:</strong> Question Text</p>
                  <p><strong className="text-emerald-300">B:</strong> Option A</p>
                  <p><strong className="text-emerald-300">C:</strong> Option B</p>
                  <p><strong className="text-emerald-300">D:</strong> Option C</p>
                  <p><strong className="text-emerald-300">E:</strong> Option D</p>
                  <p><strong className="text-amber-300">F:</strong> Correct Option (a/b/c/d)</p>
                  <p><strong className="text-amber-300">G:</strong> Subject/Section (Physics/Maths)</p>
                  <p><strong className="text-sky-300">H:</strong> Marks (+4 / +2)</p>
                  <p><strong className="text-sky-300">I:</strong> Negative Marks (1 / 0.5)</p>
                  <p><strong className="text-purple-300">J:</strong> Detailed Explanation</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  };

  return (
    <div className={isEmbedded ? "w-full select-none" : "min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans select-none"}>
      
      {!isEmbedded && (
        <header className="bg-[#0f294a] text-white px-6 py-4 flex justify-between items-center shadow-md border-b border-blue-950">
          <div className="flex items-center gap-3">
            <button
              onClick={handleGoBack}
              className="p-2 hover:bg-blue-800/40 rounded-xl transition-all text-white border border-transparent hover:border-blue-700/30 flex items-center justify-center cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-extrabold text-white text-base md:text-lg tracking-tight uppercase flex items-center gap-2">
                <span>Bulk Question Import & Exam Presets</span>
                <span className="bg-[#1d3d63] text-blue-300 text-[10px] normal-case font-black px-2.5 py-0.5 rounded border border-blue-800 uppercase">
                  Excel & PDF
                </span>
              </h1>
            </div>
          </div>
        </header>
      )}

      {/* Main Grid */}
      <main className={isEmbedded ? "w-full" : "flex-grow max-w-7xl w-full mx-auto px-4 py-8"}>
        {renderGrid()}
      </main>

      {/* Sample Excel Table Preview Modal */}
      {showSampleModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-6 h-6 text-[#1E88E5]" />
                <div>
                  <h3 className="text-xl font-black text-[#0B1F4D] uppercase">{activePattern.name} — Excel Format Sample</h3>
                  <p className="text-xs text-slate-500 font-semibold">{activePattern.description}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSampleModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-black text-sm flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#0B1F4D] text-white text-[10px] font-black uppercase tracking-wider">
                    <th className="p-3 border-r border-blue-900">#</th>
                    <th className="p-3 border-r border-blue-900 min-w-[200px]">Question</th>
                    <th className="p-3 border-r border-blue-900 min-w-[100px]">Option A</th>
                    <th className="p-3 border-r border-blue-900 min-w-[100px]">Option B</th>
                    <th className="p-3 border-r border-blue-900 min-w-[100px]">Option C</th>
                    <th className="p-3 border-r border-blue-900 min-w-[100px]">Option D</th>
                    <th className="p-3 border-r border-blue-900 text-center">Correct</th>
                    <th className="p-3 border-r border-blue-900">Subject</th>
                    <th className="p-3 border-r border-blue-900 text-center">Marks</th>
                    <th className="p-3 min-w-[220px]">Explanation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium text-slate-700">
                  {activePattern.sampleRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-blue-50/50">
                      <td className="p-3 font-bold text-slate-400 border-r border-slate-150">{idx + 1}</td>
                      <td className="p-3 font-bold text-slate-900 border-r border-slate-150">{row.question}</td>
                      <td className="p-3 border-r border-slate-150">{row.option_a}</td>
                      <td className="p-3 border-r border-slate-150">{row.option_b}</td>
                      <td className="p-3 border-r border-slate-150">{row.option_c}</td>
                      <td className="p-3 border-r border-slate-150">{row.option_d}</td>
                      <td className="p-3 text-center font-black text-emerald-600 border-r border-slate-150 uppercase bg-emerald-50">{row.correct_option}</td>
                      <td className="p-3 font-extrabold text-blue-700 border-r border-slate-150">{row.subject}</td>
                      <td className="p-3 text-center font-bold border-r border-slate-150">+{row.marks} / -{row.negative_marks}</td>
                      <td className="p-3 text-slate-500 text-[11px] font-semibold">{row.explanation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-500 font-semibold">
                You can download this pre-formatted sample Excel file and fill your question bank rows.
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={downloadSampleCSV}
                  className="px-5 py-3 bg-[#1E88E5] hover:bg-blue-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download {activePattern.name} Sample CSV</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

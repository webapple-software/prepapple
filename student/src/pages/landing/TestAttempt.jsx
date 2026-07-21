import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockQuestions } from '../data/mockData';
import { Clock, HelpCircle, ChevronRight, Menu, AlertCircle } from 'lucide-react';

const TestAttempt = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // States
  const [timeLeft, setTimeLeft] = useState(180 * 60); // default 3 hours
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { qId: optionId }
  const [status, setStatus] = useState({}); // { qId: 'answered' | 'review' | 'review-answered' | 'unanswered' | 'unvisited' }
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Initialize status on mount
  useEffect(() => {
    const initialStatus = {};
    mockQuestions.forEach((q, idx) => {
      initialStatus[q.id] = idx === 0 ? 'unanswered' : 'unvisited';
    });
    setStatus(initialStatus);
  }, []);

  // Timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQ = mockQuestions[currentQIndex];

  const handleOptionSelect = (optionId) => {
    setAnswers(prev => ({ ...prev, [currentQ.id]: optionId }));
  };

  const handleSaveAndNext = () => {
    // Update status
    setStatus(prev => ({
      ...prev,
      [currentQ.id]: answers[currentQ.id] ? 'answered' : 'unanswered'
    }));
    goToNextQuestion();
  };

  const handleMarkForReview = () => {
    setStatus(prev => ({
      ...prev,
      [currentQ.id]: answers[currentQ.id] ? 'review-answered' : 'review'
    }));
    goToNextQuestion();
  };

  const handleClearResponse = () => {
    const newAnswers = { ...answers };
    delete newAnswers[currentQ.id];
    setAnswers(newAnswers);
  };

  const goToNextQuestion = () => {
    if (currentQIndex < mockQuestions.length - 1) {
      const nextIndex = currentQIndex + 1;
      setCurrentQIndex(nextIndex);
      // Mark as unanswered if it was unvisited
      const nextQ = mockQuestions[nextIndex];
      setStatus(prev => ({
        ...prev,
        [nextQ.id]: prev[nextQ.id] === 'unvisited' ? 'unanswered' : prev[nextQ.id]
      }));
    }
  };

  const jumpToQuestion = (index) => {
    // Current question becomes unanswered if we haven't taken action
    if (status[currentQ.id] === 'unvisited') {
       setStatus(prev => ({ ...prev, [currentQ.id]: 'unanswered' }));
    }
    
    setCurrentQIndex(index);
    const targetQ = mockQuestions[index];
    if (status[targetQ.id] === 'unvisited') {
      setStatus(prev => ({ ...prev, [targetQ.id]: 'unanswered' }));
    }
  };

  const handleSubmit = () => {
    // Show success modal instead of navigating to results
    setShowSubmitModal(false);
    setIsSubmitted(true);
  };

  // Helper for Palette Colors
  const getPaletteColor = (qId) => {
    const s = status[qId];
    if (s === 'answered') return 'bg-green-500 text-white';
    if (s === 'review' || s === 'review-answered') return 'bg-amber-500 text-white';
    if (s === 'unanswered') return 'bg-red-500 text-white';
    return 'bg-slate-200 text-slate-600'; // unvisited
  };

  // Count states for header/modal
  const counts = {
    answered: Object.values(status).filter(s => s === 'answered').length,
    notAnswered: Object.values(status).filter(s => s === 'unanswered').length,
    review: Object.values(status).filter(s => s === 'review' || s === 'review-answered').length,
    notVisited: Object.values(status).filter(s => s === 'unvisited').length,
  };

  if (!currentQ) return null;

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden font-body">
      
      {/* Top Header */}
      <header className="h-16 bg-primary text-white flex items-center justify-between px-4 sm:px-6 flex-shrink-0 z-10 shadow-md">
        <div className="flex items-center gap-3">
          <img src="/assets/logo.jpeg" alt="Logo" className="h-8 w-auto mix-blend-screen filter grayscale invert brightness-200" />
          <span className="font-heading font-bold hidden sm:block">PrepApple CBT</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="bg-blue-900/50 px-4 py-1.5 rounded-full flex items-center gap-2 border border-blue-800">
            <Clock className="w-4 h-4 text-accent-end" />
            <span className="font-mono font-bold text-lg">{formatTime(timeLeft)}</span>
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Left: Question Area */}
        <div className={`flex-1 flex flex-col h-full transition-all duration-300 ${sidebarOpen ? 'lg:pr-80' : ''}`}>
          
          {/* Question Header */}
          <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between shadow-sm">
            <h2 className="font-bold text-lg text-primary flex items-center gap-2">
              <span className="bg-blue-100 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm">
                {currentQIndex + 1}
              </span>
              Question
            </h2>
            <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
              <span>Marks: +4</span>
              <span className="text-slate-300">|</span>
              <span className="text-red-400">-1</span>
            </div>
          </div>

          {/* Question Body */}
          <div className="flex-1 overflow-y-auto p-6 md:p-10">
            <div className="max-w-4xl">
              <h3 className="text-xl font-medium text-slate-800 mb-8 leading-relaxed">
                {currentQ.text}
              </h3>
              
              <div className="space-y-4">
                {currentQ.options.map((opt, idx) => (
                  <label key={opt.id} className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${answers[currentQ.id] === opt.id ? 'border-accent-start bg-blue-50/50' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                    <div className="mt-0.5">
                      <input 
                        type="radio" 
                        name={`q-${currentQ.id}`}
                        checked={answers[currentQ.id] === opt.id}
                        onChange={() => handleOptionSelect(opt.id)}
                        className="w-5 h-5 text-accent-start border-gray-300 focus:ring-accent-start"
                      />
                    </div>
                    <span className="text-lg text-slate-700">{opt.text}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="bg-white border-t border-slate-200 p-4 flex flex-wrap gap-4 justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={handleMarkForReview}
                className="px-6 py-2.5 rounded-lg border border-amber-500 text-amber-600 font-bold hover:bg-amber-50 transition-colors"
              >
                Mark for Review & Next
              </button>
              <button 
                onClick={handleClearResponse}
                className="px-6 py-2.5 rounded-lg border border-slate-300 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
              >
                Clear Response
              </button>
            </div>
            
            <button 
              onClick={handleSaveAndNext}
              className="px-8 py-2.5 rounded-lg bg-primary text-white font-bold hover:bg-blue-900 transition-colors shadow-lg shadow-blue-900/20"
            >
              Save & Next
            </button>
          </div>
        </div>

        {/* Right: Question Palette Sidebar */}
        <div className={`absolute top-0 right-0 h-full w-80 bg-white border-l border-slate-200 flex flex-col shadow-2xl lg:shadow-none transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          
          {/* User Info / Legend */}
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center">
                <img src={`https://api.dicebear.com/7.x/initials/svg?seed=Student`} alt="Avatar" className="w-12 h-12 rounded-full" />
              </div>
              <div>
                <div className="font-bold text-slate-800 text-sm">Demo Student</div>
                <div className="text-xs text-slate-500">Subject: Mock Test</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-slate-600">
              <div className="flex items-center gap-2"><span className="w-5 h-5 rounded bg-green-500 text-white flex items-center justify-center">{counts.answered}</span> Answered</div>
              <div className="flex items-center gap-2"><span className="w-5 h-5 rounded bg-red-500 text-white flex items-center justify-center">{counts.notAnswered}</span> Not Answered</div>
              <div className="flex items-center gap-2"><span className="w-5 h-5 rounded bg-slate-200 flex items-center justify-center">{counts.notVisited}</span> Not Visited</div>
              <div className="flex items-center gap-2"><span className="w-5 h-5 rounded bg-amber-500 text-white flex items-center justify-center">{counts.review}</span> Marked for Review</div>
            </div>
          </div>

          {/* Palette Grid */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-100">
            <h3 className="font-bold text-sm text-slate-700 mb-3 uppercase tracking-wider">Physics Section</h3>
            <div className="flex flex-wrap gap-2">
              {mockQuestions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => jumpToQuestion(idx)}
                  className={`w-12 h-12 rounded-lg font-bold text-sm transition-all shadow-sm ${getPaletteColor(q.id)} ${currentQIndex === idx ? 'ring-2 ring-offset-2 ring-primary border-transparent scale-110' : 'border border-slate-300'}`}
                >
                  {idx + 1}
                  {/* Small dot indicator if answered AND marked for review */}
                  {status[q.id] === 'review-answered' && (
                    <span className="absolute bottom-1 right-1 w-2 h-2 bg-green-500 rounded-full border border-white"></span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button Area */}
          <div className="p-4 border-t border-slate-200 bg-white">
            <button 
              onClick={() => setShowSubmitModal(true)}
              className="w-full py-3 rounded-lg bg-green-500 text-white font-bold hover:bg-green-600 transition-colors shadow-lg shadow-green-500/30 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" /> Submit Test
            </button>
          </div>
        </div>

      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-blue-100 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-center mb-6">Submit Examination?</h2>
            
            <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 mb-6">
              <div className="grid grid-cols-2 gap-y-3 text-sm">
                <span className="text-slate-500">Total Questions:</span> <span className="font-bold text-right">{mockQuestions.length}</span>
                <span className="text-slate-500">Answered:</span> <span className="font-bold text-green-600 text-right">{counts.answered}</span>
                <span className="text-slate-500">Not Answered:</span> <span className="font-bold text-red-500 text-right">{counts.notAnswered}</span>
                <span className="text-slate-500">Marked for Review:</span> <span className="font-bold text-amber-500 text-right">{counts.review}</span>
              </div>
            </div>
            
            <p className="text-sm text-slate-500 text-center mb-8">
              Are you sure you want to submit the test? Once submitted, you cannot modify your answers.
            </p>
            
            <div className="flex gap-4">
              <button 
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-3 rounded-lg border border-slate-300 font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit}
                className="flex-1 py-3 rounded-lg bg-primary text-white font-bold hover:bg-blue-900 shadow-lg shadow-blue-900/20"
              >
                Yes, Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {isSubmitted && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-8 shadow-2xl text-center relative animate-in fade-in zoom-in duration-200">
            <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Test Submitted!</h2>
            <p className="text-slate-500 mb-8">
              Your test has been successfully submitted. We will process your score shortly.
            </p>
            <button 
              onClick={() => navigate('/')}
              className="w-full py-3 rounded-lg bg-primary text-white font-bold hover:bg-blue-900 transition-colors shadow-lg shadow-blue-900/20"
            >
              Return to Home
            </button>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default TestAttempt;

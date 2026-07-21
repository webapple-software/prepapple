import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';

const Instructions = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);

  // Mock the test since we dynamically generate them now
  const currentTest = {
    id: id,
    title: `Full Length Mock Test`,
    questions: 20,
    duration: 30
  };

  if (!currentTest) {
    return <div className="p-20 text-center text-red-500 font-bold">Test not found!</div>;
  }

  const handleStart = () => {
    if (agreed) {
      navigate(`/test/${id}/attempt`);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="bg-primary text-white p-6 border-b border-blue-900">
            <h1 className="text-2xl font-bold">{currentTest.title}</h1>
            <div className="flex gap-6 mt-4 text-sm text-blue-200">
              <span className="flex items-center gap-1"><FileText className="w-4 h-4" /> {currentTest.questions} Questions</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {currentTest.duration} Minutes</span>
            </div>
          </div>
          
          <div className="p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-accent-start" /> 
              Please read the instructions carefully
            </h2>
            
            <div className="space-y-4 text-slate-700 text-sm leading-relaxed mb-8">
              <p><strong>1.</strong> The clock will be set at the server. The countdown timer in the top right corner of screen will display the remaining time available for you to complete the examination. When the timer reaches zero, the examination will end by itself.</p>
              <p><strong>2.</strong> The Question Palette displayed on the right side of screen will show the status of each question using one of the following symbols:</p>
              
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <li className="flex items-center gap-3"><div className="w-8 h-8 rounded bg-slate-300 flex-shrink-0"></div> <span>You have not visited the question yet.</span></li>
                <li className="flex items-center gap-3"><div className="w-8 h-8 rounded bg-red-500 flex-shrink-0"></div> <span>You have not answered the question.</span></li>
                <li className="flex items-center gap-3"><div className="w-8 h-8 rounded bg-green-500 flex-shrink-0"></div> <span>You have answered the question.</span></li>
                <li className="flex items-center gap-3"><div className="w-8 h-8 rounded bg-amber-500 flex-shrink-0"></div> <span>You have NOT answered the question, but have marked it for review.</span></li>
              </ul>
              
              <p className="mt-4"><strong>3.</strong> You can click on the "&gt;" arrow on left side of question palette to collapse the question palette thereby maximizing the question window.</p>
              <p><strong>4.</strong> To change your answer to a question that has already been answered, first select that question for answering and then follow the procedure for answering that type of question.</p>
            </div>

            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-8">
              <label className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="mt-1 w-5 h-5 text-accent-start rounded border-gray-300 focus:ring-accent-start"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
                <span className="text-sm text-slate-700 font-medium">
                  I have read and understood the instructions. All computer hardware allotted to me are in proper working condition. I declare that I am not in possession of / not wearing / not carrying any prohibited gadget like mobile phone, bluetooth devices etc.
                </span>
              </label>
            </div>
            
            <div className="flex justify-end">
              <button 
                onClick={handleStart}
                disabled={!agreed}
                className={`py-3 px-8 rounded-full font-bold transition-all ${
                  agreed 
                  ? "bg-gradient-accent text-white shadow-lg shadow-blue-500/30 hover:-translate-y-1 hover:shadow-blue-500/50" 
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                I am ready to begin
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Instructions;

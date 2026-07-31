import React, { useState } from 'react';
import { 
  Check, 
  X, 
  Zap, 
  Award, 
  Crown, 
  HelpCircle, 
  ChevronDown, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  CheckCircle2,
  Star,
  Users
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const faqs = [
    {
      q: "How often will I be billed?",
      a: "For monthly subscriptions (₹49/month), you are billed once every month. For yearly subscriptions (₹599/year), you make a single annual payment with zero recurring monthly charges."
    },
    {
      q: "Can I cancel my subscription anytime?",
      a: "Yes, absolutely! You can choose not to renew at the end of your billing cycle with no hidden cancellation fees."
    },
    {
      q: "Are there any hidden fees or extra charges per exam?",
      a: "No! Once you subscribe to PrepApple Pro or Elite, you get full unlimited access to all test series, grand mocks, and sectionals across JEE, NEET, SSC, Railways, Banking, UPSC, and State exams with zero additional fees."
    },
    {
      q: "How fast will my account activate after completing payment?",
      a: "Account verification and credential generation (Student ID & Password) typically take 1 to 2 hours. Your login details will be delivered straight to your registered WhatsApp number and Email."
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* Page Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#0B1F4D] font-extrabold text-xs uppercase tracking-wider shadow-sm">
            <Sparkles className="w-4 h-4 text-[#1E88E5]" />
            <span>Transparent & Affordable Pricing</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-[#0B1F4D] tracking-tight">
            Choose Your Learning Path
          </h1>

          <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
            Unlock premium test series, detailed AI analysis, and expert mentoring designed to help you excel in competitive exams.
          </p>

          {/* Monthly / Yearly Billing Toggle */}
          <div className="pt-6 flex items-center justify-center">
            <div className="bg-slate-200/80 p-1.5 rounded-2xl flex items-center gap-1 border border-slate-300/80 select-none shadow-inner">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'bg-[#0B1F4D] text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly Pass (₹49)
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                  billingCycle === 'yearly'
                    ? 'bg-[#1E88E5] text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Yearly Pass (₹599)</span>
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-md uppercase">Save 25%</span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid (2-Card Centered Layout: Monthly ₹49 & Yearly ₹499) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
          
          {/* Card 1: Growth / Pro (Monthly Pass - MOST POPULAR) */}
          <div className="bg-white rounded-3xl p-8 border-2 border-purple-500 shadow-xl flex flex-col justify-between relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#0052D4] via-[#6B11B0] to-[#FF2A85] text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md">
              MOST POPULAR
            </div>

            <div className="space-y-6 pt-2">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-black text-[#6B11B0] uppercase tracking-widest">MONTHLY PASS</span>
                  <h3 className="text-2xl font-black text-[#0B1F4D] mt-1">Pro Pass</h3>
                </div>
                <div className="p-3 bg-purple-50 rounded-2xl text-[#6B11B0]">
                  <Award className="w-6 h-6" />
                </div>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-[#0B1F4D]">₹49</span>
                <span className="text-xs font-bold text-slate-400 uppercase">/ month</span>
              </div>

              <div className="space-y-3.5 pt-4 border-t border-slate-100 text-sm font-semibold text-slate-700">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4.5 h-4.5 text-[#6B11B0] flex-shrink-0" />
                  <span><strong className="text-slate-900">Unlimited Mock Tests</strong> across all 50+ Exams</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4.5 h-4.5 text-[#6B11B0] flex-shrink-0" />
                  <span>Full Previous Year Papers & Solutions</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4.5 h-4.5 text-[#6B11B0] flex-shrink-0" />
                  <span>Advanced AI Performance Analytics</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4.5 h-4.5 text-[#6B11B0] flex-shrink-0" />
                  <span>Auto-renews monthly, cancel anytime</span>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <a 
                href="https://forms.gle/ML2urJTy75xXFXK18"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 bg-gradient-to-r from-[#0052D4] via-[#6B11B0] to-[#FF2A85] hover:opacity-95 text-white font-extrabold text-xs rounded-2xl uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer text-center"
              >
                <span>Choose Monthly ₹49</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Card 2: Mastery / Elite (Yearly Pass - ₹499) */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-lg flex flex-col justify-between hover:border-[#0B1F4D] transition-all relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#0B1F4D] text-amber-300 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md">
              BEST VALUE • SAVE 15%
            </div>

            <div className="space-y-6 pt-2">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-black text-[#0B1F4D] uppercase tracking-widest">ANNUAL PASS</span>
                  <h3 className="text-2xl font-black text-[#0B1F4D] mt-1">Elite Yearly</h3>
                </div>
                <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
                  <Crown className="w-6 h-6" />
                </div>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-[#0B1F4D]">₹499</span>
                <span className="text-xs font-bold text-slate-400 uppercase">/ year</span>
              </div>

              <div className="space-y-3.5 pt-4 border-t border-slate-100 text-sm font-semibold text-slate-700">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4.5 h-4.5 text-[#0B1F4D] flex-shrink-0" />
                  <span><strong className="text-slate-900">Everything in Monthly Pro Pass</strong></span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4.5 h-4.5 text-[#0B1F4D] flex-shrink-0" />
                  <span>Full <strong className="text-slate-900">12 Months Uninterrupted Access</strong></span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4.5 h-4.5 text-[#0B1F4D] flex-shrink-0" />
                  <span>Effective price just <strong className="text-[#0052D4]">₹41.5 / month</strong></span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4.5 h-4.5 text-[#0B1F4D] flex-shrink-0" />
                  <span>Priority 24/7 WhatsApp & Call Support</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4.5 h-4.5 text-[#0B1F4D] flex-shrink-0" />
                  <span>All Future Grand Test Series Included</span>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <a 
                href="https://forms.gle/ML2urJTy75xXFXK18"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 bg-[#0B1F4D] hover:bg-slate-900 text-white font-extrabold text-xs rounded-2xl uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer text-center"
              >
                <span>Choose Yearly ₹499</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>



        {/* Billing FAQ Section */}
        <div className="space-y-8 max-w-3xl mx-auto pt-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-extrabold text-[#0B1F4D]">Billing & Registration FAQ</h2>
            <p className="text-sm text-slate-600 font-medium">Common questions about PrepApple subscriptions.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div 
                  key={idx} 
                  className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                    className="w-full text-left p-5 flex justify-between items-center gap-4 cursor-pointer focus:outline-none"
                  >
                    <span className="font-bold text-[#0B1F4D] text-base">{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#1E88E5]' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-sm text-slate-600 font-medium leading-relaxed border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Pricing;

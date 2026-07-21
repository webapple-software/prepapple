import { CreditCard, CheckCircle2, Calendar, ExternalLink, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const MySubscription = () => {
  const cached = localStorage.getItem('currentUser');
  const currentUser = cached ? JSON.parse(cached) : null;

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        {/* Back Button */}
        <Link to="/student" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Portal
        </Link>

        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">My Subscription</h1>
        {currentUser && (
          <p className="text-slate-500 font-medium mb-8">
            Logged in as: <span className="text-blue-600 font-bold">{currentUser.name}</span>
            {currentUser.rollNumber && <span className="ml-2 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100 font-bold uppercase">{currentUser.rollNumber}</span>}
          </p>
        )}

        {/* Current Plan Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="bg-blue-600 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="text-white">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-4 h-4 text-green-300" />
                <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">Active</span>
              </div>
              <h2 className="text-2xl font-bold mb-1">PrepApple Premium Pass</h2>
              <p className="text-blue-200 font-medium text-sm">Monthly subscription — Unlimited mock tests across all exam categories.</p>
            </div>
            <div className="text-left md:text-right text-white">
              <div className="text-4xl font-extrabold">₹25<span className="text-lg text-blue-200 font-medium">/mo</span></div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Subscription Type</h4>
                  <p className="text-slate-500">Monthly — Renew each month via Google Form</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Payment Method</h4>
                  <p className="text-slate-500">UPI / Online — via Google Form</p>
                </div>
              </div>
            </div>

            {/* Renew CTA */}
            <div className="flex flex-col sm:flex-row gap-4 border-t border-slate-100 pt-6">
              <a
                href="https://forms.gle/ML2urJTy75xXFXK18"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors text-center flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Renew Subscription (₹25/Month)
              </a>
              <a
                href="https://forms.gle/ML2urJTy75xXFXK18"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold rounded-xl transition-colors text-center"
              >
                Contact Admin for Help
              </a>
            </div>
          </div>
        </div>

        {/* Plan Benefits */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 mb-8">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Plan Benefits</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-slate-700 font-medium">Unlimited Mock Tests for all exam categories</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-slate-700 font-medium">Free Daily Practice Quizzes</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-slate-700 font-medium">Detailed Analytics & Score Reports</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-slate-700 font-medium">Real CBT Interface — NTA Pattern</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-slate-700 font-medium">Assigned Tests from Your Teacher</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-slate-700 font-medium">Ad-free Premium Experience</span>
            </div>
          </div>
        </div>

        {/* How to Renew */}
        <div className="bg-blue-50 rounded-2xl border border-blue-100 p-6 md:p-8">
          <h3 className="text-lg font-bold text-slate-900 mb-4">How to Renew Your Subscription?</h3>
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
              <p className="text-slate-600 font-medium text-sm">Click "Renew Subscription" above to open the Google Form.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
              <p className="text-slate-600 font-medium text-sm">Pay ₹25 via UPI and fill in your details + transaction ID.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
              <p className="text-slate-600 font-medium text-sm">Admin will verify and keep your account active within 1–2 hours.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MySubscription;

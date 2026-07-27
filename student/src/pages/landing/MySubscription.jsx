import React from 'react';
import { CreditCard, CheckCircle2, Calendar, FileText, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

const MySubscription = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        <h1 className="text-3xl font-extrabold text-slate-900 mb-8">My Subscription</h1>

        {/* Current Plan Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="bg-primary p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="text-white">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">Active</span>
              </div>
              <h2 className="text-2xl font-bold mb-1">Exam Premium Pass</h2>
              <p className="text-blue-200 font-medium text-sm">Billed monthly for 1 selected category. Cancel anytime.</p>
            </div>
            <div className="text-left md:text-right text-white">
              <div className="text-4xl font-extrabold">₹49<span className="text-lg text-blue-200 font-medium">/mo</span></div>
            </div>
          </div>
          
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-primary flex-shrink-0">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Next Billing Date</h4>
                  <p className="text-slate-500">August 18, 2026</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-primary flex-shrink-0">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Payment Method</h4>
                  <p className="text-slate-500">Card ending in •••• 4242</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 border-t border-slate-100 pt-6">
              <button className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors">
                Update Payment Method
              </button>
              <button className="flex-1 py-3 border border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-xl transition-colors">
                Cancel Subscription
              </button>
            </div>
          </div>
        </div>

        {/* Features Included */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 mb-8">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Plan Benefits</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-slate-700 font-medium">Access to all Mock Tests for the selected exam</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-slate-700 font-medium">Previous Year Papers</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-slate-700 font-medium">Detailed Analytics & Reports</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-slate-700 font-medium">Ad-free Experience</span>
            </div>
          </div>
        </div>

        {/* Billing History */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 md:p-8 border-b border-slate-100">
            <h3 className="text-xl font-bold text-slate-900">Billing History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                  <th className="p-4 font-bold">Date</th>
                  <th className="p-4 font-bold">Description</th>
                  <th className="p-4 font-bold">Amount</th>
                  <th className="p-4 font-bold text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-slate-700 font-medium">Jul 18, 2026</td>
                  <td className="p-4 text-slate-500">Exam Premium Pass</td>
                  <td className="p-4 text-slate-700 font-bold">₹25.00</td>
                  <td className="p-4 text-right">
                    <button className="text-primary hover:text-blue-800 transition-colors inline-flex items-center gap-1 font-medium">
                      <Download className="w-4 h-4" /> PDF
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MySubscription;

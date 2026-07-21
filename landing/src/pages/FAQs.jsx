import React from 'react';

const FAQs = () => {
  const faqs = [
    {
      q: "How do I access the mock tests?",
      a: "Once you subscribe for ₹25/month, you will get instant access to all premium mock tests across all categories from your dashboard."
    },
    {
      q: "Is the ₹25 subscription valid for all exams?",
      a: "Yes! Your monthly subscription unlocks every single test on the PrepApple platform, including JEE, NEET, SSC, and NDA."
    },
    {
      q: "Can I take the tests on my mobile phone?",
      a: "Absolutely. PrepApple is fully responsive and our CBT interface works perfectly on smartphones, tablets, and desktops."
    },
    {
      q: "How can I cancel my subscription?",
      a: "You can cancel your subscription at any time from your account settings. You will continue to have access until the end of your current billing cycle."
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-slate-600">Find answers to common questions about PrepApple.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-2">{faq.q}</h3>
              <p className="text-slate-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQs;

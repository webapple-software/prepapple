import React from 'react';

const Terms = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-8">Terms of Service</h1>
        
        <div className="space-y-6 text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">1. Acceptance of Terms</h2>
            <p>By accessing and using PrepApple, a product of WebApple.software, you accept and agree to be bound by the terms and provision of this agreement.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">2. Subscription Services</h2>
            <p>PrepApple offers access to premium mock tests via a monthly subscription of ₹25. This subscription is auto-renewed unless canceled prior to the renewal date. All payments are non-refundable.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">3. User Conduct</h2>
            <p>Users must not attempt to scrape, copy, or distribute the mock test questions or any other proprietary material found on PrepApple. Any such violation will result in immediate termination of the account.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">4. Limitation of Liability</h2>
            <p>PrepApple is an educational tool. We do not guarantee admission into any college, university, or job placement based on your performance on our mock tests.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;

import React from 'react';

const Privacy = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-8">Privacy Policy</h1>
        
        <div className="space-y-6 text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly to us, such as when you create or modify your account, purchase a subscription, or communicate with us. This may include your name, email address, phone number, and payment information.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">2. How We Use Information</h2>
            <p>We use the information we collect to provide, maintain, and improve our services, such as to process transactions, send you technical notices, and provide customer support.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">3. Test Performance Data</h2>
            <p>We store your mock test attempts, scores, and analytics to provide you with personalized insights. We do not sell this data to third parties.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">4. Data Security</h2>
            <p>We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access. All payment processing is handled via secure third-party gateways.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;

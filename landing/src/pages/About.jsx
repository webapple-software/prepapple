import React from 'react';
import { ShieldCheck, CheckCircle2, Zap, Cloud, Code, Database, Smartphone, Megaphone } from 'lucide-react';

const About = () => {
  const reasons = [
    { id: 1, title: 'End-to-End Solutions', desc: 'Complete product lifecycle management.', icon: <CheckCircle2 className="w-5 h-5" /> },
    { id: 2, title: 'Cost-Effective', desc: 'Premium quality without the premium tag.', icon: <CheckCircle2 className="w-5 h-5" /> },
    { id: 3, title: 'AI-Powered', desc: 'Smart solutions for modern problems.', icon: <Zap className="w-5 h-5" /> },
    { id: 4, title: 'Easy Integration', desc: 'Seamless connection with existing tools.', icon: <Cloud className="w-5 h-5" /> },
    { id: 5, title: 'Scalable Architecture', desc: 'Built to grow with your business.', icon: <Database className="w-5 h-5" /> },
    { id: 6, title: '24×7 Support', desc: 'We are here when you need us most.', icon: <ShieldCheck className="w-5 h-5" /> },
  ];

  const services = [
    { id: 1, title: 'Web Development', desc: 'Custom, responsive websites and web applications built with modern frameworks.', icon: <Code className="w-8 h-8 text-primary" /> },
    { id: 2, title: 'Mobile Apps', desc: 'Native and cross-platform mobile applications for iOS and Android.', icon: <Smartphone className="w-8 h-8 text-primary" /> },
    { id: 3, title: 'Digital Marketing', desc: 'Data-driven marketing strategies that grow your brand, attract leads, and boost revenue online.', icon: <Megaphone className="w-8 h-8 text-primary" /> },
    { id: 4, title: 'AI Solutions', desc: 'Intelligent automation and machine learning models for your business.', icon: <Zap className="w-8 h-8 text-primary" /> },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-blue-900 text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-400 via-blue-900 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-800 text-blue-200 text-sm font-bold tracking-widest uppercase mb-6 border border-blue-700 shadow-inner">
            Practice Today • Excel Tomorrow
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300">PrepApple</span>
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed mb-8">
            Your trusted Computer Based Test (CBT) portal for exam preparation. Join over 200+ students monthly and learn from 8+ trusted teachers to ace your competitive exams!
          </p>
          <div className="inline-block bg-blue-950/50 backdrop-blur-sm border border-blue-800 px-6 py-3 rounded-xl">
            <p className="text-blue-200 text-sm font-medium">A proud product of <span className="text-white font-bold">WebApple Software</span></p>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-slate-900">Why PrepApple?</h2>
          <div className="w-24 h-1 bg-primary mx-auto mt-4 rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((reason) => (
            <div key={reason.id} className="bg-white p-6 rounded-2xl border-l-4 border-primary shadow-sm hover:shadow-md transition-shadow flex gap-4">
              <div className="bg-blue-50 text-primary w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                {reason.icon}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg mb-1">{reason.title}</h3>
                <p className="text-slate-500 text-sm">{reason.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900">Powered by WebApple Software</h2>
          <div className="w-24 h-1 bg-primary mx-auto mt-4 rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((srv) => (
              <div key={srv.id} className="group p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all text-center">
                <div className="w-16 h-16 mx-auto bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {srv.icon}
                </div>
                <h3 className="font-bold text-slate-900 text-xl mb-3">{srv.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{srv.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-cyan-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-extrabold text-primary mb-2">100%</div>
              <div className="text-slate-500 font-bold uppercase tracking-wider text-xs">Delivery Rate</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-primary mb-2">5.0 ★</div>
              <div className="text-slate-500 font-bold uppercase tracking-wider text-xs">Client Satisfaction</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-primary mb-2">50+</div>
              <div className="text-slate-500 font-bold uppercase tracking-wider text-xs">Projects Delivered</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-primary mb-2">24/7</div>
              <div className="text-slate-500 font-bold uppercase tracking-wider text-xs">Support Access</div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;

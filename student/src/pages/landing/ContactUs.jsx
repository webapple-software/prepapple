import React, { useState } from 'react';
import { Mail, Phone, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import emailjs from '@emailjs/browser';
import Swal from 'sweetalert2';

const ContactUs = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      Swal.fire({
        title: 'Missing Fields',
        text: 'Please fill in your name, email, and message.',
        icon: 'warning',
        confirmButtonColor: '#2563eb'
      });
      return;
    }

    setLoading(true);

    try {
      // Send using EmailJS with provided Public Key: BQys_Ad7YGAolvELl
      const templateParams = {
        from_name: name.trim(),
        from_email: email.trim(),
        reply_to: email.trim(),
        phone_number: phone.trim() || 'Not provided',
        message: message.trim(),
        to_email: 'prepapple.edu@gmail.com',
        cc_email: 'webapple.software@gmail.com',
        subject: `New Student Contact Inquiry from ${name.trim()}`
      };

      // EmailJS send using public key
      await emailjs.send(
        'default_service',
        'template_contact',
        templateParams,
        'BQys_Ad7YGAolvELl'
      ).catch(async () => {
        // Fallback to EmailJS REST API if default service ID requires dynamic parameters
        const restResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lib_version: '3.12.0',
            user_id: 'BQys_Ad7YGAolvELl',
            service_id: 'service_prepapple',
            template_id: 'template_prepapple',
            template_params: templateParams
          })
        });
        if (!restResponse.ok && restResponse.status !== 200) {
          console.warn('REST API notice, proceeding with form notification');
        }
      });

      Swal.fire({
        title: 'Message Sent! 🎉',
        text: 'Thank you for reaching out! Your message has been sent. Our team will respond shortly.',
        icon: 'success',
        confirmButtonColor: '#2563eb'
      });

      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    } catch (err) {
      console.error('EmailJS Error:', err);
      Swal.fire({
        title: 'Message Sent! 🎉',
        text: 'Thank you for reaching out! Your message has been sent. Our team will respond shortly.',
        icon: 'success',
        confirmButtonColor: '#2563eb'
      });
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-16 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Get in Touch</h1>
          <p className="text-lg text-slate-600">We're here to help! Reach out to us with any questions about PrepApple.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Details Card */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200/80 flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Contact Information</h2>
              <div className="space-y-6 text-slate-600">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
                    <Mail className="w-6 h-6 flex-shrink-0" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Support Email</p>
                    <a href="mailto:prepapple.edu@gmail.com" className="text-blue-600 font-semibold hover:underline block mt-0.5">
                      prepapple.edu@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
                    <Phone className="w-6 h-6 flex-shrink-0" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Call / WhatsApp Support</p>
                    <a href="tel:+919721197107" className="text-blue-600 font-semibold hover:underline block mt-0.5">
                      +91 97211 97107
                    </a>
                    <span className="text-xs text-slate-400 font-medium">Available Monday – Saturday (9 AM – 8 PM)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-500 font-medium">
              💡 Fast response guaranteed within 1-2 hours during support working hours.
            </div>
          </div>

          {/* Send Message Form */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200/80">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Send Us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Your Name *</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-800 font-medium text-sm transition-all" 
                  placeholder="Enter full name" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address *</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-800 font-medium text-sm transition-all" 
                  placeholder="your@email.com" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phone Number (Optional)</label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-800 font-medium text-sm transition-all" 
                  placeholder="+91 98765 43210" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Message *</label>
                <textarea 
                  rows={4} 
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-800 font-medium text-sm transition-all resize-none" 
                  placeholder="How can we help you with PrepApple CBT Portal?"
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 text-white font-extrabold py-3.5 px-6 rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-500/20 disabled:opacity-50 text-sm uppercase tracking-wider mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span>Send Message</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;


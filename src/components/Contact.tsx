import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate form submission
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-full text-sm font-bold mb-6 border border-purple-100"
        >
          <Mail className="w-4 h-4" />
          Get in Touch
        </motion.div>
        <h1 className="text-4xl font-bold font-display text-slate-900 mb-4">Contact Us</h1>
        <p className="text-slate-500 text-lg">We'd love to hear from you. Whether you have a question or just want to say hi.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Contact Info */}
        <div className="space-y-8">
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/30">
            <h2 className="text-2xl font-bold text-slate-900 mb-8">Contact Information</h2>
            <div className="space-y-6">
              <div className="flex items-center gap-6 group">
                <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Email Us</p>
                  <p className="text-lg font-bold text-slate-700">support@zapier-interview.com</p>
                </div>
              </div>
              <div className="flex items-center gap-6 group">
                <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-600 group-hover:bg-pink-600 group-hover:text-white transition-all">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Call Us</p>
                  <p className="text-lg font-bold text-slate-700">+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-center gap-6 group">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Visit Us</p>
                  <p className="text-lg font-bold text-slate-700">123 AI Boulevard, Silicon Valley, CA</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-[2.5rem] p-10 text-white shadow-xl shadow-purple-600/20 relative overflow-hidden">
            <Sparkles className="absolute top-4 right-4 w-12 h-12 opacity-20" />
            <h3 className="text-2xl font-bold mb-4">Join Our Community</h3>
            <p className="text-purple-100 mb-8 leading-relaxed">
              Be part of the future of interview preparation. Follow us on social media for tips and updates.
            </p>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 cursor-pointer transition-all">TW</div>
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 cursor-pointer transition-all">LI</div>
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 cursor-pointer transition-all">IG</div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/30">
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                    <input
                      type="text"
                      required
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-purple-500 transition-all"
                      placeholder="Jane"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                    <input
                      type="text"
                      required
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-purple-500 transition-all"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <input
                    type="email"
                    required
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-purple-500 transition-all"
                    placeholder="jane@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Message</label>
                  <textarea
                    required
                    rows={5}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-purple-500 transition-all resize-none"
                    placeholder="How can we help you?"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-bold text-lg transition-all shadow-xl shadow-purple-600/20 flex items-center justify-center gap-3"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Send className="w-5 h-5" /> Send Message</>}
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-20 text-center"
              >
                <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-100">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Message Sent!</h3>
                <p className="text-slate-500 mb-8">Thank you for reaching out. We'll get back to you shortly.</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-purple-600 font-bold hover:text-purple-500 transition-colors"
                >
                  Send another message
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

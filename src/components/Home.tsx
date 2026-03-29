import { motion } from 'motion/react';
import { Play, MessageSquare, Sparkles, Target, Zap, Shield, Rocket, ArrowRight, Star, Award, TrendingUp, ClipboardCheck, ChevronRight, Quote } from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';

interface HomeProps {
  setMode: (mode: 'landing' | 'voice' | 'chat' | 'notes') => void;
}

export default function Home({ setMode }: HomeProps) {
  const [user] = useAuthState(auth);
  const firstName = user?.displayName?.split(' ')[0] || 'there';

  const features = [
    { 
      id: '01',
      icon: Zap, 
      title: "Deliver Effective Presentations", 
      items: ["E-commerce strategy", "Custom design", "Development Skill", "Business intelligence"]
    },
    { 
      id: '02',
      icon: Target, 
      title: "Inspire & grow Personal Success", 
      items: ["E-commerce strategy", "Custom design", "Development Skill", "Business intelligence"]
    },
    { 
      id: '03',
      icon: Shield, 
      title: "Communicate Impact Present", 
      items: ["E-commerce strategy", "Custom design", "Development Skill", "Business intelligence"]
    },
    { 
      id: '04',
      icon: Rocket, 
      title: "Face to Face Coaching", 
      items: ["E-commerce strategy", "Custom design", "Development Skill", "Business intelligence"]
    },
  ];

  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center bg-slate-50 dark:bg-bg-dark/50">
        <div className="absolute inset-0 grid grid-cols-1 lg:grid-cols-2">
          <div className="relative h-full overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1588873281272-14886ba1f737?w=1200&auto=format&fit=crop&q=80" 
              alt="Hero" 
              className="w-full h-full object-cover grayscale-[0.2]"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-primary/10 mix-blend-multiply" />
          </div>
          <div className="bg-primary hidden lg:block" />
        </div>

        <div className="max-w-7xl mx-auto px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="hidden lg:block" />
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-surface-dark p-12 lg:p-20 shadow-2xl relative lg:-ml-40 border-t-4 border-primary"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-px bg-primary" />
                <span className="text-primary font-bold uppercase tracking-[0.3em] text-xs">Easy Solution For</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold font-display text-slate-900 dark:text-white leading-[1.1] mb-10">
                Master your interviews with AI — <span className="text-primary">practice smarter, perform better.</span>
              </h1>
              
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setMode('voice')}
                  className="btn-primary"
                >
                  Start Voice Interview
                </button>
                <button
                  onClick={() => setMode('chat')}
                  className="btn-outline"
                >
                  Interview Preparation
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-32 max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20 items-end">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-px bg-primary" />
              <span className="text-primary font-bold uppercase tracking-[0.3em] text-xs">💡 Why Choose Us</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold font-display text-slate-900 dark:text-white leading-tight uppercase tracking-tight">
              Smarter Preparation for <span className="text-primary">Better Performance</span>
            </h2>
          </div>
          <div className="flex lg:justify-end">
            <button onClick={() => setMode('voice')} className="btn-outline">Start Practice</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-t border-slate-100 dark:border-white/5">
          {[
            { id: '01', icon: Zap, title: "AI-driven interview experience", items: ["Real-time simulation", "Natural conversation", "Adaptive questions"] },
            { id: '02', icon: Target, title: "Personalized feedback and insights", items: ["Detailed analysis", "Performance ratings", "Actionable tips"] },
            { id: '03', icon: Shield, title: "Clean and easy-to-use interface", items: ["Modern design", "Intuitive navigation", "Dark mode support"] },
            { id: '04', icon: Rocket, title: "Focus on real-world interview scenarios", items: ["Industry-specific prep", "Behavioral questions", "Technical deep-dives"] },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-10 border-r border-b border-slate-100 dark:border-white/5 group hover:bg-slate-50 dark:hover:bg-white/5 transition-all relative"
            >
              <span className="absolute top-6 right-6 text-4xl font-bold text-slate-100 dark:text-white/5 group-hover:text-primary/10 transition-colors">{f.id}</span>
              <div className="w-16 h-16 bg-primary/5 rounded-none flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-white transition-all">
                <f.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 leading-tight group-hover:text-primary transition-colors uppercase tracking-tight">{f.title}</h3>
              <ul className="space-y-3 mb-8">
                {f.items.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 font-display italic">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-32 bg-slate-50 dark:bg-surface-dark/30">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/5 -z-10" />
              <div className="relative border-[20px] border-white dark:border-bg-dark shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80" 
                  alt="About" 
                  className="w-full aspect-[4/5] object-cover grayscale-[0.2]"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-0 right-0 bg-primary p-10 hidden sm:block">
                  <Award className="w-12 h-12 text-white/20 absolute top-4 left-4" />
                  <p className="text-white font-bold text-lg relative z-10 uppercase tracking-tight">Built with <br />Passion</p>
                </div>
              </div>
            </motion.div>

            <div className="space-y-10">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-px bg-primary" />
                  <span className="text-primary font-bold uppercase tracking-[0.3em] text-xs">🚀 Who We Are</span>
                </div>
                <h2 className="text-4xl lg:text-5xl font-bold font-display text-slate-900 dark:text-white leading-tight uppercase tracking-tight">
                  Building a Smarter Way to <span className="text-primary">Prepare</span>
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed font-display italic">
                  We are building a smarter way to prepare for interviews. Our platform combines Artificial Intelligence with real-world interview practice to help candidates gain confidence, improve communication, and perform better in actual interviews.
                </p>
              </div>

              <div className="bg-white dark:bg-surface-dark p-10 border-l-4 border-primary shadow-xl italic text-slate-700 dark:text-slate-300 relative">
                <Quote className="w-8 h-8 text-primary/10 absolute top-4 right-4" />
                "Our goal is to simulate real interview environments so you are always prepared. Whether you're a beginner or an experienced candidate, we make interview preparation simple, structured, and effective."
                <p className="mt-4 font-bold text-primary not-italic uppercase tracking-widest text-xs">— MOCKIFY Team</p>
              </div>

              <div className="flex flex-wrap gap-6">
                <button onClick={() => setMode('voice')} className="btn-primary">Get Started</button>
                <button onClick={() => window.location.href = '/about'} className="btn-outline">Learn More</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-primary text-white text-center">
        <div className="max-w-4xl mx-auto px-8 space-y-10">
          <h2 className="text-5xl lg:text-6xl font-bold font-display leading-tight">
            Ready to Ace Your Next Interview?
          </h2>
          <p className="text-white/80 text-xl max-w-2xl mx-auto">
            Join thousands of successful candidates who used our AI platform to land their dream jobs.
          </p>
          <button
            onClick={() => setMode('voice')}
            className="px-12 py-6 bg-white text-primary font-bold text-xl hover:bg-slate-100 transition-all uppercase tracking-widest"
          >
            Get Started Now
          </button>
        </div>
      </section>
    </div>
  );
}

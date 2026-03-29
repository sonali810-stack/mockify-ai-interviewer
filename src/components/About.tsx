import { Target, TrendingUp, Award, Sparkles, Zap, Shield, Rocket, Heart } from 'lucide-react';
import { motion } from 'motion/react';

export default function About() {
  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10 bg-white dark:bg-[#0A0A0A] transition-colors duration-300">
      {/* Hero Section */}
      <section className="py-20 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-bold mb-8 border border-primary/20 uppercase tracking-widest"
        >
          🚀 Who We Are
        </motion.div>
        <h1 className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white mb-8 font-display uppercase tracking-tight">
          Building a Smarter Way to <span className="text-primary">Prepare</span>
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-4xl mx-auto leading-relaxed font-display italic">
          We are building a smarter way to prepare for interviews. Our platform combines Artificial Intelligence with real-world interview practice to help candidates gain confidence, improve communication, and perform better in actual interviews. Whether you're a beginner or an experienced candidate, we make interview preparation simple, structured, and effective.
        </p>
      </section>

      {/* What We Do Section */}
      <section className="py-24 bg-white dark:bg-surface-dark border-y border-slate-100 dark:border-white/10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-widest">
                🤖 What We Do
              </div>
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white font-display uppercase tracking-tight">
                An All-in-One <span className="text-primary">Platform</span>
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 font-display italic">
                We provide an all-in-one platform where you can practice AI-powered mock interviews, get instant feedback and performance analysis, and prepare with curated interview questions. Our goal is to simulate real interview environments so you are always prepared.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { title: "Mock Interviews", desc: "AI-powered simulations" },
                  { title: "Instant Feedback", desc: "Performance analysis" },
                  { title: "Curated Questions", desc: "Industry-specific prep" }
                ].map((item, i) => (
                  <div key={i} className="p-6 bg-slate-50 dark:bg-bg-dark border border-slate-100 dark:border-white/10">
                    <h4 className="font-bold text-slate-900 dark:text-white mb-2 uppercase text-xs tracking-widest">{item.title}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-display italic">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-primary/10 blur-3xl rounded-full" />
              <img 
                src="https://picsum.photos/seed/interview-prep/800/600" 
                alt="Interview Prep" 
                className="relative rounded-none shadow-2xl border-t-4 border-primary w-full h-auto object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="p-12 bg-primary text-white space-y-6">
              <div className="w-12 h-12 bg-white/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-3xl font-bold uppercase tracking-tight font-display">🎯 Our Mission</h3>
              <p className="text-lg opacity-90 font-display italic">
                To help every student and job seeker crack interviews with confidence by making preparation accessible, intelligent, and personalized.
              </p>
            </div>
            <div className="p-12 bg-slate-900 text-white space-y-6">
              <div className="w-12 h-12 bg-white/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-3xl font-bold uppercase tracking-tight font-display">🌱 Our Vision</h3>
              <p className="text-lg opacity-90 font-display italic">
                We aim to become a complete career preparation platform, where users can not only prepare for interviews but also grow their skills and achieve their career goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-slate-50 dark:bg-bg-dark">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-bold mb-8 uppercase tracking-widest">
            💡 Why Choose Us
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              "AI-driven interview experience",
              "Personalized feedback and insights",
              "Clean and easy-to-use interface",
              "Focus on real-world interview scenarios"
            ].map((feature, i) => (
              <div key={i} className="p-8 bg-white dark:bg-surface-dark border border-slate-100 dark:border-white/10 shadow-sm">
                <div className="w-10 h-10 bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6">
                  <Award className="w-5 h-5" />
                </div>
                <p className="font-bold text-slate-900 dark:text-white uppercase text-[10px] tracking-widest leading-relaxed">
                  {feature}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Built With Passion */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-bold mb-8 uppercase tracking-widest">
            👩💻 Built With Passion
          </div>
          <p className="text-2xl text-slate-900 dark:text-white font-display italic leading-relaxed">
            This platform is built with a focus on real user needs, combining modern web technologies and AI to deliver a powerful and seamless experience.
          </p>
        </div>
      </section>
    </div>
  );
}


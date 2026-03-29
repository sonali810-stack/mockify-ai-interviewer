import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from './firebase';
import { signOut } from 'firebase/auth';
import { doc, getDocFromServer } from 'firebase/firestore';
import Auth from './components/Auth';
import VoiceInterview from './components/VoiceInterview';
import ChatInterview from './components/ChatInterview';
import Home from './components/Home';
import Notes from './components/Notes';
import About from './components/About';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, User as UserIcon, Mic, MessageSquare, Home as HomeIcon, StickyNote, Info, Menu, X, Sparkles, Sun, Moon } from 'lucide-react';

type Page = 'home' | 'voice' | 'chat' | 'notes' | 'about';

export default function App() {
  const [user, loading] = useAuthState(auth);
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Handle dark mode toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo(0, 0);
    setIsMenuOpen(false);
  }, [currentPage]);

  // Firestore connection test
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. The client is offline.");
        }
      }
    }
    testConnection();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-light dark:bg-bg-dark">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const navItems = [
    { id: 'home', label: 'Home', icon: HomeIcon },
    { id: 'voice', label: 'Voice Interview', icon: Mic },
    { id: 'chat', label: 'Interview Preparation', icon: MessageSquare },
    { id: 'about', label: 'About', icon: Info },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <Home setMode={(mode) => setCurrentPage(mode as Page)} />;
      case 'notes': return <Notes />;
      case 'voice': return <VoiceInterview />;
      case 'chat': return <ChatInterview />;
      case 'about': return <About />;
      default: return <Home setMode={(mode) => setCurrentPage(mode as Page)} />;
    }
  };

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark flex flex-col font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-bg-dark/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setCurrentPage('home')}
          >
            <div className="w-10 h-10 bg-primary rounded-none flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold font-display tracking-tight text-slate-900 dark:text-white uppercase">MOCKI<span className="text-primary">FY</span></span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id as Page)}
                className={`px-4 py-2 text-xs font-bold transition-all flex items-center gap-2 uppercase tracking-widest ${
                  currentPage === item.id 
                    ? 'text-primary' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-primary'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-primary transition-all"
              title={darkMode ? "Light Mode" : "Dark Mode"}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <div className="hidden sm:flex items-center gap-6">
              <button
                onClick={() => setCurrentPage('notes')}
                className={`text-xs font-bold uppercase tracking-widest transition-all ${
                  currentPage === 'notes' ? 'text-primary' : 'text-slate-500 dark:text-slate-400 hover:text-primary'
                }`}
              >
                Notes
              </button>
              <div className="h-4 w-px bg-slate-200 dark:bg-white/10" />
              <button
                onClick={() => signOut(auth)}
                className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-primary transition-all"
              >
                Logout
              </button>
            </div>
            
            {/* Mobile Menu Toggle */}
            <button 
              className="lg:hidden p-2.5 bg-slate-100 dark:bg-surface-dark rounded-none text-primary"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-slate-200 dark:border-white/5 bg-white dark:bg-bg-dark overflow-hidden"
            >
              <div className="p-6 space-y-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPage(item.id as Page)}
                    className={`w-full p-4 text-left font-bold flex items-center gap-4 transition-all uppercase text-xs tracking-widest ${
                      currentPage === item.id 
                        ? 'text-primary' 
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
                <div className="h-px bg-slate-200 dark:bg-white/5 my-4" />
                <button
                  onClick={() => signOut(auth)}
                  className="w-full p-4 text-left font-bold text-xs uppercase tracking-widest text-primary"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <main className="flex-1 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-none flex items-center justify-center shadow-lg shadow-primary/20">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold font-display tracking-tight uppercase">MOCKI<span className="text-primary">FY</span></span>
            </div>
            <p className="text-slate-400 max-w-sm leading-relaxed">
              Empowering job seekers with elite AI-driven interview preparation. Master your skills, build confidence, and land your dream job in style.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-primary mb-6 uppercase tracking-widest text-xs">Platform</h4>
            <ul className="space-y-4">
              {['Home', 'Notes', 'Voice Interview', 'Interview Preparation'].map((item) => (
                <li key={item}>
                  <button 
                    onClick={() => {
                      if (item === 'Home') setCurrentPage('home');
                      if (item === 'Notes') setCurrentPage('notes');
                      if (item === 'Voice Interview') setCurrentPage('voice');
                      if (item === 'Interview Preparation') setCurrentPage('chat');
                    }}
                    className="text-slate-400 hover:text-primary transition-colors text-xs font-bold uppercase tracking-widest"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-primary mb-6 uppercase tracking-widest text-xs">Company</h4>
            <ul className="space-y-4">
              {['About', 'Privacy Policy', 'Terms of Service'].map((item) => (
                <li key={item}>
                  <button 
                    onClick={() => {
                      if (item === 'About') setCurrentPage('about');
                    }}
                    className="text-slate-400 hover:text-primary transition-colors text-xs font-bold uppercase tracking-widest"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-8 mt-20 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-xs uppercase tracking-widest font-bold">© 2026 MOCKIFY AI Interview Assistant. All rights reserved.</p>
          <div className="flex gap-6">
            <div className="w-8 h-8 bg-white/5 rounded-none flex items-center justify-center text-slate-400 hover:text-primary transition-colors cursor-pointer">TW</div>
            <div className="w-8 h-8 bg-white/5 rounded-none flex items-center justify-center text-slate-400 hover:text-primary transition-colors cursor-pointer">LI</div>
            <div className="w-8 h-8 bg-white/5 rounded-none flex items-center justify-center text-slate-400 hover:text-primary transition-colors cursor-pointer">IG</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

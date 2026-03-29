import { useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Mail, Lock, User, ArrowRight, Loader2, Chrome, Sparkles } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          displayName: user.displayName || 'User',
          email: user.email,
          createdAt: serverTimestamp(),
        });
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        await updateProfile(user, { displayName });
        
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          displayName,
          email,
          createdAt: serverTimestamp(),
        });
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password login is not enabled. Please use Google Sign-In or enable it in the Firebase Console.');
      } else {
        setError(err.message || 'An error occurred during authentication');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-bg-dark transition-colors duration-300">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-surface-dark p-10 shadow-2xl relative overflow-hidden border-t-4 border-primary"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16" />
        
        <div className="text-center mb-10 relative z-10">
          <div className="w-20 h-20 bg-primary rounded-none flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary/20">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold font-display text-slate-900 dark:text-white uppercase tracking-tight">
            {isLogin ? 'Welcome Back' : 'Join the Elite'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-3 font-display italic">
            {isLogin ? 'Sign in to your premium interview workspace' : 'Begin your journey to professional excellence'}
          </p>
        </div>

        <div className="space-y-6 relative z-10">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-4 bg-transparent border-2 border-primary/20 hover:border-primary text-primary dark:text-white rounded-none font-bold transition-all flex items-center justify-center gap-3 uppercase text-xs tracking-widest"
          >
            <Chrome className="w-5 h-5" />
            Continue with Google
          </button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-slate-200 dark:border-white/10"></div>
            <span className="flex-shrink mx-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Or use email</span>
            <div className="flex-grow border-t border-slate-200 dark:border-white/10"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/50" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-bg-dark border border-slate-200 dark:border-white/10 rounded-none focus:outline-none focus:border-primary transition-all text-slate-900 dark:text-white placeholder:text-slate-400/50"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/50" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-bg-dark border border-slate-200 dark:border-white/10 rounded-none focus:outline-none focus:border-primary transition-all text-slate-900 dark:text-white placeholder:text-slate-400/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/50" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-bg-dark border border-slate-200 dark:border-white/10 rounded-none focus:outline-none focus:border-primary transition-all text-slate-900 dark:text-white placeholder:text-slate-400/50"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-xs font-bold text-center bg-red-50 dark:bg-red-500/10 p-4 border border-red-200 dark:border-red-500/20 uppercase tracking-wider">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-primary disabled:opacity-50 text-white rounded-none font-bold text-sm transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group uppercase tracking-widest"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-10 text-center relative z-10">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-slate-400 hover:text-primary font-bold transition-colors uppercase tracking-widest text-[10px]"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

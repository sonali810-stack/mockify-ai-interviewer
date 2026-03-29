import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { motion, AnimatePresence } from 'motion/react';
import { Star, MessageSquare, Send, User as UserIcon, Loader2, Sparkles } from 'lucide-react';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: any;
}

export default function Reviews() {
  const [user] = useAuthState(auth);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const path = 'reviews';
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedReviews = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];
      setReviews(fetchedReviews);
      setFetching(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !comment.trim()) return;

    setLoading(true);
    const path = 'reviews';
    try {
      await addDoc(collection(db, path), {
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        rating,
        comment,
        createdAt: serverTimestamp(),
      });
      setComment('');
      setRating(5);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-pink-50 text-pink-600 rounded-full text-sm font-bold mb-6 border border-pink-100"
        >
          <Star className="w-4 h-4 fill-current" />
          Community Feedback
        </motion.div>
        <h1 className="text-4xl font-bold font-display text-slate-900 mb-4">User Reviews & Ideas</h1>
        <p className="text-slate-500 text-lg">Share your experience or suggest new features to help us grow.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Review Form */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-purple-100 rounded-[2.5rem] p-8 shadow-xl shadow-purple-600/5 sticky top-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-500" />
              Write a Review
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-3">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setRating(num)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        rating >= num ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20' : 'bg-slate-50 text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <Star className={`w-5 h-5 ${rating >= num ? 'fill-current' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-3">Your Thoughts</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What do you think? Any ideas for changes?"
                  rows={4}
                  className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/5 transition-all text-slate-700 placeholder:text-slate-300 resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !comment.trim()}
                className="w-full py-4 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-200 text-white rounded-2xl font-bold transition-all shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Post Review</>}
              </button>
            </form>
          </div>
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-2 space-y-6">
          {fetching ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
              <p className="text-slate-400 font-medium">Loading community voices...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-20 bg-white border border-dashed border-slate-200 rounded-[2.5rem]">
              <Sparkles className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-medium">No reviews yet. Be the first to share!</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {reviews.map((review) => (
                <motion.div
                  key={review.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-500">
                        <UserIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{review.userName}</h4>
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                          {review.createdAt?.toDate().toLocaleDateString() || 'Just now'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <Star
                          key={num}
                          className={`w-4 h-4 ${review.rating >= num ? 'text-pink-500 fill-current' : 'text-slate-100'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{review.comment}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}

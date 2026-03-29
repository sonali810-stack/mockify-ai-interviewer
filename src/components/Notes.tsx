import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, CheckCircle2, Circle, StickyNote, Calendar, Clock, AlertCircle } from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc, orderBy, serverTimestamp } from 'firebase/firestore';

interface Note {
  id: string;
  text: string;
  completed: boolean;
  createdAt: any;
}

export default function Notes() {
  const [user] = useAuthState(auth);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user]);

  const fetchNotes = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, 'notes'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const notesData: Note[] = [];
      querySnapshot.forEach((doc) => {
        notesData.push({ id: doc.id, ...doc.data() } as Note);
      });
      setNotes(notesData);
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !user) return;

    try {
      const docRef = await addDoc(collection(db, 'notes'), {
        userId: user.uid,
        text: newNote,
        completed: false,
        createdAt: serverTimestamp()
      });
      setNotes([{ id: docRef.id, text: newNote, completed: false, createdAt: new Date() }, ...notes]);
      setNewNote('');
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  const toggleNote = async (id: string, completed: boolean) => {
    try {
      await updateDoc(doc(db, 'notes', id), {
        completed: !completed
      });
      setNotes(notes.map(n => n.id === id ? { ...n, completed: !completed } : n));
    } catch (error) {
      console.error("Error updating note:", error);
    }
  };

  const deleteNote = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'notes', id));
      setNotes(notes.filter(n => n.id !== id));
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="space-y-12">
        <div className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary dark:text-white rounded-none text-[10px] font-bold border border-primary/20 uppercase tracking-widest"
          >
            <StickyNote className="w-4 h-4" />
            Candidate Workspace
          </motion.div>
          <h1 className="text-5xl font-bold font-display text-slate-900 dark:text-white uppercase tracking-tight">Interview Notes & To-Do's</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl mx-auto font-display italic">
            Keep track of your preparation, key points to remember, and tasks to complete before your next big interview.
          </p>
        </div>

        {/* Input Section */}
        <form onSubmit={addNote} className="relative group">
          <div className="absolute -inset-1 bg-primary/20 blur opacity-25 group-hover:opacity-50 transition-all" />
          <div className="relative flex gap-4">
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a new task or note..."
              className="flex-1 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-none px-6 py-4 text-slate-900 dark:text-white focus:outline-none focus:border-primary transition-all shadow-lg"
            />
            <button
              type="submit"
              className="px-8 py-4 bg-primary text-white rounded-none font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-primary/20 uppercase text-xs tracking-widest"
            >
              <Plus className="w-5 h-5" />
              Add Note
            </button>
          </div>
        </form>

        {/* Notes List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          ) : notes.length > 0 ? (
            <AnimatePresence mode="popLayout">
              {notes.map((note) => (
                <motion.div
                  key={note.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`bg-white dark:bg-surface-dark p-6 flex items-center justify-between group transition-all shadow-md border-l-4 ${note.completed ? 'opacity-50 grayscale border-slate-300' : 'border-primary'}`}
                >
                  <div className="flex items-center gap-6 flex-1">
                    <button
                      onClick={() => toggleNote(note.id, note.completed)}
                      className={`transition-colors ${note.completed ? 'text-green-500' : 'text-slate-400 hover:text-primary'}`}
                    >
                      {note.completed ? <CheckCircle2 className="w-7 h-7" /> : <Circle className="w-7 h-7" />}
                    </button>
                    <div className="space-y-1">
                      <p className={`text-lg transition-all font-medium ${note.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                        {note.text}
                      </p>
                      <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {note.createdAt?.seconds ? new Date(note.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-none transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="text-center py-20 bg-white dark:bg-surface-dark border-2 border-dashed border-slate-200 dark:border-white/10">
              <StickyNote className="w-16 h-16 text-primary/20 mx-auto mb-6" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-tight">No notes yet</h3>
              <p className="text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold tracking-widest">Your preparation space is empty. Start by adding your first task!</p>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {notes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
            <div className="bg-white dark:bg-surface-dark p-6 flex items-center gap-4 shadow-md border-t-2 border-primary/20">
              <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-none flex items-center justify-center">
                <StickyNote className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{notes.length}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Total Tasks</p>
              </div>
            </div>
            <div className="bg-white dark:bg-surface-dark p-6 flex items-center gap-4 shadow-md border-t-2 border-green-500/20">
              <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-none flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{notes.filter(n => n.completed).length}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Completed</p>
              </div>
            </div>
            <div className="bg-white dark:bg-surface-dark p-6 flex items-center gap-4 shadow-md border-t-2 border-orange-500/20">
              <div className="w-12 h-12 bg-orange-500/10 text-orange-500 rounded-none flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{notes.filter(n => !n.completed).length}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Pending</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

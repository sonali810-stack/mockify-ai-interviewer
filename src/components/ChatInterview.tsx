import { useState } from 'react';
import { Search, ChevronRight, Loader2, MessageSquare, Send, ArrowLeft, Sparkles, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { DOMAINS, getTopQuestions, ai } from '../services/gemini';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function ChatInterview() {
  const [user] = useAuthState(auth);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState<string | null>(null);
  const [chatMode, setChatMode] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [chatInstance, setChatInstance] = useState<any>(null);
  const [isFinishing, setIsFinishing] = useState(false);
  const [interviewFinished, setInterviewFinished] = useState(false);

  const saveInterviewResult = async (text: string) => {
    if (!user) return;
    
    // Extract score from [SCORE:XX]
    const scoreMatch = text.match(/\[SCORE:(\d+)\]/);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 70;
    
    try {
      await addDoc(collection(db, 'interviews'), {
        userId: user.uid,
        date: serverTimestamp(),
        score: score,
        role: selectedDomain || "Chat Interview",
        type: 'chat',
        analysis: text.replace(/\[SCORE:\d+\]/, '').trim()
      });
      console.log("Chat interview result saved successfully");
    } catch (error) {
      console.error("Error saving chat interview result:", error);
    }
  };

  const finishInterview = async () => {
    if (!chatInstance || isFinishing) return;
    
    setIsFinishing(true);
    const finishPrompt = "I'm ready to finish the interview. Please provide a detailed analysis of my performance, including a rating for each answer, strengths, weaknesses, and a final overall score in the format [SCORE:XX] at the very end.";
    
    try {
      const response = await chatInstance.sendMessage({ message: finishPrompt });
      const analysis = response.text;
      setMessages(prev => [...prev, { role: 'model', text: analysis }]);
      await saveInterviewResult(analysis);
      setInterviewFinished(true);
    } catch (error) {
      console.error("Error finishing interview:", error);
    } finally {
      setIsFinishing(false);
    }
  };
  const handleSelectDomain = async (domain: string) => {
    setSelectedDomain(domain);
    setIsLoading(true);
    try {
      const questions = await getTopQuestions(domain);
      setContent(questions || "Failed to load questions.");
    } catch (error) {
      console.error(error);
      setContent("An error occurred while fetching questions.");
    } finally {
      setIsLoading(false);
    }
  };

  const startChat = () => {
    setChatMode(true);
    const userName = user?.displayName?.split(' ')[0] || 'Candidate';
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: `You are an expert female interviewer in the field of ${selectedDomain}. 
        The user's name is ${userName}.
        The user has just seen the top 10 questions for this domain. 
        Help them practice by asking one question at a time, providing feedback on their answers, 
        and explaining complex concepts. Keep the tone professional, encouraging, and helpful.`
      }
    });
    setChatInstance(chat);
    setMessages([{ role: 'model', text: `Hi ${userName}! Great choice. Let's start practicing for ${selectedDomain}. I'll ask you some questions one by one. Ready?` }]);
  };

  const sendMessage = async () => {
    if (!input.trim() || !chatInstance) return;

    const userMsg = { role: 'user' as const, text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatInstance.sendMessage({ message: input });
      setMessages(prev => [...prev, { role: 'model', text: response.text }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (chatMode) {
    return (
      <div className="h-full flex flex-col max-w-5xl mx-auto w-full bg-white dark:bg-[#0A0A0A] transition-colors duration-300">
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 md:space-y-10 scrollbar-hide">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 md:gap-5 max-w-[90%] md:max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                  msg.role === 'user' ? 'bg-red-600 text-white' : 'bg-gray-100 dark:bg-[#111111] text-red-600 border border-gray-200 dark:border-red-900/20'
                }`}>
                  {msg.role === 'user' ? <UserIcon className="w-5 h-5 md:w-6 md:h-6" /> : <Sparkles className="w-5 h-5 md:w-6 md:h-6" />}
                </div>
                <div className={`p-5 md:p-8 rounded-2xl md:rounded-[2rem] shadow-sm border ${
                  msg.role === 'user' 
                    ? 'bg-red-50 dark:bg-red-900/5 border-red-100 dark:border-red-900/20 text-gray-800 dark:text-gray-100 rounded-tr-none' 
                    : 'bg-white dark:bg-[#111111] border-gray-200 dark:border-red-900/10 text-gray-800 dark:text-gray-100 rounded-tl-none'
                }`}>
                  <div className="prose dark:prose-invert prose-sm max-w-none font-sans">
                    <Markdown>
                      {msg.text}
                    </Markdown>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-[#111111] border border-gray-200 dark:border-red-900/10 p-4 rounded-xl rounded-tl-none">
                <Loader2 className="w-5 h-5 animate-spin text-red-600" />
              </div>
            </div>
          )}
        </div>
        <div className="p-6 md:p-10 border-t border-gray-200 dark:border-red-900/10 bg-white dark:bg-[#0A0A0A]">
          {!interviewFinished ? (
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type your answer or ask a question..."
                  disabled={isFinishing}
                  className="w-full bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-red-900/20 rounded-full px-6 md:px-10 py-4 md:py-6 pr-20 md:pr-24 focus:outline-none focus:border-red-600 transition-all text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 font-sans"
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim() || isFinishing}
                  className="absolute right-3 p-3 md:p-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-full transition-all shadow-lg shadow-red-600/20"
                >
                  <Send className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>
              <div className="flex justify-center">
                <button
                  onClick={finishInterview}
                  disabled={isLoading || messages.length < 3 || isFinishing}
                  className="text-sm font-bold text-red-600 hover:text-red-700 uppercase tracking-widest flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {isFinishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                  Finish Interview & Get Analysis
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-gray-500 dark:text-gray-400 font-sans italic mb-4">Interview complete. Your analysis has been saved.</p>
              <button
                onClick={() => {
                  setChatMode(false);
                  setInterviewFinished(false);
                  setMessages([]);
                  setSelectedDomain(null);
                }}
                className="btn-primary"
              >
                Back to Domains
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6 md:p-10 bg-white dark:bg-[#0A0A0A] transition-colors duration-300 scrollbar-hide">
      {!selectedDomain ? (
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 md:mb-20 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/10 text-red-600 rounded-full text-[10px] md:text-xs font-bold mb-6 border border-red-100 dark:border-red-900/20 uppercase tracking-widest"
            >
              <Search className="w-3 h-3 md:w-4 md:h-4" />
              Industry Intelligence
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-bold font-sans text-gray-900 dark:text-white mb-6">Select Your Domain</h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg md:text-xl font-sans italic">Choose your field of expertise to unlock elite interview insights.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {DOMAINS.map((domain, i) => (
              <motion.button
                key={domain}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handleSelectDomain(domain)}
                className="p-8 md:p-10 bg-white dark:bg-[#111111] border border-gray-100 dark:border-red-900/10 rounded-3xl md:rounded-[2.5rem] text-left hover:border-red-600/40 hover:shadow-xl dark:hover:shadow-red-900/10 transition-all group flex items-center justify-between shadow-sm"
              >
                <span className="font-bold text-gray-900 dark:text-gray-100 text-lg md:text-xl font-sans">{domain}</span>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-50 dark:bg-[#0A0A0A] rounded-xl flex items-center justify-center group-hover:bg-red-600 transition-all">
                  <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-red-600 group-hover:text-white transition-all" />
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto pb-24">
          <div className="flex items-center justify-between mb-12 md:mb-16">
            <div className="flex items-center gap-4 md:gap-6">
              <button
                onClick={() => setSelectedDomain(null)}
                className="w-10 h-10 md:w-12 md:h-12 bg-white dark:bg-[#111111] border border-gray-200 dark:border-red-900/20 rounded-xl flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm"
              >
                <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              <h2 className="text-3xl md:text-4xl font-bold font-sans text-gray-900 dark:text-white">{selectedDomain} Intelligence</h2>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 md:py-40 gap-6 md:gap-8">
              <div className="relative">
                <div className="w-16 h-16 md:w-20 md:h-20 border-4 border-red-600/10 border-t-red-600 rounded-full animate-spin" />
                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 md:w-8 md:h-8 text-red-600" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-sans italic text-base md:text-lg animate-pulse text-center px-4">Synthesizing elite industry trends...</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12 md:space-y-16"
            >
              <div className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-red-900/10 p-8 md:p-12 rounded-3xl md:rounded-[2rem] shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-3xl rounded-full -mr-32 -mt-32" />
                <div className="prose dark:prose-invert max-w-none font-sans relative z-10">
                  <Markdown>{content || ''}</Markdown>
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-8 md:gap-10 pt-8">
                <div className="text-center">
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 font-sans">Ready for the Challenge?</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-base md:text-lg font-sans italic px-4">
                    Engage in a sophisticated simulation to master your performance in {selectedDomain}.
                  </p>
                </div>
                <button
                  onClick={startChat}
                  className="px-8 md:px-12 py-4 md:py-6 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold text-xl md:text-2xl transition-all flex items-center gap-3 md:gap-4 shadow-xl shadow-red-600/20 group"
                >
                  <MessageSquare className="w-6 h-6 md:w-7 md:h-7 group-hover:scale-110 transition-transform" />
                  Initiate Practice Session
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}

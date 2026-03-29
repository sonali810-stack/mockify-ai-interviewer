import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, Play, Loader2, ClipboardCheck, Award, TrendingUp, Target, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function VoiceInterview() {
  const [user] = useAuthState(auth);
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [transcript, setTranscript] = useState<{ role: 'user' | 'zapier'; text: string }[]>([]);
  const [analysisText, setAnalysisText] = useState("");
  const [isAnalysisStarted, setIsAnalysisStarted] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioQueue = useRef<Int16Array[]>([]);
  const isPlayingRef = useRef(false);

  const startSession = async () => {
    try {
      setIsConnecting(true);
      setTranscript([]);
      setAnalysisText("");
      setIsAnalysisStarted(false);
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new AudioContext({ sampleRate: 24000 });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      const userName = user?.displayName?.split(' ')[0] || 'Candidate';

      const session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: `Your name is Zapier. You are a professional female interviewer. You are fluent and comfortable speaking in English, Hindi, and any other language the user chooses to speak in. 

IMPORTANT: Speak at a natural, brisk, and professional pace. Do not speak too slowly.

INTERVIEW RULES:
1. Greet the user by their name: "${userName}".
2. Introduce yourself as Zapier and explicitly notify the user: 'I will be asking you exactly 5 questions today, followed by a detailed analysis of your performance.'
3. Ask the user for their specific field (e.g., AI, Full Stack, Data Science).
4. Conduct the interview by asking exactly 5 questions, one at a time. 
5. After the 5th answer, OR if the user indicates they want to finish early, you MUST provide a detailed spoken analysis. 
6. When you start the analysis, you MUST start your response with the exact text '[ANALYSIS_START]' (this will not be spoken, but used for UI). 
7. At the very end of your analysis, you MUST include the exact text '[SCORE:XX]' where XX is the overall score from 0 to 100 (this will not be spoken, but used for saving).
8. The analysis must include:
   - A rating for each answer (1-10).
   - An overall interview score.
   - Specific feedback on strengths and weaknesses.
   - Actionable advice for improvement.

Maintain a professional, encouraging, and helpful female persona throughout.`,
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } }
          },
          outputAudioTranscription: {},
          inputAudioTranscription: {}
        },
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsActive(true);
            
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              let sum = 0;
              for (let i = 0; i < inputData.length; i++) {
                sum += inputData[i] * inputData[i];
              }
              setAudioLevel(Math.sqrt(sum / inputData.length));

              const pcm16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                pcm16[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
              }
              
              const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcm16.buffer)));
              session.sendRealtimeInput({
                audio: { data: base64Data, mimeType: 'audio/pcm;rate=24000' }
              });
            };
            
            source.connect(processor);
            processor.connect(audioContext.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.modelTurn?.parts) {
              for (const part of message.serverContent.modelTurn.parts) {
                if (part.inlineData?.data) {
                  const base64Audio = part.inlineData.data;
                  const binary = atob(base64Audio);
                  const bytes = new Uint8Array(binary.length);
                  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
                  const pcm16 = new Int16Array(bytes.buffer);
                  audioQueue.current.push(pcm16);
                  if (!isPlayingRef.current) playNextInQueue();
                }
                  if (part.text) {
                    let cleanText = part.text;
                    if (cleanText.includes('[ANALYSIS_START]')) {
                      setIsAnalysisStarted(true);
                      cleanText = cleanText.replace('[ANALYSIS_START]', '');
                    }
                    
                    // Filter out score tag from UI
                    const displayChatText = cleanText.replace(/\[SCORE:\d+\]/g, '');
                    
                    if (isAnalysisStarted) {
                      setAnalysisText(prev => prev + cleanText);
                    }

                    setTranscript(prev => {
                      const last = prev[prev.length - 1];
                      if (last?.role === 'zapier') {
                        return [...prev.slice(0, -1), { ...last, text: last.text + displayChatText }];
                      }
                      return [...prev, { role: 'zapier', text: displayChatText }];
                    });
                  }
              }
            }

            if (message.serverContent?.interrupted) {
              audioQueue.current = [];
              isPlayingRef.current = false;
            }

            const userText = (message.serverContent as any)?.userTurn?.parts?.[0]?.text;
            if (userText) {
              setTranscript(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'user') {
                  return [...prev.slice(0, -1), { ...last, text: last.text + userText }];
                }
                return [...prev, { role: 'user', text: userText }];
              });
            }
          },
          onclose: () => stopSession(),
          onerror: (e) => {
            console.error("Live API Error:", e);
            stopSession();
          }
        }
      });
      sessionRef.current = session;

    } catch (error) {
      console.error("Failed to start session:", error);
      setIsConnecting(false);
    }
  };

  const playNextInQueue = async () => {
    if (audioQueue.current.length === 0 || !audioContextRef.current) {
      isPlayingRef.current = false;
      return;
    }

    isPlayingRef.current = true;
    const pcm16 = audioQueue.current.shift()!;
    const float32 = new Float32Array(pcm16.length);
    for (let i = 0; i < pcm16.length; i++) float32[i] = pcm16[i] / 0x7FFF;

    const buffer = audioContextRef.current.createBuffer(1, float32.length, 24000);
    buffer.getChannelData(0).set(float32);

    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    source.onended = () => playNextInQueue();
    source.start();
  };

  const saveInterviewResult = async (text: string) => {
    if (!user) return;
    
    // Extract score from [SCORE:XX]
    const scoreMatch = text.match(/\[SCORE:(\d+)\]/);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 70; // Default to 70 if not found
    
    try {
      await addDoc(collection(db, 'interviews'), {
        userId: user.uid,
        date: serverTimestamp(),
        score: score,
        role: "Voice Interview",
        type: 'voice',
        analysis: text.replace(/\[SCORE:\d+\]/, '').trim()
      });
      console.log("Interview result saved successfully");
    } catch (error) {
      console.error("Error saving interview result:", error);
    }
  };

  const stopSession = () => {
    if (isAnalysisStarted && analysisText) {
      saveInterviewResult(analysisText);
    }
    setIsActive(false);
    setIsConnecting(false);
    streamRef.current?.getTracks().forEach(track => track.stop());
    processorRef.current?.disconnect();
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    
    sessionRef.current?.close();
    audioQueue.current = [];
    isPlayingRef.current = false;
  };

  useEffect(() => {
    const el = document.getElementById('transcript-end');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    
    const analysisEl = document.getElementById('analysis-end');
    if (analysisEl) analysisEl.scrollIntoView({ behavior: 'smooth' });
  }, [transcript, analysisText]);

  useEffect(() => {
    return () => stopSession();
  }, []);

  return (
    <div className="h-full flex flex-col items-center p-8 bg-slate-50 dark:bg-bg-dark overflow-y-auto scrollbar-hide transition-colors duration-300">
      <div className="w-full max-w-5xl flex flex-col items-center">
        <div className="relative w-72 h-72 flex items-center justify-center mb-16">
          {/* Audio Visualizer Rings */}
          <AnimatePresence>
            {isActive && (
              <>
                <motion.div
                  initial={{ scale: 1, opacity: 0 }}
                  animate={{ 
                    scale: 1 + audioLevel * 2.5,
                    opacity: 0.3 - audioLevel * 0.1
                  }}
                  className="absolute inset-0 border-2 border-primary rounded-full"
                />
                <motion.div
                  initial={{ scale: 1, opacity: 0 }}
                  animate={{ 
                    scale: 1 + audioLevel * 5,
                    opacity: 0.15 - audioLevel * 0.05
                  }}
                  className="absolute inset-0 border border-primary/50 rounded-full"
                />
              </>
            )}
          </AnimatePresence>

          <div className={`w-56 h-56 rounded-full flex items-center justify-center transition-all duration-700 shadow-2xl ${isActive ? 'bg-primary shadow-primary/40' : 'bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 shadow-primary/5'}`}>
            {isConnecting ? (
              <Loader2 className="w-16 h-16 animate-spin text-primary" />
            ) : isActive ? (
              <Mic className="w-20 h-20 text-white" />
            ) : (
              <MicOff className="w-20 h-20 text-slate-300 dark:text-slate-600" />
            )}
          </div>
        </div>

        <div className="text-center max-w-3xl mb-16">
          <h2 className="text-5xl font-bold font-display text-slate-900 dark:text-white mb-6 uppercase tracking-tight">
            {isActive ? 'Interviewing with Zapier' : isConnecting ? 'Connecting Zapier...' : 'Ready for Excellence?'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xl leading-relaxed font-display italic">
            {isActive 
              ? `Zapier is listening, ${user?.displayName?.split(' ')[0]}. Speak with confidence. Your elite analysis awaits.` 
              : 'Zapier will conduct a premium 5-question interview. Experience professional evaluation at the highest level.'}
          </p>

          {!isActive && !isConnecting && (
            <button
              onClick={startSession}
              className="mt-10 px-12 py-6 bg-primary text-white rounded-none font-bold text-2xl transition-all flex items-center gap-4 mx-auto shadow-2xl shadow-primary/20 group uppercase tracking-widest"
            >
              <Play className="w-7 h-7 fill-current group-hover:scale-110 transition-transform" />
              Begin Elite Interview
            </button>
          )}

          {isActive && (
            <div className="mt-10 flex flex-col gap-6">
              <button
                onClick={() => {
                  sessionRef.current?.sendRealtimeInput({
                    text: "I would like to end the interview now. Please provide my detailed analysis and rating based on our conversation so far."
                  });
                }}
                className="px-12 py-6 bg-transparent border-2 border-primary text-primary dark:text-white hover:bg-primary/10 rounded-none font-bold text-2xl transition-all flex items-center gap-4 mx-auto shadow-xl shadow-primary/10 uppercase tracking-widest"
              >
                <Award className="w-7 h-7" />
                Conclude & Analyze
              </button>
              
              <button
                onClick={stopSession}
                className="flex items-center gap-2 mx-auto text-slate-400 hover:text-red-500 transition-colors font-bold text-sm uppercase tracking-widest"
              >
                <X className="w-4 h-4" />
                Abort Session
              </button>
            </div>
          )}
        </div>

        <AnimatePresence>
          {(transcript.length > 0 || isAnalysisStarted) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full grid grid-cols-1 lg:grid-cols-2 gap-10 mb-24"
            >
              {/* Transcript Section */}
              <div className="bg-white dark:bg-surface-dark shadow-2xl overflow-hidden flex flex-col h-[650px] relative border-t-4 border-primary">
                <div className="p-8 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-bg-dark/50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary rounded-none flex items-center justify-center">
                      <ClipboardCheck className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary dark:text-white">Elite Transcript</span>
                  </div>
                </div>
                <div className="p-10 overflow-y-auto space-y-10 flex-1 scrollbar-hide">
                  {transcript.map((entry, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex flex-col gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${entry.role === 'zapier' ? 'bg-primary' : 'bg-slate-300'}`} />
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${entry.role === 'zapier' ? 'text-primary' : 'text-slate-400'}`}>
                          {entry.role === 'zapier' ? 'Zapier' : 'Candidate'}
                        </span>
                      </div>
                      <div className={`p-6 rounded-none ${entry.role === 'zapier' ? 'bg-primary/5 border border-primary/10' : 'bg-slate-50 dark:bg-bg-dark border border-slate-100 dark:border-white/10'}`}>
                        <p className="text-[16px] text-slate-900 dark:text-white leading-relaxed whitespace-pre-wrap font-display italic">
                          {entry.text}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  <div id="transcript-end" className="h-4" />
                </div>
              </div>

              {/* Analysis Report Section */}
              <div className="bg-white dark:bg-surface-dark shadow-2xl overflow-hidden flex flex-col h-[650px] relative border-t-4 border-primary">
                <div className="p-8 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-bg-dark/50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary rounded-none flex items-center justify-center">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary dark:text-white">Performance Report</span>
                  </div>
                  {isAnalysisStarted && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Live Evaluation</span>
                    </div>
                  )}
                </div>
                
                <div className="p-10 overflow-y-auto flex-1 scrollbar-hide">
                  {!isAnalysisStarted ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-12 text-slate-300">
                      <TrendingUp className="w-20 h-20 mb-8 opacity-20" />
                      <p className="text-xl font-display italic max-w-[250px] uppercase text-[10px] font-bold tracking-widest">Your premium performance analysis will manifest here.</p>
                    </div>
                  ) : (
                    <div className="prose prose-slate dark:prose-invert prose-sm max-w-none">
                      <div className="mb-10 flex items-center gap-6 p-8 bg-primary/5 rounded-none border border-primary/10">
                        <div className="w-14 h-14 bg-primary rounded-none flex items-center justify-center shadow-2xl shadow-primary/20">
                          <Target className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <h4 className="text-slate-900 dark:text-white font-bold m-0 text-xl font-display uppercase tracking-tight">Zapier's Verdict</h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400 m-0 font-display italic">Professional Assessment for {user?.displayName?.split(' ')[0]}</p>
                        </div>
                      </div>
                      <div className="markdown-body text-slate-900 dark:text-white leading-relaxed font-display italic">
                        <ReactMarkdown>{analysisText.replace(/\[SCORE:\d+\]/g, '')}</ReactMarkdown>
                      </div>
                      <div id="analysis-end" className="h-4" />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

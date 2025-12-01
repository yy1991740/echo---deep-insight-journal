"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from '@/components/Header';
import { RecordButton } from '@/components/RecordButton';
import { FeedbackCard } from '@/components/FeedbackCard';
import { InsightCard } from '@/components/InsightCard';
import { AppState, InsightResult, Language } from '@/types';
import { getFastFeedback, getDeepInsight, getDailyQuestion, getStoredConfig } from '@/services/doubaoService';
import { Keyboard, Send, Mic, Sparkles, Globe } from 'lucide-react';

const Home: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [transcript, setTranscript] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [insight, setInsight] = useState<InsightResult | null>(null);
  const [dailyQuestion, setDailyQuestion] = useState<string>("");
  const [language, setLanguage] = useState<Language>('zh');
  
  // Detect WeChat environment
  const [isWeChat] = useState(() => 
    typeof navigator !== 'undefined' && /MicroMessenger/i.test(navigator.userAgent)
  );

  // Input State - Default to text if WeChat to avoid broken voice UX
  const [inputMode, setInputMode] = useState<'voice' | 'text'>(() => {
    if (typeof navigator !== 'undefined' && /MicroMessenger/i.test(navigator.userAgent)) {
      return 'text';
    }
    return 'voice';
  });
  
  const [manualText, setManualText] = useState<string>("");

  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>("");
  // Track recording state internally to handle event race conditions
  const isRecognitionActive = useRef<boolean>(false);

  // Load Daily Question (Runs on mount AND when language changes)
  useEffect(() => {
    getDailyQuestion(language)
      .then(q => setDailyQuestion(q))
      .catch((e) => {
          console.error("Failed to load daily question:", e);
          setDailyQuestion(language === 'zh' ? "今天发生了什么有趣的事吗？" : "Did anything interesting happen today?");
      });
  }, [language]);

  // Initialize/Update Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = language === 'zh' ? "zh-CN" : "en-US";
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onstart = () => {
          console.log("Speech recognition started");
          isRecognitionActive.current = true;
          setAppState(AppState.RECORDING);
        };

        recognition.onend = () => {
          console.log("Speech recognition ended");
          isRecognitionActive.current = false;
          // Only reset to IDLE if we were recording. 
          // If we transitioned to PROCESSING manually, don't reset.
          setAppState(prev => {
            if (prev === AppState.RECORDING) {
              return AppState.IDLE;
            }
            return prev;
          });
        };

        recognition.onresult = (event: any) => {
          let fullTranscript = "";
          for (let i = 0; i < event.results.length; i++) {
            fullTranscript += event.results[i][0].transcript;
          }
          
          setTranscript(fullTranscript);
          transcriptRef.current = fullTranscript;
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          isRecognitionActive.current = false;
          if (event.error === 'not-allowed') {
             alert(language === 'zh' ? "请允许麦克风权限以使用语音功能。" : "Please allow microphone access to use voice features.");
          } else if (event.error === 'service-not-allowed') {
             // In WeChat this might trigger, but we try to avoid it by default text mode
             alert(language === 'zh' ? "当前设备不支持语音识别，请尝试更换浏览器。" : "Voice recognition not supported on this device.");
          }
          // Only reset if error is fatal
          if (event.error !== 'no-speech') {
             setAppState(AppState.IDLE);
          }
        };
        
        recognitionRef.current = recognition;
      }
    }
  }, [language]);

  const handleProcessing = useCallback(async (text: string) => {
    const config = getStoredConfig();
    if (!config) {
        alert(language === 'zh' ? "未检测到 API 配置，无法连接 AI。" : "API configuration missing.");
        return;
    }

    setAppState(AppState.PROCESSING);
    
    // Phase 1: Fast System
    const fastResponse = await getFastFeedback(text, language);
    setFeedback(fastResponse);

    // Phase 2: Slow System
    const deepResult = await getDeepInsight(text, language);
    setInsight(deepResult);
    
    setAppState(AppState.COMPLETED);
  }, [language]);

  const toggleRecording = useCallback(() => {
    const config = getStoredConfig();
    if (!config) {
        alert(language === 'zh' ? "未检测到 API 配置。请检查环境变量。" : "Missing Environment Variables.");
        return;
    }

    if (!recognitionRef.current) {
      alert("您的浏览器不支持语音识别功能 / Browser does not support Speech Recognition.");
      return;
    }

    if (appState === AppState.RECORDING) {
      // STOP RECORDING
      try {
        recognitionRef.current.stop();
        // Force state update immediately to UI doesn't hang
        isRecognitionActive.current = false; 
        
        if (transcriptRef.current && transcriptRef.current.trim().length > 0) {
          handleProcessing(transcriptRef.current);
        } else {
          setAppState(AppState.IDLE);
        }
      } catch (e) {
        console.error("Error stopping recognition:", e);
        setAppState(AppState.IDLE);
      }
    } else {
      // START RECORDING
      setTranscript("");
      transcriptRef.current = "";
      setFeedback("");
      setInsight(null);
      
      try {
        recognitionRef.current.start();
        // State change will happen in onstart
      } catch (e) {
        console.error("Error starting recognition:", e);
        alert(language === 'zh' ? "无法启动录音，请刷新重试。" : "Could not start recording, please refresh.");
      }
    }
  }, [appState, handleProcessing, language]);

  const handleManualSubmit = () => {
    if (!manualText.trim()) return;
    setFeedback("");
    setInsight(null);
    setTranscript(manualText);
    handleProcessing(manualText);
    setManualText("");
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'zh' ? 'en' : 'zh');
    setFeedback("");
    setInsight(null);
    setTranscript("");
  };

  const handleSwitchToVoice = () => {
    if (isWeChat) {
        alert(language === 'zh' 
            ? "微信内置浏览器不支持语音识别，请点击右上角「...」选择「在浏览器打开」以体验完整功能。" 
            : "WeChat does not support voice recognition. Please open in an external browser for full experience.");
        return;
    }
    setInputMode('voice');
  };

  return (
    <div className="relative min-h-screen bg-[#020202] text-slate-200 overflow-x-hidden font-sans selection:bg-amber-500/30">
      
      {/* Void Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#111] via-[#000] to-[#000]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
      </div>

      {/* Top Controls */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-4">
        <button 
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all duration-300 group"
        >
            <Globe className="w-3 h-3 text-slate-400 group-hover:text-amber-100 transition-colors" />
            <span className="text-[10px] font-mono tracking-widest text-slate-400 group-hover:text-amber-100 transition-colors">
                {language === 'zh' ? 'EN' : 'CN'}
            </span>
        </button>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 md:py-20 min-h-screen flex flex-col items-center">
        
        <Header dailyQuestion={dailyQuestion} />

        <main className="w-full max-w-xl flex flex-col items-center gap-12 mt-4">
          
          {/* Input Area */}
          <div className="w-full flex flex-col items-center justify-center min-h-[160px] relative">
            {inputMode === 'voice' ? (
              <div className="relative flex flex-col items-center gap-8">
                 <div className="relative group">
                    <RecordButton appState={appState} onClick={toggleRecording} />
                    
                    {(appState === AppState.IDLE || appState === AppState.COMPLETED) && (
                        <button 
                            onClick={() => setInputMode('text')}
                            className="absolute -right-20 top-1/2 -translate-y-1/2 p-3 text-white/10 hover:text-white/40 transition-colors duration-300"
                        >
                            <Keyboard className="w-5 h-5" />
                        </button>
                    )}
                 </div>

                 {/* Minimal Status Text */}
                 <div className="h-6 flex items-center justify-center">
                    {appState === AppState.RECORDING && (
                    <p className="text-rose-400/80 text-[10px] font-mono tracking-[0.2em] uppercase animate-pulse">
                        {language === 'zh' ? '正在聆听' : 'Recording'}
                    </p>
                    )}
                    {appState === AppState.PROCESSING && !feedback && (
                    <p className="text-amber-200/60 text-[10px] font-mono tracking-[0.2em] uppercase animate-pulse">
                        {language === 'zh' ? '思考中' : 'Thinking'}
                    </p>
                    )}
                </div>
              </div>
            ) : (
                <div className="w-full animate-[fadeIn_0.5s_ease-out]">
                    <div className="relative bg-white/[0.03] rounded-sm border border-white/10 overflow-hidden backdrop-blur-md transition-all focus-within:border-white/20">
                        <textarea 
                            autoFocus
                            value={manualText}
                            onChange={(e) => setManualText(e.target.value)}
                            placeholder={language === 'zh' ? "输入你的记忆..." : "Type your memory..."}
                            className="w-full h-32 bg-transparent p-6 text-slate-200 placeholder-slate-700 focus:outline-none resize-none font-serif text-lg leading-relaxed"
                            onKeyDown={(e) => {
                                if(e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleManualSubmit();
                                }
                            }}
                        />
                        <div className="flex justify-between items-center px-4 py-3 border-t border-white/5 bg-black/20">
                            <button 
                                onClick={handleSwitchToVoice}
                                className="p-2 text-slate-600 hover:text-slate-400 transition-colors"
                            >
                                <Mic className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={handleManualSubmit}
                                disabled={!manualText.trim()}
                                className="text-slate-500 hover:text-white disabled:opacity-30 transition-colors"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    {isWeChat && (
                        <p className="text-center mt-3 text-[10px] text-white/20">
                            {language === 'zh' ? '微信环境下推荐使用文字输入' : 'Text input recommended in WeChat'}
                        </p>
                    )}
                </div>
            )}
          </div>

          {/* Transcript Display */}
          {transcript && (
            <div className="w-full text-center px-8 animate-[fadeIn_0.8s_ease-out]">
                <p className={`font-serif italic text-lg leading-relaxed transition-colors duration-500 ${appState === AppState.RECORDING ? 'text-white/20' : 'text-white/50'}`}>
                    "{transcript}"
                </p>
            </div>
          )}

          {/* Output Flow */}
          <div className="w-full flex flex-col gap-16 items-center pb-20">
            {feedback && <FeedbackCard text={feedback} isVisible={!!feedback} />}
            
            {appState === AppState.PROCESSING && feedback && !insight && (
                <div className="flex flex-col items-center gap-3 mt-4 opacity-40 animate-pulse">
                    <Sparkles className="w-4 h-4 text-amber-100" />
                </div>
            )}

            <InsightCard data={insight} lang={language} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;

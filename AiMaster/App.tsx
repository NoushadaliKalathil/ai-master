
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, MoreVertical, Phone, Video, Send, Paperclip, Smile, Mic, Languages, MicOff, Share2, Settings, RotateCcw, Upload, Image as ImageIcon, Award, Download, CheckCircle2, Lock, Save, FileUp, User as UserIcon, Edit2, Trash2, Gift, Book, Bookmark, X, Copy, Info, Mail, AlertTriangle, ChevronRight, Play, LogIn } from 'lucide-react';
import { Course, Message, AppView, Language, Teacher, UserProgress, CourseCategory, UserProfile, AppTheme, DownloadItem } from './types';
import { COURSES, TEACHERS, DEFAULT_USER, EMOJI_LIST, THEMES, FREE_DOWNLOADS } from './constants';
import { CourseCard } from './components/CourseCard';
import { ChatBubble } from './components/ChatBubble';
import { startCourseChat, sendMessageToGemini, stopAllAudio, resumeChat } from './services/gemini';

const App = () => {
  const [view, setView] = useState<AppView>(AppView.LANDING);
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>(TEACHERS);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher>(TEACHERS[0]); 
  
  // User Profile & Gamification
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER);
  
  // Login State
  const [loginName, setLoginName] = useState('');
  const [loginMobile, setLoginMobile] = useState('');

  // Messages & History
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatHistory, setChatHistory] = useState<Record<string, Message[]>>({});
  const [bookmarkedMessages, setBookmarkedMessages] = useState<Message[]>([]);
  const [sharedMessage, setSharedMessage] = useState<Message | null>(null); // For E-Card

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [language, setLanguage] = useState<Language>('english');
  const [isListening, setIsListening] = useState(false);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false); 
  
  // Theme & Appearance
  const [currentTheme, setCurrentTheme] = useState<AppTheme>(THEMES[0]);

  // Filtering
  const [selectedCategory, setSelectedCategory] = useState<CourseCategory>('ALL');

  // Gamification State
  const [progress, setProgress] = useState<UserProgress>({});
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Load Data on Mount
  useEffect(() => {
    // Check for Existing User Login
    const savedProfile = localStorage.getItem('aimaster_user');
    if (savedProfile) {
        try { 
            const parsedProfile = JSON.parse(savedProfile);
            setUserProfile(parsedProfile);
            // If we have a profile, check if we need onboarding
            const hasVisited = localStorage.getItem('aimaster_has_visited');
            if (!hasVisited) {
                setShowOnboarding(true);
            }
        } catch(e) {
            setView(AppView.LOGIN); // Corrupt data, force login
        }
    } else {
        // No profile found, show LOGIN screen first
        setView(AppView.LOGIN);
    }

    // Teachers
    const savedTeachers = localStorage.getItem('aimaster_teachers');
    if (savedTeachers) {
        try {
            const parsed = JSON.parse(savedTeachers);
            if (parsed.length > 0 && (parsed[0].id === 'ai-master' || parsed[0].id === 'ai-teacher')) {
                setTeachers(parsed);
                setSelectedTeacher(parsed[0]);
            } else {
                localStorage.removeItem('aimaster_teachers'); 
                setTeachers(TEACHERS);
                setSelectedTeacher(TEACHERS[0]);
            }
        } catch (e) { 
            setTeachers(TEACHERS); 
            setSelectedTeacher(TEACHERS[0]);
        }
    }

    // Progress
    const savedProgress = localStorage.getItem('aimaster_progress');
    if (savedProgress) {
        try { setProgress(JSON.parse(savedProgress)); } catch(e) {}
    }

    // Chat History
    const savedHistory = localStorage.getItem('aimaster_chat_history');
    if (savedHistory) {
        try { setChatHistory(JSON.parse(savedHistory)); } catch(e) {}
    }

    // Bookmarks
    const savedBookmarks = localStorage.getItem('aimaster_bookmarks');
    if (savedBookmarks) {
        try { setBookmarkedMessages(JSON.parse(savedBookmarks)); } catch(e) {}
    }

    // Theme
    const savedTheme = localStorage.getItem('aimaster_theme');
    if (savedTheme) {
        try { setCurrentTheme(JSON.parse(savedTheme)); } catch(e) {}
    }
  }, []);

  const handleLogin = () => {
      if (!loginName.trim()) {
          alert("Please enter your name!");
          return;
      }
      
      const newProfile: UserProfile = {
          ...DEFAULT_USER,
          id: `user_${Date.now()}`,
          name: loginName,
          mobile: loginMobile,
          bio: 'Student at Ai Master Academy'
      };
      
      setUserProfile(newProfile);
      localStorage.setItem('aimaster_user', JSON.stringify(newProfile));
      
      // Go to Onboarding after login
      setView(AppView.LANDING);
      setShowOnboarding(true);
  };

  const finishOnboarding = () => {
      setShowOnboarding(false);
      localStorage.setItem('aimaster_has_visited', 'true');
  };

  const saveTeachers = (newTeachers: Teacher[]) => {
    setTeachers(newTeachers);
    localStorage.setItem('aimaster_teachers', JSON.stringify(newTeachers));
  };

  const saveUserProfile = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    localStorage.setItem('aimaster_user', JSON.stringify(newProfile));
  };
  
  const saveTheme = (theme: AppTheme) => {
      setCurrentTheme(theme);
      localStorage.setItem('aimaster_theme', JSON.stringify(theme));
  };

  const updateProgress = (courseId: string) => {
    setProgress(prev => {
        const currentVal = prev[courseId] || 0;
        const newVal = Math.min(currentVal + 5, 100);
        const newProgress = { ...prev, [courseId]: newVal };
        localStorage.setItem('aimaster_progress', JSON.stringify(newProgress));
        
        // Update XP
        const totalXP = Object.values(newProgress).reduce((a, b) => a + b, 0);
        const level = Math.floor(totalXP / 100) + 1;
        
        if (level !== userProfile.level || totalXP !== userProfile.totalXp) {
             saveUserProfile({ ...userProfile, level, totalXp: totalXP });
        }

        return newProgress;
    });
  };

  const resetTeachers = () => {
    if(confirm("Reset all teachers to default?")) {
        setTeachers(TEACHERS);
        localStorage.removeItem('aimaster_teachers');
        setSelectedTeacher(TEACHERS[0]);
    }
  };

  const handleToggleBookmark = (msg: Message) => {
      let newBookmarks = [...bookmarkedMessages];
      const exists = newBookmarks.find(b => b.id === msg.id);
      
      if (exists) {
          newBookmarks = newBookmarks.filter(b => b.id !== msg.id);
      } else {
          newBookmarks.push({ ...msg, isBookmarked: true });
      }
      
      setBookmarkedMessages(newBookmarks);
      localStorage.setItem('aimaster_bookmarks', JSON.stringify(newBookmarks));
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isBookmarked: !exists } : m));
  };
  
  const handleShareCard = (msg: Message) => {
      setSharedMessage(msg);
      setView(AppView.SHARE_CARD);
  };

  const handleFeedback = () => {
      window.open('mailto:support@aimaster.app?subject=Feedback for Ai Master Beta&body=Hi, I found a bug/have an idea:', '_blank');
  };

  // --- BACKUP SYSTEM ---
  const handleExportBackup = () => {
    const backupData = {
        teachers, progress, userProfile, chatHistory, bookmarkedMessages,
        timestamp: new Date().toISOString(),
        version: "2.1"
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "aimaster_full_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const json = JSON.parse(event.target?.result as string);
            if (json.teachers && json.progress && json.userProfile) {
                if(confirm("Restore backup? This overwrites current data.")) {
                    setTeachers(json.teachers);
                    setProgress(json.progress);
                    setUserProfile(json.userProfile);
                    if(json.chatHistory) setChatHistory(json.chatHistory);
                    if(json.bookmarkedMessages) setBookmarkedMessages(json.bookmarkedMessages);
                    
                    localStorage.setItem('aimaster_teachers', JSON.stringify(json.teachers));
                    localStorage.setItem('aimaster_progress', JSON.stringify(json.progress));
                    localStorage.setItem('aimaster_user', JSON.stringify(json.userProfile));
                    if(json.chatHistory) localStorage.setItem('aimaster_chat_history', JSON.stringify(json.chatHistory));
                    if(json.bookmarkedMessages) localStorage.setItem('aimaster_bookmarks', JSON.stringify(json.bookmarkedMessages));
                    
                    alert("Restored successfully!");
                    setView(AppView.LANDING); // Go to landing on restore
                }
            } else { alert("Invalid backup file."); }
        } catch (err) { alert("Failed to restore."); }
    };
    reader.readAsText(file);
  };

  // --- IMAGE UPLOAD LOGIC ---
  const processImage = (file: File, callback: (dataUrl: string) => void) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_SIZE = 400; 
          
          if (width > height) {
            if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
          } else {
            if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          callback(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
  };

  const handleTeacherImageUpload = (e: React.ChangeEvent<HTMLInputElement>, teacherIndex: number, field: 'image' | 'videoImage') => {
    if (e.target.files?.[0]) {
        processImage(e.target.files[0], (dataUrl) => {
            const newTeachers = [...teachers];
            newTeachers[teacherIndex][field] = dataUrl;
            saveTeachers(newTeachers);
        });
    }
  };

  const handleUserAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
        processImage(e.target.files[0], (dataUrl) => {
            saveUserProfile({ ...userProfile, avatar: dataUrl });
        });
    }
  };

  const handleChatImageAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
        processImage(e.target.files[0], (dataUrl) => {
            addMessage("Sent an image", 'user', [], 'image', dataUrl);
            setTimeout(async () => {
                setIsTyping(true);
                const { text, suggestions } = await sendMessageToGemini("I just sent you an image. (Simulated image analysis)");
                setIsTyping(false);
                addMessage(text, 'ai', suggestions);
            }, 1000);
        });
    }
  };

  // --- CHAT LOGIC ---
  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); };
  useEffect(() => { scrollToBottom(); }, [messages, isTyping, showEmojiPicker]);

  // Voice Init (omitted for brevity)
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInputText(prev => prev ? `${prev} ${transcript}` : transcript);
            setIsListening(false);
        };
        recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return alert("Voice input not supported.");
    if (isListening) { recognitionRef.current.stop(); setIsListening(false); }
    else { recognitionRef.current.lang = language === 'malayalam' ? 'ml-IN' : 'en-US'; recognitionRef.current.start(); setIsListening(true); }
  };

  const handleStartCourse = async (course: Course) => {
    stopAllAudio();
    setActiveCourse(course);
    setView(AppView.CHAT);
    setIsOnline(true);
    setIsVideoCallActive(false); 
    setShowChatMenu(false);
    setShowEmojiPicker(false);

    if (!progress[course.id]) setProgress(prev => ({...prev, [course.id]: 0}));

    if (chatHistory[course.id] && chatHistory[course.id].length > 0) {
        const historyWithBookmarks = chatHistory[course.id].map(msg => ({
            ...msg,
            isBookmarked: bookmarkedMessages.some(b => b.id === msg.id)
        }));
        setMessages(historyWithBookmarks);
        resumeChat(course.systemPrompt, language, selectedTeacher, historyWithBookmarks);
        return; 
    }

    setMessages([]);
    setIsTyping(true);
    const { text, suggestions } = await startCourseChat(course.systemPrompt, language, selectedTeacher);
    setIsTyping(false);
    addMessage(text, 'ai', suggestions, 'text', undefined, course.id); 
  };

  const handleRestartChat = async () => {
      if (!activeCourse) return;
      if (confirm("Restart this class? Chat history will be cleared.")) {
          stopAllAudio();
          setMessages([]);
          const newHistory = { ...chatHistory };
          delete newHistory[activeCourse.id];
          setChatHistory(newHistory);
          localStorage.setItem('aimaster_chat_history', JSON.stringify(newHistory));
          
          setIsTyping(true);
          setShowChatMenu(false);
          const { text, suggestions } = await startCourseChat(activeCourse.systemPrompt, language, selectedTeacher);
          setIsTyping(false);
          addMessage(text, 'ai', suggestions);
      }
  };

  const addMessage = (text: string, sender: 'user' | 'ai', suggestions?: string[], type: 'text'|'image' = 'text', attachment?: string, overrideCourseId?: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'read',
      suggestions,
      type,
      attachment,
      isBookmarked: false
    };

    setMessages(prev => {
        const updatedMessages = [...prev, newMessage];
        const currentCourseId = overrideCourseId || activeCourse?.id;
        if (currentCourseId) {
            const newHistory = { ...chatHistory, [currentCourseId]: updatedMessages };
            setChatHistory(newHistory);
            localStorage.setItem('aimaster_chat_history', JSON.stringify(newHistory));
        }
        return updatedMessages;
    });
  };

  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = textOverride || inputText;
    if (!textToSend.trim()) return;
    if (!textOverride) { setInputText(''); setShowEmojiPicker(false); }
    
    addMessage(textToSend, 'user');
    if (activeCourse) updateProgress(activeCourse.id);
    
    setIsOnline(true);
    setIsTyping(true); 

    setTimeout(async () => {
        const { text, suggestions } = await sendMessageToGemini(textToSend);
        setIsTyping(false);
        addMessage(text, 'ai', suggestions);
    }, 1000); 
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
  };

  // --- DOWNLOADS SYSTEM ---
  const downloadFile = (item: DownloadItem) => {
    const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(item.content);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", item.filename);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // --- RENDERERS ---

  const renderLogin = () => (
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-6 bg-white animate-fade-in">
          <div className="max-w-xs w-full">
              <div className="flex justify-center mb-8">
                  <div className={`p-4 rounded-2xl ${THEMES[0].bg} text-white shadow-xl`}>
                      <Award size={48} />
                  </div>
              </div>
              
              <h2 className="text-2xl font-black text-gray-800 text-center mb-1">Create Profile</h2>
              <p className="text-center text-gray-500 text-sm mb-8">Start your AI Learning Journey</p>
              
              <div className="space-y-4">
                  <div>
                      <label className="text-xs font-bold text-gray-600 ml-1">YOUR NAME</label>
                      <input 
                        type="text" 
                        value={loginName}
                        onChange={(e) => setLoginName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#008069] focus:ring-1 focus:ring-[#008069] transition-all font-bold text-gray-800"
                      />
                  </div>
                  
                  <div>
                      <label className="text-xs font-bold text-gray-600 ml-1">MOBILE NUMBER (Optional)</label>
                      <input 
                        type="tel" 
                        value={loginMobile}
                        onChange={(e) => setLoginMobile(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#008069] focus:ring-1 focus:ring-[#008069] transition-all font-medium text-gray-800"
                      />
                  </div>
                  
                  <button 
                    onClick={handleLogin}
                    className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2 ${THEMES[0].button}`}
                  >
                      Start Learning <ChevronRight size={20} />
                  </button>
                  
                  <p className="text-xs text-gray-400 text-center mt-4">By continuing, you agree to our Terms.</p>
              </div>
          </div>
      </div>
  );

  const renderOnboarding = () => (
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in" style={{ background: `linear-gradient(to bottom right, ${currentTheme.from}, ${currentTheme.to})` }}>
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full">
              <Award size={64} className={`mx-auto mb-4 ${currentTheme.text}`} />
              <h1 className="text-2xl font-black text-gray-800 mb-1">Welcome {userProfile.name}!</h1>
              <h2 className="text-xl font-bold text-[#008069] mb-4">ആര്‍ക്കും പഠിക്കാം എ.ഐ!</h2>
              <p className="text-gray-500 mb-6">Your Personal Academy to master AI tools, YouTube Growth, and Career Skills.</p>
              
              <div className="flex justify-center mb-6">
                  <div className="bg-gray-100 p-1 rounded-lg flex shadow-inner">
                      <button 
                          onClick={() => setLanguage('english')}
                          className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${language === 'english' ? 'bg-white shadow text-black' : 'text-gray-500 hover:text-gray-800'}`}
                      >
                          English
                      </button>
                      <button 
                          onClick={() => setLanguage('malayalam')}
                          className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${language === 'malayalam' ? 'bg-white shadow text-black' : 'text-gray-500 hover:text-gray-800'}`}
                      >
                          മലയാളം
                      </button>
                  </div>
              </div>

              <button onClick={finishOnboarding} className={`w-full py-3 rounded-xl text-white font-bold text-lg shadow-lg ${currentTheme.button}`}>
                  Go to Dashboard 🚀
              </button>
          </div>
      </div>
  );

  // Icon for onboarding
  const MessageCircle = ({size, className}: {size: number, className: string}) => (
      <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
  )

  const renderShareCard = () => (
    <div 
        className="h-full flex flex-col items-center justify-center p-6 relative overflow-hidden"
        style={{ background: `linear-gradient(to bottom right, ${currentTheme.from}, ${currentTheme.to})` }}
    >
        <button onClick={() => setView(AppView.CHAT)} className="absolute top-4 left-4 bg-white/20 p-2 rounded-full text-white hover:bg-white/30"><X size={24}/></button>
        
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full relative overflow-hidden animate-fade-in border-[6px] border-white/50">
             {/* Watermark BG */}
             <div className="absolute inset-0 opacity-5 flex items-center justify-center pointer-events-none scale-150 rotate-12">
                 <Award size={300} />
             </div>
             
             {/* Content */}
             <div className="relative z-10">
                 <div className="flex justify-between items-start mb-6">
                     <div className="flex items-center gap-3">
                         <img src={sharedMessage?.sender === 'ai' ? selectedTeacher.image : userProfile.avatar} className="w-14 h-14 rounded-full border-2 border-gray-200" />
                         <div>
                             <h3 className="font-bold text-gray-800 text-lg">{sharedMessage?.sender === 'ai' ? (language==='malayalam'?selectedTeacher.nameMal:selectedTeacher.name) : userProfile.name}</h3>
                             <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">{sharedMessage?.sender === 'ai' ? 'Master Advice' : 'Student Prompt'}</p>
                         </div>
                     </div>
                     <Award className={`text-yellow-400`} size={32} fill="currentColor" />
                 </div>
                 
                 <div className="mb-8">
                     <p className="text-xl font-serif leading-relaxed text-gray-800 italic">
                         "{sharedMessage?.text.substring(0, 150)}{sharedMessage?.text.length && sharedMessage.text.length > 150 ? '...' : ''}"
                     </p>
                 </div>
                 
                 {/* Footer Watermark */}
                 <div className="border-t-2 border-gray-100 pt-4 flex justify-between items-center">
                     <div>
                         <p className="font-black text-lg tracking-tight text-gray-900">AI MASTER</p>
                         <p className="text-[10px] text-gray-400 uppercase tracking-widest">Viral Academy App</p>
                     </div>
                     <div className="bg-gray-900 text-white px-3 py-1 rounded text-xs font-bold">aimaster.app</div>
                 </div>
             </div>
        </div>
        
        <p className="text-white/80 mt-6 text-sm font-medium animate-pulse text-center">
            📸 Take a Screenshot & Share on Status!
        </p>
    </div>
  );

  const renderNotebook = () => (
      <div 
        className="h-full flex flex-col transition-colors duration-500"
        style={{ background: `linear-gradient(to bottom, #ffffff, ${currentTheme.from}15)` }}
      >
        <div className={`bg-gradient-to-r ${currentTheme.gradient} text-white p-4 flex items-center gap-3 shadow-md`}>
            <button onClick={() => setView(AppView.LANDING)} className="p-1 rounded-full hover:bg-white/10"><ArrowLeft className="w-6 h-6" /></button>
            <h2 className="font-bold text-lg">My Notebook</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {bookmarkedMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
                    <Book size={64} className="opacity-20" />
                    <p>No bookmarks yet.</p>
                    <p className="text-xs">Click the <Bookmark className="inline w-3 h-3"/> icon on messages to save them here.</p>
                </div>
            ) : (
                bookmarkedMessages.map(msg => (
                    <div key={msg.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-2">
                             <div className="flex items-center gap-2">
                                <img src={selectedTeacher.image} className="w-6 h-6 rounded-full" />
                                <span className="text-xs font-bold text-gray-500">{msg.timestamp}</span>
                             </div>
                             <div className="flex gap-2">
                                 <button onClick={() => handleShareCard(msg)} className="text-blue-400 hover:text-blue-600"><Share2 size={16} /></button>
                                 <button onClick={() => handleToggleBookmark(msg)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                             </div>
                        </div>
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">{msg.text}</p>
                    </div>
                ))
            )}
        </div>
      </div>
  );

  const renderDownloads = () => (
    <div 
        className="h-full flex flex-col transition-colors duration-500"
        style={{ background: `linear-gradient(to bottom, #ffffff, ${currentTheme.from}15)` }}
    >
         <div className={`bg-gradient-to-r ${currentTheme.gradient} text-white p-4 flex items-center gap-3 shadow-md`}>
            <button onClick={() => setView(AppView.LANDING)} className="p-1 rounded-full hover:bg-white/10"><ArrowLeft className="w-6 h-6" /></button>
            <h2 className="font-bold text-lg">Free Gifts Vault</h2>
        </div>
        
        <div className="p-4 space-y-4 overflow-y-auto">
             <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg flex items-center gap-3">
                 <div className="bg-yellow-100 p-2 rounded-full"><Gift className="text-yellow-600" size={20} /></div>
                 <p className="text-xs text-yellow-800">Unlock more gifts by increasing your User Level!</p>
             </div>

             {FREE_DOWNLOADS.map(item => {
                 const isLocked = userProfile.level < item.minLevel;
                 return (
                     <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                         <div className="flex items-center gap-4">
                             <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${isLocked ? 'bg-gray-100 grayscale' : 'bg-blue-50'}`}>{item.icon}</div>
                             <div>
                                 <h3 className={`font-bold ${isLocked ? 'text-gray-400' : 'text-gray-800'}`}>{item.title}</h3>
                                 <p className="text-xs text-gray-500">{item.description}</p>
                             </div>
                         </div>
                         {isLocked ? (
                             <div className="flex flex-col items-center">
                                 <Lock className="text-gray-300 mb-1" size={20} />
                                 <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Lvl {item.minLevel}</span>
                             </div>
                         ) : (
                             <button onClick={() => downloadFile(item)} className={`${currentTheme.button} text-white px-4 py-2 rounded-full text-xs font-bold shadow-md active:scale-95 transition-transform flex items-center gap-1`}>
                                 <Download size={14} /> Get
                             </button>
                         )}
                     </div>
                 )
             })}
        </div>
    </div>
  );

  const renderCertificate = () => {
      const currentProgress = activeCourse ? (progress[activeCourse.id] || 0) : 0;
      const isUnlocked = currentProgress >= 100;
      return (
        <div className="bg-[#1e1e1e] h-full flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#1e1e1e] to-[#2d2d2d] z-0"></div>
            <div className="z-10 w-full max-w-sm">
                {!isUnlocked ? (
                    <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 shadow-2xl">
                         <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border-2 border-gray-600">
                             <Lock className="text-gray-400 w-10 h-10" />
                         </div>
                         <h2 className="text-2xl font-bold text-white mb-2">Certificate Locked</h2>
                         <p className="text-gray-300 text-sm mb-6">Complete 100% of the class to unlock.</p>
                         <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden border border-gray-600 mb-6">
                            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-full transition-all duration-1000" style={{ width: `${currentProgress}%` }}></div>
                         </div>
                         <button onClick={() => setView(AppView.CHAT)} className="w-full bg-white text-gray-900 py-3 rounded-xl font-bold hover:bg-gray-100 transition shadow-lg">Continue Learning</button>
                    </div>
                ) : (
                    <div className="bg-white p-6 rounded-lg shadow-2xl w-full border-[8px] border-double border-[#d4af37] relative overflow-hidden animate-fade-in transform transition-all hover:scale-[1.02]">
                             <div className="absolute inset-0 opacity-5 flex items-center justify-center pointer-events-none"><Award size={200} /></div>
                             <div className="relative z-10">
                                <div className="flex justify-center mb-4"><img src={selectedTeacher.image} alt="Teacher" className="w-16 h-16 rounded-full border-4 border-[#d4af37]" /></div>
                                <h1 className="text-2xl font-serif text-gray-900 font-bold uppercase tracking-widest mb-1">Certificate</h1>
                                <p className="text-xl font-bold text-gray-800 border-b-2 border-gray-200 pb-1 mb-4 inline-block min-w-[200px] font-serif">{userProfile.name}</p>
                                <p className="text-lg font-bold text-[#008069] mb-8">{language === 'malayalam' && activeCourse?.titleMal ? activeCourse.titleMal : activeCourse?.title}</p>
                                <div className="flex justify-between items-end mt-8">
                                    <div className="text-left"><p className="text-[10px] font-bold">{new Date().toLocaleDateString()}</p></div>
                                    <div className="text-right"><div className="font-handwriting text-lg text-blue-600 font-bold italic leading-none mb-1">{language === 'malayalam' ? selectedTeacher.nameMal : selectedTeacher.name}</div><p className="text-[8px] text-gray-500 uppercase">Ai Master Signature</p></div>
                                </div>
                             </div>
                             {/* Download Button */}
                             <button onClick={() => alert("Screenshot this certificate to save it!")} className="mt-4 w-full bg-[#d4af37] text-white py-2 rounded font-bold shadow-md hover:bg-[#b5952f] flex items-center justify-center gap-2">
                                <Download size={16}/> Save / Screenshot
                             </button>
                        </div>
                )}
                {isUnlocked && <button onClick={() => setView(AppView.CHAT)} className="mt-8 bg-gray-700 text-white py-3 px-8 rounded-full font-bold shadow-lg">Back</button>}
            </div>
        </div>
      );
  };

  const renderSettings = () => (
    <div 
        className="h-full flex flex-col transition-colors duration-500"
        style={{ background: `linear-gradient(to bottom, #ffffff, ${currentTheme.from}15)` }}
    >
        <div className={`bg-gradient-to-r ${currentTheme.gradient} text-white p-4 flex items-center gap-3 shadow-md`}>
            <button onClick={() => setView(AppView.LANDING)} className="p-1 rounded-full hover:bg-white/10"><ArrowLeft className="w-6 h-6" /></button>
            <h2 className="font-bold text-lg">Settings</h2>
        </div>

        <div className="p-4 overflow-y-auto flex-1 space-y-6">
            
            {/* THEME SELECTOR */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <h3 className={`text-gray-800 font-bold mb-3 flex items-center gap-2`}>Appearance</h3>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {THEMES.map(theme => (
                        <button 
                            key={theme.id}
                            onClick={() => saveTheme(theme)}
                            className={`w-10 h-10 rounded-full shrink-0 shadow-md border-2 ${currentTheme.id === theme.id ? 'border-gray-800 scale-110' : 'border-white'} transition-all`}
                            style={{ background: `linear-gradient(to right, ${theme.from}, ${theme.to})` }}
                        />
                    ))}
                </div>
            </div>

            {/* USER PROFILE SETTINGS */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <h3 className={`text-gray-800 font-bold mb-3 flex items-center gap-2`}><UserIcon size={18} className={currentTheme.text}/> My Profile</h3>
                <div className="flex items-center gap-4 mb-4">
                     <div className="relative">
                         <img src={userProfile.avatar} alt="Me" className={`w-16 h-16 rounded-full object-cover border-2 ${currentTheme.border}`} />
                         <label className={`absolute bottom-0 right-0 ${currentTheme.button} text-white p-1 rounded-full cursor-pointer shadow-md hover:opacity-90`}>
                            <Upload size={12} />
                            <input type="file" className="hidden" accept="image/*" onChange={handleUserAvatarUpload} />
                         </label>
                     </div>
                     <div className="flex-1">
                         <input 
                            type="text" 
                            value={userProfile.name}
                            onChange={(e) => saveUserProfile({...userProfile, name: e.target.value})}
                            className={`w-full font-bold text-gray-800 border-b border-gray-300 focus:border-indigo-600 outline-none pb-1 mb-1`}
                            placeholder="Your Name"
                         />
                         <input 
                            type="text" 
                            value={userProfile.bio}
                            onChange={(e) => saveUserProfile({...userProfile, bio: e.target.value})}
                            className="w-full text-xs text-gray-500 border-b border-gray-300 focus:border-indigo-600 outline-none pb-1"
                            placeholder="Your Bio (e.g. Student)"
                         />
                         <p className="text-[10px] text-gray-400 mt-1">{userProfile.mobile || "No Mobile Added"}</p>
                     </div>
                </div>
                {/* Level Display */}
                <div className="flex justify-between items-center text-xs text-gray-500 border-t pt-2 border-gray-50">
                    <span>Level: <b className="text-gray-800">{userProfile.level}</b></span>
                    <span>XP: <b className="text-gray-800">{userProfile.totalXp}</b></span>
                </div>
            </div>

            {/* ABOUT & FEEDBACK */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-4">
                 <h3 className={`text-gray-800 font-bold flex items-center gap-2`}><Info size={18} className={currentTheme.text} /> About</h3>
                 
                 <div className="text-xs text-gray-600 space-y-2">
                     <p><b>Ai Master (Beta v1.0)</b> is a Generative AI Academy designed to teach digital skills in English and Malayalam.</p>
                     <p className="flex items-center gap-1 text-yellow-600 bg-yellow-50 p-2 rounded"><AlertTriangle size={12}/> AI can make mistakes. Please verify important information.</p>
                 </div>
                 
                 <button onClick={handleFeedback} className={`w-full py-2 rounded-lg border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50 flex items-center justify-center gap-2`}>
                     <Mail size={14}/> Send Feedback / Report Bug
                 </button>
                 
                 <button onClick={() => setShowOnboarding(true)} className={`w-full py-2 rounded-lg border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50 flex items-center justify-center gap-2`}>
                     <Play size={14}/> Replay Welcome Screen
                 </button>
            </div>

            {/* BACKUP */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <h3 className={`text-gray-800 font-bold mb-3 flex items-center gap-2`}><Save size={18} className={currentTheme.text} /> Backup Data</h3>
                <div className="flex gap-3">
                    <button onClick={handleExportBackup} className={`flex-1 ${currentTheme.bg} hover:opacity-90 ${currentTheme.text} bg-opacity-10 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2`}><Download size={16} /> Save</button>
                    <label className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"><FileUp size={16} /> Restore <input type="file" className="hidden" accept=".json" onChange={handleImportBackup} /></label>
                </div>
            </div>

            {/* TEACHER CUSTOMIZATION */}
            <h3 className="text-gray-800 font-bold">Customize Masters</h3>
            {teachers.map((t, idx) => (
                <div key={t.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center gap-4 mb-4">
                        <img src={t.image} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                        <div><h4 className="font-bold text-sm">{t.name}</h4></div>
                    </div>
                    <div className="space-y-3">
                        <input type="text" value={t.name} onChange={(e) => {const n=[...teachers]; n[idx].name=e.target.value; saveTeachers(n);}} className="w-full p-2 border rounded text-xs" placeholder="Name" />
                        <div className="flex gap-2">
                             <input type="text" value={t.image} readOnly className="flex-1 p-2 border rounded text-xs text-gray-400" />
                             <label className="bg-gray-100 p-2 rounded border cursor-pointer"><Upload size={14} /><input type="file" className="hidden" accept="image/*" onChange={(e) => handleTeacherImageUpload(e, idx, 'image')} /></label>
                        </div>
                    </div>
                </div>
            ))}
            <button onClick={resetTeachers} className="w-full py-3 text-red-500 font-bold text-sm bg-white rounded-lg border border-red-100 hover:bg-red-50 mb-4">Reset All Settings</button>
            
            <div className="text-center text-[10px] text-gray-400 pb-6 space-y-1">
                <p>Ai Master - Viral Academy</p>
                <p>Version 1.0.0 (Beta)</p>
                <p>© 2025 AI Master. Created in Kerala with ❤️</p>
            </div>
        </div>
    </div>
  );

  const renderLanding = () => {
    const categories: {id: CourseCategory, label: string, labelMal: string, icon: string}[] = [
        { id: 'ALL', label: 'All', labelMal: 'എല്ലാം', icon: '🌀' },
        { id: 'CREATOR', label: 'Creator', labelMal: 'ക്രിയേറ്റർ', icon: '🎬' },
        { id: 'STUDENT', label: 'Student', labelMal: 'വിദ്യാർത്ഥി', icon: '🎓' },
        { id: 'CAREER', label: 'Job Seeker', labelMal: 'ജോലി', icon: '💼' },
        { id: 'BUSINESS', label: 'Business', labelMal: 'ബിസിനസ്', icon: '💰' },
        { id: 'LIFESTYLE', label: 'Lifestyle', labelMal: 'ജീവിതശൈലി', icon: '🌱' }, 
    ];
    const filteredCourses = selectedCategory === 'ALL' ? COURSES : COURSES.filter(c => c.category === selectedCategory);

    return (
    <div 
        className="max-w-md mx-auto h-full flex flex-col relative overflow-hidden shadow-2xl transition-colors duration-500"
        style={{ background: `linear-gradient(to bottom, #ffffff, ${currentTheme.from}15)` }}
    >
      <div className={`bg-gradient-to-r ${currentTheme.gradient} h-40 w-full absolute top-0 left-0 z-0 shadow-lg`}></div>
      
      <div className="z-10 flex flex-col h-full pt-6 px-4">
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-4 text-white">
           <div className="flex flex-col">
             <h1 className="text-2xl font-black tracking-wider flex items-center gap-2">
                 <Award size={24} className="text-yellow-400" /> 
                 AI MASTER
             </h1>
             <p className="text-sm text-white/90 font-bold tracking-wide ml-8 uppercase opacity-90">
               {language === 'english' ? 'Anyone can learn!' : 'ആര്‍ക്കും പഠിക്കാം!'}
             </p>
           </div>
           
           <div className="flex gap-2">
             <button onClick={() => setView(AppView.BOOKMARKS)} className="bg-[#fef3c7] hover:bg-[#fde68a] text-yellow-700 p-2 rounded-full shadow-md transition-all active:scale-95" aria-label="Notebook">
                 <Book className="w-5 h-5" />
             </button>
             <button onClick={() => setView(AppView.DOWNLOADS)} className="bg-[#ccfbf1] hover:bg-[#99f6e4] text-teal-700 p-2 rounded-full shadow-md transition-all active:scale-95" aria-label="Gifts">
                 <Gift className="w-5 h-5 animate-bounce" />
             </button>
             <button onClick={() => setView(AppView.SETTINGS)} className="bg-[#e9d5ff] hover:bg-[#d8b4fe] text-purple-700 p-2 rounded-full shadow-md transition-all active:scale-95" aria-label="Settings">
                 <Settings className="w-5 h-5" />
             </button>
             <button onClick={() => setLanguage(prev => prev === 'english' ? 'malayalam' : 'english')} className="bg-black/20 hover:bg-black/30 px-3 py-1 rounded-full text-[10px] font-bold border border-white/10 text-white backdrop-blur-md transition-all">
               {language === 'english' ? 'ENG | മലയാളം' : 'ENG | മലയാളം'}
             </button>
           </div>
        </div>

        {/* Teacher Selection */}
        <div className="mb-4">
           <div className="grid grid-cols-2 gap-3">
             {teachers.map(teacher => (
               <div key={teacher.id} onClick={() => setSelectedTeacher(teacher)} className={`bg-white rounded-lg p-2 flex items-center gap-2 cursor-pointer border-2 shadow-sm ${selectedTeacher.id === teacher.id ? `${currentTheme.border}` : 'border-transparent'}`}>
                 <img src={teacher.image} alt={teacher.name} className="w-10 h-10 rounded-full object-cover" />
                 <div>
                   <h3 className="font-bold text-gray-800 text-xs">{language === 'malayalam' ? teacher.nameMal : teacher.name}</h3>
                   <p className="text-[11px] text-gray-600 font-medium">{language === 'malayalam' ? teacher.roleMal : teacher.role}</p>
                 </div>
               </div>
             ))}
           </div>
        </div>

        {/* Categories (Wrapped) */}
        <div className="flex flex-wrap gap-2 mb-4">
            {categories.map(cat => (
                <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`flex-grow-0 whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center justify-center gap-1 transition-all active:scale-95 ${selectedCategory === cat.id ? `${currentTheme.bg} text-white shadow-md ring-1 ring-white/50` : 'bg-white text-gray-600 border border-gray-200 shadow-sm hover:bg-gray-50'}`}>
                    <span>{cat.icon}</span><span>{language === 'english' ? cat.label : cat.labelMal}</span>
                </button>
            ))}
        </div>

        <div className="bg-white rounded-t-xl shadow-lg p-6 flex-1 overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-800 mb-4">{language === 'english' ? 'Academy Courses' : 'അക്കാദമി ക്ലാസുകൾ'}</h2>
            <div className="space-y-3 pb-6">
                {filteredCourses.map((course) => (
                    <CourseCard 
                        key={course.id} 
                        course={{...course, title: language === 'malayalam' && course.titleMal ? course.titleMal : course.title}} 
                        index={COURSES.findIndex(c => c.id === course.id) + 1} // Global Numbering
                        progress={progress[course.id] || 0} 
                        theme={currentTheme}
                        onClick={handleStartCourse} 
                    />
                ))}
            </div>
            {/* Copyright Footer */}
            <div className="mt-8 text-center border-t border-gray-100 pt-4 pb-2">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">© 2025 Ai Master Academy</p>
                <p className="text-[9px] text-gray-300">Made with ❤️ in Kerala</p>
            </div>
        </div>
      </div>
    </div>
  )};

  const renderChat = () => (
    <div className="max-w-md mx-auto h-full flex flex-col bg-[#efeae2] relative shadow-2xl overflow-hidden">
      {isVideoCallActive && (
        <div className="absolute inset-0 z-0 bg-black"><img src={selectedTeacher.videoImage} className="w-full h-full object-cover opacity-80" /><div className="absolute top-20 left-4 bg-red-600 text-white text-[10px] font-bold px-2 rounded animate-pulse">LIVE</div></div>
      )}
      {!isVideoCallActive && <div className="absolute inset-0 academy-bg z-0 pointer-events-none"></div>}

      {/* Header */}
      <div className={`bg-gradient-to-r ${currentTheme.gradient} text-white p-2 flex items-center justify-between z-10 shadow-md ${isVideoCallActive ? 'bg-black/40' : ''}`}>
        <div className="flex items-center gap-2">
          <button onClick={() => { stopAllAudio(); setView(AppView.LANDING); }} className="p-1"><ArrowLeft className="w-6 h-6" /></button>
          <img src={selectedTeacher.image} className="w-10 h-10 rounded-full border border-white/20 object-cover" />
          <div className="flex flex-col">
            <h3 className="font-bold text-sm">{language === 'malayalam' ? selectedTeacher.nameMal : selectedTeacher.name}</h3>
            <span className="text-[10px] text-white/80">{isTyping ? 'typing...' : 'online'}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 pr-2">
            <button onClick={() => setIsVideoCallActive(!isVideoCallActive)}><Video className={`w-6 h-6 ${isVideoCallActive ? 'text-red-400' : ''}`} /></button>
            <div className="relative">
                <button onClick={() => setShowChatMenu(!showChatMenu)}><MoreVertical className="w-6 h-6" /></button>
                {showChatMenu && (
                    <div className="absolute top-8 right-0 bg-white shadow-xl rounded w-48 py-2 z-50 text-gray-800 border border-gray-100">
                        <button className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm flex gap-2 border-b border-gray-100" onClick={() => setView(AppView.CERTIFICATE)}>
                            <Award size={16} className={currentTheme.text}/> Certificate
                        </button>
                        <button className="w-full text-left px-4 py-3 hover:bg-red-50 text-sm flex gap-2 text-red-500 font-medium" onClick={handleRestartChat}>
                            <RotateCcw size={16}/> Restart Class
                        </button>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 z-10 scrollbar-hide">
        {messages.map((msg) => (
            <ChatBubble 
              key={msg.id} message={msg} voiceName={selectedTeacher.voiceName} userAvatar={userProfile.avatar} teacherAvatar={selectedTeacher.image}
              onSuggestionClick={(suggestion) => handleSendMessage(suggestion)}
              onBookmark={handleToggleBookmark}
              onShare={handleShareCard}
            />
        ))}
        {isTyping && <div className="text-xs text-gray-500 ml-10">Thinking...</div>}
        <div ref={messagesEndRef} />
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
         <div className="absolute bottom-16 left-2 bg-white p-2 rounded-lg shadow-xl grid grid-cols-8 gap-2 z-30">
             {EMOJI_LIST.map(e => <button key={e} onClick={() => setInputText(p => p + e)} className="text-xl hover:bg-gray-100 rounded">{e}</button>)}
         </div>
      )}

      {/* Input */}
      <div className={`p-2 flex items-end gap-2 z-20 ${isVideoCallActive ? 'bg-black/40' : 'bg-gray-100'}`}>
        <div className="bg-white flex-1 rounded-2xl flex items-center px-2 py-1 shadow-sm">
            <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2 text-gray-400"><Smile className="w-6 h-6" /></button>
            <input 
                type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={handleKeyPress}
                placeholder={isListening ? "Listening..." : "Type here..."}
                className="flex-1 bg-transparent border-none focus:ring-0 text-gray-800 px-2 py-2"
                disabled={isListening}
            />
            <label className="p-2 text-gray-400 cursor-pointer"><Paperclip className="w-5 h-5" /><input type="file" className="hidden" accept="image/*" onChange={handleChatImageAttachment} /></label>
        </div>
        <button onClick={inputText ? () => handleSendMessage() : toggleListening} className={`p-3 rounded-full shadow text-white ${isListening ? 'bg-red-500' : currentTheme.button}`}>
            {inputText ? <Send className="w-5 h-5" /> : (isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />)}
        </button>
      </div>
    </div>
  );

  return (
    <div 
        className="h-screen w-full flex items-center justify-center font-sans transition-colors duration-700 bg-cover bg-center"
        style={{
            backgroundImage: `linear-gradient(to bottom right, ${currentTheme.from}44, ${currentTheme.to}22)`
        }}
    >
        <div className="w-full h-full sm:h-[85vh] sm:w-[400px] sm:rounded-2xl sm:overflow-hidden bg-white shadow-2xl border border-white/50 relative">
            {view === AppView.LOGIN && renderLogin()}
            {view !== AppView.LOGIN && showOnboarding && renderOnboarding()}
            
            {view === AppView.LANDING && renderLanding()}
            {view === AppView.CHAT && renderChat()}
            {view === AppView.SETTINGS && renderSettings()}
            {view === AppView.CERTIFICATE && renderCertificate()}
            {view === AppView.DOWNLOADS && renderDownloads()}
            {view === AppView.BOOKMARKS && renderNotebook()}
            {view === AppView.SHARE_CARD && renderShareCard()}
        </div>
    </div>
  );
};

export default App;
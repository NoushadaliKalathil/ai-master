
import React, { useState } from 'react';
import { Message } from '../types';
import { Check, CheckCheck, ArrowRight, Volume2, Loader2, Bookmark, Share2, Target } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { playTextAsSpeech } from '../services/gemini';

interface ChatBubbleProps {
  message: Message;
  voiceName: string;
  userAvatar: string;
  teacherAvatar: string;
  onSuggestionClick: (text: string) => void;
  onBookmark: (message: Message) => void;
  onShare: (message: Message) => void; // New prop
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, voiceName, userAvatar, teacherAvatar, onSuggestionClick, onBookmark, onShare }) => {
  const isUser = message.sender === 'user';
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  const handlePlayAudio = async () => {
    if (isLoadingAudio || isPlaying) return;
    
    setIsLoadingAudio(true);
    try {
        await playTextAsSpeech(message.text, voiceName);
        setIsPlaying(true);
        setTimeout(() => setIsPlaying(false), 5000); 
    } catch (e) {
        console.error("Failed to play audio");
    } finally {
        setIsLoadingAudio(false);
    }
  };

  return (
    <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'} items-end gap-2`}>
      
      {/* Teacher Avatar (Left) */}
      {!isUser && (
        <img 
          src={teacherAvatar} 
          alt="Teacher" 
          className="w-8 h-8 rounded-full object-cover border border-gray-200 shadow-sm mb-1"
        />
      )}

      {/* Main Message Bubble */}
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[85%]`}>
        
        <div
            className={`relative w-full px-3 py-2 rounded-lg shadow-sm text-[15px] leading-snug break-words group
            ${isUser 
                ? 'bg-[#d9fdd3] text-gray-900 rounded-tr-none' 
                : 'bg-white text-gray-900 rounded-tl-none'
            }`}
        >
            {/* Attachment Rendering */}
            {message.type === 'image' && message.attachment && (
                <div className="mb-2 rounded-lg overflow-hidden border border-black/10">
                    <img src={message.attachment} alt="Attachment" className="w-full h-auto object-cover" />
                </div>
            )}

            {/* Markdown Text */}
            <div className="markdown-content">
                <ReactMarkdown 
                    components={{
                        strong: ({node, ...props}) => <span className="font-bold text-gray-800" {...props} />,
                        p: ({node, ...props}) => <p className="mb-1 last:mb-0" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc ml-4 mb-2" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal ml-4 mb-2" {...props} />,
                        li: ({node, ...props}) => <li className="mb-1" {...props} />,
                    }}
                >
                    {message.text}
                </ReactMarkdown>
            </div>

            {/* Footer: Audio, Bookmark, Share, Time, Ticks */}
            <div className="flex items-center justify-between mt-2 select-none border-t border-gray-50 pt-1">
                <div className="flex gap-2">
                    {!isUser && (
                        <>
                            <button 
                                onClick={handlePlayAudio}
                                className={`p-1 rounded-full transition-colors ${isPlaying ? 'text-green-600 bg-green-50' : 'text-gray-400 hover:text-gray-600'}`}
                                title="Listen"
                            >
                                {isLoadingAudio ? <Loader2 size={14} className="animate-spin" /> : <Volume2 size={14} />}
                            </button>
                            
                            <button 
                                onClick={() => onBookmark(message)}
                                className={`p-1 rounded-full transition-colors ${message.isBookmarked ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                                title="Save to Notebook"
                            >
                                <Bookmark size={14} className={message.isBookmarked ? "fill-current" : ""} />
                            </button>

                             <button 
                                onClick={() => onShare(message)}
                                className="p-1 rounded-full transition-colors text-gray-400 hover:text-blue-500"
                                title="Share as Card"
                            >
                                <Share2 size={14} />
                            </button>
                        </>
                    )}
                    {/* User Share (Prompt Card) */}
                    {isUser && (
                         <button 
                            onClick={() => onShare(message)}
                            className="p-1 rounded-full transition-colors text-gray-400 hover:text-blue-500"
                            title="Share My Prompt"
                        >
                            <Share2 size={14} />
                        </button>
                    )}
                </div>
                
                <div className={`flex items-center gap-1 ml-auto`}>
                    <span className="text-[10px] text-gray-500 min-w-[45px] text-right">
                        {message.timestamp}
                    </span>
                    {isUser && (
                        <span className="text-[#53bdeb]">
                            {message.status === 'read' ? <CheckCheck size={14} /> : <Check size={14} />}
                        </span>
                    )}
                </div>
            </div>
        </div>

        {/* Suggestion Chips + Challenge Button */}
        {!isUser && message.suggestions && message.suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2 max-w-full animate-fade-in">
            {message.suggestions.map((suggestion, idx) => (
                <button
                key={idx}
                onClick={() => onSuggestionClick(suggestion)}
                className="bg-white/90 hover:bg-white text-[#008069] text-xs px-3 py-1.5 rounded-full shadow-sm border border-gray-200 flex items-center gap-1 transition-all active:scale-95"
                >
                <span>{suggestion}</span>
                <ArrowRight size={12} />
                </button>
            ))}
            {/* The Special Challenge Button */}
             <button
                onClick={() => onSuggestionClick("Give me a Challenge! 🎯")}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-3 py-1.5 rounded-full shadow-md flex items-center gap-1 transition-all active:scale-95 animate-pulse"
                >
                <Target size={12} />
                <span>Test Me!</span>
            </button>
            </div>
        )}
      </div>

      {/* User Avatar (Right) */}
      {isUser && (
        <img 
          src={userAvatar} 
          alt="User" 
          className="w-8 h-8 rounded-full object-cover border border-gray-200 shadow-sm mb-1"
        />
      )}

    </div>
  );
};

import { GoogleGenAI, Chat, GenerateContentResponse, Modality } from "@google/genai";
import { Language, Teacher, Message } from '../types';

let chatSession: Chat | null = null;
let genAI: GoogleGenAI | null = null;

// Global Audio State
let currentAudioContext: AudioContext | null = null;
let currentSource: AudioBufferSourceNode | null = null;

// Initialize Gemini Client
const getClient = (): GoogleGenAI => {
  if (!genAI) {
    genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return genAI;
};

// Helper to parse the special format: "Answer *** Suggestion1 | Suggestion 2"
const parseResponse = (rawText: string): { text: string, suggestions: string[] } => {
  if (!rawText) return { text: "...", suggestions: [] };

  const parts = rawText.split('***');
  const mainText = parts[0].trim();
  
  let suggestions: string[] = [];
  if (parts.length > 1) {
    const rawSuggestions = parts[1]
      .split('|')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    // Deduplicate suggestions to prevent "Image | Image" issues
    suggestions = [...new Set(rawSuggestions)].slice(0, 3); 
  }

  return { text: mainText, suggestions };
};

// Helper for delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Wrapper to retry on 429 (Quota Exceeded)
const retryOperation = async <T>(operation: () => Promise<T>, retries = 2): Promise<T> => {
    try {
        return await operation();
    } catch (error: any) {
        const errString = JSON.stringify(error) + error.toString();
        // Check for 429 or Quota errors
        if (retries > 0 && (
            errString.includes("429") || 
            errString.includes("quota") || 
            errString.includes("RESOURCE_EXHAUSTED") ||
            error?.status === 429
        )) {
            console.warn(`Quota hit, retrying in 2s... (${retries} retries left)`);
            await delay(2000); // Wait 2 seconds
            return retryOperation(operation, retries - 1);
        }
        throw error;
    }
};

// ERROR HANDLER HELPER
const handleApiError = (error: any): { text: string, suggestions: string[] } => {
    console.error("Gemini API Error:", error);
    
    // Robust error checking
    const errString = JSON.stringify(error) + error.toString();
    const isQuota = 
        error?.status === 429 || 
        error?.status === "RESOURCE_EXHAUSTED" ||
        (error?.error?.code === 429) ||
        errString.includes("429") || 
        errString.includes("quota") || 
        errString.includes("RESOURCE_EXHAUSTED");

    if (isQuota) {
        return {
            text: "⚠️ **Server Busy (High Traffic)**\n\nThe AI is currently overloaded (Quota Exceeded). This happens when too many people use the free version at once.\n\n**Please wait 1 minute and try again.**",
            suggestions: ["Wait 1 Minute", "Try Again"]
        };
    }
    
    return { text: "⚠️ Network connection error. Please check your internet or try again.", suggestions: ["Retry"] };
};

// Internal helper to create the session configuration
const createChatSession = (systemInstruction: string, language: Language, teacher: Teacher, historyMessages: Message[] = []) => {
  const client = getClient();
  
  // STRICT LANGUAGE ENFORCEMENT
  let langInstruction = "";

  if (language === 'malayalam') {
      langInstruction = `
        CRITICAL INSTRUCTION - LANGUAGE OVERRIDE:
        The user has selected MALAYALAM language.
        You MUST IGNORE any previous instructions to speak English.
        You MUST speak in PURE MALAYALAM SCRIPT (Unicode).
        
        RULES FOR MALAYALAM MODE:
        1. OUTPUT MUST BE IN MALAYALAM SCRIPT (e.g., "നമസ്കാരം").
        2. Do NOT use English alphabet for Malayalam words (No Manglish).
        3. Do NOT translate technical terms (keep them as 'AI', 'Photoshop', 'YouTube', 'Prompt').
        4. Translate your Persona/Role into Malayalam context.
        5. If the course instructions are in English, MENTALLY TRANSLATE them and teach in Malayalam.
      `;
  } else {
      langInstruction = `
        STRICT LANGUAGE RULE:
        - You MUST speak in STANDARD INTERNATIONAL ENGLISH.
        - Tone: Professional, Global, and Articulate (World-class Instructor style).
        - Do NOT use regional Indian slang (No 'Aliya', 'Poli', 'Dear', etc.).
        - Avoid Indian-English mannerisms. Speak like a US/UK industry expert.
        - Be clear, concise, and professional.
      `;
  }

  // Map app messages to Gemini history format
  const history = historyMessages.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }]
  }));

  chatSession = client.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      temperature: 0.7,
      systemInstruction: `
        ${langInstruction}
        
        YOUR TEACHER PERSONA (Adapt this to the selected language):
        ${teacher.systemInstruction}
        
        YOUR SPECIFIC TASK:
        ${systemInstruction}

        CRITICAL OUTPUT FORMAT (Strictly Follow):
        1. MAIN TEXT: Answer the user or teach the concept. Keep it concise.
        2. SEPARATOR: On a new line, write exactly three asterisks: ***
        3. SUGGESTIONS: After the ***, list 2-3 clickable options separated by '|'.
        
        LOGIC FOR SUGGESTIONS (Crucial):
        - **CONVERSATIONAL & ACTIONABLE**: Do NOT use single words like "Image" or "Video". 
          - BAD: "Image" | "Video"
          - GOOD: "Create an Image" | "Make a Video" | "Show me Examples"
        - **USER PERSPECTIVE**: The suggestion is what the USER will say next. Phrase it as a request or action.
        - **FORWARD MOVING**: Suggest the next logical step in the lesson (e.g., "Give me a prompt", "How do I start?").
        - **NO REPETITION**: Never output the same suggestion twice.
        - **CONTEXT AWARE**: If you asked "Do you want A or B?", the suggestions must be "I want A | I want B".
        - **LENGTH**: Keep them short (3-5 words max) so they fit in the UI.
      `,
    },
    history: history
  });
  
  return chatSession;
};

export const startCourseChat = async (systemInstruction: string, language: Language, teacher: Teacher): Promise<{ text: string, suggestions: string[] }> => {
  // Initialize new session with empty history
  createChatSession(systemInstruction, language, teacher, []);
  
  const langName = language === 'malayalam' ? 'Malayalam' : 'International English';
  const teacherName = language === 'malayalam' ? teacher.nameMal : teacher.name;

  if (!chatSession) throw new Error("Failed to initialize chat");

  try {
    return await retryOperation(async () => {
        if (!chatSession) throw new Error("Chat session lost");
        const response: GenerateContentResponse = await chatSession.sendMessage({
        message: `[SYSTEM: FORCE OUTPUT IN ${langName.toUpperCase()}]
        Start the class. Introduce yourself briefly as ${teacherName}.
        Ask what they want to learn today based on the course topic.
        
        IMPORTANT: If I selected Malayalam, you MUST use Malayalam script (Unicode). Do not speak English.`
        });
        return parseResponse(response.text || "");
    });
  } catch (error) {
    return handleApiError(error);
  }
};

// New function to resume a chat from history without sending a new message immediately
export const resumeChat = (systemInstruction: string, language: Language, teacher: Teacher, history: Message[]) => {
  try {
    createChatSession(systemInstruction, language, teacher, history);
    console.log("Chat session resumed with history length:", history.length);
  } catch (error) {
    console.error("Failed to resume chat:", error);
  }
};

export const sendMessageToGemini = async (userMessage: string): Promise<{ text: string, suggestions: string[] }> => {
  if (!chatSession) {
    // If session is missing (e.g. page reload without resume), we can't easily recover context without the course data.
    // The App.tsx should ensure resumeChat is called.
    throw new Error("Chat session not initialized");
  }

  try {
    return await retryOperation(async () => {
        if (!chatSession) throw new Error("Chat session lost");
        const response: GenerateContentResponse = await chatSession.sendMessage({
            message: userMessage
        });
        return parseResponse(response.text || "");
    });
  } catch (error) {
    return handleApiError(error);
  }
};

// --- TTS Logic ---

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const stopAllAudio = () => {
  if (currentSource) {
    try {
      currentSource.stop();
      currentSource.disconnect();
    } catch (e) {
      // Ignore errors if already stopped
    }
    currentSource = null;
  }
  
  if (currentAudioContext) {
    try {
      if (currentAudioContext.state !== 'closed') {
        currentAudioContext.close();
      }
    } catch (e) {
      console.error("Error closing audio context", e);
    }
    currentAudioContext = null;
  }
};

export const playTextAsSpeech = async (text: string, voiceName: string = 'Kore'): Promise<void> => {
  // Stop any currently playing audio before starting new one
  stopAllAudio();
  
  const client = getClient();
  
  try {
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceName }, 
            },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio data received");

    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
    currentAudioContext = outputAudioContext;
    
    const outputNode = outputAudioContext.createGain();
    
    const audioBuffer = await decodeAudioData(
      decode(base64Audio),
      outputAudioContext,
      24000,
      1,
    );
    
    const source = outputAudioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(outputNode);
    outputNode.connect(outputAudioContext.destination);
    
    source.onended = () => {
        if (currentSource === source) {
            currentSource = null;
        }
    };

    currentSource = source;
    source.start();

  } catch (error) {
    console.error("TTS Error:", error);
    // Ensure we clean up if there was an error mid-setup
    stopAllAudio();
    throw error;
  }
};
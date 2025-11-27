
import { Course, Teacher, UserProfile, AppTheme, DownloadItem } from './types';

export const DEFAULT_USER: UserProfile = {
  id: 'user_01',
  name: 'Aspiring Pro',
  bio: 'Learning AI to master the future.',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', // Default avatar
  level: 1,
  totalXp: 0
};

export const EMOJI_LIST = ["👍", "❤️", "😂", "🔥", "🎉", "🤔", "👀", "🚀", "💡", "✨", "🤖", "🎓", "📚", "💪", "🙌", "👋"];

export const FREE_DOWNLOADS: DownloadItem[] = [
    {
        id: 'dl_1',
        title: '50 Cinematic AI Prompts',
        description: 'Copy-paste prompts for Midjourney/Firefly.',
        icon: '🎬',
        filename: 'Cinematic_Prompts_Pack.txt',
        minLevel: 1, // Unlocked by default
        content: `AI MASTER - CINEMATIC PROMPTS PACK
------------------------------------
1. THE BLOCKBUSTER SHOT
Prompt: "Cinematic wide angle shot of a cyberpunk city street at night, neon rain, volumetric lighting, 8k resolution, octane render, photorealistic --ar 16:9"

2. THE PORTRAIT
Prompt: "Close up portrait of an old fisherman, highly detailed face texture, dramatic side lighting, rembrandt lighting, blurred background, 85mm lens"

3. THE FANTASY LANDSCAPE
Prompt: "Ethereal floating islands in the sky, waterfalls cascading into clouds, golden hour sun, studio ghibli style, vivid colors, masterpiece"

... (Use these in Midjourney, Bing Image Creator, or Firefly)`
    },
    {
        id: 'dl_2',
        title: 'YouTube Viral Checklist',
        description: '10 Steps before you upload a video.',
        icon: '🚀',
        filename: 'YouTube_Checklist.txt',
        minLevel: 2,
        content: `YOUTUBE VIRAL CHECKLIST
-----------------------
1. THUMBNAIL: Does it have high contrast? Is the face expressing emotion? (Aim for <3 text words)
2. TITLE: Is it under 60 chars? Does it create curiosity?
3. HOOK: Did you start the video immediately (No long intros)?
4. AUDIO: Is the voice clear? Did you remove background noise?
...
`
    },
    {
        id: 'dl_3',
        title: 'Freelance Email Templates',
        description: 'Get clients on Upwork/Fiverr.',
        icon: '✉️',
        filename: 'Client_Emails.txt',
        minLevel: 3,
        content: `FREELANCE EMAIL TEMPLATES
-------------------------
SUBJECT: Idea for [Client Name]'s Project

Hi [Name],
I saw your job post about [Topic] and I have a specific idea on how to solve it using AI tools to save time.

Here is a quick sample of my previous work: [Link]

Can we chat for 5 mins?
Best,
[Your Name]`
    }
];

export const TEACHERS: Teacher[] = [
  {
    id: 'ai-master',
    name: 'AI Master',
    nameMal: 'AI മാസ്റ്റർ',
    role: 'Senior Mentor',
    roleMal: 'സീനിയർ മെൻ്റർ',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&h=200&auto=format&fit=crop', // Placeholder for handsome indian man
    videoImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop',
    description: 'Global Creative Director.',
    descriptionMal: 'അറിവും അനുഭവസമ്പത്തുമുള്ള മികച്ച അധ്യാപകൻ.',
    systemInstruction: "You are 'AI Master', a World-Class Senior Creative Director. You have 25 years of global industry experience.\n\nKEY TRAITS:\n- International Professionalism: Speak like a TED Talk speaker or a Masterclass instructor.\n- Respectful Authority: Treat the user as a colleague. Maintain high professional standards.\n- Tone: Wise, sophisticated, and inspiring. Avoid all local slang or over-familiarity in English.\n- Goal: Provide high-level, industry-standard advice suitable for a global audience.",
    voiceName: 'Fenrir' // Deep Male Voice
  },
  {
    id: 'ai-teacher',
    name: 'AI Teacher',
    nameMal: 'AI ടീച്ചർ',
    role: 'Tech Lead',
    roleMal: 'ടെക് ട്യൂട്ടർ',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&h=200&auto=format&fit=crop', // Placeholder for beautiful indian girl
    videoImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800&auto=format&fit=crop',
    description: 'Silicon Valley Tech Expert.',
    descriptionMal: 'പുതിയ സാങ്കേതികവിദ്യകൾ ലളിതമായി പഠിപ്പിക്കുന്നു.',
    systemInstruction: "You are 'AI Teacher', a Silicon Valley Tech Lead. You are an expert in modern global technology.\n\nKEY TRAITS:\n- Modern & Efficient: Speak like a professional at Google or Apple.\n- Universal Approach: Use clear, standard English suitable for international users.\n- Tone: Energetic, smart, and precise. Friendly but maintaining professional distance.\n- No Slang: Do not use local Indian terms. Focus on clarity and efficiency.",
    voiceName: 'Kore' // Female Voice
  }
];

export const COURSES: Course[] = [
  // --- VIRAL & INCOME (Hooks) ---
  {
    id: 'free-ai-tools',
    title: 'Top FREE AI Tools',
    titleMal: 'മികച്ച സൗജന്യ AI ടൂളുകൾ',
    description: 'Create Image, Video & Audio for Free.',
    icon: '🧰',
    badge: 'HOT',
    category: 'CREATOR',
    systemPrompt: `You are the "Free AI Tools Advisor".
    
    CRITICAL INSTRUCTION:
    If the user says "Start" or asks vaguely for tools, DO NOT list everything at once. 
    INSTEAD, ASK: "What do you want to create for FREE today? 
    1. Image (Photos, Art)
    2. Video (Reels, Movies)
    3. Audio (Music, Voice)
    4. Editing (Restoration, Upscaling)"
    
    SUGGESTION CHIPS LOGIC:
    If you ask the above, suggestions MUST be: "Create an Image" | "Make a Video" | "Generate Audio".
    
    ONLY when the user selects a category, provide the best FREE tools for that specific task.
    
    DATABASE OF TOOLS (Recommend these):
    - Image: Bing Image Creator (Best Free), Leonardo.ai (Daily Free Credits), Ideogram (Good Text).
    - Video: Kling AI (High Motion - Web), Luma Dream Machine (Web), Hailuo AI (MiniMax).
    - Audio: Suno AI (Songs), ElevenLabs (Voice - Limited Free), Udio.
    - Editing: CapCut (Mobile/PC), DaVinci Resolve (PC - Pro), Upscayl (Free PC Upscaler).
    - Restoration: RestorePhotos.io, GFP-GAN.
    
    Always mention: Name, Platform (Web/App), and "Free Limit" (e.g. Daily credits).`
  },
  {
    id: 'youtube-growth',
    title: 'YouTube Money Secrets',
    titleMal: 'യൂട്യൂബ് വരുമാനം',
    description: '10 Secrets to Viral Success & Income.',
    icon: '🚀',
    badge: 'TRENDING',
    category: 'CREATOR',
    systemPrompt: `You are an expert in YouTube Growth and Monetization using AI.
    
    STARTING STRATEGY:
    When the class starts, ASK: "What is your channel's niche? (Tech, Vlog, Cooking, Entertainment?)"
    
    CONTENT:
    Teach the "10 Secrets of Winning Channels" (e.g., High CTR Thumbnails, Hooks, Retention Editing). Explain Monetization rules clearly (4000 hours, 1000 subs). Teach how to use AI to generate titles, tags, and descriptions for Indian audiences.`
  },
  {
    id: 'ai-video-reels',
    title: 'Viral AI Reels & Shorts',
    titleMal: 'AI റീൽസ് & ഷോർട്ട്സ്',
    description: 'Make faceless videos that go viral.',
    icon: '📱',
    badge: 'NEW',
    category: 'CREATOR',
    systemPrompt: `Teach how to create high-quality AI videos for Instagram Reels and YouTube Shorts.
    
    STARTING STRATEGY:
    When the class starts, ASK: "Do you want to make Text-to-Video (from scratch) or animate an Image (Image-to-Video)?"
    
    CONTENT:
    Topics: Text-to-Video tools (Sora, Runway, Pika), AI Voiceovers (ElevenLabs), and "Faceless" channel ideas. Focus on creating viral content efficiently.`
  },
  {
    id: 'social-media-income',
    title: 'Earn from Instagram/FB',
    titleMal: 'സോഷ്യൽ മീഡിയ വരുമാനം',
    description: 'Affiliate, Ads & Sponsorships.',
    icon: '💰',
    category: 'BUSINESS',
    systemPrompt: `Teach how to monetize Facebook and Instagram using AI content.
    
    STARTING STRATEGY:
    When the class starts, ASK: "Are you focusing on Facebook or Instagram for income?"
    
    CONTENT:
    Topics: Affiliate marketing, Sponsored posts, and Ad revenue. Explain how to build an audience using consistent, high-quality AI art and video.`
  },

  // --- NEW VIRAL ADDITIONS (LIFESTYLE & CAREER) ---
  {
    id: 'dream-home',
    title: 'Dream Home Designer',
    titleMal: 'സ്വപ്ന വീട് ഡിസൈൻ',
    description: 'Design Interiors & Exteriors with AI.',
    icon: '🏠',
    badge: 'NEW',
    category: 'LIFESTYLE',
    systemPrompt: `You are an AI Architect and Interior Designer.
    
    GOAL:
    Help users generate visual descriptions (prompts) to see their dream home using AI image tools.
    
    STARTING STRATEGY:
    ASK: "Are we designing an 'Exterior' (House elevation) or an 'Interior' (Room design) today?"
    
    CONTENT:
    - Styles: Kerala Traditional (Nalukettu), Modern Minimalist, Contemporary.
    - Advice: Color combinations, space saving ideas, and generating prompts for visualization tools.`
  },
  {
    id: 'ielts-migration',
    title: 'IELTS & Migration AI',
    titleMal: 'IELTS & വിദേശ പഠനം',
    description: 'Speaking Practice & SOP Writing.',
    icon: '✈️',
    badge: 'ESSENTIAL',
    category: 'CAREER',
    systemPrompt: `You are an IELTS/OET Trainer and Study Abroad Consultant.
    
    GOAL:
    Help students and nurses preparing for migration (UK, Canada, Australia, Gulf).
    
    STARTING STRATEGY:
    ASK: "Do you want to practice 'Speaking/Grammar' 🗣️ or need help with 'SOP/Emails' 📝?"
    
    CONTENT:
    - Speaking: Act as an examiner. Ask a question, wait for answer, then correct grammar.
    - Writing: Help write Statements of Purpose (SOP) or professional emails to universities.
    - Gulf Focus: Basic Arabic greetings for Gulf expats.`
  },
  {
    id: 'ai-chef',
    title: 'AI Smart Chef & Diet',
    titleMal: 'സ്മാർട്ട് അടുക്കള & ഡയറ്റ്',
    description: 'Recipe Generator & Diet Plans.',
    icon: '🍳',
    badge: 'TRENDING',
    category: 'LIFESTYLE',
    systemPrompt: `You are an AI Chef and Nutritionist.
    
    GOAL:
    Solve the daily "What to cook?" problem and help with healthy eating.
    
    STARTING STRATEGY:
    ASK: "Do you want a 'Recipe' 🍲 based on ingredients you have, or a 'Diet Plan' 🥗?"
    
    CONTENT:
    - Magic Fridge: User lists ingredients (e.g., "Egg, Spinach"), you give a tasty recipe.
    - Diet: Create meal plans for weight loss/gain suitable for Indian/Kerala palette.`
  },
  {
    id: 'no-code-apps',
    title: 'Build Apps (No-Code)',
    titleMal: 'ആപ്പുകൾ നിർമ്മിക്കാം',
    description: 'Create Software without Coding.',
    icon: '💻',
    badge: 'HOT',
    category: 'CAREER',
    systemPrompt: `You are a No-Code Development Expert.
    
    GOAL:
    Teach normal people how to build websites/apps using AI tools without learning complex code.
    
    STARTING STRATEGY:
    ASK: "Do you want to build a 'Website' 🌐 or a 'Mobile App' 📱?"
    
    CONTENT:
    - Tools: Teach how to use Cursor, Replit, or Bolt.new.
    - Prompting: How to tell AI to write code for you.
    - Strategy: Turning an idea into a working product.`
  },


  // --- STUDENT WORLD (AI FOCUSED) ---
  {
    id: 'student-lp',
    title: 'AI Magic (Class 1-5)',
    titleMal: 'AI മാജിക് (1-5 ക്ലാസ്)',
    description: 'Create Stories, Cartoons & Art.',
    icon: '🎈',
    badge: 'SCHOOL',
    category: 'STUDENT',
    systemPrompt: `You are a Mentor teaching Generative AI to small children (Age 6-10).
    
    GOAL:
    Teach them how to use AI to unleash their creativity. Do NOT just teach school subjects. Teach them how to *use* AI.
    
    ACTIVITIES:
    - "Let's make a story together!" (Interactive Storytelling)
    - "Imagine a magical creature and I will describe how to draw it."
    - "Ask me anything, and I will explain it like a cartoon."
    
    STARTING STRATEGY:
    ASK: "Hello little friend! Do you want to create a 'Magical Story' 📖, or invent a 'New Cartoon Character' 🦄 today?"`
  },
  {
    id: 'student-up',
    title: 'AI Creator (Class 6-7)',
    titleMal: 'AI ക്രിയേറ്റർ (6-7 ക്ലാസ്)',
    description: 'Fun Science & Digital Art.',
    icon: '🎒',
    badge: 'SCHOOL',
    category: 'STUDENT',
    systemPrompt: `You are a Mentor teaching Generative AI to Pre-teens (Age 11-12).
    
    GOAL:
    Teach them how to use AI tools for learning and fun.
    
    ACTIVITIES:
    - Visualizing Science: "Describe a black hole and I'll help you visualize it."
    - AI for Hobbies: Creating comic strips, simple game ideas.
    - Fun Facts: Using AI to find amazing facts about the world.
    
    STARTING STRATEGY:
    ASK: "Welcome! Do you want to use AI to 'Visualize Science' 🔬 or 'Create Digital Art' 🎨?"`
  },
  {
    id: 'student-sslc',
    title: 'AI Smart Study (8-10)',
    titleMal: 'AI സ്മാർട്ട് പഠനം (8-10)',
    description: 'Exam Prep & Summarization Tools.',
    icon: '📚',
    badge: 'SCHOOL',
    category: 'STUDENT',
    systemPrompt: `You are an AI Study Coach for High School Students.
    
    GOAL:
    Teach them how to use Generative AI as a "Super Tutor" for their exams (SSLC).
    
    TEACH THEM TO PROMPT FOR:
    - Summarizing long History chapters into bullet points.
    - Explaining complex Physics/Maths formulas simply.
    - Creating "Memory Tricks" (Mnemonics) to remember answers.
    - Generating Practice Quizzes.
    
    STARTING STRATEGY:
    ASK: "Exam mode ON! Do you want to learn how to 'Summarize Chapters' 📝, 'Simplify Formulas' ➗, or 'Create a Quiz' ❓?"`
  },
  {
    id: 'student-plus',
    title: 'AI Concept Master (+1/+2)',
    titleMal: 'AI കൺസെപ്റ്റ് മാസ്റ്റർ',
    description: 'Deep Dive Science & Commerce.',
    icon: '🔬',
    badge: 'COLLEGE',
    category: 'STUDENT',
    systemPrompt: `You are an AI Mentor for Higher Secondary Students.
    
    GOAL:
    Teach them how to leverage AI to master complex streams (Science/Commerce/Humanities).
    
    TEACH THEM TO PROMPT FOR:
    - Breaking down complex theories (Quantum Physics, Economics).
    - Finding real-world applications of what they study.
    - Comparing different colleges/courses using AI.
    
    STARTING STRATEGY:
    ASK: "Welcome. Shall we use AI to 'Decode Complex Topics' 🧠 or 'Explore Career Options' 🚀?"`
  },
  {
    id: 'student-college',
    title: 'AI for Research & Career',
    titleMal: 'AI കരിയർ & റിസർച്ച്',
    description: 'Thesis, Coding & Projects.',
    icon: '🎓',
    badge: 'COLLEGE',
    category: 'STUDENT',
    systemPrompt: `You are a Professional AI Consultant for College Students.
    
    GOAL:
    Teach them professional AI workflows for their degree and future job.
    
    TEACH THEM TO PROMPT FOR:
    - Research: Literature review, finding gaps, summarizing papers.
    - Coding: Debugging, explaining code, generating snippets.
    - Writing: Structuring assignments and project reports (Ethically).
    
    STARTING STRATEGY:
    ASK: "Hello Future Pro. Do you need AI help with 'Research/Thesis' 📄, 'Coding/Projects' 💻, or 'Resume Building' 📝?"`
  },

  // --- CREATIVE ARTS & CAREER ---
  {
    id: 'cinematic-prompts',
    title: 'Cinematic Masterclass',
    titleMal: 'സിനിമാറ്റിക് മാസ്റ്റർക്ലാസ്',
    description: 'Visuals, Lighting & Camera Angles.',
    icon: '🎬',
    category: 'CREATOR',
    systemPrompt: `Teach how to write AI prompts for photorealistic results.
    
    STARTING STRATEGY:
    When the class starts, ASK: "What genre are we visualizing today? (e.g., Sci-fi, Thriller, Nature, or Portrait?)"
    
    CONTENT:
    Focus on: Camera Angles (Wide, Low, Dutch), Lighting (Volumetric, Rim), and Film Stock aesthetics. Give examples of bad vs good prompts.`
  },
  {
    id: 'english-tutor',
    title: 'English for Success',
    titleMal: 'ഇംഗ്ലീഷ് സംസാരിക്കാം',
    description: 'Speak fluently in Interviews & Work.',
    icon: '🗣️',
    badge: 'ESSENTIAL',
    category: 'CAREER',
    systemPrompt: `You are a friendly Spoken English Tutor.
    
    STARTING STRATEGY:
    When the class starts, ASK: "Do you want to practice 'Conversation' or do you want me to 'Correct' your grammar?"
    
    CONTENT:
    1. If user types in Malayalam: Translate it to proper English and explain the grammar.
    2. If user types in broken English: Correct the sentence politely and show the difference.
    3. Suggest better vocabulary words (Synonyms).`
  },
  {
    id: 'career-interview',
    title: 'Interview & Resume Pro',
    titleMal: 'ജോലി & ഇന്റർവ്യൂ',
    description: 'Get hired faster with AI tips.',
    icon: 'wg',
    category: 'CAREER',
    systemPrompt: `You are a Career Coach and HR Expert.
    
    STARTING STRATEGY:
    When the class starts, ASK: "Are you preparing for an 'Interview' or do you need help writing a 'Resume/CV'?"
    
    CONTENT:
    - Interview: Conduct a mock interview. Ask one question at a time. Rate the user's answer.
    - Resume: Teach how to write ATS-friendly resumes. Suggest action verbs (Managed, Created, Led).`
  },
  {
    id: 'photoshop-ai',
    title: 'Photoshop + AI Magic',
    titleMal: 'ഫോട്ടോഷോപ്പ് + AI',
    description: 'Fix hands, Composite & Edit like a Pro.',
    icon: '🎨',
    category: 'CREATOR',
    systemPrompt: `Teach how to combine AI generations with Photoshop.
    
    STARTING STRATEGY:
    When the class starts, ASK: "Are we fixing a bad AI generation (like hands/eyes) or creating a Composite image?"
    
    CONTENT:
    Focus on: Fixing AI errors, overpainting, color grading, and compositing.`
  },
  {
    id: 'storyboarding',
    title: 'Storyboarding for Film',
    titleMal: 'സ്റ്റോറിബോർഡിംഗ്',
    description: 'Visual scripts & Pitch decks.',
    icon: '📝',
    category: 'CREATOR',
    systemPrompt: `Teach how to visualize film scripts using AI.
    
    STARTING STRATEGY:
    When the class starts, ASK: "Do you have a script ready, or are we working on a rough concept today?"
    
    CONTENT:
    Focus on: Shot composition, consistency, and creating Pitch Decks. Explain how to visualize a scene before generating it.`
  },
  {
    id: 'office-business',
    title: 'Business Productivity',
    titleMal: 'ഓഫീസ് & ബിസിനസ്',
    description: 'Excel, Email & Marketing tools.',
    icon: '💼',
    category: 'BUSINESS',
    systemPrompt: `You are an Office Productivity Expert teaching AI tools.
    
    STARTING STRATEGY:
    When the class starts, ASK: "What do you need help with? (Writing Emails, Excel Formulas, or Marketing posts?)"
    
    CONTENT:
    - Excel: Write formulas for the user.
    - Email: Write professional emails for leave, job application, or client replies.
    - Marketing: Write captions for Instagram/Facebook for small businesses/shops.`
  }
];

export const THEMES: AppTheme[] = [
    {
      id: 'whatsapp',
      name: 'Classic Green',
      from: '#008069',
      to: '#00a884',
      bg: 'bg-[#008069]',
      text: 'text-[#008069]',
      button: 'bg-[#008069] hover:bg-[#00a884]',
      border: 'border-[#008069]',
      gradient: 'from-[#008069] to-[#00a884]'
    },
    {
      id: 'blue',
      name: 'Ocean Blue',
      from: '#2563eb',
      to: '#06b6d4',
      bg: 'bg-blue-600',
      text: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-cyan-500',
      border: 'border-blue-600',
      gradient: 'from-blue-600 to-cyan-500'
    },
    {
      id: 'purple',
      name: 'Royal Purple',
      from: '#7c3aed',
      to: '#db2777',
      bg: 'bg-violet-600',
      text: 'text-violet-600',
      button: 'bg-violet-600 hover:bg-pink-600',
      border: 'border-violet-600',
      gradient: 'from-violet-600 to-pink-600'
    },
    {
      id: 'orange',
      name: 'Sunset Orange',
      from: '#ea580c',
      to: '#facc15',
      bg: 'bg-orange-600',
      text: 'text-orange-600',
      button: 'bg-orange-600 hover:bg-yellow-500',
      border: 'border-orange-600',
      gradient: 'from-orange-600 to-yellow-500'
    },
    {
      id: 'red',
      name: 'Crimson Red',
      from: '#dc2626',
      to: '#ef4444',
      bg: 'bg-red-600',
      text: 'text-red-600',
      button: 'bg-red-600 hover:bg-red-500',
      border: 'border-red-600',
      gradient: 'from-red-600 to-red-500'
    },
    {
      id: 'pink',
      name: 'Hot Pink',
      from: '#db2777',
      to: '#f472b6',
      bg: 'bg-pink-600',
      text: 'text-pink-600',
      button: 'bg-pink-600 hover:bg-rose-400',
      border: 'border-pink-600',
      gradient: 'from-pink-600 to-rose-400'
    },
    {
      id: 'teal',
      name: 'Teal Fresh',
      from: '#0d9488',
      to: '#14b8a6',
      bg: 'bg-teal-600',
      text: 'text-teal-600',
      button: 'bg-teal-600 hover:bg-cyan-500',
      border: 'border-teal-600',
      gradient: 'from-teal-600 to-cyan-500'
    },
    {
      id: 'gold',
      name: 'Golden Luxe',
      from: '#ca8a04',
      to: '#eab308',
      bg: 'bg-yellow-600',
      text: 'text-yellow-600',
      button: 'bg-yellow-600 hover:bg-amber-500',
      border: 'border-yellow-600',
      gradient: 'from-yellow-600 to-amber-500'
    },
    {
      id: 'slate',
      name: 'Slate Pro',
      from: '#475569',
      to: '#64748b',
      bg: 'bg-slate-600',
      text: 'text-slate-600',
      button: 'bg-slate-600 hover:bg-gray-500',
      border: 'border-slate-600',
      gradient: 'from-slate-600 to-gray-500'
    },
    {
      id: 'indigo-deep',
      name: 'Indigo Deep',
      from: '#3730a3',
      to: '#4338ca',
      bg: 'bg-indigo-800',
      text: 'text-indigo-800',
      button: 'bg-indigo-800 hover:bg-indigo-600',
      border: 'border-indigo-800',
      gradient: 'from-indigo-800 to-blue-700'
    },
    {
      id: 'forest',
      name: 'Forest Green',
      from: '#166534',
      to: '#15803d',
      bg: 'bg-green-800',
      text: 'text-green-800',
      button: 'bg-green-800 hover:bg-emerald-700',
      border: 'border-green-800',
      gradient: 'from-green-800 to-emerald-700'
    },
    {
      id: 'dark',
      name: 'Midnight',
      from: '#1f2937',
      to: '#111827',
      bg: 'bg-gray-800',
      text: 'text-gray-800',
      button: 'bg-gray-800 hover:bg-black',
      border: 'border-gray-800',
      gradient: 'from-gray-800 to-gray-900'
    }
];
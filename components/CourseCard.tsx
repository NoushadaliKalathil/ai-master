
import React from 'react';
import { Course, AppTheme } from '../types';
import { ChevronRight } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  index: number;
  progress: number; // 0 to 100
  theme: AppTheme;
  onClick: (course: Course) => void;
}

// Beautiful Pastel Palette inspired by the user's screenshot
const PASTEL_COLORS = [
  'bg-[#fffbeb]', // Amber/Yellow (Warm & Friendly)
  'bg-[#fdf2f8]', // Pink (Sweet & Soft)
  'bg-[#eff6ff]', // Blue (Cool & Professional)
  'bg-[#f0fdf4]', // Green (Fresh & Natural)
  'bg-[#faf5ff]', // Purple (Creative)
  'bg-[#ecfdf5]', // Teal (Calm)
  'bg-[#fff7ed]', // Orange (Energetic)
  'bg-[#f5f3ff]', // Violet (Deep)
];

export const CourseCard: React.FC<CourseCardProps> = ({ course, index, progress, theme, onClick }) => {
  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'HOT': return 'bg-red-500 text-white';
      case 'NEW': return 'bg-blue-500 text-white';
      case 'TRENDING': return 'bg-orange-500 text-white';
      case 'ESSENTIAL': return 'bg-green-600 text-white';
      case 'SCHOOL': return 'bg-pink-500 text-white';
      case 'COLLEGE': return 'bg-indigo-600 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  // Cycle through the pastel colors based on the index
  const cardColor = PASTEL_COLORS[index % PASTEL_COLORS.length];

  return (
    <div 
      onClick={() => onClick(course)}
      className={`${cardColor} p-4 rounded-xl shadow-sm border border-black/5 flex flex-col gap-3 cursor-pointer hover:opacity-90 transition-all active:scale-[0.98] relative overflow-hidden`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
            {/* Number Badge (Subtler now to blend with color) */}
            <div className="flex flex-col items-center justify-center w-6 shrink-0">
                <span className="text-xs font-black text-black/20">#{index.toString().padStart(2, '0')}</span>
            </div>

            {/* Icon Circle (White background to pop against color) */}
            <div className={`text-2xl bg-white/80 w-12 h-12 flex items-center justify-center rounded-full shrink-0 shadow-sm backdrop-blur-sm`}>
                {course.icon}
            </div>
            
            <div className="flex flex-col">
            <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 leading-tight text-[15px]">{course.title}</h3>
                {course.badge && (
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm uppercase tracking-wide ${getBadgeColor(course.badge)}`}>
                        {course.badge}
                    </span>
                )}
            </div>
            <p className="text-xs font-medium text-gray-600 leading-snug mt-0.5">{course.description}</p>
            </div>
        </div>
        <ChevronRight className="text-black/20 w-5 h-5 shrink-0" />
      </div>

      {/* Progress Bar (Darker shade of theme for visibility) */}
      <div className="w-full flex items-center gap-2 pl-9">
           <div className="flex-1 h-1.5 bg-black/5 rounded-full overflow-hidden">
                <div 
                    className={`h-full rounded-full transition-all duration-1000 ${progress >= 100 ? 'bg-green-500' : theme.bg}`} 
                    style={{ width: `${progress}%` }}
                ></div>
           </div>
           <span className="text-[9px] font-bold text-gray-500 w-6 text-right">{progress}%</span>
      </div>
    </div>
  );
};

import { TrendingUp, BarChart3 } from "lucide-react";

export function SEOaxeLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <div className="w-10 h-10 flex items-center justify-center">
          <svg 
            viewBox="0 0 48 48" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="w-10 h-10"
          >
            <path 
              d="M8 36L20 12L24 8L28 12L40 36L32 36L28 28L20 28L16 36L8 36Z" 
              fill="#378ADD"
            />
            <path 
              d="M12 32L20 16L24 12L28 16L36 32L30 32L26 24L22 24L18 32L12 32Z" 
              fill="#2563eb"
            />
            <path 
              d="M22 24L26 24L24 16L22 24Z" 
              fill="#1e40af"
            />
            <rect x="4" y="38" width="40" height="4" rx="2" fill="#e0e7ff"/>
          </svg>
        </div>
      </div>
      <span className="text-xl font-black tracking-tight">
        <span className="text-slate-900">SEO</span>
        <span className="text-blue-600">axe</span>
      </span>
    </div>
  );
}

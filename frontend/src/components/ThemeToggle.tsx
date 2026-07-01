import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative p-3 rounded-xl bg-gradient-to-br from-slate-700/50 to-slate-600/50 hover:from-slate-700 hover:to-slate-600 text-slate-200 transition-all duration-300 border border-white/10 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/20 hover:-translate-y-1 hover:scale-105 group overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 focus:ring-offset-slate-900"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {/* Background Gradient Animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/0 via-purple-600/0 to-pink-600/0 group-hover:via-indigo-500/20 transition-all duration-500"></div>

      {theme === 'dark' ? (
        <div className="relative flex items-center justify-center transition-all duration-500">
          <div className="absolute inset-0 rounded-full bg-indigo-500/20 group-hover:scale-150 transition-transform duration-500 blur-md"></div>
          <Moon size={22} className="text-indigo-300 group-hover:text-white drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
        </div>
      ) : (
        <div className="relative flex items-center justify-center transition-all duration-500">
          <div className="absolute inset-0 rounded-full bg-yellow-500/20 group-hover:scale-150 transition-transform duration-500 blur-md"></div>
          <Sun size={22} className="text-yellow-400 group-hover:text-white drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
        </div>
      )}

      {/* Tooltip */}
      <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-20 whitespace-nowrap shadow-xl">
        Switch to {theme === 'dark' ? 'light' : 'dark'} mode
      </span>
    </button>
  );
}

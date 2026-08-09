'use client';

import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  if (!mounted) {
    return <div className="w-10 h-10 rounded-2xl" />;
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="theme-toggle group relative w-10 h-10 rounded-2xl border border-pink-200/80 dark:border-pink-900/40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-sm hover:shadow-md hover:border-pink-400 dark:hover:border-pink-500 transition-all duration-300 flex items-center justify-center cursor-pointer overflow-hidden"
      title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
      aria-label="Toggle theme"
    >
      {/* Background Glow */}
      <span className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-pink-500/10 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Sun Icon (shown in dark mode to switch to light) */}
      <svg
        className={`w-5 h-5 text-amber-400 transition-all duration-500 transform ${
          isDark
            ? 'rotate-0 scale-100 opacity-100 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
            : '-rotate-90 scale-0 opacity-0 absolute'
        }`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" />
        <path d="m19.07 4.93-1.41 1.41" />
      </svg>

      {/* Moon Icon (shown in light mode to switch to dark) */}
      <svg
        className={`w-5 h-5 text-pink-600 transition-all duration-500 transform ${
          !isDark
            ? 'rotate-0 scale-100 opacity-100 drop-shadow-[0_0_8px_rgba(219,39,119,0.3)]'
            : 'rotate-90 scale-0 opacity-0 absolute'
        }`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
      >
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      </svg>
    </button>
  );
}

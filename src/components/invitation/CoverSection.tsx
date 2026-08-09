'use client';

interface CoverSectionProps {
  title: string;
  guestName?: string;
  onOpenCover: () => void;
}

export function CoverSection({ title, guestName, onOpenCover }: CoverSectionProps) {
  return (
    <div className="fixed inset-0 z-50 bg-stone-900/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-amber-50 animate-fade-in">
      <div className="max-w-md w-full space-y-6">
        <span className="text-xs uppercase tracking-widest text-amber-300 font-serif">
          Undangan Digital
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-extrabold text-amber-100">
          {title}
        </h1>
        {guestName && (
          <div className="p-4 rounded-2xl bg-white/10 border border-white/20">
            <p className="text-xs text-stone-300">Kepada Yth. Bapak/Ibu/Saudara/i:</p>
            <p className="text-lg font-bold text-amber-200 mt-1">{guestName}</p>
          </div>
        )}
        <button
          onClick={onOpenCover}
          className="px-8 py-3.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
        >
          💌 Buka Undangan
        </button>
      </div>
    </div>
  );
}

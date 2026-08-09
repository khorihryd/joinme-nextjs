'use client';

interface MusicPlayerProps {
  isPlayingMusic: boolean;
  onToggleMusic: () => void;
  musicUrl?: string;
}

export function MusicPlayer({ isPlayingMusic, onToggleMusic, musicUrl }: MusicPlayerProps) {
  return (
    <>
      <button
        onClick={onToggleMusic}
        className={`fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-amber-800 text-white flex items-center justify-center shadow-2xl transition-all cursor-pointer ${
          isPlayingMusic ? 'animate-spin' : ''
        }`}
        title="Toggle Music"
      >
        🎵
      </button>

      {musicUrl && isPlayingMusic && (
        <iframe
          src={`${musicUrl}?autoplay=1`}
          allow="autoplay"
          className="hidden"
          title="Background Music"
        />
      )}
    </>
  );
}

'use client';

import React, { useRef, useEffect } from 'react';

interface MusicPlayerProps {
  isPlayingMusic: boolean;
  onToggleMusic: () => void;
  musicUrl?: string;
}

export function MusicPlayer({ isPlayingMusic, onToggleMusic, musicUrl }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isAudioFile = Boolean(
    musicUrl &&
      (musicUrl.includes('.mp3') ||
        musicUrl.includes('.wav') ||
        musicUrl.includes('.ogg') ||
        musicUrl.includes('.m4a') ||
        musicUrl.includes('supabase') ||
        musicUrl.includes('mixkit.co') ||
        musicUrl.startsWith('data:audio') ||
        musicUrl.startsWith('blob:'))
  );

  useEffect(() => {
    if (!audioRef.current || !musicUrl) return;

    if (isPlayingMusic) {
      audioRef.current.play().catch((err) => {
        console.warn('Audio playback prevented by browser:', err);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlayingMusic, musicUrl]);

  return (
    <>
      <button
        onClick={onToggleMusic}
        className={`fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-amber-800 text-white flex items-center justify-center shadow-2xl transition-all cursor-pointer ${
          isPlayingMusic ? 'animate-spin' : ''
        }`}
        title={isPlayingMusic ? 'Jeda Musik' : 'Putar Musik'}
      >
        <span style={{ fontSize: '1.2rem' }}>{isPlayingMusic ? '🎵' : '💿'}</span>
      </button>

      {musicUrl && (
        isAudioFile ? (
          <audio
            ref={audioRef}
            src={musicUrl}
            loop
            preload="metadata"
          />
        ) : (
          isPlayingMusic && (
            <iframe
              src={`${musicUrl}?autoplay=1`}
              allow="autoplay"
              className="hidden"
              title="Background Music"
            />
          )
        )
      )}
    </>
  );
}

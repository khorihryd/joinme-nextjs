'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { StudioNode } from '@/types';

interface MusicWidgetProps {
  node: StudioNode;
  isPreviewMode?: boolean;
  onSelectNode?: (id: string) => void;
  selectedNodeId?: string | null;
  eventDetails?: any;
}

export function MusicWidget({
  node,
  isPreviewMode = false,
  onSelectNode,
  selectedNodeId,
  eventDetails,
}: MusicWidgetProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isAudioLoaded, setIsAudioLoaded] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const resolvedMusicUrl = useMemo(() => {
    return (
      node.musicUrl ||
      node.content ||
      eventDetails?.musicUrl ||
      eventDetails?.music_url ||
      'https://assets.mixkit.co/music/preview/mixkit-romantic-wedding-234.mp3'
    );
  }, [node.musicUrl, node.content, eventDetails]);

  const musicTitle = node.musicTitle || eventDetails?.musicTitle || 'Musik Latar Undangan';
  const musicArtist = node.musicArtist || eventDetails?.musicArtist || 'Romantic Melody';
  const isFloating = node.musicFloating !== false && node.musicPosition !== 'inline';
  const position = node.musicPosition || 'bottom-right';
  const isSelected = selectedNodeId === node.id;
  const buttonBg = node.musicButtonBg || 'var(--primary, #8B5E3C)';
  const buttonColor = node.musicButtonColor || '#ffffff';
  const shouldSpin = node.musicSpinAnimation !== false;

  // Handle Play / Pause toggle
  const togglePlay = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }

    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setHasInteracted(true);
        })
        .catch((err) => {
          console.warn('Audio play request was prevented by browser:', err);
          setIsPlaying(false);
        });
    }
  };

  // Autoplay handler in preview mode or on first user interaction
  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onLoadedMetadata = () => {
      setAudioDuration(audio.duration || 0);
      setIsAudioLoaded(true);
      setLoadError(false);
    };
    const onTimeUpdate = () => setCurrentTime(audio.currentTime || 0);
    const onError = () => {
      setLoadError(true);
      setIsPlaying(false);
    };

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('error', onError);

    // If autoplay is requested and in preview/live mode
    if (isPreviewMode && node.musicAutoplay !== false && !hasInteracted) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(() => {
            // Autoplay blocked by browser policy; user will click the floating button
            setIsPlaying(false);
          });
      }
    }

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('error', onError);
    };
  }, [resolvedMusicUrl, isPreviewMode, node.musicAutoplay, hasInteracted]);

  // Position styles for floating mode
  const getPositionStyles = (): React.CSSProperties => {
    if (!isFloating) return {};

    const base: React.CSSProperties = {
      position: 'fixed',
      zIndex: 9999,
    };

    switch (position) {
      case 'bottom-left':
        return { ...base, bottom: '24px', left: '24px' };
      case 'top-right':
        return { ...base, top: '24px', right: '24px' };
      case 'top-left':
        return { ...base, top: '24px', left: '24px' };
      case 'bottom-right':
      default:
        return { ...base, bottom: '24px', right: '24px' };
    }
  };

  const formatSeconds = (sec: number) => {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // --- FLOATING MODE RENDER ---
  if (isFloating) {
    return (
      <div
        id={`node-dom-${node.id}`}
        style={getPositionStyles()}
        onClick={(e) => {
          if (!isPreviewMode && onSelectNode) {
            e.stopPropagation();
            onSelectNode(node.id);
          }
        }}
        className="music-widget-floating-container"
      >
        <audio
          ref={audioRef}
          src={resolvedMusicUrl}
          loop={node.musicLoop !== false}
          preload="metadata"
        />

        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {/* Main Floating Vinyl Button */}
          <button
            type="button"
            onClick={togglePlay}
            title={isPlaying ? `Jeda Musik (${musicTitle})` : `Putar Musik (${musicTitle})`}
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: buttonBg,
              color: buttonColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.28), 0 2px 6px rgba(0, 0, 0, 0.15)',
              border: isSelected && !isPreviewMode ? '3px solid #3b82f6' : '2px solid rgba(255, 255, 255, 0.4)',
              cursor: 'pointer',
              transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease',
              outline: 'none',
              transform: isPlaying ? 'scale(1.05)' : 'scale(1)',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = isPlaying ? 'scale(1.12)' : 'scale(1.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = isPlaying ? 'scale(1.05)' : 'scale(1)';
            }}
          >
            {/* Vinyl record lines effect */}
            <div
              style={{
                position: 'absolute',
                inset: '4px',
                borderRadius: '50%',
                border: '1px dashed rgba(255, 255, 255, 0.25)',
                pointerEvents: 'none',
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: '8px',
                borderRadius: '50%',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                pointerEvents: 'none',
              }}
            />

            {/* Rotating Disc Center Icon */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                animation: isPlaying && shouldSpin ? 'spin 3.5s linear infinite' : 'none',
              }}
            >
              <span style={{ fontSize: '1.35rem', userSelect: 'none' }}>
                {isPlaying ? '🎵' : '💿'}
              </span>
            </div>

            {/* Playing Status Pulsing Dot */}
            {isPlaying && (
              <span
                style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  width: '9px',
                  height: '9px',
                  backgroundColor: '#22c55e',
                  borderRadius: '50%',
                  boxShadow: '0 0 8px #22c55e',
                }}
              />
            )}
          </button>

          {/* Equalizer Wave Badge in Studio Mode (shows title and status) */}
          {!isPreviewMode && (
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.96)',
                backdropFilter: 'blur(8px)',
                padding: '6px 12px',
                borderRadius: '20px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
                border: isSelected ? '1.5px solid #3b82f6' : '1px solid rgba(0, 0, 0, 0.08)',
                fontSize: '0.72rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                pointerEvents: 'auto',
                cursor: 'pointer',
              }}
              onClick={() => onSelectNode && onSelectNode(node.id)}
            >
              {/* Animated Equalizer Bars */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '14px' }}>
                <span
                  style={{
                    width: '3px',
                    backgroundColor: isPlaying ? buttonBg : '#94a3b8',
                    height: isPlaying ? '100%' : '30%',
                    borderRadius: '2px',
                    animation: isPlaying ? 'eqWave 0.8s ease-in-out infinite alternate' : 'none',
                  }}
                />
                <span
                  style={{
                    width: '3px',
                    backgroundColor: isPlaying ? buttonBg : '#94a3b8',
                    height: isPlaying ? '60%' : '50%',
                    borderRadius: '2px',
                    animation: isPlaying ? 'eqWave 0.5s ease-in-out infinite alternate 0.2s' : 'none',
                  }}
                />
                <span
                  style={{
                    width: '3px',
                    backgroundColor: isPlaying ? buttonBg : '#94a3b8',
                    height: isPlaying ? '80%' : '20%',
                    borderRadius: '2px',
                    animation: isPlaying ? 'eqWave 0.7s ease-in-out infinite alternate 0.4s' : 'none',
                  }}
                />
              </div>

              <div>
                <div style={{ fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {musicTitle}
                </div>
                <div style={{ fontSize: '0.62rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>{isPlaying ? 'Memutar' : 'Jeda'}</span>
                  <span>•</span>
                  <span>{formatSeconds(currentTime)} / {formatSeconds(audioDuration)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <style jsx global>{`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
          @keyframes eqWave {
            0% {
              height: 25%;
            }
            100% {
              height: 100%;
            }
          }
        `}</style>
      </div>
    );
  }

  // --- INLINE CARD PLAYER MODE RENDER ---
  return (
    <div
      id={`node-dom-${node.id}`}
      onClick={(e) => {
        if (!isPreviewMode && onSelectNode) {
          e.stopPropagation();
          onSelectNode(node.id);
        }
      }}
      style={{
        ...(node.style as unknown as React.CSSProperties),
        padding: '16px 20px',
        backgroundColor: (node.style?.backgroundColor as string) || '#ffffff',
        borderRadius: (node.style?.borderRadius as any) || '16px',
        boxShadow: (node.style?.boxShadow as string) || '0 10px 30px rgba(0, 0, 0, 0.06)',
        border: isSelected && !isPreviewMode ? '2px solid #3b82f6' : '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        cursor: !isPreviewMode ? 'pointer' : 'default',
        boxSizing: 'border-box',
        position: 'relative',
      }}
      className="music-widget-inline-card"
    >
      <audio
        ref={audioRef}
        src={resolvedMusicUrl}
        loop={node.musicLoop !== false}
        preload="metadata"
      />

      {/* Left: Disc Art & Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
        {/* Vinyl Disc Icon */}
        <div
          onClick={togglePlay}
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            backgroundColor: buttonBg,
            color: buttonColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
            cursor: 'pointer',
            flexShrink: 0,
            animation: isPlaying && shouldSpin ? 'spin 3.5s linear infinite' : 'none',
          }}
          title={isPlaying ? 'Jeda Musik' : 'Putar Musik'}
        >
          <span style={{ fontSize: '1.2rem' }}>{isPlaying ? '🎵' : '💿'}</span>
        </div>

        {/* Title, Artist, & Progress */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
            <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 800, color: buttonBg, background: 'rgba(139, 94, 60, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
              Musik Latar
            </span>
            {loadError && (
              <span style={{ fontSize: '0.62rem', color: '#ef4444', fontWeight: 700 }}>
                (File tidak dapat dimuat)
              </span>
            )}
          </div>
          <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {musicTitle}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
            {musicArtist}
          </div>
        </div>
      </div>

      {/* Right: Controls & Waveform */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        {/* Animated Equalizer Wave */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '20px' }}>
          {[0.6, 0.9, 0.4, 0.8, 1, 0.5, 0.7].map((heightScale, idx) => (
            <span
              key={idx}
              style={{
                width: '3px',
                backgroundColor: isPlaying ? buttonBg : '#cbd5e1',
                height: isPlaying ? `${heightScale * 100}%` : '25%',
                borderRadius: '2px',
                animation: isPlaying ? `eqWave 0.7s ease-in-out infinite alternate ${idx * 0.1}s` : 'none',
              }}
            />
          ))}
        </div>

        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={togglePlay}
          style={{
            padding: '8px 14px',
            borderRadius: '10px',
            backgroundColor: buttonBg,
            color: buttonColor,
            border: 'none',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
          }}
        >
          <span>{isPlaying ? '⏸️' : '▶️'}</span>
          <span>{isPlaying ? 'Jeda' : 'Putar'}</span>
        </button>
      </div>

      <style jsx global>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes eqWave {
          0% {
            height: 25%;
          }
          100% {
            height: 100%;
          }
        }
      `}</style>
    </div>
  );
}

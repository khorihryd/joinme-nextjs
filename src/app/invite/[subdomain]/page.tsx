'use client';

import { useState, useEffect, use } from 'react';
import { useSearchParams } from 'next/navigation';
import { CoverSection } from '@/components/invitation/CoverSection';
import { ProfileSection } from '@/components/invitation/ProfileSection';
import { CountdownTimer } from '@/components/invitation/CountdownTimer';
import { ScheduleCards } from '@/components/invitation/ScheduleCards';
import { LoveStory } from '@/components/invitation/LoveStory';
import { GalleryGrid } from '@/components/invitation/GalleryGrid';
import { RSVPForm } from '@/components/invitation/RSVPForm';
import { GiftSection } from '@/components/invitation/GiftSection';
import { MusicPlayer } from '@/components/invitation/MusicPlayer';

export default function PublicInvitationPage({ params }: { params: Promise<{ subdomain: string }> }) {
  const { subdomain } = use(params);
  const searchParams = useSearchParams();
  const guestName = searchParams.get('to') || searchParams.get('guest') || searchParams.get('nama') || '';

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCoverOpen, setIsCoverOpen] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);

  // RSVP Form state
  const [rsvpName, setRsvpName] = useState(guestName);
  const [rsvpAttendance, setRsvpAttendance] = useState('Hadir');
  const [rsvpPax, setRsvpPax] = useState('1');
  const [rsvpWishes, setRsvpWishes] = useState('');
  const [wishesList, setWishesList] = useState<any[]>([]);
  const [submittingRsvp, setSubmittingRsvp] = useState(false);

  useEffect(() => {
    async function loadEvent() {
      try {
        const res = await fetch('/api/events');
        if (res.ok) {
          const events = await res.json();
          const found = events.find((e: any) => e.subdomain === subdomain);
          if (found) {
            setEvent(found);
            // Increment view count asynchronously
            fetch(`/api/events/${found.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ views: (found.views || 0) + 1 }),
            }).catch(() => {});

            // Fetch guests for wishes
            fetch(`/api/guests?eventId=${found.id}`)
              .then((r) => r.json())
              .then((g) => setWishesList(g))
              .catch(() => {});
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadEvent();
  }, [subdomain]);

  const handleOpenCover = () => {
    setIsCoverOpen(true);
    setIsPlayingMusic(true);
  };

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpName) return;
    setSubmittingRsvp(true);

    try {
      const res = await fetch('/api/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          name: rsvpName,
          attendance: rsvpAttendance,
          pax: rsvpPax,
          wishes: rsvpWishes,
        }),
      });

      if (res.ok) {
        const newGuest = await res.json();
        setWishesList((prev) => [newGuest, ...prev]);
        setRsvpWishes('');
        alert('Terima kasih atas konfirmasi RSVP & doa Anda! 🙏');
      }
    } catch (err) {
      alert('Gagal mengirim RSVP');
    } finally {
      setSubmittingRsvp(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-900 text-amber-100 font-serif">
        Memuat Undangan Digital...
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-900 text-stone-300">
        Undangan tidak ditemukan.
      </div>
    );
  }

  const details = event.details || {};
  const isWedding = event.type === 'Pernikahan';

  return (
    <div className="min-h-screen bg-[#F5EDE4] text-[#4a3728] font-sans relative overflow-x-hidden">
      {/* Cover Overlay Modal */}
      {!isCoverOpen && (
        <CoverSection
          title={event.title}
          guestName={guestName}
          onOpenCover={handleOpenCover}
        />
      )}

      {/* Music Controller Button */}
      {isCoverOpen && (
        <MusicPlayer
          isPlayingMusic={isPlayingMusic}
          onToggleMusic={() => setIsPlayingMusic(!isPlayingMusic)}
          musicUrl={details.musicUrl}
        />
      )}

      {/* Main Invitation Page Content */}
      <div className="max-w-md mx-auto min-h-screen bg-white shadow-2xl space-y-16 pb-20">
        {/* Hero Section */}
        <section className="relative h-[80vh] flex flex-col items-center justify-center text-center p-6 bg-stone-900 text-amber-50">
          <img
            src={details.fotoPria || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800'}
            alt="Cover"
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
          <div className="relative z-10 space-y-4 max-w-xs">
            <span className="text-xs uppercase tracking-widest text-amber-300 font-serif">
              Walimatul Ursy
            </span>
            <h1 className="text-4xl font-serif font-extrabold leading-tight text-amber-100">
              {isWedding ? (
                <>
                  {details.panggilanPria || 'Pria'} <br /> & <br /> {details.panggilanWanita || 'Wanita'}
                </>
              ) : (
                details.organizerName || event.title
              )}
            </h1>
            <p className="text-xs text-stone-300">{event.date || '21 September 2026'}</p>
            <CountdownTimer targetDateStr={event.date} />
          </div>
        </section>

        {/* Profile Section */}
        <ProfileSection isWedding={isWedding} details={details} eventTitle={event.title} />

        {/* Schedules Section */}
        <ScheduleCards schedules={details.schedules} />

        {/* Love Story Section */}
        <LoveStory story={details.story} />

        {/* Gallery Section */}
        <GalleryGrid gallery={details.gallery} />

        {/* RSVP Form Section */}
        <RSVPForm
          rsvpName={rsvpName}
          setRsvpName={setRsvpName}
          rsvpAttendance={rsvpAttendance}
          setRsvpAttendance={setRsvpAttendance}
          rsvpPax={rsvpPax}
          setRsvpPax={setRsvpPax}
          rsvpWishes={rsvpWishes}
          setRsvpWishes={setRsvpWishes}
          submittingRsvp={submittingRsvp}
          onSubmit={handleRsvpSubmit}
          wishesList={wishesList}
        />

        {/* Gift Section */}
        <GiftSection details={details} />
      </div>
    </div>
  );
}

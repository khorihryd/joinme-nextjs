'use client';

interface ProfileSectionProps {
  isWedding: boolean;
  details: any;
  eventTitle: string;
}

export function ProfileSection({ isWedding, details, eventTitle }: ProfileSectionProps) {
  if (!isWedding) {
    return (
      <section className="px-6 text-center space-y-4">
        <h2 className="text-2xl font-serif font-bold text-amber-900">Penyelenggara</h2>
        <h3 className="font-serif font-bold text-xl text-amber-800">{details.organizerName || eventTitle}</h3>
      </section>
    );
  }

  return (
    <section className="px-6 text-center space-y-8">
      <h2 className="text-2xl font-serif font-bold text-amber-900">Mempelai</h2>
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="font-serif font-bold text-xl text-amber-800">{details.mempelaiPria || 'Mempelai Pria'}</h3>
          {details.ortuPria && <p className="text-xs text-stone-600">{details.ortuPria}</p>}
        </div>
        <div className="text-2xl font-serif text-amber-600">&</div>
        <div className="space-y-2">
          <h3 className="font-serif font-bold text-xl text-amber-800">{details.mempelaiWanita || 'Mempelai Wanita'}</h3>
          {details.ortuWanita && <p className="text-xs text-stone-600">{details.ortuWanita}</p>}
        </div>
      </div>
    </section>
  );
}

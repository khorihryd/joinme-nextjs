'use client';

interface GiftSectionProps {
  details: any;
}

export function GiftSection({ details }: GiftSectionProps) {
  if (!details.bank1Nama && !details.bank2Nama) return null;

  return (
    <section className="px-6 space-y-4 text-center">
      <h2 className="text-2xl font-serif font-bold text-amber-900">Digital Gift</h2>
      <p className="text-xs text-stone-600">Doa restu Anda merupakan hadiah terindah. Bagi yang ingin memberikan tanda kasih:</p>

      <div className="space-y-3">
        {details.bank1Nama && (
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-1">
            <p className="text-xs font-bold text-amber-800">{details.bank1Nama}</p>
            <p className="text-base font-mono font-bold text-amber-900">{details.bank1Rek}</p>
            <p className="text-xs text-stone-600">a.n {details.bank1An}</p>
          </div>
        )}
        {details.bank2Nama && (
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-1">
            <p className="text-xs font-bold text-amber-800">{details.bank2Nama}</p>
            <p className="text-base font-mono font-bold text-amber-900">{details.bank2Rek}</p>
            <p className="text-xs text-stone-600">a.n {details.bank2An}</p>
          </div>
        )}
      </div>
    </section>
  );
}

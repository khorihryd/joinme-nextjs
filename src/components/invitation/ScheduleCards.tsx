'use client';

interface ScheduleCardsProps {
  schedules?: any[];
}

export function ScheduleCards({ schedules }: ScheduleCardsProps) {
  if (!schedules || schedules.length === 0) return null;

  return (
    <section className="px-6 space-y-6">
      <h2 className="text-2xl font-serif font-bold text-center text-amber-900">Jadwal Acara</h2>
      <div className="space-y-4">
        {schedules.map((sched: any, i: number) => (
          <div key={i} className="p-6 rounded-2xl bg-amber-50/50 border border-amber-200/60 text-center space-y-2">
            <h3 className="font-serif font-bold text-lg text-amber-900">{sched.name}</h3>
            <p className="text-sm font-semibold text-amber-800">{sched.date} • {sched.time}</p>
            <p className="text-xs text-stone-600 font-bold mt-2">{sched.place}</p>
            <p className="text-xs text-stone-500">{sched.address}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

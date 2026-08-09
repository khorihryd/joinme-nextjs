'use client';

interface LoveStoryProps {
  story?: any[];
}

export function LoveStory({ story }: LoveStoryProps) {
  if (!story || story.length === 0) return null;

  return (
    <section className="px-6 space-y-6">
      <h2 className="text-2xl font-serif font-bold text-center text-amber-900">Cerita Cinta</h2>
      <div className="space-y-4">
        {story.map((st: any, i: number) => (
          <div key={i} className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 space-y-1">
            <span className="text-xs font-bold text-amber-700">[{st.year}]</span>
            <h4 className="font-bold text-sm text-amber-900">{st.title}</h4>
            <p className="text-xs text-stone-600 leading-relaxed">{st.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

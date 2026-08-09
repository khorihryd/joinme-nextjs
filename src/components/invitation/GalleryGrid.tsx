'use client';

interface GalleryGridProps {
  gallery?: string[];
}

export function GalleryGrid({ gallery }: GalleryGridProps) {
  if (!gallery || gallery.length === 0) return null;

  return (
    <section className="px-6 space-y-6">
      <h2 className="text-2xl font-serif font-bold text-center text-amber-900">Galeri Momen</h2>
      <div className="grid grid-cols-2 gap-3">
        {gallery.map((url: string, i: number) => (
          <img
            key={i}
            src={url}
            alt={`Galeri ${i + 1}`}
            className="w-full h-36 object-cover rounded-xl border border-amber-200"
          />
        ))}
      </div>
    </section>
  );
}

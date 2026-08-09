'use client';

interface RSVPFormProps {
  rsvpName: string;
  setRsvpName: (val: string) => void;
  rsvpAttendance: string;
  setRsvpAttendance: (val: string) => void;
  rsvpPax: string;
  setRsvpPax: (val: string) => void;
  rsvpWishes: string;
  setRsvpWishes: (val: string) => void;
  submittingRsvp: boolean;
  onSubmit: (e: React.FormEvent) => void;
  wishesList: any[];
}

export function RSVPForm({
  rsvpName,
  setRsvpName,
  rsvpAttendance,
  setRsvpAttendance,
  rsvpPax,
  setRsvpPax,
  rsvpWishes,
  setRsvpWishes,
  submittingRsvp,
  onSubmit,
  wishesList,
}: RSVPFormProps) {
  return (
    <section className="px-6 space-y-6">
      <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 space-y-4">
        <h2 className="text-xl font-serif font-bold text-center text-amber-900">Konfirmasi RSVP & Doa</h2>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-bold text-stone-600 block mb-1">Nama Anda</label>
            <input
              type="text"
              value={rsvpName}
              onChange={(e) => setRsvpName(e.target.value)}
              placeholder="Masukkan nama lengkap"
              className="w-full p-3 rounded-xl border border-stone-200 text-sm bg-white"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-bold text-stone-600 block mb-1">Kehadiran</label>
              <select
                value={rsvpAttendance}
                onChange={(e) => setRsvpAttendance(e.target.value)}
                className="w-full p-3 rounded-xl border border-stone-200 text-sm bg-white"
              >
                <option value="Hadir">Hadir</option>
                <option value="Tidak Hadir">Tidak Hadir</option>
                <option value="Ragu-ragu">Ragu-ragu</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-stone-600 block mb-1">Jumlah Tamu</label>
              <select
                value={rsvpPax}
                onChange={(e) => setRsvpPax(e.target.value)}
                className="w-full p-3 rounded-xl border border-stone-200 text-sm bg-white"
              >
                <option value="1">1 Orang</option>
                <option value="2">2 Orang</option>
                <option value="3">3 Orang</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-stone-600 block mb-1">Ucapan & Doa Restu</label>
            <textarea
              value={rsvpWishes}
              onChange={(e) => setRsvpWishes(e.target.value)}
              placeholder="Tuliskan ucapan untuk mempelai..."
              className="w-full p-3 rounded-xl border border-stone-200 text-sm bg-white h-20"
            />
          </div>
          <button
            type="submit"
            disabled={submittingRsvp}
            className="w-full py-3 bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md cursor-pointer"
          >
            {submittingRsvp ? 'Mengirim...' : 'Kirim RSVP'}
          </button>
        </form>
      </div>

      {/* Wishes Feed */}
      {wishesList.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wider text-center">Doa Restu ({wishesList.length})</h3>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {wishesList.map((g: any, i: number) => (
              <div key={i} className="p-3.5 rounded-xl bg-white border border-stone-200 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-amber-900">{g.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">{g.attendance}</span>
                </div>
                {g.wishes && <p className="text-xs text-stone-600 italic">"{g.wishes}"</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useToast } from '@/components/ui/Toast';

export default function EventGuestsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { showToast } = useToast();

  const [event, setEvent] = useState<any>(null);
  const [guests, setGuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterAttendance, setFilterAttendance] = useState('Semua');

  // New guest modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAttendance, setNewAttendance] = useState('Hadir');
  const [newPax, setNewPax] = useState('1');
  const [newWishes, setNewWishes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const [eRes, gRes] = await Promise.all([
        fetch(`/api/events/${id}`),
        fetch(`/api/guests?eventId=${id}`),
      ]);

      if (eRes.ok) setEvent(await eRes.ok ? await eRes.json() : null);
      if (gRes.ok) setGuests(await gRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: id,
          name: newName,
          attendance: newAttendance,
          pax: newPax,
          wishes: newWishes,
        }),
      });

      if (res.ok) {
        showToast('Tamu berhasil ditambahkan!', 'success');
        setNewName('');
        setNewWishes('');
        setIsModalOpen(false);
        loadData();
      } else {
        showToast('Gagal menambahkan tamu', 'error');
      }
    } catch (err) {
      showToast('Terjadi kesalahan sistem', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const copyGuestLink = (guestName: string) => {
    const url = `${window.location.origin}/invite/${event?.subdomain}?to=${encodeURIComponent(guestName)}`;
    navigator.clipboard.writeText(url);
    showToast(`Link khusus untuk ${guestName} berhasil disalin! 📋`, 'success');
  };

  const filteredGuests = guests.filter((g) => {
    const matchesSearch = g.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterAttendance === 'Semua' || g.attendance === filterAttendance;
    return matchesSearch && matchesFilter;
  });

  const totalAttending = guests.filter((g) => g.attendance === 'Hadir').reduce((acc, curr) => acc + (curr.pax || 1), 0);
  const totalDeclined = guests.filter((g) => g.attendance === 'Tidak Hadir').length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white">
      {/* Header */}
      <header className="p-6 border-b border-slate-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-xs font-semibold text-slate-500 hover:text-pink-600">
            ← Dashboard
          </Link>
          <span className="text-slate-300">|</span>
          <h1 className="font-extrabold text-lg">
            Kelola Tamu & RSVP — {event?.title}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl gradient-primary text-white font-bold text-xs shadow-md hover:opacity-95 cursor-pointer"
          >
            + Tambah Tamu
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="p-6 sm:p-8 space-y-8 max-w-6xl mx-auto w-full flex-1">
        {/* KPI Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Respon Tamu</span>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">{guests.length}</p>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Konfirmasi Hadir (Pax)</span>
            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">{totalAttending} Tamu</p>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tidak Hadir</span>
            <p className="text-3xl font-black text-rose-600 dark:text-rose-400 mt-2">{totalDeclined} Tamu</p>
          </div>
        </div>

        {/* Filters & Table */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-6 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <input
              type="text"
              placeholder="Cari nama tamu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs"
            />

            <div className="flex gap-2">
              {['Semua', 'Hadir', 'Tidak Hadir'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterAttendance(status)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    filterAttendance === status
                      ? 'bg-pink-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 dark:border-zinc-800 text-xs text-slate-400 uppercase">
                <tr>
                  <th className="py-3 px-4">Nama Tamu</th>
                  <th className="py-3 px-4">Kehadiran</th>
                  <th className="py-3 px-4">Jumlah Pax</th>
                  <th className="py-3 px-4">Pesan / Ucapan</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {filteredGuests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                      Tidak ada data tamu ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredGuests.map((g) => (
                    <tr key={g.id}>
                      <td className="py-3 px-4 font-bold">{g.name}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            g.attendance === 'Hadir'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {g.attendance}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold">{g.pax || 1} orang</td>
                      <td className="py-3 px-4 text-slate-500 italic max-w-xs truncate">
                        "{g.wishes || '-'}"
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => copyGuestLink(g.name)}
                          className="px-3 py-1 rounded-lg text-xs font-semibold bg-pink-50 dark:bg-pink-950/50 text-pink-600 hover:bg-pink-600 hover:text-white transition-all cursor-pointer"
                        >
                          Salin Link 📋
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add Guest Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-zinc-800 space-y-4">
            <h2 className="text-xl font-bold">Tambah Tamu Undangan</h2>
            <form onSubmit={handleAddGuest} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Nama Tamu</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Budi Santoso & Partner"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Status Kehadiran</label>
                <select
                  value={newAttendance}
                  onChange={(e) => setNewAttendance(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs"
                >
                  <option value="Hadir">Hadir</option>
                  <option value="Tidak Hadir">Tidak Hadir</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Jumlah Rombongan (Pax)</label>
                <input
                  type="number"
                  min="1"
                  value={newPax}
                  onChange={(e) => setNewPax(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Ucapan (Opsional)</label>
                <textarea
                  value={newWishes}
                  onChange={(e) => setNewWishes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs h-16"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-800 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl gradient-primary text-white font-bold text-xs"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Tamu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

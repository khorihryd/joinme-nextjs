import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Clear existing data to prevent unique constraint errors during re-seeding
  await prisma.guest.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.event.deleteMany();
  await prisma.template.deleteMany();
  await prisma.user.deleteMany();

  const userPassword = bcrypt.hashSync('user123', 10);
  const adminPassword = bcrypt.hashSync('admin123', 10);

  // 1. Create Users
  const userRoni = await prisma.user.create({
    data: {
      name: 'Roni Wijaya',
      email: 'roni@gmail.com',
      password: userPassword,
      role: 'user',
      plan: 'Pro',
    },
  });

  const userBudi = await prisma.user.create({
    data: {
      name: 'Budi Santoso',
      email: 'budi@gmail.com',
      password: userPassword,
      role: 'user',
      plan: 'Free',
    },
  });

  const userSiti = await prisma.user.create({
    data: {
      name: 'Siti Rahma',
      email: 'siti@gmail.com',
      password: userPassword,
      role: 'user',
      plan: 'Enterprise',
    },
  });

  const adminUtama = await prisma.user.create({
    data: {
      name: 'Admin Utama',
      email: 'admin@joinme.id',
      password: adminPassword,
      role: 'admin',
      plan: 'Enterprise',
    },
  });

  const userDenny = await prisma.user.create({
    data: {
      name: 'Denny Sumargo',
      email: 'denny@gmail.com',
      password: userPassword,
      role: 'user',
      plan: 'Pro',
    },
  });

  // 2. Create Templates
  const tmplSage = await prisma.template.create({
    data: {
      name: 'Sage Green Luxury',
      category: 'Pernikahan',
      tier: 'Pro',
      views: 3420,
      thumbnail: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&auto=format&fit=crop&q=80',
    },
  });

  const tmplNeon = await prisma.template.create({
    data: {
      name: 'Neon Party Night',
      category: 'Ulang Tahun',
      tier: 'Free',
      views: 1890,
      thumbnail: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&auto=format&fit=crop&q=80',
    },
  });

  const tmplWarm = await prisma.template.create({
    data: {
      name: 'Warm Botanical Syukuran',
      category: 'Syukuran',
      tier: 'Free',
      views: 1240,
      thumbnail: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&auto=format&fit=crop&q=80',
    },
  });

  const tmplCorp = await prisma.template.create({
    data: {
      name: 'Corporate Business Gala',
      category: 'Bisnis',
      tier: 'Enterprise',
      views: 950,
      thumbnail: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&auto=format&fit=crop&q=80',
    },
  });

  // 3. Create Events (linked to Roni Wijaya)
  const eventPernikahan = await prisma.event.create({
    data: {
      title: 'Pernikahan Roni & Anti',
      type: 'Pernikahan',
      subdomain: 'roni-anti',
      views: 1240,
      status: 'Aktif',
      date: '21 Sept 2026',
      userId: userRoni.id,
      templateId: tmplSage.id,
      details: {
        mempelaiPria: 'Roni Wijaya, S.Kom.',
        panggilanPria: 'Roni',
        ortuPria: 'Putra dari Bp. Wawan & Ibu Asih',
        igPria: 'roni_wijaya',
        fotoPria: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        mempelaiWanita: 'Anti Kartika, S.T.',
        panggilanWanita: 'Anti',
        ortuWanita: 'Putri dari Bp. Haryanto & Ibu Dewi',
        igWanita: 'anti_kartika',
        fotoWanita: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
        schedules: [
          { name: 'Akad Nikah', time: '08.00-10.00', date: '21 Sept 2026', location: 'Bandung' },
          { name: 'Resepsi', time: '11.00-14.00', date: '21 Sept 2026', location: 'Bandung' },
        ],
        banks: [
          { name: 'BCA', account: '1234567890', owner: 'Roni Wijaya' },
          { name: 'Mandiri', account: '0987654321', owner: 'Anti Kartika' },
        ],
        story: [
          { title: 'Pertama Bertemu', year: '2018', description: 'Bertemu di kampus dan menjadi teman dekat.' },
          { title: 'Menjalin Hubungan', year: '2019', description: 'Resmi menjalin hubungan.' },
          { title: 'Lamaran', year: '2025', description: 'Momen lamaran disaksikan keluarga.' },
          { title: 'Pernikahan', year: '2026', description: 'Hari bahagia yang dinantikan.' },
        ],
        gallery: [
          'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400',
          'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400',
          'https://images.unsplash.com/photo-1519741497674-611481863552?w=400',
          'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=400',
          'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=400',
          'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400',
        ],
        showStory: true,
        showGallery: true,
        showDresscode: true,
        dresscodeStyle: 'Earth Tone & Modern Traditional Attire',
        dresscodeColors: ['#78350f', '#d97706', '#fef3c7', '#ffffff'],
      },
    },
  });

  const eventSyukuran = await prisma.event.create({
    data: {
      title: 'Syukuran Rumah Baru Roni',
      type: 'Syukuran',
      subdomain: 'syukuran-keluarga',
      views: 450,
      status: 'Aktif',
      date: '15 Oktober 2026',
      userId: userRoni.id,
      templateId: tmplWarm.id,
      details: {
        schedules: [
          { name: 'Acara Syukuran', time: '10.00-13.00', date: '15 Oktober 2026', location: 'Rumah Baru' },
        ],
        banks: [
          { name: 'BCA', account: '1234567890', owner: 'Roni Wijaya' },
        ],
        showStory: false,
        showGallery: false,
        showDresscode: false,
      },
    },
  });

  // 4. Create Guests
  await prisma.guest.createMany({
    data: [
      { eventId: eventPernikahan.id, name: 'Budi Santoso', attendance: 'Hadir', pax: 2, wishes: 'Selamat menempuh hidup baru!' },
      { eventId: eventPernikahan.id, name: 'Siti Rahma', attendance: 'Hadir', pax: 1, wishes: 'Semoga samawa yaa' },
      { eventId: eventPernikahan.id, name: 'Agus', attendance: 'Tidak Hadir', pax: 0, wishes: 'Maaf berhalangan hadir, selamat ya' },
      { eventId: eventPernikahan.id, name: 'Dina', attendance: 'Hadir', pax: 1, wishes: 'Happy Wedding Roni & Anti!' },
      { eventId: eventSyukuran.id, name: 'Denny Sumargo', attendance: 'Hadir', pax: 1, wishes: 'Selamat rumah barunya braderr!' },
    ],
  });

  // 5. Create Transactions
  await prisma.transaction.createMany({
    data: [
      { userId: userRoni.id, plan: 'Pro', amount: 149000, method: 'QRIS Instant', status: 'Lunas' },
      { userId: userSiti.id, plan: 'Enterprise', amount: 399000, method: 'BCA Transfer', status: 'Lunas' },
      { userId: userDenny.id, plan: 'Pro', amount: 149000, method: 'Bank Mandiri Transfer', status: 'Menunggu Verifikasi' },
      { userId: userRoni.id, plan: 'Pro', amount: 149000, method: 'QRIS Instant', status: 'Lunas' },
    ],
  });

  console.log('Seeding finished successfully.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

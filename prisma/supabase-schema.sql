-- Table User
CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" TEXT NOT NULL,
  "email" TEXT UNIQUE NOT NULL,
  "password" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'user',
  "plan" TEXT NOT NULL DEFAULT 'Free',
  "status" TEXT NOT NULL DEFAULT 'Aktif',
  "joinedDate" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  "eventsCount" INTEGER DEFAULT 0 NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table Template
CREATE TABLE IF NOT EXISTS "Template" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "tier" TEXT NOT NULL DEFAULT 'Free',
  "status" TEXT NOT NULL DEFAULT 'Aktif',
  "views" INTEGER DEFAULT 0 NOT NULL,
  "thumbnail" TEXT,
  "globalStyles" JSONB,
  "nodes" JSONB,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table Event
CREATE TABLE IF NOT EXISTS "Event" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "title" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "subdomain" TEXT UNIQUE NOT NULL,
  "views" INTEGER DEFAULT 0 NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'Draft',
  "date" TEXT,
  "details" JSONB,
  "userId" TEXT REFERENCES "User"("id") ON DELETE CASCADE NOT NULL,
  "templateId" TEXT REFERENCES "Template"("id") ON DELETE SET NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table Guest (Tamu)
CREATE TABLE IF NOT EXISTS "Guest" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "eventId" TEXT REFERENCES "Event"("id") ON DELETE CASCADE NOT NULL,
  "name" TEXT NOT NULL,
  "group" TEXT DEFAULT 'Umum',
  "category" TEXT DEFAULT 'Umum',
  "phone" TEXT,
  "attendance" TEXT NOT NULL DEFAULT 'Belum Konfirmasi',
  "pax" INTEGER NOT NULL DEFAULT 1,
  "wishes" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table Transaction
CREATE TABLE IF NOT EXISTS "Transaction" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT REFERENCES "User"("id") ON DELETE CASCADE NOT NULL,
  "plan" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "method" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'Menunggu Verifikasi',
  "date" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

// ===== User Types =====
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  plan: 'Free' | 'Pro' | 'Enterprise';
  status: 'Aktif' | 'Nonaktif';
  joinedDate: Date;
  eventsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export type SafeUser = Omit<User, 'password'>;

// ===== Event Types =====
export type EventType = 'Pernikahan' | 'Ulang Tahun' | 'Syukuran' | 'Bisnis';
export type EventStatus = 'Aktif' | 'Draft' | 'Arsip';

export interface Schedule {
  name: string;
  date: string;
  time: string;
  place: string;
  address: string;
}

export interface StoryItem {
  year: string;
  title: string;
  desc: string;
}

export interface EventDetails {
  // Wedding-specific
  fotoPria?: string;
  mempelaiPria?: string;
  panggilanPria?: string;
  ortuPria?: string;
  igPria?: string;
  fotoWanita?: string;
  mempelaiWanita?: string;
  panggilanWanita?: string;
  ortuWanita?: string;
  igWanita?: string;
  // Non-wedding
  organizerPhoto?: string;
  organizerName?: string;
  organizerNickname?: string;
  organizerParents?: string;
  organizerAge?: string;
  organizerSpeaker?: string;
  // Schedules
  schedules: Schedule[];
  // Financial
  bank1Nama?: string;
  bank1Rek?: string;
  bank1An?: string;
  bank2Nama?: string;
  bank2Rek?: string;
  bank2An?: string;
  // Story
  story: StoryItem[];
  showStory: boolean;
  // Gallery
  gallery: string[];
  showGallery: boolean;
  // Dresscode
  showDresscode?: boolean;
  dresscodeStyle?: string;
  dresscodeColors?: string[];
  dresscodeNotes?: string;
}

export interface Event {
  id: string;
  title: string;
  type: EventType;
  subdomain: string;
  views: number;
  status: EventStatus;
  date: string | null;
  details: EventDetails | null;
  userId: string;
  templateId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ===== Guest Types =====
export type AttendanceStatus = 'Hadir' | 'Tidak Hadir' | 'Ragu-ragu';

export interface Guest {
  id: string;
  eventId: string;
  name: string;
  attendance: AttendanceStatus;
  pax: number;
  wishes: string | null;
  createdAt: Date;
}

// ===== Template Types =====
export type TemplateTier = 'Free' | 'Pro' | 'Enterprise';

export interface Template {
  id: string;
  name: string;
  category: EventType;
  tier: TemplateTier;
  status: 'Aktif' | 'Nonaktif';
  views: number;
  thumbnail: string | null;
  globalStyles: Record<string, string> | null;
  nodes: StudioNode[] | null;
  createdAt: Date;
  updatedAt: Date;
}

// ===== Transaction Types =====
export type TransactionStatus = 'Lunas' | 'Menunggu Verifikasi' | 'Ditolak';

export interface Transaction {
  id: string;
  userId: string;
  plan: string;
  amount: number;
  method: string;
  status: TransactionStatus;
  date: Date;
}

// ===== Studio Types =====
export type NodeType = 'container' | 'heading' | 'text' | 'image' | 'button' | 'divider' | 'spacer' | 'input' | 'textarea' | 'select' | 'slider' | 'countdown' | 'map' | 'event' | 'lovestory' | 'gallery' | 'rsvp' | 'wishes';

export type ButtonAction = 'none' | 'submit-rsvp' | 'open-cover' | 'google-maps' | 'save-calendar' | 'open-instagram' | 'open-tiktok' | 'open-facebook' | 'open-whatsapp' | 'open-youtube' | 'open-url';

export type AnimationType = 'none' | 'anim-fade-in' | 'anim-fade-in-up' | 'anim-fade-in-down' | 'anim-fade-in-left' | 'anim-fade-in-right' | 'anim-zoom-in' | 'anim-bounce-in' | 'anim-pulse';

export interface NodeStyle {
  // Layout
  width?: string;
  widthMobile?: string;
  widthTablet?: string;
  height?: string;
  heightMobile?: string;
  heightTablet?: string;
  maxWidth?: string;
  minHeight?: string;
  // Flex
  display?: string;
  flexDirection?: string;
  flexDirectionMobile?: string;
  flexDirectionTablet?: string;
  justifyContent?: string;
  alignItems?: string;
  flexWrap?: string;
  gap?: string;
  gapMobile?: string;
  // Spacing
  padding?: string;
  paddingMobile?: string;
  paddingTablet?: string;
  margin?: string;
  marginMobile?: string;
  marginTablet?: string;
  // Typography
  fontSize?: string;
  fontSizeMobile?: string;
  fontSizeTablet?: string;
  fontFamily?: string;
  fontWeight?: string;
  fontWeightMobile?: string;
  textAlign?: string;
  textAlignMobile?: string;
  lineHeight?: string;
  letterSpacing?: string;
  textTransform?: string;
  fontStyle?: string;
  color?: string;
  // Background
  bgType?: string;
  backgroundColor?: string;
  backgroundColorMobile?: string;
  backgroundColorTablet?: string;
  backgroundImage?: string;
  backgroundImageMobile?: string;
  backgroundImageTablet?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundRepeat?: string;
  backgroundOverlayColor?: string;
  backgroundOverlayOpacity?: number;
  gradientColors?: string[];
  gradientColor1?: string;
  gradientColor2?: string;
  gradientDirection?: string;
  // Slideshow Background
  bgSlideshowImages?: string[];
  bgSlideshowInterval?: number;
  bgSlideshowTransition?: 'fade' | 'slide-left' | 'zoom' | 'ken-burns';
  bgSlideshowEffect?: string;
  sliderInterval?: number;
  sliderEffect?: string;
  hideScrollbar?: boolean;
  // Border
  borderStyle?: string;
  borderWidth?: number;
  borderColor?: string;
  borderRadius?: number;
  borderTopLeftRadius?: number;
  borderTopRightRadius?: number;
  borderBottomLeftRadius?: number;
  borderBottomRightRadius?: number;
  // Effects & Shadow
  opacity?: string | number;
  boxShadow?: string;
  boxShadowColor?: string;
  boxShadowX?: number;
  boxShadowY?: number;
  boxShadowBlur?: number;
  boxShadowSpread?: number;
  backdropFilter?: string;
  position?: string;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  zIndex?: string | number;
  overflow?: 'visible' | 'hidden' | 'auto' | 'scroll';
  overflowX?: 'visible' | 'hidden' | 'auto' | 'scroll';
  overflowY?: 'visible' | 'hidden' | 'auto' | 'scroll';
  // Grid Container Properties
  gridCols?: number;
  gridColsMobile?: number;
  gridColsTablet?: number;
  // Animation
  animationName?: AnimationType;
  animationType?: AnimationType;
  animationDuration?: string;
  animationDelay?: string;
  animationIteration?: '1' | 'infinite';
  // Shape Dividers
  shapeDividerTop?: string;
  shapeDividerBottom?: string;
  shapeDividerTopColor?: string;
  shapeDividerBottomColor?: string;
  // Parallax
  parallaxSpeed?: string;
  // Ken Burns
  kenBurns?: boolean;
  // Custom
  [key: string]: string | boolean | number | string[] | undefined;
}

export interface StudioNode {
  id: string;
  type: NodeType;
  label?: string;
  content?: string;
  children?: StudioNode[];
  style: NodeStyle;
  widgetType?: 'rsvp-form' | 'wishes-feed' | 'event-list';
  isWishesFeed?: boolean;
  isEventFeed?: boolean;
  isDynamic?: boolean;
  binding?: string;
  placeholder?: string;
  inputName?: string;
  selectOptions?: string;
  buttonAction?: ButtonAction;
  buttonUrl?: string;
  icon?: string;
  showInGallery?: boolean;
  hideDots?: boolean;
  kenBurns?: boolean;
}

export interface StudioState {
  currentTemplate: Template | null;
  nodes: StudioNode[];
  selectedNodeId: string | null;
  collapsedNavigatorNodes: Set<string>;
  activeInspectorTab: 'layout' | 'style' | 'advanced';
  viewportMode: 'desktop' | 'tablet' | 'mobile';
  lastFocusedInput: HTMLInputElement | HTMLTextAreaElement | null;
}

// ===== Sample Variables & Dynamic Variable Categories =====
export interface SampleVariables {
  [key: string]: string;
}

export const SAMPLE_VARIABLES: SampleVariables = {
  // General & Guest
  guest_name: 'Budi Santoso & Partner',
  nama_tamu: 'Budi Santoso & Partner',
  kode_tamu: 'JM-8821',
  kuota_tamu: '2 Pax',
  organizer_name: 'Keluarga Besar Wijaya & Kartika',
  nama_penyelenggara: 'Keluarga Besar Wijaya & Kartika',
  penyelenggara: 'Keluarga Besar Wijaya & Kartika',

  // Wedding & Couples
  groom_name: 'Roni Wijaya, S.Kom.',
  nama_pria: 'Roni',
  groom_full: 'Roni Wijaya, S.Kom.',
  bride_name: 'Anti Kartika, S.T.',
  nama_wanita: 'Anti',
  bride_full: 'Anti Kartika, S.T.',
  couple_name: 'Roni & Anti',
  nama_mempelai: 'Roni & Anti',
  ortu_pria: 'Bpk. H. Bambang Wijaya & Ibu Hj. Siti Rahma',
  ortu_wanita: 'Bpk. Ir. H. Ahmad Kartika & Ibu Hj. Nurbaeti',

  // Date & Time
  event_date: '21 September 2026',
  tanggal_acara: '21 September 2026',
  event_time: '08:00 - 14:00 WIB',
  waktu_acara: '08:00 - 14:00 WIB',
  hari_acara: 'Sabtu',
  bulan_acara: 'September',
  tahun_acara: '2026',

  // Location & Venue
  event_location: 'Grand Ballroom Hotel Mulia, Jakarta',
  lokasi_acara: 'Grand Ballroom Hotel Mulia',
  nama_lokasi: 'Grand Ballroom Hotel Mulia',
  alamat_lengkap: 'Jl. Asia Afrika No. 8, Gelora, Senayan, Jakarta Pusat',
  kota_acara: 'Jakarta Pusat',

  // Circumcision & Aqiqah
  nama_anak: 'Muhammad Rayhan Wijaya',
  nama_ortu_anak: 'Bpk. Roni Wijaya & Ibu Anti Kartika',

  // Birthday / Party
  nama_yang_ultah: 'Aisha Az-Zahra',
  umur: '17 Tahun',

  // Formal & Corporate
  nama_event: 'National Tech Summit 2026',
  nama_narasumber: 'Dr. Eng. Ir. H. Pratama',

  // Social Media
  ig_pria: '@roni_wijaya',
  tiktok_pria: '@roni_official',
  fb_pria: 'Roni Wijaya',
  ig_wanita: '@anti_kartika',
  tiktok_wanita: '@antikartika',
  fb_wanita: 'Anti Kartika',
  ig_organizer: '@joinme_id',
  yt_organizer: 'JoinMe Studio',
  fb_organizer: 'JoinMe Digital',
  wa_contact: '081234567890',

  // Media
  cover_photo: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80',
};

export interface VariableCategory {
  id: string;
  label: string;
  icon: string;
  variables: { tag: string; label: string; desc: string }[];
}

export const DYNAMIC_VARIABLE_CATEGORIES: VariableCategory[] = [
  {
    id: 'general',
    label: 'Umum & Tamu',
    icon: '📌',
    variables: [
      { tag: '{nama_tamu}', label: 'Nama Tamu', desc: 'Nama Tamu Undangan' },
      { tag: '{kode_tamu}', label: 'Kode Tamu', desc: 'Kode Unik Check-In' },
      { tag: '{kuota_tamu}', label: 'Kuota Tamu', desc: 'Jumlah Pax Tamu' },
      { tag: '{penyelenggara}', label: 'Penyelenggara', desc: 'Nama Sohibul Hajat' },
      { tag: '{wa_contact}', label: 'WhatsApp Contact', desc: 'Nomor WhatsApp Acara / Contact Person' },
    ],
  },
  {
    id: 'wedding',
    label: 'Pernikahan & Medsos Mempelai',
    icon: '💍',
    variables: [
      { tag: '{nama_mempelai}', label: 'Mempelai Singkat', desc: 'Nama Pasangan (Pria & Wanita)' },
      { tag: '{nama_pria}', label: 'Panggilan Pria', desc: 'Nama Panggilan Mempelai Pria' },
      { tag: '{nama_wanita}', label: 'Panggilan Wanita', desc: 'Nama Panggilan Mempelai Wanita' },
      { tag: '{groom_full}', label: 'Lengkap Pria', desc: 'Nama Lengkap & Gelar Pria' },
      { tag: '{bride_full}', label: 'Lengkap Wanita', desc: 'Nama Lengkap & Gelar Wanita' },
      { tag: '{ortu_pria}', label: 'Orang Tua Pria', desc: 'Nama Orang Tua Mempelai Pria' },
      { tag: '{ortu_wanita}', label: 'Orang Tua Wanita', desc: 'Nama Orang Tua Mempelai Wanita' },
      { tag: '{ig_pria}', label: 'Instagram Pria', desc: 'Username Instagram Pria (@username)' },
      { tag: '{tiktok_pria}', label: 'TikTok Pria', desc: 'Username TikTok Pria (@username)' },
      { tag: '{fb_pria}', label: 'Facebook Pria', desc: 'Nama Akun Facebook Pria' },
      { tag: '{ig_wanita}', label: 'Instagram Wanita', desc: 'Username Instagram Wanita (@username)' },
      { tag: '{tiktok_wanita}', label: 'TikTok Wanita', desc: 'Username TikTok Wanita (@username)' },
      { tag: '{fb_wanita}', label: 'Facebook Wanita', desc: 'Nama Akun Facebook Wanita' },
    ],
  },
  {
    id: 'datetime',
    label: 'Waktu & Tempat',
    icon: '📅',
    variables: [
      { tag: '{tanggal_acara}', label: 'Tanggal Acara', desc: 'Tanggal Pelaksanaan Acara' },
      { tag: '{waktu_acara}', label: 'Waktu Acara', desc: 'Jam / Waktu Pelaksanaan' },
      { tag: '{hari_acara}', label: 'Hari Acara', desc: 'Nama Hari' },
      { tag: '{bulan_acara}', label: 'Bulan Acara', desc: 'Nama Bulan' },
      { tag: '{tahun_acara}', label: 'Tahun Acara', desc: 'Tahun Pelaksanaan' },
      { tag: '{nama_lokasi}', label: 'Nama Lokasi', desc: 'Nama Gedung / Tempat' },
      { tag: '{alamat_lengkap}', label: 'Alamat Lengkap', desc: 'Detail Alamat Gedung' },
      { tag: '{kota_acara}', label: 'Kota Acara', desc: 'Kota Tempat Acara' },
    ],
  },
  {
    id: 'khitan',
    label: 'Khitan & Aqiqah',
    icon: '🌙',
    variables: [
      { tag: '{nama_anak}', label: 'Nama Anak', desc: 'Nama Anak Yang Dikhitan / Diaqiqahkan' },
      { tag: '{nama_ortu_anak}', label: 'Orang Tua Anak', desc: 'Nama Ayah & Ibu Sang Anak' },
    ],
  },
  {
    id: 'birthday',
    label: 'Ulang Tahun',
    icon: '🎂',
    variables: [
      { tag: '{nama_yang_ultah}', label: 'Nama Ultah', desc: 'Nama Yang Ulang Tahun' },
      { tag: '{umur}', label: 'Usia / Umur', desc: 'Usia Ulang Tahun Ke-' },
    ],
  },
  {
    id: 'formal',
    label: 'Formal, Seminar & Medsos Brand',
    icon: '💼',
    variables: [
      { tag: '{nama_event}', label: 'Nama Event', desc: 'Judul Acara / Seminar / Summit' },
      { tag: '{nama_narasumber}', label: 'Nama Narasumber', desc: 'Keynote Speaker / Pembicara' },
      { tag: '{ig_organizer}', label: 'Instagram Brand', desc: 'Instagram Perusahaan / Event' },
      { tag: '{yt_organizer}', label: 'YouTube Channel', desc: 'YouTube Channel Perusahaan' },
      { tag: '{fb_organizer}', label: 'Facebook Page', desc: 'Facebook Page Perusahaan' },
      { tag: '{wa_contact}', label: 'WhatsApp Contact', desc: 'Nomor WhatsApp Official / Admin' },
    ],
  },
];

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

export type ButtonAction = 'none' | 'submit-rsvp' | 'open-cover';

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
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundRepeat?: string;
  backgroundOverlayColor?: string;
  backgroundOverlayOpacity?: string;
  backgroundVideoUrl?: string;
  bgSlideshowInterval?: number;
  bgSlideshowEffect?: string;
  bgSlideshowCustomUrls?: string;
  sliderInterval?: number;
  sliderEffect?: string;
  gradientColors?: string[];
  gradientDirection?: string;
  gradientColor1?: string;
  gradientColor2?: string;
  // Border
  borderRadius?: string;
  borderWidth?: string;
  borderStyle?: string;
  borderColor?: string;
  // Shadow & Glassmorphism
  boxShadow?: string;
  backdropFilter?: string;
  // Position
  position?: string;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  zIndex?: string;
  // Overflow
  overflow?: string;
  overflowX?: string;
  overflowY?: string;
  hideScrollbar?: boolean;
  // Opacity & Visibility
  opacity?: string;
  // Animation
  animationType?: AnimationType;
  animationDuration?: string;
  animationDelay?: string;
  // Shape Divider
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
  widgetType?: 'rsvp-form' | 'wishes-feed';
  isWishesFeed?: boolean;
  isDynamic?: boolean;
  binding?: string;
  placeholder?: string;
  inputName?: string;
  selectOptions?: string;
  buttonAction?: ButtonAction;
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

// ===== Sample Variables =====
export interface SampleVariables {
  [key: string]: string;
}

export const SAMPLE_VARIABLES: SampleVariables = {
  guest_name: 'Budi Santoso & Partner',
  nama_tamu: 'Budi Santoso & Partner',
  groom_name: 'Roni Wijaya',
  nama_pria: 'Roni Wijaya',
  bride_name: 'Anti Rahmawati',
  nama_wanita: 'Anti Rahmawati',
  couple_name: 'Roni & Anti',
  nama_mempelai: 'Roni & Anti',
  event_date: '21 September 2026',
  tanggal_acara: '21 September 2026',
  event_time: '09:00 WIB - Selesai',
  waktu_acara: '09:00 WIB - Selesai',
  event_location: 'Grand Ballroom Hotel Mulia, Jakarta',
  lokasi_acara: 'Grand Ballroom Hotel Mulia, Jakarta',
  organizer_name: 'Denny Sumargo',
  nama_penyelenggara: 'Denny Sumargo',
  cover_photo: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80',
};

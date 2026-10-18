export interface ActivityTranslation {
  name: string;
  description?: string;
  locationName?: string;
  city?: string;
  badge?: string;
}

export interface Activity {
  id: string;
  name: string;
  nameAr?: string;
  nameFr?: string;
  nameEn?: string;
  category: string;
  categoryIcon: string;
  city: string;
  cityAr?: string;
  cityFr?: string;
  cityEn?: string;
  price: number;
  duration: string;
  distance: string;
  rating: number;
  image: string;
  description?: string;
  descriptionAr?: string;
  descriptionFr?: string;
  descriptionEn?: string;
  location?: string;
  locationNameAr?: string;
  locationNameFr?: string;
  locationNameEn?: string;
  badgeAr?: string;
  badgeFr?: string;
  badgeEn?: string;
  translations?: {
    ar?: ActivityTranslation;
    fr?: ActivityTranslation;
    en?: ActivityTranslation;
  };
  latitude?: number;
  longitude?: number;
  priceTag?: string;
  averagePrice?: number;   // Average ticket per person (TND)
  priceRange?: string;    // e.g. "15 - 30 DT"
  priceLevel?: '$' | '$$' | '$$$' | '$$$$'; // Price level rating
  durationMinutes?: number;
  distanceKm?: number;
  reviewsCount?: number;
  tags?: string[];
  suitableFor?: string[];
  isFavorite?: boolean;
  isFeatured?: boolean;
  isIndoor?: boolean;
  bookingRequired?: boolean;
  openingHours?: string;
  peopleMin?: number;
  peopleMax?: number;
  // Dynamic situation & context attributes
  hasPowerBackup?: boolean; // Has generator / confirmed electricity during cuts
  powerBackupMode?: boolean; // Mode Électricité & Lumière garantie en direct (affiche la lampe dorée allumée 💡)
  hasAirConditioning?: boolean; // Confirmed AC (good for hot weather)
  isOpenNow?: boolean;     // Confirmed open right now
  openingTime?: string;    // e.g. "09:00"
  closingTime?: string;    // e.g. "23:00"
  openDays?: string[];     // e.g. ["Tous les jours"]
  phone?: string;          // Direct phone call (e.g. "+216 74 123 456")
  whatsapp?: string;       // Direct WhatsApp booking/info (e.g. "+216 98 123 456")
  events?: ActivityEvent[];
  promotion?: ActivityPromotion;
  powerReports?: PowerCommunityReports;
  partnerTier?: PartnerTier;
}

export interface PowerCommunityReports {
  yesVotes: number;
  noVotes: number;
  lastReportAt?: string | null;
  lastReportStatus?: 'light_on' | 'light_off' | null;
  userVote?: 'yes' | 'no' | null;
}

export interface ActivityEvent {
  _id?: string;
  id?: string;
  title: string;
  image?: string;
  date?: string;
  time?: string;
  description?: string;
  category?: string; // music, food, party, art
  price?: number;
}

export interface ActivityPromotion {
  isPromo: boolean;
  promoType?: 'all' | 'item';
  discountPercent: number;
  targetItem?: string;
  promoLabel: string;
  validUntil?: string;
}

export type PartnerTier = 'standard' | 'pro' | 'premium';




export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  city: string;
  latitude: number;
  longitude: number;
  status: string;
  bio?: string;
  favoriteCategory?: string;
  distanceKm?: number;
  role?: UserRole;
  userType?: UserType;
  establishmentName?: string;
  permissions?: UserPermission[];
}

export type UserRole = 'user' | 'partner' | 'admin';
export type UserType = 'simple_user' | 'partner_business' | 'administrator';
export type UserPermission =
  | 'activity:read'
  | 'activity:create'
  | 'activity:update'
  | 'activity:delete';

// Modèle métier partagé par l'interface et le futur service d'authentification.
// Les données mockées restent compatibles avec l'interface User ci-dessus.
export class User {
  static canManageActivities(user?: Pick<User, 'role'> | null): boolean {
    return user?.role === 'admin' || user?.role === 'partner';
  }
}

export const USER_PERMISSIONS: Record<UserRole, UserPermission[]> = {
  user: ['activity:read'],
  partner: ['activity:read', 'activity:create', 'activity:update'],
  admin: ['activity:read', 'activity:create', 'activity:update', 'activity:delete'],
};

export const canManageActivities = (user?: Pick<User, 'role'> | null): boolean =>
  User.canManageActivities(user);

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  city?: string;
  provider?: 'google' | 'email';
  role: UserRole;
  userType: UserType;
  partnerTier?: PartnerTier;
  establishmentName?: string;
  permissions: UserPermission[];
  lastLogin?: string;
  lastActivityUpdate?: string;
}

export type AppTab = 'home' | 'explore' | 'favorites' | 'profile' | 'chatbot';

export interface AdminPlatformStats {
  users: {
    total: number;
    regularUsers: number;
    partners: number;
    admins: number;
  };
  activities: {
    total: number;
    pendingApproval: number;
    byCity: Array<{ city: string; count: number }>;
  };
  reviews: {
    total: number;
  };
}

export interface AdminUser {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  partnerTier?: PartnerTier;
  city?: string;
  establishmentName?: string;
  lastLogin?: string;
  lastActivityUpdate?: string;
  createdAt?: string;
}

export interface AdminDiagnosticsResponse {
  success: boolean;
  diagnostics: {
    telemetry: {
      totalSessions: number;
      screenViews: Array<{ screenName: string; count: number }>;
      dailySessions: Array<{ date: string; count: number }>;
    };
    partnersStatus: Array<{
      id: string;
      name: string;
      email: string;
      establishmentName?: string;
      partnerTier: PartnerTier;
      lastLogin?: string;
      lastActivityUpdate?: string;
      activityCount: number;
      isInactive: boolean;
      hasStaleData: boolean;
      city?: string;
      phone?: string;
    }>;
  };
}

export interface AdminActivityItem {
  _id: string;
  id?: string;
  name: string;
  city: string;
  category: string;
  price: number;
  isApproved: boolean;
  isFeatured?: boolean;
  isPopular?: boolean;
  image?: string;
  createdBy?: {
    _id?: string;
    name: string;
    email: string;
    role?: string;
    establishmentName?: string;
  };
  createdAt?: string;
}

export interface AdminUsersResponse {
  success: boolean;
  total: number;
  page: number;
  totalPages: number;
  users: AdminUser[];
}

export interface AdminActivitiesResponse {
  success: boolean;
  total: number;
  page: number;
  totalPages: number;
  activities: AdminActivityItem[];
}

export interface PartnerStats {
  total: number;
  approved: number;
  pending: number;
  totalReviews: number;
  averageRating: number;
}

export interface PartnerActivityItem {
  _id: string;
  id?: string;
  name: string;
  category: string;
  city: string;
  price: number;
  description?: string;
  imageUrl?: string;
  image?: string;
  phone?: string;
  whatsapp?: string;
  rating?: number;
  reviewsCount?: number;
  isApproved?: boolean;
  isFeatured?: boolean;
  isPopular?: boolean;
  hasPowerBackup?: boolean;
  powerBackupMode?: boolean;
  hasAirConditioning?: boolean;
  openingTime?: string;
  closingTime?: string;
  openDays?: string[];
  events?: ActivityEvent[];
  promotion?: ActivityPromotion;
  createdAt?: string;
}

export interface PartnerActivitiesResponse {
  success: boolean;
  count: number;
  stats: PartnerStats;
  activities: PartnerActivityItem[];
  partnerTier?: PartnerTier;
}

export interface PartnerActivityInput {
  name: string;
  category: string;
  city: string;
  price: number;
  description?: string;
  imageUrl?: string;
  phone?: string;
  whatsapp?: string;
  hasPowerBackup?: boolean;
  powerBackupMode?: boolean;
  hasAirConditioning?: boolean;
  openingTime?: string;
  closingTime?: string;
  openDays?: string[];
}





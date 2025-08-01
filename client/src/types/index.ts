export interface UrlFormData {
  longUrl: string;
  shortcode?: string;
  validityMinutes?: number;
}

export interface UrlStats {
  totalUrls: number;
  totalClicks: number;
  activeUrls: number;
  expiredUrls: number;
}

export interface RedirectTestResult {
  shortCode: string;
  longUrl: string;
  success: boolean;
  error?: string;
}

export type UrlStatus = 'active' | 'expired' | 'expiring-soon';

export interface NavigationTab {
  label: string;
  path: string;
  icon: string;
}

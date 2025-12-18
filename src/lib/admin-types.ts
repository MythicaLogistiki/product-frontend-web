/**
 * Admin API types for Platform Admin Console
 */

export type TenantType = "organization" | "individual";
export type TenantStatus = "active" | "suspended" | "pending";
export type SubscriptionTier = "free" | "pro" | "enterprise";

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  type: TenantType;
  status: TenantStatus;
  owner_user_id: string | null;
  owner_email: string | null;
  subscription_tier: SubscriptionTier;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  user_count?: number;
}

export interface CreateTenantRequest {
  name: string;
  slug: string;
  owner_email: string;
  subscription_tier: SubscriptionTier;
}

export interface CreateTenantResponse {
  tenant: Tenant;
  invitation_link: string;
}

export interface UpdateTenantRequest {
  name?: string;
  subscription_tier?: SubscriptionTier;
  is_active?: boolean;
}

export interface TenantListResponse {
  items: Tenant[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface PlatformUser {
  id: string;
  email: string;
  role: string;
  tenant_count: number;
  created_at: string;
  last_login_at: string | null;
}

export interface SystemHealth {
  status: "healthy" | "degraded" | "down";
  database: boolean;
  cache: boolean;
  plaid_api: boolean;
  uptime_seconds: number;
  active_tenants: number;
  total_users: number;
}

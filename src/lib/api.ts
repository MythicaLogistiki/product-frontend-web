import type {
  Transaction,
  PaginatedResponse,
  TransactionFilters,
  PlaidItem,
  SyncResult,
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const AUTH_BASE_URL = process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:8001";

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface ApiError {
  detail: string;
}

class ApiClient {
  private baseUrl: string;
  private authUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string, authUrl: string) {
    this.baseUrl = baseUrl;
    this.authUrl = authUrl;
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", token);
    }
  }

  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("access_token");
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    const token = this.getToken();
    if (token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        detail: "An error occurred",
      }));
      throw new Error(error.detail);
    }

    return response.json();
  }

  async login(username: string, password: string): Promise<TokenResponse> {
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    const response = await fetch(`${this.authUrl}/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        detail: "Invalid credentials",
      }));
      throw new Error(error.detail);
    }

    const data: TokenResponse = await response.json();
    this.setToken(data.access_token);
    return data;
  }

  async getOIDCConfig() {
    return this.request("/.well-known/openid-configuration");
  }

  async healthCheck() {
    return this.request("/health");
  }

  // Plaid API methods
  async createPlaidLinkToken(): Promise<{ link_token: string }> {
    return this.request("/api/v1/plaid/link-token", { method: "POST" });
  }

  async connectPlaidAccount(
    publicToken: string,
    institutionId?: string,
    institutionName?: string
  ): Promise<{ item_id: string; institution_name: string | null }> {
    return this.request("/api/v1/plaid/connect", {
      method: "POST",
      body: JSON.stringify({
        public_token: publicToken,
        institution_id: institutionId,
        institution_name: institutionName,
      }),
    });
  }

  async getPlaidItems(): Promise<PlaidItem[]> {
    return this.request("/api/v1/plaid/items");
  }

  async syncPlaidItem(itemId: string): Promise<SyncResult> {
    return this.request(`/api/v1/plaid/sync/${itemId}`, {
      method: "POST",
    });
  }

  // Transaction API methods
  async getTransactions(
    filters: TransactionFilters = {}
  ): Promise<PaginatedResponse<Transaction>> {
    const params = new URLSearchParams();
    if (filters.start_date) params.set("start_date", filters.start_date);
    if (filters.end_date) params.set("end_date", filters.end_date);
    if (filters.page) params.set("page", filters.page.toString());
    if (filters.page_size) params.set("page_size", filters.page_size.toString());

    const queryString = params.toString();
    return this.request(
      `/api/v1/transactions${queryString ? `?${queryString}` : ""}`
    );
  }

  // Decode JWT to get user info (client-side only, not verified)
  decodeToken(): { sub: string; tenant_id: string; role: string } | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = token.split(".")[1];
      const decoded = JSON.parse(atob(payload));
      return {
        sub: decoded.sub,
        tenant_id: decoded.tenant_id,
        role: decoded.role,
      };
    } catch {
      return null;
    }
  }
}

export const api = new ApiClient(API_BASE_URL, AUTH_BASE_URL);

import config from "../../config";
import AppError from "../../errors/AppError";
import { StatusCodes } from "http-status-codes";
import logger from "../../logger";

export interface MNMember {
  id: number;
  created_at: string;
  updated_at: string;
  email: string;
  member_type?: string;
  first_name: string;
  last_name: string;
  time_zone?: string;
  location?: string | null;
  bio?: string | null;
  referral_count?: number;
  avatar?: string | null;
  categories?: any;
  permalink?: string;
  ambassador_level?: string;
  last_visited_at?: string;
}

export interface MNTag {
  id: number;
  created_at: string;
  updated_at: string;
  title: string;
  description?: string | null;
  color?: string | null;
  custom_field_id?: number;
}

export interface MNCustomField {
  id: number;
  created_at: string;
  updated_at: string;
  title: string;
  response_type: string;
  location_granularity?: string | null;
}

class MightyNetworksClient {
  private get baseUrl(): string {
    return (config.mighty.mighty_api_url || "https://api.mn.co/admin/v1").replace(/\/$/, "");
  }

  private get networkId(): string {
    return String(config.mighty.mighty_network_id || "21482781");
  }

  private get apiKey(): string {
    const key = config.mighty.mighty_api_key;
    if (!key) {
      throw new AppError(
        "MIGHTY_API_KEY is not configured in environment variables",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
    return key;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}, retries = 2): Promise<T> {
    const url = endpoint.startsWith("http") ? endpoint : `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> || {}),
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 429) {
        if (retries > 0) {
          const retryAfter = Number(response.headers.get("retry-after")) || 2;
          logger.warn(`Mighty Networks rate limited (429). Retrying after ${retryAfter}s...`);
          await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
          return this.request<T>(endpoint, options, retries - 1);
        }
        throw new AppError("Mighty Networks API rate limit exceeded. Please try again later.", StatusCodes.TOO_MANY_REQUESTS);
      }

      if (response.status === 401 || response.status === 403) {
        throw new AppError("Mighty Networks API authorization failed. Check MIGHTY_API_KEY.", StatusCodes.UNAUTHORIZED);
      }

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`Mighty Networks API error ${response.status}: ${errorText}`);
        throw new AppError(`Mighty Networks API error (${response.status}): ${response.statusText}`, response.status);
      }

      return (await response.json()) as T;
    } catch (err: any) {
      if (err.name === "AbortError") {
        throw new AppError("Mighty Networks API request timed out", StatusCodes.GATEWAY_TIMEOUT);
      }
      if (err instanceof AppError) {
        throw err;
      }
      logger.error("Mighty Networks network request failed:", err);
      throw new AppError(`Mighty Networks communication error: ${err.message}`, StatusCodes.BAD_GATEWAY);
    }
  }

  /**
   * Fetches all members from Mighty Networks handling pagination
   */
  async fetchAllMembers(perPage = 100): Promise<MNMember[]> {
    const allMembers: MNMember[] = [];
    let page = 1;
    let hasNextPage = true;

    while (hasNextPage) {
      const endpoint = `/networks/${this.networkId}/members?page=${page}&per_page=${perPage}`;
      const data = await this.request<{ items: MNMember[]; links?: { next?: string } }>(endpoint);

      if (Array.isArray(data.items) && data.items.length > 0) {
        allMembers.push(...data.items);
      }

      if (data.links?.next && data.items.length === perPage) {
        page += 1;
      } else {
        hasNextPage = false;
      }
    }

    return allMembers;
  }

  /**
   * Fetches single member by Mighty Networks member ID
   */
  async getMemberById(memberId: string | number): Promise<MNMember> {
    const endpoint = `/networks/${this.networkId}/members/${memberId}/`;
    return await this.request<MNMember>(endpoint);
  }

  /**
   * Fetches all network custom fields
   */
  async getNetworkCustomFields(): Promise<MNCustomField[]> {
    const endpoint = `/networks/${this.networkId}/custom_fields`;
    const data = await this.request<{ items: MNCustomField[] }>(endpoint);
    return data.items || [];
  }

  /**
   * Fetches all network tags
   */
  async getNetworkTags(): Promise<MNTag[]> {
    const endpoint = `/networks/${this.networkId}/tags`;
    const data = await this.request<{ items: MNTag[] }>(endpoint);
    return data.items || [];
  }

  /**
   * Fetches tags assigned to a specific member
   */
  async getMemberTags(memberId: string | number): Promise<MNTag[]> {
    try {
      const endpoint = `/networks/${this.networkId}/members/${memberId}/tags`;
      const data = await this.request<{ items: MNTag[] }>(endpoint);
      return data.items || [];
    } catch {
      // Tags might not exist or endpoint may return 404 for untagged members
      return [];
    }
  }
}

export const mightyNetworksClient = new MightyNetworksClient();

/**
 * API Client
 * Complete fetch wrapper for backend API calls
 */

// Resolve the API base URL. NEXT_PUBLIC_API_URL may point at the backend origin
// (e.g. https://voteweb-backend.onrender.com) or already include the /api/v1 prefix.
const resolveApiBaseUrl = (): string => {
  const raw = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000').replace(/\/+$/, '');
  return raw.endsWith('/api/v1') ? raw : `${raw}/api/v1`;
};

const API_BASE_URL = resolveApiBaseUrl();

// Types matching backend responses
export interface Election {
  id: number;
  name: string;
  description?: string;
  status: 'DRAFT' | 'SCHEDULED' | 'REGISTRATION_OPEN' | 'OPEN' | 'CLOSED' | 'RESULTS_PUBLISHED';
  start_time?: string;
  end_time?: string;
  created_at: string;
  updated_at: string;
  results_published_at?: string;
  results_published_by?: number;
}

export interface Club {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Position {
  id: number;
  club_id: number;
  name: string;
  description?: string;
  display_order: number;
  max_selections: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Candidate {
  id: number;
  position_id: number;
  name: string;
  description?: string;
  manifesto?: string;
  image_url?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: number;
  external_id: string;
  name: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface VoteReceipt {
  receiptId: string;
  receiptHash: string;
  nullifier: string;
  createdAt: string;
}

export interface VoteResponse {
  success: boolean;
  message: string;
  data?: {
    vote: unknown;
    receipt: VoteReceipt;
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface Eligibility {
  eligible: boolean;
  can_vote: boolean;
  reason?: string;
  authorized_elections: number[];
}

export interface Announcement {
  id: number;
  election_id?: number;
  title: string;
  message: string;
  audience: 'all' | 'students' | 'candidates' | 'admins';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  is_published: boolean;
  published_at?: string;
  created_by?: number;
  created_at: string;
  updated_at: string;
}

export interface SupportRequest {
  id: number;
  student_id: number;
  election_id?: number;
  category: string;
  subject: string;
  description: string;
  status: 'open' | 'in_review' | 'waiting' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  assigned_to?: number;
  response?: string;
  responded_at?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: number;
  user_id: number;
  type: 'success' | 'info' | 'warning' | 'error';
  category: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  title: string;
  message?: string;
  action_url?: string;
  action_label?: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

// Auth types
export interface AuthUser {
  id: number;
  externalId: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'CANDIDATE' | 'ADMIN';
  requiresPasswordChange: boolean;
}

export interface LoginResponse {
  authenticated: boolean;
  mfaRequired?: boolean;
  requiresMfaSetup?: boolean;
  mfaChallenge?: string;
  enrollmentToken?: string;
  requiresPasswordChange?: boolean;
  bindingToken?: string;
  user?: AuthUser;
}

export interface MfaVerifyResponse {
  authenticated: boolean;
  bindingToken?: string;
  user?: AuthUser;
}

export interface MfaSetupResponse {
  secret: string;
  provisioningUri: string;
}

export interface MeResponse {
  authenticated: boolean;
  requiresPasswordChange?: boolean;
  user?: AuthUser;
}

export interface CsrfResponse {
  data: {
    csrfToken: string;
  };
}

export interface ApiError {
  error?: string;
  message?: string;
  code?: string;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
  meta?: Record<string, unknown>;
  [key: string]: unknown;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  params?: Record<string, string | number | boolean>;
  headers?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;
  private csrfToken: string | null = null;
  private bindingToken: string | null = null;
  private static BINDING_STORAGE_KEY = 'voteweb_binding_token';

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    if (typeof window !== 'undefined') {
      this.bindingToken = window.sessionStorage.getItem(ApiClient.BINDING_STORAGE_KEY);
    }
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
    if (!params) return `${this.baseUrl}${endpoint}`;

    const url = new URL(`${this.baseUrl}${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
    return url.toString();
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const { method = 'GET', body, params, headers = {} } = options;
    const url = this.buildUrl(endpoint, params);

    // Add CSRF token for state-changing requests
    const stateChanging = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };
    if (stateChanging && this.csrfToken) {
      requestHeaders['X-CSRF-Token'] = this.csrfToken;
    }
    if (stateChanging && this.bindingToken) {
      requestHeaders['X-Session-Binding'] = this.bindingToken;
    }

    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        credentials: 'include', // Include cookies
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json();

      if (!response.ok) {
        const rawError = data.message || data.error;
        const message =
          typeof rawError === 'string'
            ? rawError
            : rawError && typeof rawError === 'object'
              ? String((rawError as { message?: unknown }).message || '')
              : '';
        return {
          error: message || 'An error occurred',
          message: message || undefined,
        };
      }

      return data;
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Set CSRF token from response
  setCsrfToken(token: string) {
    this.csrfToken = token;
  }

  // Store the session binding token sent as X-Session-Binding on state-changing requests
  setBindingToken(token: string | null) {
    this.bindingToken = token;
    if (typeof window !== 'undefined') {
      if (token) {
        window.sessionStorage.setItem(ApiClient.BINDING_STORAGE_KEY, token);
      } else {
        window.sessionStorage.removeItem(ApiClient.BINDING_STORAGE_KEY);
      }
    }
  }

  async ensureCsrf(): Promise<string | null> {
    if (this.csrfToken) return this.csrfToken;
    return this.refreshCsrf();
  }

  // ==================== HEALTH ====================
  async checkHealth() {
    return this.request<{ status: string; service: string; timestamp: string }>(
      '/health'
    );
  }

  async checkDbHealth() {
    return this.request<{ status: string; database: string; responseTime: string; timestamp: string }>(
      '/health/db'
    );
  }

  // ==================== AUTH ====================

  /**
   * Get CSRF token for form submissions
   */
  async getCsrf(): Promise<ApiResponse<CsrfResponse>> {
    const response = await this.request<CsrfResponse>('/auth/csrf');
    return response;
  }

  /**
   * Get current authenticated user
   */
  async getMe(): Promise<ApiResponse<MeResponse>> {
    return this.request<MeResponse>('/auth/me');
  }

  /**
   * Login with credentials
   */
  async login(identifier: string, password: string): Promise<ApiResponse<LoginResponse>> {
    // CSRF token must be fetched before the first state-changing request (login POST)
    await this.ensureCsrf();
    const response = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: { userIdentifier: identifier, password },
    });
    if (response.data && (response.data as LoginResponse).bindingToken) {
      this.setBindingToken((response.data as LoginResponse).bindingToken || null);
    }
    // Refresh CSRF token after login
    await this.refreshCsrf();
    return response;
  }

  /**
   * Refresh CSRF token
   */
  async refreshCsrf(): Promise<string | null> {
    const response = await fetch(`${this.baseUrl}/auth/csrf`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await response.json();
    if (data.data?.csrfToken) {
      this.csrfToken = data.data.csrfToken;
      return this.csrfToken;
    }
    return null;
  }

  /**
   * Get CSRF token
   */
  async getCsrfToken(): Promise<string | null> {
    return this.refreshCsrf();
  }

  /**
   * Verify MFA code
   */
  async verifyMfa(mfaChallenge: string, code: string): Promise<ApiResponse<MfaVerifyResponse>> {
    const response = await this.request<MfaVerifyResponse>('/auth/mfa/verify', {
      method: 'POST',
      body: { mfaChallenge, code },
    });
    if (response.data && (response.data as MfaVerifyResponse).bindingToken) {
      this.setBindingToken((response.data as MfaVerifyResponse).bindingToken || null);
    }
    return response;
  }

  /**
   * Start MFA setup
   */
  async setupMfa(mfaChallenge: string, enrollmentToken: string): Promise<ApiResponse<MfaSetupResponse>> {
    return this.request<MfaSetupResponse>('/auth/mfa/setup', {
      method: 'POST',
      body: { mfaChallenge, enrollmentToken },
    });
  }

  /**
   * Verify MFA setup
   */
  async verifyMfaSetup(
    mfaChallenge: string,
    enrollmentToken: string,
    code: string
  ): Promise<ApiResponse<MfaVerifyResponse>> {
    const response = await this.request<MfaVerifyResponse>('/auth/mfa/verify-setup', {
      method: 'POST',
      body: { mfaChallenge, enrollmentToken, code },
    });
    if (response.data && (response.data as MfaVerifyResponse).bindingToken) {
      this.setBindingToken((response.data as MfaVerifyResponse).bindingToken || null);
    }
    await this.refreshCsrf();
    return response;
  }

  /**
   * Change password
   */
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse<{ message: string; bindingToken: string }>> {
    await this.ensureCsrf();
    const response = await this.request<{
      message: string;
      bindingToken: string;
    }>('/auth/change-password', {
      method: 'POST',
      body: { currentPassword, newPassword },
    });
    // Session rotates on password change - store the new binding token
    if (!response.error && response.data?.bindingToken) {
      this.setBindingToken(response.data.bindingToken);
    }
    return response;
  }

  /**
   * Register a new account
   */
  async register(data: {
    fullName: string;
    email: string;
    studentIdentifier: string;
    password: string;
  }): Promise<ApiResponse<{ message: string }>> {
    await this.ensureCsrf();
    return this.request('/auth/register', {
      method: 'POST',
      body: data,
    });
  }

  /**
   * Logout
   */
  async logout(): Promise<ApiResponse<{ message: string }>> {
    const response = await this.request<{ message: string }>('/auth/logout', {
      method: 'POST',
    });
    this.setBindingToken(null);
    return response;
  }

  // ==================== ELECTIONS ====================
  async getElections(params?: { status?: string; limit?: number; offset?: number }) {
    return this.request<{ elections: Election[]; total: number }>('/elections', { params });
  }

  async getElection(id: number) {
    return this.request<{ election: Election }>(`/elections/${id}`);
  }

  async getActiveElections() {
    return this.request<{ elections: Election[] }>('/elections', {
      params: { status: 'OPEN' },
    });
  }

  async getElectionResults(id: number) {
    return this.request(`/elections/${id}/results`);
  }

  // ==================== CLUBS ====================
  async getClubs(electionId?: number) {
    const endpoint = electionId ? `/elections/${electionId}/clubs` : '/clubs';
    return this.request<{ clubs: Club[] }>(endpoint);
  }

  async getClub(id: number) {
    return this.request<{ club: Club }>(`/clubs/${id}`);
  }

  async getClubPositions(clubId: number) {
    return this.request(`/clubs/${clubId}/positions`);
  }

  async getElectionClubs(electionId: number) {
    return this.request(`/elections/${electionId}/clubs`);
  }

  // ==================== POSITIONS ====================
  async getPositions(clubId?: number) {
    const endpoint = clubId ? `/clubs/${clubId}/positions` : '/positions';
    return this.request(endpoint);
  }

  async getPosition(id: number) {
    return this.request<{ position: Position }>(`/positions/${id}`);
  }

  async getPositionCandidates(positionId: number) {
    return this.request(`/positions/${positionId}/candidates`);
  }

  // ==================== STUDENTS ====================
  async getStudent(id: number) {
    return this.request(`/students/${id}`);
  }

  // ==================== CANDIDATES ====================
  async getCandidates(positionId?: number) {
    const endpoint = positionId ? `/positions/${positionId}/candidates` : '/candidates';
    return this.request(endpoint);
  }

  async getCandidate(id: number) {
    return this.request<{ candidate: Candidate }>(`/candidates/${id}`);
  }

  /**
   * Update a candidate record (authenticated candidates/admins only).
   * Only allowed fields: name, description, image_url, display_order.
   */
  async updateCandidate(
    id: number,
    data: {
      name?: string;
      description?: string;
      image_url?: string;
      display_order?: number;
    }
  ): Promise<ApiResponse<{ candidate: Candidate }>> {
    await this.ensureCsrf();
    return this.request<{ candidate: Candidate }>(`/candidates/${id}`, {
      method: 'PATCH',
      body: data,
    });
  }

  // ==================== VOTING ====================
  async submitVote(electionId: number, clubId: number, positionId: number, candidateId: number) {
    return this.request<VoteResponse>(`/elections/${electionId}/votes`, {
      method: 'POST',
      body: { club_id: clubId, position_id: positionId, candidate_id: candidateId },
    });
  }

  async checkVoteStatus(electionId: number, positionIds?: number[]) {
    const params: Record<string, string | number | boolean> = {};
    if (positionIds) {
      params.position_ids = positionIds.join(',');
    }
    return this.request(`/elections/${electionId}/votes/check`, { params });
  }

  async getReceipt(electionId: number, voteId?: number) {
    if (voteId) {
      return this.request(`/elections/${electionId}/votes/receipt/${voteId}`);
    }
    return this.request(`/elections/${electionId}/votes/receipt`);
  }

  // Get receipt by receipt ID using existing backend endpoint
  async getReceiptById(receiptId: string) {
    return this.request(`/receipts/${receiptId}`);
  }

  // Get the authenticated student's receipt for an election (private, requires auth)
  async getMyReceipt(electionId: number) {
    return this.request(`/receipts/me/${electionId}`);
  }

  // ==================== ELIGIBILITY ====================
  async checkEligibility(electionId: number) {
    return this.request<Eligibility>(`/elections/${electionId}/eligibility`);
  }

  // ==================== ANNOUNCEMENTS ====================
  async getAnnouncements(electionId?: number) {
    const endpoint = electionId ? `/announcements?election_id=${electionId}` : '/announcements';
    return this.request(endpoint);
  }

  // ==================== NOTIFICATIONS ====================
  async getNotifications() {
    return this.request('/notifications');
  }

  async getUnreadCount() {
    return this.request('/notifications/unread-count');
  }

  async markNotificationRead(id: number) {
    return this.request(`/notifications/${id}/read`, { method: 'POST' });
  }

  async markAllNotificationsRead() {
    return this.request('/notifications/mark-all-read', { method: 'POST' });
  }

  // ==================== SUPPORT ====================
  async getSupportRequests() {
    return this.request('/support');
  }

  async createSupportRequest(data: {
    election_id?: number;
    category: string;
    subject: string;
    description: string;
    priority?: string;
  }) {
    return this.request('/support', { method: 'POST', body: data });
  }

  async getSupportRequest(id: number) {
    return this.request(`/support/${id}`);
  }

  // ==================== ADMIN ====================

  // Admin students
  async getAdminStudents() {
    return this.request<{ data: Student[] }>('/admin/students');
  }

  // Admin elections
  async getAdminElections() {
    return this.request('/admin/elections');
  }

  // Admin support requests
  async getAdminSupportRequests() {
    return this.request('/admin/support');
  }

  // Publish election results
  async publishElectionResults(electionId: number) {
    return this.request(`/admin/elections/${electionId}/publish`, { method: 'POST' });
  }

  // Admin eligibility
  async getAdminElectionEligibility(electionId: number) {
    return this.request(`/admin/elections/${electionId}/authorizations`);
  }

  // Admin create/update methods
  async createAdminElection(data: {
    name: string;
    description: string;
    start_time: string;
    end_time: string;
    status: string;
  }) {
    return this.request('/admin/elections', { method: 'POST', body: data });
  }

  async updateAdminElection(id: number, data: {
    name?: string;
    description?: string;
    start_time?: string;
    end_time?: string;
    status?: string;
  }) {
    return this.request(`/admin/elections/${id}`, { method: 'PATCH', body: data });
  }

  async updateAdminElectionStatus(id: number, status: string) {
    return this.request(`/admin/elections/${id}/status`, { method: 'PATCH', body: { status } });
  }

  async createAdminStudent(data: {
    external_id: string;
    name: string;
    email: string;
  }) {
    return this.request('/admin/students', { method: 'POST', body: data });
  }

  async updateAdminStudent(id: number, data: {
    name?: string;
    email?: string;
  }) {
    return this.request(`/admin/students/${id}`, { method: 'PATCH', body: data });
  }

  async updateAdminStudentStatus(id: number, is_active: boolean) {
    return this.request(`/admin/students/${id}/status`, { method: 'PATCH', body: { is_active } });
  }

  async createAdminAuthorization(electionId: number, data: {
    student_id: number;
    authorized_clubs: number[];
    authorized_positions?: number[];
    full_access?: boolean;
  }) {
    return this.request(`/admin/elections/${electionId}/authorizations`, { method: 'POST', body: data });
  }

  // Admin clubs
  async createAdminClub(electionId: number, data: {
    name: string;
    description?: string;
  }) {
    return this.request(`/admin/elections/${electionId}/clubs`, { method: 'POST', body: data });
  }

  async updateAdminClub(id: number, data: {
    name?: string;
    description?: string;
  }) {
    return this.request(`/admin/clubs/${id}`, { method: 'PATCH', body: data });
  }

  // Admin positions
  async createAdminPosition(clubId: number, data: {
    name: string;
    description?: string;
    display_order?: number;
    max_selections?: number;
  }) {
    return this.request(`/admin/clubs/${clubId}/positions`, { method: 'POST', body: data });
  }

  async updateAdminPosition(id: number, data: {
    name?: string;
    description?: string;
    display_order?: number;
    max_selections?: number;
  }) {
    return this.request(`/admin/positions/${id}`, { method: 'PATCH', body: data });
  }

  // Admin candidates
  async createAdminCandidate(positionId: number, data: {
    name: string;
    bio?: string;
    photo_url?: string;
  }) {
    return this.request(`/admin/positions/${positionId}/candidates`, { method: 'POST', body: data });
  }

  async updateAdminCandidate(id: number, data: {
    name?: string;
    bio?: string;
    photo_url?: string;
  }) {
    return this.request(`/admin/candidates/${id}`, { method: 'PATCH', body: data });
  }

  // Admin announcements
  async createAdminAnnouncement(data: {
    election_id?: number;
    title: string;
    content: string;
    is_active?: boolean;
  }) {
    return this.request('/admin/announcements', { method: 'POST', body: data });
  }

  async updateAdminAnnouncement(id: number, data: {
    title?: string;
    content?: string;
    is_active?: boolean;
  }) {
    return this.request(`/admin/announcements/${id}`, { method: 'PATCH', body: data });
  }

  async deleteAdminAnnouncement(id: number) {
    return this.request(`/admin/announcements/${id}`, { method: 'DELETE' });
  }

  // Admin support
  async updateAdminSupportStatus(id: number, data: {
    status?: string;
    assigned_to?: number;
    admin_notes?: string;
  }) {
    return this.request(`/admin/support/${id}`, { method: 'PATCH', body: data });
  }
}

// Export singleton instance
export const api = new ApiClient(API_BASE_URL);

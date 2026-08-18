/**
 * API Configuration
 * Central configuration for backend API endpoints
 */

// Resolve the API base URL. NEXT_PUBLIC_API_URL may point at the backend origin
// (e.g. https://voteweb-backend.onrender.com) or already include the /api/v1 prefix.
const resolveApiBaseUrl = (): string => {
  const raw = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000').replace(/\/+$/, '');
  return raw.endsWith('/api/v1') ? raw : `${raw}/api/v1`;
};

const API_BASE_URL = resolveApiBaseUrl();

export const API_ENDPOINTS = {
  // Health
  health: `${API_BASE_URL}/health`,
  dbHealth: `${API_BASE_URL}/health/db`,

  // Elections
  elections: `${API_BASE_URL}/elections`,
  electionById: (id: number) => `${API_BASE_URL}/elections/${id}`,
  electionEligibility: (electionId: number, studentId: number) =>
    `${API_BASE_URL}/elections/${electionId}/eligibility/${studentId}`,

  // Clubs
  clubs: `${API_BASE_URL}/clubs`,
  clubById: (id: number) => `${API_BASE_URL}/clubs/${id}`,
  clubPositions: (id: number) => `${API_BASE_URL}/clubs/${id}/positions`,

  // Positions
  positions: `${API_BASE_URL}/positions`,
  positionById: (id: number) => `${API_BASE_URL}/positions/${id}`,
  positionCandidates: (id: number) => `${API_BASE_URL}/positions/${id}/candidates`,

  // Candidates
  candidates: `${API_BASE_URL}/candidates`,
  candidateById: (id: number) => `${API_BASE_URL}/candidates/${id}`,

  // Voting
  vote: (electionId: number) => `${API_BASE_URL}/elections/${electionId}/votes`,
  voteCheck: (electionId: number) => `${API_BASE_URL}/elections/${electionId}/votes/check`,

  // Vote Receipt
  receipt: (id: string) => `${API_BASE_URL}/receipts/${id}`,

  // Announcements
  announcements: `${API_BASE_URL}/announcements`,
  announcementById: (id: number) => `${API_BASE_URL}/announcements/${id}`,

  // Support
  support: `${API_BASE_URL}/support`,
  supportById: (id: number) => `${API_BASE_URL}/support/${id}`,

  // Notifications
  notifications: `${API_BASE_URL}/notifications`,
  notificationsUnreadCount: `${API_BASE_URL}/notifications/unread-count`,
  notificationMarkRead: (id: number) => `${API_BASE_URL}/notifications/${id}/read`,
  notificationsMarkAllRead: `${API_BASE_URL}/notifications/mark-all-read`,

  // Students
  students: `${API_BASE_URL}/students`,
  studentById: (id: number) => `${API_BASE_URL}/students/${id}`,

  // Admin endpoints
  admin: {
    elections: `${API_BASE_URL}/admin/elections`,
    electionById: (id: number) => `${API_BASE_URL}/admin/elections/${id}`,
    electionClubs: (id: number) => `${API_BASE_URL}/admin/elections/${id}/clubs`,
    electionAuthorizations: (id: number) => `${API_BASE_URL}/admin/elections/${id}/authorizations`,
    electionResults: (id: number) => `${API_BASE_URL}/admin/elections/${id}/results`,
    electionReadiness: (id: number) => `${API_BASE_URL}/admin/elections/${id}/readiness`,

    students: `${API_BASE_URL}/admin/students`,
    studentById: (id: number) => `${API_BASE_URL}/admin/students/${id}`,

    clubs: `${API_BASE_URL}/admin/clubs`,
    clubById: (id: number) => `${API_BASE_URL}/admin/clubs/${id}`,

    positions: `${API_BASE_URL}/admin/positions`,
    positionById: (id: number) => `${API_BASE_URL}/admin/positions/${id}`,

    candidates: `${API_BASE_URL}/admin/candidates`,
    candidateById: (id: number) => `${API_BASE_URL}/admin/candidates/${id}`,

    authorizations: `${API_BASE_URL}/admin/authorizations`,
    authorizationById: (id: number) => `${API_BASE_URL}/admin/authorizations/${id}`,

    announcements: `${API_BASE_URL}/admin/announcements`,
    announcementById: (id: number) => `${API_BASE_URL}/admin/announcements/${id}`,

    support: `${API_BASE_URL}/admin/support`,
    supportById: (id: number) => `${API_BASE_URL}/admin/support/${id}`,

    activity: `${API_BASE_URL}/admin/activity`,
  },
};

export default API_ENDPOINTS;

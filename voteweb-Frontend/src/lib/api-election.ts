/**
 * API Election Data
 * Real backend data fetching for the voting flow
 *
 * This module replaces MOCK_VOTING_ELECTION with actual API calls
 */

import { api, Election, Club, Position, Candidate } from "./api-client";

export interface VotingElection {
  id: number;
  name: string;
  status: "open" | "closed" | "not_eligible" | "already_voted";
  votingPeriod: {
    start: string;
    end: string;
    startTime: string;
    endTime: string;
  };
  eligible: boolean;
  hasVoted: boolean;
  positions: VotingPosition[];
  clubName: string;
  clubId: number;
  electionId: number;
}

export interface VotingPosition {
  id: number;
  name: string;
  order: number;
  candidates: VotingCandidate[];
  clubId: number;
  clubName: string;
}

export interface VotingCandidate {
  id: number;
  name: string;
  department: string;
  year: string;
  photoInitials: string;
  campaignSymbol: string;
  shortManifesto: string;
  description?: string;
}

// Helper to extract data from API response
function extractArrayData<T>(response: { data?: unknown; error?: string }): T[] {
  if (response.error) return [];
  if (!response.data) return [];
  if (typeof response.data === 'object' && response.data !== null && 'data' in response.data) {
    const d = response.data as { data: T[] };
    return d.data || [];
  }
  if (Array.isArray(response.data)) {
    return response.data as unknown as T[];
  }
  return [];
}

/**
 * Fetch election with voting data for a student
 */
export async function fetchVotingElection(electionId: number): Promise<{
  election: VotingElection | null;
  error: string | null;
}> {
  try {
    // 1. Fetch election details
    const electionRes = await api.getElection(electionId);
    if (electionRes.error) {
      return { election: null, error: electionRes.error };
    }

    // Extract election data
    let electionData: Election | null = null;
    const eData = electionRes.data as Record<string, unknown>;
    if ('election' in eData) {
      electionData = eData.election as Election;
    } else if ('data' in eData && eData.data) {
      electionData = eData.data as unknown as Election;
    } else if (typeof eData === 'object') {
      electionData = eData as unknown as Election;
    }

    if (!electionData) {
      return { election: null, error: "Election not found" };
    }

    // 2. Check eligibility
    const eligibilityRes = await api.checkEligibility(electionId);
    const eligible = !eligibilityRes.error;

    // 3. Check if already voted
    const voteStatusRes = await api.checkVoteStatus(electionId);
    const hasVoted = !voteStatusRes.error && !(voteStatusRes.data && typeof voteStatusRes.data === 'object' && !('voted' in voteStatusRes.data));

    // 4. Fetch clubs for this election
    const clubsRes = await api.getElectionClubs(electionId);
    if (clubsRes.error) {
      return { election: null, error: clubsRes.error };
    }
    const clubs: Club[] = extractArrayData<Club>(clubsRes);

    // 5. Fetch all positions and candidates
    const positionsWithCandidates: VotingPosition[] = [];

    for (const club of clubs) {
      const positionsRes = await api.getClubPositions(club.id);
      if (positionsRes.error) continue;

      const positions: Position[] = extractArrayData<Position>(positionsRes);

      for (const position of positions) {
        const candidatesRes = await api.getPositionCandidates(position.id);
        if (candidatesRes.error) continue;

        const candidates: Candidate[] = extractArrayData<Candidate>(candidatesRes);

        positionsWithCandidates.push({
          id: position.id,
          name: position.name,
          order: position.display_order,
          candidates: candidates.map((c) => ({
            id: c.id,
            name: c.name,
            department: extractDepartment(c.description),
            year: extractYear(c.description),
            photoInitials: c.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase(),
            campaignSymbol: c.name[0]?.toUpperCase() || "?",
            shortManifesto: c.manifesto?.substring(0, 100) || "",
            description: c.description,
          })),
          clubId: club.id,
          clubName: club.name,
        });
      }
    }

    // 6. Build the response
    const status = electionData.status === 'OPEN' ? 'open' :
                   electionData.status === 'CLOSED' || electionData.status === 'RESULTS_PUBLISHED' ? 'closed' :
                   'not_eligible';

    return {
      election: {
        id: electionData.id,
        name: electionData.name,
        status,
        votingPeriod: {
          start: electionData.start_time || "",
          end: electionData.end_time || "",
          startTime: electionData.start_time ? new Date(electionData.start_time).toLocaleTimeString() : "",
          endTime: electionData.end_time ? new Date(electionData.end_time).toLocaleTimeString() : "",
        },
        eligible,
        hasVoted,
        positions: positionsWithCandidates,
        clubName: clubs[0]?.name || "Club",
        clubId: clubs[0]?.id || 0,
        electionId: electionData.id,
      },
      error: null,
    };
  } catch (err) {
    return {
      election: null,
      error: err instanceof Error ? err.message : "Failed to fetch election",
    };
  }
}

/**
 * Submit a vote
 */
export async function submitVote(
  electionId: number,
  clubId: number,
  positionId: number,
  candidateId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await api.submitVote(electionId, clubId, positionId, candidateId);
    if (res.error) {
      return { success: false, error: res.error };
    }
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to submit vote",
    };
  }
}

/**
 * Get vote receipt
 */
export async function getVoteReceipt(
  electionId: number,
  voteId?: number
): Promise<{ receipt: unknown; error: string | null }> {
  try {
    const res = await api.getReceipt(electionId, voteId);
    if (res.error) {
      return { receipt: null, error: res.error };
    }
    return { receipt: res.data, error: null };
  } catch (err) {
    return {
      receipt: null,
      error: err instanceof Error ? err.message : "Failed to get receipt",
    };
  }
}

/**
 * Submit vote to backend
 */
export async function submitVoteToBackend(
  electionId: number,
  clubId: number,
  positionId: number,
  candidateId: number
): Promise<{ success: boolean; error?: string; message?: string; receiptId?: string }> {
  try {
    const res = await api.submitVote(electionId, clubId, positionId, candidateId);
    if (res.error) {
      return { success: false, error: res.error, message: res.message };
    }
    // Extract receipt ID from successful response
    const receiptId = (res as { data?: { receipt?: { receiptId?: string } } })?.data?.receipt?.receiptId;
    return { success: true, receiptId };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to submit vote",
    };
  }
}

/**
 * Check if student has already voted
 */
export async function checkVoteStatus(
  electionId: number
): Promise<{ hasVoted: boolean; error?: string }> {
  try {
    const res = await api.checkVoteStatus(electionId);
    if (res.error) {
      return { hasVoted: false, error: res.error };
    }
    // Extract from response
    const data = res.data as Record<string, unknown>;
    const voted = data?.voted_positions && Array.isArray(data.voted_positions) && (data.voted_positions as unknown[]).length > 0;
    return { hasVoted: !!voted };
  } catch (err) {
    return {
      hasVoted: false,
      error: err instanceof Error ? err.message : "Failed to check vote status",
    };
  }
}

/**
 * Get list of open elections
 */
export async function fetchOpenElections(): Promise<{
  elections: Election[];
  error: string | null;
}> {
  try {
    const res = await api.getElections({ status: "OPEN" });
    if (res.error) {
      return { elections: [], error: res.error };
    }
    return { elections: extractArrayData<Election>(res), error: null };
  } catch (err) {
    return {
      elections: [],
      error: err instanceof Error ? err.message : "Failed to fetch elections",
    };
  }
}

/**
 * Helper: Extract department from description
 */
function extractDepartment(description?: string): string {
  if (!description) return "General";
  const match = description.match(/(?:department|faculty|dept)[\s:]+([A-Za-z]+)/i);
  return match ? match[1] : "General";
}

/**
 * Helper: Extract year from description
 */
function extractYear(description?: string): string {
  if (!description) return "N/A";
  const match = description.match(/\d+(?:st|nd|rd|th)\s*year/i);
  return match ? match[0] : "N/A";
}

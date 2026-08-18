"use client";
import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface BallotSelection {
  positionId: string;
  candidateId?: string | null;
  clubId?: number;
}

interface VotingContextType {
  selections: BallotSelection[];
  setCandidate: (positionId: string, candidateId: string, clubId?: number) => void;
  setAbstain: (positionId: string) => void;
  getSelection: (positionId: string) => BallotSelection | undefined;
  resetSelections: () => void;
  clearSelections: () => void;
  setSelections: (selections: BallotSelection[]) => void;
  initializePositions: (positions: { id: string; clubId?: number }[]) => void;
}

const VotingContext = createContext<VotingContextType | null>(null);

export function useVoting() {
  const ctx = useContext(VotingContext);
  if (!ctx) throw new Error("useVoting must be used within VotingProvider");
  return ctx;
}

export function VotingProvider({ children }: { children: ReactNode }) {
  // Start with empty selections - will be initialized by page
  const [selections, setSelectionsState] = useState<BallotSelection[]>([]);

  const setCandidate = useCallback(
    (positionId: string, candidateId: string, clubId?: number) => {
      setSelectionsState((prev) => {
        const existing = prev.find((s) => s.positionId === positionId);
        if (existing) {
          return prev.map((s) =>
            s.positionId === positionId ? { ...s, candidateId, clubId: clubId ?? s.clubId } : s
          );
        }
        return [...prev, { positionId, candidateId, clubId }];
      });
    },
    []
  );

  const setAbstain = useCallback((positionId: string) => {
    setSelectionsState((prev) => {
      const existing = prev.find((s) => s.positionId === positionId);
      if (existing) {
        return prev.map((s) =>
          s.positionId === positionId ? { ...s, candidateId: null } : s
        );
      }
      return [...prev, { positionId, candidateId: null }];
    });
  }, []);

  const getSelection = useCallback(
    (positionId: string) => selections.find((s) => s.positionId === positionId),
    [selections]
  );

  const initializePositions = useCallback(
    (positions: { id: string; clubId?: number }[]) => {
      const newSelections: BallotSelection[] = positions.map((p) => ({
        positionId: p.id,
        candidateId: undefined,
        clubId: p.clubId,
      }));
      setSelectionsState(newSelections);
    },
    []
  );

  const resetSelections = useCallback(() => {
    setSelectionsState((prev) =>
      prev.map((s) => ({ ...s, candidateId: undefined }))
    );
  }, []);

  const clearSelections = useCallback(() => {
    setSelectionsState([]);
  }, []);

  const setSelections = useCallback((newSelections: BallotSelection[]) => {
    setSelectionsState(newSelections);
  }, []);

  return (
    <VotingContext.Provider
      value={{
        selections,
        setCandidate,
        setAbstain,
        getSelection,
        resetSelections,
        clearSelections,
        setSelections,
        initializePositions,
      }}
    >
      {children}
    </VotingContext.Provider>
  );
}

// Receipt types shared by receipt UI components.
// Receipt data itself is fetched live from the backend API.

export type ReceiptStatus = "recorded" | "pending" | "invalid" | "not_found" | "error";

export interface VoteReceipt {
  id: string;
  receiptId: string;
  electionName: string;
  status: ReceiptStatus;
  submittedAt: string;
  submittedDate: string;
  submittedTime: string;
  electionStatus: string;
  verificationUrl: string;
}

export interface ReceiptHistoryItem {
  electionName: string;
  receiptId: string;
  status: ReceiptStatus;
  date: string;
}

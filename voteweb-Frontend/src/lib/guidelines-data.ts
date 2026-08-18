"use client";

// Mock guideline data for CampusVote Module 6
// Election Guidelines & Rules

export interface GuidelineSection {
  id: string;
  title: string;
  content: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface TimelineEvent {
  label: string;
  date: string;
  time?: string;
  isCurrent?: boolean;
}

export const ELECTION_INFO = {
  name: "Student Council Election 2026",
  votingDate: "10 August 2026",
  votingTime: "9:00 AM – 5:00 PM",
  eligibleVoters: "Registered students",
  votingMethod: "Online",
  status: "Open",
};

export const GUIDELINE_SECTIONS: GuidelineSection[] = [
  {
    id: "overview",
    title: "Election Overview",
    content:
      "The Student Council Election gives eligible students an opportunity to participate in selecting student representatives for the upcoming academic year.",
  },
  {
    id: "eligibility",
    title: "Who Can Vote?",
    content:
      "To be eligible to vote, you must be a registered student with an active student account that is eligible for the current election. Students who have already submitted a ballot cannot vote again.",
  },
  {
    id: "how-to-vote",
    title: "How to Vote",
    content:
      "Voting is a simple process. Sign in with your student account, review candidates and their manifestos, select one candidate for each position (or abstain), review your ballot, and confirm your submission. A receipt is generated after successful submission.",
  },
  {
    id: "voting-rules",
    title: "Voting Rules",
    content:
      "You may submit only one ballot per election. You can select only one candidate for each position. Abstaining is allowed. Review your ballot carefully before submitting — votes cannot be changed after submission.",
  },
  {
    id: "privacy",
    title: "Vote Privacy",
    content:
      "Your candidate selections are treated as confidential ballot information. The vote receipt confirms that a ballot was recorded but does not display your candidate selections.",
  },
  {
    id: "receipt",
    title: "Understanding Your Vote Receipt",
    content:
      "After submitting your vote, CampusVote provides a receipt containing a Receipt ID, election name, submission status, date/time, and verification information. The receipt does not contain candidate selections.",
  },
  {
    id: "dates",
    title: "Important Dates",
    content:
      "Key dates include candidate registration, verification, voting opening and closing, and results publication.",
  },
  {
    id: "candidates",
    title: "Candidate Information",
    content:
      "Candidates are reviewed and published by election administration. Students can view profiles, read biographies and manifestos, and compare factual information. CampusVote does not recommend or rank candidates.",
  },
  {
    id: "neutrality",
    title: "Election Neutrality",
    content:
      "CampusVote provides the tools needed to participate in the election without recommending or promoting individual candidates. All candidates receive equal visual treatment. No popularity rankings or recommendations are displayed.",
  },
  {
    id: "after-voting",
    title: "What Happens After You Vote?",
    content:
      "After submission, your ballot is recorded and a receipt is generated. You cannot submit another ballot for the same election. Results are published according to the election schedule.",
  },
];

export const VOTING_RULES = [
  "You may submit only one ballot for the election.",
  "You can select only one candidate for each position.",
  "You may abstain from a position.",
  "Review your ballot before submitting.",
  "A submitted vote cannot be changed.",
  "Do not share your account credentials.",
  "Do not attempt to access another student's account.",
  "Do not interfere with the voting system.",
  "Use only your own eligible student account.",
  "Report technical issues through Help & Support.",
];

export const VOTING_STEPS = [
  { step: 1, title: "Sign In", description: "Use your authorized student account." },
  { step: 2, title: "Review Candidates", description: "Read candidate profiles and manifestos." },
  { step: 3, title: "Select Candidates", description: "Choose one candidate for each position or abstain." },
  { step: 4, title: "Review Ballot", description: "Check all selections carefully." },
  { step: 5, title: "Confirm & Submit", description: "Confirm that your ballot is correct." },
  { step: 6, title: "Receive Receipt", description: "A receipt is generated after successful submission." },
];

export const AFTER_VOTING_STEPS = [
  { step: 1, title: "Ballot Submitted", description: "Your completed ballot is submitted." },
  { step: 2, title: "Vote Recorded", description: "The system records the ballot." },
  { step: 3, title: "Receipt Generated", description: "A receipt identifier is provided." },
  { step: 4, title: "Voting Access Ends", description: "You cannot submit another ballot for the same election." },
  { step: 5, title: "Results", description: "Election results are published according to the election schedule." },
];

export const TIMELINE_EVENTS: TimelineEvent[] = [
  { label: "Candidate Registration", date: "1 August 2026" },
  { label: "Candidate Verification", date: "5 August 2026" },
  { label: "Voting Opens", date: "10 August 2026", time: "9:00 AM", isCurrent: true },
  { label: "Voting Closes", date: "10 August 2026", time: "5:00 PM" },
  { label: "Results Published", date: "11 August 2026" },
];

export const FAQ_ITEMS: FAQItem[] = [
  {
    question: "Can I change my vote after submitting?",
    answer: "No. Review your ballot carefully before confirming submission.",
  },
  {
    question: "Can I vote more than once?",
    answer: "No. Each eligible student can submit one ballot for the election.",
  },
  {
    question: "What happens if I don't select a candidate?",
    answer: "You can choose the Abstain option for that position.",
  },
  {
    question: "Can other students see my vote?",
    answer: "Your candidate selections are treated as confidential ballot information.",
  },
  {
    question: "What does my receipt contain?",
    answer: "It confirms that your ballot was recorded and provides verification information. It does not display your candidate selections.",
  },
  {
    question: "What if I cannot log in?",
    answer: "Use the password recovery option or contact Election Administration through Help & Support.",
  },
  {
    question: "What if voting closes while I'm voting?",
    answer: "If the election closes before submission, the system will prevent the ballot from being submitted.",
  },
  {
    question: "Can I vote from my phone?",
    answer: "Yes, CampusVote is designed to work on desktop, tablet and mobile devices.",
  },
];

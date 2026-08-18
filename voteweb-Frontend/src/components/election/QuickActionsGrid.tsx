import React from "react";
import { Card } from "../ui/Card";
import { Users, Vote, BookOpen, ReceiptText } from "lucide-react";
import Link from "next/link";

export const QuickActionsGrid: React.FC = () => {
  const actions = [
    {
      icon: <Vote className="w-5 h-5" />,
      title: "Vote Now",
      description: "Access the secure ballot page and cast your vote.",
      href: "/student/vote",
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "View Candidates",
      description: "Examine candidate profiles, manifestos, and backgrounds.",
      href: "/student/candidates",
    },
    {
      icon: <BookOpen className="w-5 h-5" />,
      title: "Election Guidelines",
      description: "Read the rules, policies, and regulations of the election.",
      href: "/student/guidelines",
    },
    {
      icon: <ReceiptText className="w-5 h-5" />,
      title: "My Receipt",
      description: "Verify your submitted ballot receipt cryptographic hash.",
      href: "/student/receipt",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {actions.map((action) => (
        <Link key={action.href} href={action.href}>
          <Card className="hoverable h-full p-4 flex flex-col">
            <div className="p-2 bg-primary-100 rounded-xl w-fit mb-3">
              {action.icon}
            </div>
            <div className="flex-1 flex flex-col">
              <h4 className="font-medium text-text-primary">{action.title}</h4>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed flex-1">{action.description}</p>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
};
import React from "react";
import { Card } from "../ui/Card";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface QuickActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  className?: string;
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({
  icon,
  title,
  description,
  href,
  className,
}) => {
  return (
    <Link href={href}>
      <Card className={cn("hoverable h-full flex flex-col", className)}>
        <div className="p-2 bg-primary-100 rounded-xl w-fit mb-3">
          {icon}
        </div>
        <div className="flex-1 flex flex-col">
          <h4 className="font-medium text-text-primary">{title}</h4>
          <p className="text-xs text-text-secondary mt-1 leading-relaxed flex-1">{description}</p>
        </div>
      </Card>
    </Link>
  );
};
import React from "react";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Settings, GraduationCap, Calendar } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ProfileCardProps {
  name: string;
  id: string;
  department: string;
  year: string;
  status: string;
  className?: string;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  name,
  id,
  department,
  year,
  status,
  className,
}) => {
  return (
    <Card className={cn(className)}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center font-bold text-white text-base">
          {name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-text-primary truncate">{name}</h4>
          <p className="text-xs text-text-secondary font-medium truncate">ID: {id}</p>
        </div>
      </div>

      <div className="space-y-3 border-t border-border pt-4 mb-4">
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-text-muted">Department</span>
          <span className="text-text-primary font-semibold flex items-center gap-1">
            <GraduationCap className="w-3.5 h-3.5" />
            {department}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-text-muted">Year</span>
          <span className="text-text-primary font-semibold flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {year}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-text-muted">Eligibility</span>
          <Badge variant="success" size="sm">
            <span className="w-1.5 h-1.5 rounded-full bg-success-500 mr-1" />
            {status}
          </Badge>
        </div>
      </div>

      <Link href="/student/profile">
        <Button variant="outline" size="sm" className="w-full gap-2 justify-center">
          <Settings className="w-3.5 h-3.5" />
          View Profile
        </Button>
      </Link>
    </Card>
  );
};
import React from "react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Lock, ExternalLink } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PrivacyCardProps {
  title: string;
  message: string;
  buttonText: string;
  buttonHref: string;
  className?: string;
}

export const PrivacyCard: React.FC<PrivacyCardProps> = ({
  title,
  message,
  buttonText,
  buttonHref,
  className,
}) => {
  return (
    <Card className={cn("bg-primary-50 border-primary-100", className)}>
      <div className="flex items-start gap-3">
        <div className="p-2 bg-primary-100 rounded-xl shrink-0">
          <Lock className="w-5 h-5 text-primary-700" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-text-primary">{title}</h4>
          <p className="text-sm text-text-secondary mt-1 leading-relaxed">{message}</p>
          <Link href={buttonHref}>
            <Button variant="secondary" size="sm" className="mt-3 gap-1.5">
              {buttonText}
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};
import React from "react";
import { Card } from "./Card";
import { Button } from "./Button";
import { RefreshCw } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  onRefresh?: () => void;
  isLoading?: boolean;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  onRefresh,
  isLoading = false,
  icon,
  action,
}) => {
  return (
    <Card className="p-10 text-center border-border/50">
      <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center">
        {icon || (
          <svg className="w-8 h-8 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )}
      </div>
      <h3 className="font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-sm text-text-secondary max-w-sm mx-auto mb-5 leading-relaxed">{description}</p>
      {action ? (
        action
      ) : onRefresh ? (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRefresh}
          isLoading={isLoading}
          className="gap-1.5"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      ) : null}
    </Card>
  );
};

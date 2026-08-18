import React from "react";
import { Card } from "./Card";
import { Button } from "./Button";
import { AlertTriangle, RefreshCw } from "lucide-react";
import Link from "next/link";

interface ActionProps {
  label: string;
  onClick?: () => void;
  href?: string;
}

interface ErrorStateProps {
  title: string;
  message: string;
  onRetry?: () => void;
  isLoading?: boolean;
  action?: ActionProps;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  onRetry,
  isLoading = false,
  action,
}) => {
  return (
    <Card className="p-10 text-center border-error-100 bg-error-50">
      <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-error-100 flex items-center justify-center">
        <AlertTriangle className="w-8 h-8 text-error-600" />
      </div>
      <h3 className="font-semibold text-error-700 mb-2">{title}</h3>
      <p className="text-sm text-error-600 max-w-sm mx-auto mb-5 leading-relaxed">{message}</p>
      {(onRetry || action) && (
        <div className="flex gap-2 justify-center">
          {onRetry && (
            <Button
              variant="danger"
              size="sm"
              onClick={onRetry}
              isLoading={isLoading}
              className="gap-1.5"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
          )}
          {action && (
            action.href ? (
              <Link href={action.href}>
                <Button variant="secondary" size="sm">
                  {action.label}
                </Button>
              </Link>
            ) : (
              <Button variant="secondary" size="sm" onClick={action.onClick}>
                {action.label}
              </Button>
            )
          )}
        </div>
      )}
    </Card>
  );
};
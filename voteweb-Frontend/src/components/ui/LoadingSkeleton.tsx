import React from "react";
import { Card } from "./Card";

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome skeleton */}
      <div className="space-y-2">
        <div className="h-6 w-48 bg-primary-100 rounded-xl animate-shimmer" />
        <div className="h-4 w-64 bg-primary-100 rounded-xl animate-shimmer" />
      </div>

      {/* Election Card skeleton */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary-100 animate-shimmer" />
          <div className="h-6 w-40 bg-primary-100 rounded-xl animate-shimmer" />
        </div>
        <div className="h-4 w-full bg-primary-100 rounded-xl animate-shimmer mb-2" />
        <div className="h-4 w-3/4 bg-primary-100 rounded-xl animate-shimmer mb-4" />
        <div className="h-10 w-32 bg-primary-100 rounded-xl animate-shimmer" />
      </Card>

      {/* Stats skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-5">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 animate-shimmer" />
              <div className="h-4 w-24 bg-primary-100 rounded-xl animate-shimmer" />
            </div>
            <div className="h-8 w-20 bg-primary-100 rounded-xl animate-shimmer mb-1" />
            <div className="h-4 w-28 bg-primary-100 rounded-xl animate-shimmer" />
          </Card>
        ))}
      </div>

      {/* Voting Status skeleton */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary-100 animate-shimmer" />
          <div className="h-6 w-36 bg-primary-100 rounded-xl animate-shimmer" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary-100 animate-shimmer shrink-0" />
              <div className="flex-1">
                <div className="h-4 w-24 bg-primary-100 rounded-xl animate-shimmer mb-1" />
                <div className="h-3 w-28 bg-primary-100 rounded-xl animate-shimmer" />
              </div>
              <div className="h-8 w-24 bg-primary-100 rounded-xl animate-shimmer shrink-0" />
            </div>
          ))}
        </div>
      </Card>

      {/* Activity skeleton */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary-100 animate-shimmer" />
          <div className="h-6 w-36 bg-primary-100 rounded-xl animate-shimmer" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 animate-shimmer shrink-0" />
              <div className="flex-1">
                <div className="h-4 w-32 bg-primary-100 rounded-xl animate-shimmer mb-1" />
                <div className="h-3 w-24 bg-primary-100 rounded-xl animate-shimmer" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Actions skeleton */}
      <div className="space-y-2">
        <div className="h-4 w-32 bg-primary-100 rounded-xl animate-shimmer" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-4">
              <div className="w-10 h-10 rounded-xl bg-primary-100 animate-shimmer mb-3" />
              <div className="h-4 w-24 bg-primary-100 rounded-xl animate-shimmer mb-1" />
              <div className="h-3 w-32 bg-primary-100 rounded-xl animate-shimmer" />
            </Card>
          ))}
        </div>
      </div>

      {/* Profile skeleton */}
      <Card className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary-100 animate-shimmer" />
          <div>
            <div className="h-5 w-32 bg-primary-100 rounded-xl animate-shimmer mb-1" />
            <div className="h-3 w-24 bg-primary-100 rounded-xl animate-shimmer" />
          </div>
        </div>
        <div className="space-y-3 border-t border-border pt-4 mb-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between">
              <div className="h-3 w-20 bg-primary-100 rounded-xl animate-shimmer" />
              <div className="h-3 w-24 bg-primary-100 rounded-xl animate-shimmer" />
            </div>
          ))}
        </div>
        <div className="h-10 w-full bg-primary-100 rounded-xl animate-shimmer" />
      </Card>

      {/* Privacy Card skeleton */}
      <Card className="p-4 bg-primary-50 border-primary-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-100 animate-shimmer shrink-0" />
          <div className="flex-1">
            <div className="h-5 w-28 bg-primary-100 rounded-xl animate-shimmer mb-1" />
            <div className="h-3 w-48 bg-primary-100 rounded-xl animate-shimmer mb-3" />
            <div className="h-9 w-28 bg-primary-100 rounded-xl animate-shimmer" />
          </div>
        </div>
      </Card>
    </div>
  );
};
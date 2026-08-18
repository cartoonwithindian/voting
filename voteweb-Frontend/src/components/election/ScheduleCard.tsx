import React from "react";
import { Card } from "../ui/Card";
import { Calendar, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScheduleCardProps {
  className?: string;
}

export const ScheduleCard: React.FC<ScheduleCardProps> = ({ className }) => {
  const schedule = [
    { label: "Today", date: "10 August", status: "Voting Open", time: "9:00 AM – 5:00 PM", isToday: true },
    { label: "Tomorrow", date: "11 August", status: "Results Pending", time: "—", isToday: false },
  ];

  return (
    <Card className={cn("h-full", className)}>
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-primary-100 rounded-xl">
          <Calendar className="w-5 h-5 text-primary-700" />
        </div>
        <h3 className="font-semibold text-text-primary">Election Schedule</h3>
      </div>

      <div className="space-y-4">
        {schedule.map((day, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium ${day.isToday ? "text-primary-700" : "text-text-secondary"}`}>
                {day.label}
              </span>
              {day.isToday && (
                <span className="px-2 py-0.5 text-[10px] font-medium bg-primary-100 text-primary-700 rounded-full">
                  Today
                </span>
              )}
            </div>
            <div className="pl-6 space-y-1.5 border-l border-border">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-600" />
                <span className="text-sm font-medium text-text-primary">{day.date}</span>
              </div>
              <div className="pl-6 flex items-center gap-2 text-sm text-text-secondary">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>{day.time}</span>
              </div>
              <div className="pl-6 flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-success-500 shrink-0" />
                <span className="font-medium text-success-600">{day.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
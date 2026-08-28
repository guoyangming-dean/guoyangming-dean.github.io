import * as React from "react";
import { cn } from "@/lib/utils";

interface TimelineItemProps {
  title: string;
  subtitle: string;
  date: string;
  isLast?: boolean;
  aside?: React.ReactNode;
  children?: React.ReactNode;
}

export default function TimelineItem({
  title,
  subtitle,
  date,
  isLast = false,
  aside,
  children,
}: TimelineItemProps) {
  return (
    <div className="relative flex gap-6">
      <div className="flex flex-col items-center">
        <div
          className="flex h-[18px] w-[18px] rounded-full border border-purple-500/50 bg-background dark:bg-muted z-10"
        />
        {!isLast && (
          <div className="w-px grow bg-gradient-to-b from-purple-500/50 to-pink-500/30 dark:from-purple-500/30 dark:to-pink-500/10" />
        )}
      </div>
      <div className={cn("min-w-0 flex-1 pb-8", isLast ? "pb-0" : "")}>
        <div className="rounded-lg -m-3 p-3 origin-left transition-all duration-300 ease-in-out hover:scale-[1.012] hover:shadow-md hover:bg-background/60 hover:ring-1 hover:ring-purple-500/20 dark:hover:bg-card/20">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex flex-col gap-0.5">
              <h3 className="font-medium">{title}</h3>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
              <p className="text-xs text-muted-foreground/70 mb-2">{date}</p>
            </div>
            {aside && <div className="shrink-0">{aside}</div>}
          </div>
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}

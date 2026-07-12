"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  defaultTab?: string;
  className?: string;
}

export function Tabs({ items, defaultTab, className }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab ?? items[0]?.id);
  const active = items.find((item) => item.id === activeTab) ?? items[0];

  return (
    <div className={cn("w-full", className)}>
      <div
        role="tablist"
        className="flex gap-1 overflow-x-auto border-b border-zinc-200 dark:border-zinc-800"
      >
        {items.map((item) => (
          <button
            key={item.id}
            role="tab"
            type="button"
            aria-selected={item.id === activeTab}
            disabled={item.disabled}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "-mb-px border-b-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors",
              "disabled:cursor-not-allowed disabled:opacity-50",
              item.id === activeTab
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="pt-4">
        {active?.content}
      </div>
    </div>
  );
}

"use client";

import { createContext, useContext } from "react";
import type { LogisticsData } from "./types";

const LogisticsDataContext = createContext<LogisticsData | null>(null);

export function LogisticsDataProvider({
  data,
  children,
}: {
  data: LogisticsData;
  children: React.ReactNode;
}) {
  return <LogisticsDataContext.Provider value={data}>{children}</LogisticsDataContext.Provider>;
}

export function useLogisticsData(): LogisticsData {
  const ctx = useContext(LogisticsDataContext);
  if (!ctx) throw new Error("useLogisticsData must be used inside LogisticsDataProvider");
  return ctx;
}

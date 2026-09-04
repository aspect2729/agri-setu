"use client";

import { createContext, useContext } from "react";
import type { BuyerData } from "./types";

const BuyerDataContext = createContext<BuyerData | null>(null);

export function BuyerDataProvider({ data, children }: { data: BuyerData; children: React.ReactNode }) {
  return <BuyerDataContext.Provider value={data}>{children}</BuyerDataContext.Provider>;
}

export function useBuyerData(): BuyerData {
  const ctx = useContext(BuyerDataContext);
  if (!ctx) throw new Error("useBuyerData must be used inside BuyerDataProvider");
  return ctx;
}

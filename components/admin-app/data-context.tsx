"use client";

import { createContext, useContext } from "react";
import type { AdminData } from "./types";

const AdminDataContext = createContext<AdminData | null>(null);

export function AdminDataProvider({ data, children }: { data: AdminData; children: React.ReactNode }) {
  return <AdminDataContext.Provider value={data}>{children}</AdminDataContext.Provider>;
}

export function useAdminData(): AdminData {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error("useAdminData must be used inside AdminDataProvider");
  return ctx;
}

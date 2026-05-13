import { createContext, useContext } from "react";

export interface NurAppContextValue {
  launchWizard(): void;
  modelReady: boolean;
  refreshModelReady(): Promise<void>;
}

export const NurAppContext = createContext<NurAppContextValue | null>(null);

export function useNurApp(): NurAppContextValue {
  const ctx = useContext(NurAppContext);
  if (!ctx) {
    throw new Error("useNurApp must be used inside NurAppContext.Provider");
  }
  return ctx;
}

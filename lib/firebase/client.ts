"use client";

import { readPortfolioFromFirestore } from "./rest";
import type { PortfolioData } from "./types";

export async function getLivePortfolioData(): Promise<PortfolioData> {
  return readPortfolioFromFirestore();
}

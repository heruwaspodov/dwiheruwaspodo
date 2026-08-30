import { cache } from "react";
import { readPortfolioFromFirestore } from "./rest";
import type { PortfolioData } from "./types";

export const getPortfolioData = cache(async (): Promise<PortfolioData> => readPortfolioFromFirestore());

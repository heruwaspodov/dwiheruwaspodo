"use client";

import { useEffect, useState } from "react";
import { getLivePortfolioData } from "./client";
import type { PortfolioData } from "./types";

export function useLivePortfolioData(initialData: PortfolioData): PortfolioData {
  const [data, setData] = useState(initialData);

  useEffect(() => {
    let active = true;
    getLivePortfolioData()
      .then((latest) => {
        if (active) setData(latest);
      })
      .catch((error) => {
        console.error("Unable to refresh portfolio data from Firestore", error);
      });

    return () => {
      active = false;
    };
  }, []);

  return data;
}

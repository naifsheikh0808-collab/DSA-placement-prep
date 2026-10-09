"use client";

import { useState, useEffect } from "react";
import { loadProgress, updateProblemStatus, type UserProgress } from "@/lib/db";

export function useProgressStore() {
  const [progress, setProgress] = useState<Record<string, UserProgress>>({});

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const setStatus = (problemId: string, status: UserProgress["status"], notes?: string) => {
    const updated = updateProblemStatus(problemId, status, notes);
    setProgress((prev) => ({ ...prev, [problemId]: updated }));
  };

  return { progress, setStatus, updateStatus: setStatus };
}

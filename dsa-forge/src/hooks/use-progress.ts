"use client";

import { useState, useEffect } from "react";
import { loadProgress, updateProblemStatus, type UserProgress } from "@/lib/db";
import type { ProgressStatus } from "@/lib/types";

export function useProgressStore() {
  const [progress, setProgress] = useState<Record<string, UserProgress>>({});

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const setStatus = (problemId: string, status: ProgressStatus, notes?: string) => {
    const updated = updateProblemStatus(problemId, status, notes);
    setProgress((prev) => ({ ...prev, [problemId]: updated }));
  };

  const markSolved = (problemId: string) => setStatus(problemId, "solved");
  const markAttempted = (problemId: string) => setStatus(problemId, "attempted");
  const markRevise = (problemId: string) => setStatus(problemId, "revise");

  return {
    progress,
    setStatus,
    updateStatus: setStatus,
    markSolved,
    markAttempted,
    markRevise,
  };
}

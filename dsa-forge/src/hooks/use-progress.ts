"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  EMPTY_PROGRESS,
  PROGRESS_UPDATED_EVENT,
  getProgressSnapshot,
  invalidateProgressCache,
  updateProblemStatus,
  type UserProgress,
} from "@/lib/db";
import type { ProgressStatus } from "@/lib/types";

export { PROGRESS_UPDATED_EVENT };

const STORAGE_KEY = "dsaforge_progress";

function subscribeToProgress(onStoreChange: () => void) {
  // Another tab wrote to localStorage — drop the cache and re-read.
  const onStorage = (e: StorageEvent) => {
    if (e.key !== null && e.key !== STORAGE_KEY) return;
    invalidateProgressCache();
    onStoreChange();
  };

  window.addEventListener(PROGRESS_UPDATED_EVENT, onStoreChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(PROGRESS_UPDATED_EVENT, onStoreChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function useProgressStore() {
  const progress = useSyncExternalStore(
    subscribeToProgress,
    getProgressSnapshot,
    () => EMPTY_PROGRESS
  );

  const setStatus = useCallback(
    (problemId: string, status: ProgressStatus, notes?: string) => {
      // updateProblemStatus persists under the canonical problem id and fires
      // PROGRESS_UPDATED_EVENT, which re-renders every subscribed store.
      updateProblemStatus(problemId, status, notes);
    },
    []
  );

  const markSolved = useCallback(
    (problemId: string) => setStatus(problemId, "solved"),
    [setStatus]
  );
  const markAttempted = useCallback(
    (problemId: string) => setStatus(problemId, "attempted"),
    [setStatus]
  );
  const markRevise = useCallback(
    (problemId: string) => setStatus(problemId, "revise"),
    [setStatus]
  );

  return {
    progress,
    refresh: () => {
      invalidateProgressCache();
      return getProgressSnapshot();
    },
    setStatus,
    updateStatus: setStatus,
    markSolved,
    markAttempted,
    markRevise,
  };
}

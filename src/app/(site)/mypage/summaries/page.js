"use client";

import AllNotes from "@/components/AllNotes";
import AuthGuard from "@/components/AuthGuard";
import { loadMockStudyNotePage } from "@/mocks/all-notes";

export default function MySummariesPage() {
  return (
    <AuthGuard>
      <AllNotes
        scope="mine"
        loadPage={loadMockStudyNotePage}
        accessState="authorized"
      />
    </AuthGuard>
  );
}

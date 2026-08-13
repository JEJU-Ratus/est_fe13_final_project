"use client";

import { use } from "react";
import AllNotes from "@/components/AllNotes";
import {
  getMockSummaryNoteAccess,
  loadMockStudyNotePage,
} from "@/mocks/all-notes";

export default function SummaryNotesPage({ params }) {
  const { summaryId } = use(params);
  const accessState = getMockSummaryNoteAccess(summaryId);

  return (
    <AllNotes
      key={summaryId}
      scope="summary"
      summaryId={summaryId}
      loadPage={loadMockStudyNotePage}
      accessState={accessState}
    />
  );
}

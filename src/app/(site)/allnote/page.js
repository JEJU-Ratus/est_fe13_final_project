"use client";

import AllNotes from "./AllNotes";
import { loadMockStudyNotePage, MOCK_BANNERS } from "@/mocks/all-notes";

export default function AllNotePage() {
  return (
    <AllNotes
      scope="all"
      loadPage={loadMockStudyNotePage}
      banner={MOCK_BANNERS.validInternal}
      accessState="public"
    />
  );
}

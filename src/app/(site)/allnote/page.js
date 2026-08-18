"use client";

import { Suspense, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AllNotes from "@/components/AllNotes";
import Loading from "@/components/Loading";
import { useAuth } from "@/components/AuthProvider";
import { loadMockStudyNotePage, MOCK_BANNERS } from "@/mocks/all-notes";

const NOTES_PAGE_SIZE = 12;

function formatDate(createdAt) {
  return createdAt.slice(0, 10).replaceAll("-", ".");
}

function AllNoteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthLoading, supabase, user } = useAuth();
  const isMineScope = searchParams.get("scope") === "mine";

  useEffect(() => {
    if (isMineScope && !isAuthLoading && !user) {
      router.replace("/login?returnTo=%2Fallnote%3Fscope%3Dmine");
    }
  }, [isAuthLoading, isMineScope, router, user]);

  const loadMyStudyNotePage = useCallback(
    async (_scope, cursor = null) => {
      if (!user) {
        throw new Error("UNAUTHENTICATED");
      }

      let notesQuery = supabase
        .from("learning_notes")
        .select("id, summary_id, title, is_quiz_completed, created_at")
        .eq("author_id", user.id)
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .limit(NOTES_PAGE_SIZE + 1);

      if (cursor) {
        notesQuery = notesQuery.or(
          `created_at.lt.${cursor.createdAt},and(created_at.eq.${cursor.createdAt},id.lt.${cursor.noteId})`,
        );
      }

      const [{ data: notes, error: notesError }, { count, error: countError }, profileResult] =
        await Promise.all([
          notesQuery,
          supabase
            .from("learning_notes")
            .select("id", { count: "exact", head: true })
            .eq("author_id", user.id),
          supabase.from("profiles").select("nickname").eq("id", user.id).maybeSingle(),
        ]);

      if (notesError || countError || profileResult.error) {
        throw notesError || countError || profileResult.error;
      }

      const hasMore = notes.length > NOTES_PAGE_SIZE;
      const pageNotes = notes.slice(0, NOTES_PAGE_SIZE);
      const summaryIds = [...new Set(pageNotes.map(note => note.summary_id))];
      const { data: summaries, error: summariesError } = summaryIds.length
        ? await supabase.from("summaries").select("id, topic").in("id", summaryIds)
        : { data: [], error: null };

      if (summariesError) {
        throw summariesError;
      }

      const topicsBySummaryId = new Map(
        (summaries ?? []).map(summary => [summary.id, summary.topic]),
      );
      const lastNote = pageNotes.at(-1);

      return {
        totalCount: count ?? 0,
        items: pageNotes.map(note => ({
          noteId: note.id,
          summaryId: note.summary_id,
          authorNickname: profileResult.data?.nickname ?? "알 수 없는 사용자",
          topic: topicsBySummaryId.get(note.summary_id) ?? note.title,
          createdAt: note.created_at,
          createdAtDisplay: formatDate(note.created_at),
          quizStatus: note.is_quiz_completed ? "completed" : "notStarted",
        })),
        nextCursor:
          hasMore && lastNote
            ? { createdAt: lastNote.created_at, noteId: lastNote.id }
            : null,
        hasMore,
      };
    },
    [supabase, user],
  );

  if (isMineScope && (isAuthLoading || !user)) {
    return <Loading />;
  }

  return (
    <AllNotes
      scope={isMineScope ? "mine" : "all"}
      loadPage={isMineScope ? loadMyStudyNotePage : loadMockStudyNotePage}
      banner={MOCK_BANNERS.validInternal}
      accessState="public"
    />
  );
}

export default function AllNotePage() {
  return (
    <Suspense fallback={<Loading />}>
      <AllNoteContent />
    </Suspense>
  );
}

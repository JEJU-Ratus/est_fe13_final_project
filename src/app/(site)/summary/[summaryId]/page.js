import EmptyState from "@/components/EmptyState";
import NoteItem from "@/components/NoteItem";
import {
  getMockSummary,
  getMockSummaryNotes,
} from "@/mocks/summary-detail";
import { notFound } from "next/navigation";
import styles from "./page.module.scss";

export default async function SummaryDetailPage({ params }) {
  const { summaryId } = await params;
  const summary = getMockSummary(summaryId);

  if (!summary) {
    notFound();
  }

  const notes = getMockSummaryNotes(summaryId);

  return (
    <section className={styles["notes-section"]}>
      <div className={styles["action-row"]}>
        {/* 로그인·소유권 서비스가 연결되기 전에는 변경 동작을 실행할 수 없습니다. */}
        <button className={styles["create-button"]} type="button" disabled>
          노트 생성
        </button>
        <button className={styles["delete-button"]} type="button" disabled>
          삭제
        </button>
      </div>

      <div className={styles["section-heading"]}>
        <h2>학습노트 리스트</h2>
      </div>

      {notes.length > 0 ? (
        notes.map(note => (
          <NoteItem
            key={note.noteId}
            summaryId={note.summaryId}
            noteId={note.noteId}
            authorNickname={note.authorNickname}
            topic={summary.topic}
            createdAt={note.createdAtDisplay}
            quizStatus={note.quizStatus}
          />
        ))
      ) : (
        <EmptyState message="현재 리스트가 없습니다." />
      )}
    </section>
  );
}

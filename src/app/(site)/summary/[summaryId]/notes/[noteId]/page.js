import Link from "next/link";
import { notFound } from "next/navigation";
import DeleteActionButton from "./DeleteActionButton";
import {
  getCurrentUserId,
  getStudyNote,
  getSummary,
} from "@/lib/summary-detail";
import styles from "./page.module.scss";

const NOTE_SECTIONS = [
  { key: "learnedSummary", label: "오늘 배운 내용 요약" },
  { key: "reflection", label: "오늘의 회고" },
  { key: "references", label: "참고자료" },
];

export default async function NoteDetailPage({ params }) {
  const { summaryId, noteId } = await params;
  const [summary, note, userId] = await Promise.all([
    getSummary(summaryId),
    getStudyNote(summaryId, noteId),
    getCurrentUserId(),
  ]);

  if (!summary || !note) {
    notFound();
  }

  const isOwner = Boolean(userId && userId === note.authorId);

  return (
    <section
      className={styles["note-detail"]}
      data-summary-id={summaryId}
      data-note-id={noteId}
    >
      <div className={styles["note-heading"]}>
        <h2>{note.title}</h2>
      </div>
      <div className={styles["accent-line"]} />

      <div className={styles["note-content"]}>
        {NOTE_SECTIONS.map(section => (
          <section className={styles["content-section"]} key={section.key}>
            <h3>{section.label}</h3>
            <p>{note[section.key] || "내용이 없습니다."}</p>
          </section>
        ))}
      </div>

      {isOwner && (
        <div className={styles["note-actions"]}>
          <Link
            className={styles["edit-button"]}
            href={`/summary/${summaryId}/notes/${noteId}/edit`}
          >
            수정
          </Link>
          <DeleteActionButton
            className={styles["delete-button"]}
            summaryId={summaryId}
            noteId={noteId}
          />
        </div>
      )}
    </section>
  );
}

import { getMockStudyNote } from "@/mocks/summary-detail";
import { notFound } from "next/navigation";
import styles from "./page.module.scss";

const noteSections = [
  { key: "learnedSummary", label: "오늘 배운 내용 요약" },
  { key: "reflection", label: "오늘의 회고" },
  { key: "references", label: "참고자료" },
];

export default async function NoteDetailPage({ params }) {
  const { summaryId, noteId } = await params;
  const note = getMockStudyNote(summaryId, noteId);

  if (!note) {
    notFound();
  }

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
        {noteSections.map(section => (
          <section className={styles["content-section"]} key={section.key}>
            <h3>{section.label}</h3>
            <p>{note[section.key]}</p>
          </section>
        ))}
      </div>

      <div className={styles["note-actions"]}>
        {/* 작성자 판정과 변경 서비스가 연결되기 전에는 두 동작을 실행하지 않습니다. */}
        <button className={styles["edit-button"]} type="button" disabled>
          수정
        </button>
        <button className={styles["delete-button"]} type="button" disabled>
          삭제
        </button>
      </div>
    </section>
  );
}

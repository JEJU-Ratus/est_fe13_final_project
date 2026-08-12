import { getMockStudyNote } from "@/mocks/summary-detail";
import { notFound } from "next/navigation";
import styles from "./page.module.scss";

const noteFields = [
  {
    id: "learned-summary",
    name: "learnedSummary",
    valueKey: "learnedSummary",
    label: "오늘 배운 내용 요약",
    placeholder: "오늘 배운 내용 입력",
  },
  {
    id: "reflection",
    name: "reflection",
    valueKey: "reflection",
    label: "오늘의 회고",
    placeholder: "오늘의 회고 입력",
  },
  {
    id: "references",
    name: "references",
    valueKey: "references",
    label: "참고자료",
    placeholder: "참고자료 입력",
  },
];

export default async function EditNotePage({ params }) {
  const { summaryId, noteId } = await params;
  const note = getMockStudyNote(summaryId, noteId);

  if (!note) {
    notFound();
  }

  return (
    <section
      className={styles["note-form-section"]}
      data-summary-id={summaryId}
      data-note-id={noteId}
    >
      <form className={styles["note-form"]}>
        <div className={styles["title-field"]}>
          <label className={styles["screen-reader-only"]} htmlFor="note-title">
            제목
          </label>
          <input
            id="note-title"
            name="title"
            type="text"
            maxLength={50}
            placeholder="제목을 입력하세요"
            defaultValue={note.title}
          />
        </div>

        <div className={styles["accent-line"]} />

        <div className={styles["body-fields"]}>
          {noteFields.map(field => (
            <div className={styles["body-field"]} key={field.id}>
              <label htmlFor={`edit-${field.id}`}>{field.label}</label>
              <textarea
                id={`edit-${field.id}`}
                name={field.name}
                maxLength={1000}
                placeholder={field.placeholder}
                defaultValue={note[field.valueKey]}
              />
            </div>
          ))}
        </div>

        <div className={styles["form-actions"]}>
          {/* mock은 읽기 전용이므로 기존 값만 표시하고 제출 요청을 만들지 않습니다. */}
          <button type="button" disabled>
            수정 완료
          </button>
        </div>
      </form>
    </section>
  );
}

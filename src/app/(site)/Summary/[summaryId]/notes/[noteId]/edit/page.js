import styles from "./page.module.scss";

const noteFields = [
  {
    id: "learned-summary",
    name: "learnedSummary",
    label: "오늘 배운 내용 요약",
    placeholder: "오늘 배운 내용 입력",
  },
  {
    id: "reflection",
    name: "reflection",
    label: "오늘의 회고",
    placeholder: "오늘의 회고 입력",
  },
  {
    id: "references",
    name: "references",
    label: "참고자료",
    placeholder: "참고자료 입력",
  },
];

export default async function EditNotePage({ params }) {
  const { summaryId, noteId } = await params;

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
              />
            </div>
          ))}
        </div>

        <div className={styles["form-actions"]}>
          {/* 기존 값 조회와 수정 서비스가 연결되기 전에는 제출 요청을 만들지 않습니다. */}
          <button type="button" disabled>
            수정 완료
          </button>
        </div>
      </form>
    </section>
  );
}

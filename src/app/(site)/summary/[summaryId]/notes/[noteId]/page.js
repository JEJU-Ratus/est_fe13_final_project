import styles from "./page.module.scss";

const noteSections = ["오늘 배운 내용 요약", "오늘의 회고", "참고자료"];

export default async function NoteDetailPage({ params }) {
  const { summaryId, noteId } = await params;

  return (
    <section
      className={styles["note-detail"]}
      data-summary-id={summaryId}
      data-note-id={noteId}
    >
      <div className={styles["quiz-action"]}>
        {/* 로그인 상태와 저장 퀴즈를 확인할 수 있을 때 서비스 단계에서 활성화합니다. */}
        <button type="button" disabled>
          퀴즈 풀기
        </button>
      </div>

      <div className={styles["note-heading"]}>
        <h2>제목</h2>
      </div>
      <div className={styles["accent-line"]} />

      <div className={styles["note-content"]}>
        {noteSections.map(section => (
          <section className={styles["content-section"]} key={section}>
            <h3>{section}</h3>
            {/* 학습노트 조회 결과가 연결될 자리이며 임시 본문을 생성하지 않습니다. */}
            <p />
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

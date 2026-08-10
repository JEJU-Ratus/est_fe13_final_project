import styles from "./layout.module.scss";

export default async function SummaryDetailLayout({ children, params }) {
  const { summaryId } = await params;

  return (
    <main className={styles["summary-detail"]} data-summary-id={summaryId}>
      <div className={styles["summary-container"]}>
        <section className={styles["summary-section"]}>
          <header className={styles["topic-header"]}>
            <h1>생성 주제</h1>
            {/* 서비스 연결 전에는 권한과 저장 상태를 판단할 수 없어 북마크를 표시 전용으로 둡니다. */}
            <button className={styles["bookmark-button"]} type="button" disabled>
              {/* 숨김 텍스트가 버튼 이름을 제공하므로 아이콘의 중복 낭독을 막습니다. */}
              <span className="material-symbols-outlined" aria-hidden="true">
                bookmark_add
              </span>
              <span className={styles["screen-reader-only"]}>북마크</span>
            </button>
          </header>

          <article className={styles["summary-content"]}>
            {/* 실제 요약 데이터가 연결되면 이 표시 영역의 내용만 교체합니다. */}
            <p className={styles["summary-placeholder"]}>AI 요약본</p>
          </article>
        </section>

        {children}
      </div>
    </main>
  );
}

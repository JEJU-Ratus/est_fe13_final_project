"use client";

import styles from "./SummaryId.module.scss";
import summaries from "@/mocks/summaries.json";
import { use, useState } from "react";

export default function AiSummaryLayout({ children, params }) {
  const { summaryId } = use(params);
  const summary = summaries.find(item => item.summaryId === summaryId);
  const aiSummarySections = summary?.aiSummary?.sections ?? [];
  const [isBookmarked, setBookmarked] = useState(false);

  function handleBookmarkToggle() {
    setBookmarked(currentIsBookmarked => !currentIsBookmarked);
  }

  return (
    <main className={styles["Ai-page"]}>
      <div className={styles["Ai-container"]}>
        <section className={styles["ai-summary"]}>
          <div className={styles["Ai-header"]}>
            <h2 className={styles["Ai-title"]}>{summary?.topic ?? ""}</h2>

            {/* 토글의 현재 상태와 동작 목적을 보조 기술 사용자에게 전달 */}
            <button
              className={styles["bookmark-btn"]}
              type="button"
              aria-label={isBookmarked ? "북마크 삭제" : "북마크 추가"}
              aria-pressed={isBookmarked}
              onClick={handleBookmarkToggle}
            >
              <span
                className={`material-symbols-outlined ${styles["bookmark-icon"]} ${isBookmarked ? styles["is-active"] : ""}`}
                aria-hidden="true"
              >
                bookmark_add
              </span>
            </button>
          </div>

          <div className={styles["Ai-content"]}>
            <h3>{summary?.aiSummary?.title ?? ""}</h3>
            {aiSummarySections.map((section, index) => (
              <div key={section.sectionId}>
                <h4>{`${index + 1}. ${section.heading}`}</h4>
                {section.content.map(content => (
                  <p key={content}>{content}</p>
                ))}
              </div>
            ))}
          </div>
        </section>

        {children}
      </div>
    </main>
  );
}

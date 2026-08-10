"use client";

import Link from "next/link";
import styles from "./SummaryId.module.scss";
import { useState } from "react";

export default function AiSummary() {
  const [isBookmarked, setBookmarked] = useState(false);

  return (
    <>
      <main className={styles["Ai-page"]}>
        <section className={styles["Ai-container"]}>
          <div className={styles["Ai-header"]}>
            <Link href="/" className={styles["title-link"]}>
              <h2 className={styles["Ai-title"]}>생성 주제</h2>
            </Link>
            <button
              className={styles["bookmark-btn"]}
              type="button"
              aria-label={isBookmarked ? "북마크 삭제" : "북마크 추가"}
              aria-pressed={isBookmarked}
              onClick={() => setBookmarked(!isBookmarked)}
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
            <h3>제목</h3>
            <h4>1. 한 줄 요약</h4>
            <h4>2. 개념 설명</h4>
            <h4>3. 기본 문법</h4>
            <h4>4. 실무 예제</h4>
            <h4>5. 핵심포인트</h4>
            <p>- 꼭 기억할 내용</p>
            <h4>6. 자주 하는 실수</h4>
            <h4>7. 관련 개념</h4>
          </div>
        </section>
      </main>
    </>
  );
}

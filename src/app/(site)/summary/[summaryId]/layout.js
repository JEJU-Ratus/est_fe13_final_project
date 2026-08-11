"use client";

import styles from "./SummaryId.module.scss";
import summaries from "@/mocks/summaries.json";
import learningNotes from "@/mocks/learning-notes.json";
import bookmarks from "@/mocks/bookmarks.json";
import QuizModal from "@/components/QuizModal";
import { use, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

// TODO: Supabase 인증 연결 시 제거
const DEV_CURRENT_USER_ID = "user-001";

export default function AiSummaryLayout({ children, params }) {
  const { summaryId } = use(params);
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);
  const isNoteDetailPage =
    pathSegments.length === 4 &&
    pathSegments[0] === "summary" &&
    pathSegments[1] === summaryId &&
    pathSegments[2] === "notes" &&
    pathSegments[3] !== "new";
  const noteId = isNoteDetailPage ? pathSegments[3] : null;
  const summary = summaries.find(item => item.summaryId === summaryId);
  const learningNote = learningNotes.find(
    note => note.summaryId === summaryId && note.noteId === noteId,
  );
  const aiSummarySections = summary?.aiSummary?.sections ?? [];
  const isOwner = learningNote?.authorId === DEV_CURRENT_USER_ID;
  const shouldShowQuizButton = isNoteDetailPage && isOwner;
  // TODO: Supabase 연결 시 현재 인증 사용자의 북마크 조회 결과로 교체
  const initialIsBookmarked = bookmarks.some(
    bookmark =>
      bookmark.userId === DEV_CURRENT_USER_ID && bookmark.summaryId === summaryId,
  );
  // TODO: 실제 퀴즈 데이터 연결 시 조회된 퀴즈와 이용 가능 상태로 교체
  const quiz = null;
  const isQuizUnavailable = true;
  const [isBookmarked, setBookmarked] = useState(() => initialIsBookmarked);
  const [isQuizModalOpen, setQuizModalOpen] = useState(false);
  const bookmarkLabel = isBookmarked ? "북마크 삭제" : "북마크에 담기";

  function handleBookmarkToggle() {
    // TODO: Supabase 연결 시 현재 상태에 따라 bookmarks INSERT 또는 DELETE 요청으로 교체
    setBookmarked(currentIsBookmarked => !currentIsBookmarked);
  }

  function handleQuizModalOpen() {
    setQuizModalOpen(true);
  }

  function handleQuizModalClose() {
    setQuizModalOpen(false);
  }

  return (
    <main className={styles["Ai-page"]}>
      <div className={styles["Ai-container"]}>
        <section className={styles["ai-summary"]}>
          <div className={styles["Ai-header"]}>
            {/* 링크의 이동 목적을 제목과 함께 전달하고 북마크 버튼은 별도 조작 요소로 유지 */}
            <Link
              className={styles["topic-link"]}
              href={`/summary/${summaryId}`}
              aria-label={`${summary?.topic ?? "요약 노트"} 요약 상세로 이동`}
              data-tooltip="요약 상세로 이동"
            >
              <h2 className={styles["Ai-title"]}>{summary?.topic ?? ""}</h2>
            </Link>

            {/* 토글의 현재 상태와 동작 목적을 보조 기술 사용자에게 전달 */}
            <button
              className={styles["bookmark-btn"]}
              type="button"
              aria-label={bookmarkLabel}
              aria-pressed={isBookmarked}
              data-tooltip={bookmarkLabel}
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

          {shouldShowQuizButton && (
            <div className={styles["quiz-action"]}>
              <button type="button" onClick={handleQuizModalOpen}>
                퀴즈 풀기
              </button>
            </div>
          )}

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

        <QuizModal
          isOpen={shouldShowQuizButton && isQuizModalOpen}
          quiz={quiz}
          isUnavailable={isQuizUnavailable}
          onClose={handleQuizModalClose}
        />
      </div>
    </main>
  );
}

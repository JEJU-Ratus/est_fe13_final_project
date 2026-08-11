"use client";

import styles from "./AllSummary.module.scss";
import SummaryItemCard from "./SummaryItemCard";
import summaries from "@/mocks/summaries.json";
import users from "@/mocks/users.json";
import bookmarks from "@/mocks/bookmarks.json";
import { useEffect, useRef, useState } from "react";

const BATCH_SIZE = {
  mobile: 3,
  tablet: 6,
  pc: 12,
};

function getBatchSize(mobileMediaQuery, tabletMediaQuery) {
  if (mobileMediaQuery.matches) {
    return BATCH_SIZE.mobile;
  }

  if (tabletMediaQuery.matches) {
    return BATCH_SIZE.tablet;
  }

  return BATCH_SIZE.pc;
}

function getSummariesByView(view, currentUserId) {
  if (view === "mine") {
    return summaries
      .filter(summary => summary.authorId === currentUserId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  if (view === "bookmarks") {
    return bookmarks
      .filter(bookmark => bookmark.userId === currentUserId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(bookmark => summaries.find(summary => summary.summaryId === bookmark.summaryId))
      .filter(Boolean);
  }

  return summaries;
}

export default function AllSummary({ title, view = "all", currentUserId }) {
  const [batchSize, setBatchSize] = useState(BATCH_SIZE.mobile);
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE.mobile);
  const batchSizeRef = useRef(BATCH_SIZE.mobile);
  const sentinelRef = useRef(null);
  const filteredSummaries = getSummariesByView(view, currentUserId);
  const summaryCards = filteredSummaries.map(summary => {
    const author = users.find(user => user.userId === summary.authorId);
    const isBookmarked = bookmarks.some(
      bookmark => bookmark.userId === currentUserId && bookmark.summaryId === summary.summaryId,
    );

    return {
      ...summary,
      nickname: author?.nickname ?? "알 수 없는 사용자",
      profileImageUrl: author?.profileImageUrl ?? "/images/main_profile.webp",
      isBookmarked,
    };
  });
  const resultKey = summaryCards.map(summary => summary.summaryId).join("|");
  const hasMore = visibleCount < summaryCards.length;
  // TODO: Supabase 연결 시 client-side slice 방식에서 DB pagination 조회·append 방식으로 교체
  const visibleSummaryCards = summaryCards.slice(0, visibleCount);

  useEffect(() => {
    const mobileMediaQuery = window.matchMedia("(max-width: 480px)");
    const tabletMediaQuery = window.matchMedia("(min-width: 481px) and (max-width: 1024px)");

    function handleBreakpointChange() {
      const nextBatchSize = getBatchSize(mobileMediaQuery, tabletMediaQuery);

      batchSizeRef.current = nextBatchSize;
      setBatchSize(nextBatchSize);
      setVisibleCount(currentCount => Math.max(currentCount, nextBatchSize));
    }

    handleBreakpointChange();
    mobileMediaQuery.addEventListener("change", handleBreakpointChange);
    tabletMediaQuery.addEventListener("change", handleBreakpointChange);

    return () => {
      mobileMediaQuery.removeEventListener("change", handleBreakpointChange);
      tabletMediaQuery.removeEventListener("change", handleBreakpointChange);
    };
  }, []);

  useEffect(() => {
    setVisibleCount(batchSizeRef.current);
  }, [view, currentUserId, resultKey]);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel || !hasMore) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      entries => {
        if (!entries[0]?.isIntersecting) {
          return;
        }

        setVisibleCount(currentCount =>
          Math.min(currentCount + batchSize, summaryCards.length),
        );
      },
      {
        root: null,
        rootMargin: "200px 0px",
        threshold: 0,
      },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [batchSize, hasMore, summaryCards.length, visibleCount]);

  return (
    <main className={styles["summary-page"]}>
      <section className={styles["summary-container"]}>
        <div className={styles["summary-header"]}>
          <div className={styles["summary-title-row"]}>
            <h2 className={styles["summary-title"]}>{title}</h2>
            {/* 아이콘만 표시되는 버튼의 용도를 스크린 리더 사용자에게 전달 */}
            <button className={styles["bookmark-btn"]} type="button" aria-label="북마크">
              <span className={`material-symbols-outlined ${styles["bookmark-icon"]}`} aria-hidden="true">
                bookmark_add
              </span>
            </button>
          </div>
          <div className={styles["search-box"]}>
            <input type="text" placeholder="주제 검색하기" />

            <span className={`material-symbols-outlined ${styles["search-icon"]}`} aria-hidden="true">
              search
            </span>
          </div>
        </div>

        <div className={styles["summary-content"]}>
          {visibleSummaryCards.map(summary => (
            <SummaryItemCard
              key={summary.summaryId}
              summaryId={summary.summaryId}
              nickname={summary.nickname}
              profileImageUrl={summary.profileImageUrl}
              title={summary.title}
              excerpt={summary.excerpt}
              createdAt={summary.createdAt}
              isPrivate={summary.isPrivate}
              initialIsBookmarked={summary.isBookmarked}
            />
          ))}
        </div>

        {hasMore && (
          /* 화면에 보이는 콘텐츠가 아닌 다음 묶음 감지 지점이므로 보조 기술에서 제외 */
          <div className={styles["scroll-sentinel"]} ref={sentinelRef} aria-hidden="true" />
        )}
      </section>
    </main>
  );
}

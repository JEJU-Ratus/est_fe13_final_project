"use client";

import styles from "./AllSummary.module.scss";
import SummaryItemCard from "./SummaryItemCard";
import summaries from "@/mocks/summaries.json";
import users from "@/mocks/users.json";
import bookmarks from "@/mocks/bookmarks.json";
import { useEffect, useRef, useState } from "react";

// 화면 크기별 한 번에 보여줄 카드 개수
const BATCH_SIZE = {
  mobile: 3,
  tablet: 6,
  pc: 12,
};

// 현재 화면이 모바일, 태블릿, PC인지 판단해 카드 개수를 반환하는 함수
function getBatchSize(mobileMediaQuery, tabletMediaQuery) {
  if (mobileMediaQuery.matches) {
    return BATCH_SIZE.mobile;
  }

  if (tabletMediaQuery.matches) {
    return BATCH_SIZE.tablet;
  }

  return BATCH_SIZE.pc;
}

// 전체 요약, 내 요약, 북마크 요약을 구분해 데이터를 반환하는 함수
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

// AllSummary 컴포넌트
export default function AllSummary({ title, view = "all", currentUserId }) {
  // 검색어 저장
  const [searchTerm, setSearchTerm] = useState("");

  // batchSize: 스크롤 시 한 번에 추가할 카드 개수
  // visibleCount: 현재 화면에 보여주고 있는 전체 카드 개수
  const [batchSize, setBatchSize] = useState(BATCH_SIZE.mobile);
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE.mobile);

  // 현재 화면의 batchSize 값을 저장
  const batchSizeRef = useRef(BATCH_SIZE.mobile);

  // 무한 스크롤의 마지막 지점을 감지하기 위한 ref
  const sentinelRef = useRef(null);

  // 검색어 앞뒤 공백 제거 및 소문자 변환
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  // 현재 view에 맞는 데이터 가져오기
  const summariesByView = getSummariesByView(view, currentUserId);

  // TODO: Supabase 연결 시 client-side 검색 필터를 DB 검색 쿼리로 교체
  // topic을 기준으로 검색어가 포함된 요약만 필터링
  const filteredSummaries = normalizedSearchTerm
    ? summariesByView.filter(summary => summary.topic.toLowerCase().includes(normalizedSearchTerm))
    : summariesByView;

  // 카드 렌더링에 필요한 작성자 정보와 북마크 여부 추가
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

  // 검색 또는 필터 결과가 변경됐는지 확인하기 위한 값
  const resultKey = summaryCards.map(summary => summary.summaryId).join("|");

  // 아직 추가로 보여줄 카드가 남아 있는지 확인
  const hasMore = visibleCount < summaryCards.length;

  // TODO: Supabase 연결 시 client-side slice 방식에서 DB pagination 조회·append 방식으로 교체
  // 현재 visibleCount만큼의 카드만 화면에 렌더링
  const visibleSummaryCards = summaryCards.slice(0, visibleCount);

  // 화면 크기에 따라 batchSize 변경
  useEffect(() => {
    const mobileMediaQuery = window.matchMedia("(max-width: 480px)");
    const tabletMediaQuery = window.matchMedia("(min-width: 481px) and (max-width: 1024px)");

    function handleBreakpointChange() {
      const nextBatchSize = getBatchSize(mobileMediaQuery, tabletMediaQuery);

      batchSizeRef.current = nextBatchSize;
      setBatchSize(nextBatchSize);

      // 화면 크기가 변경돼도 기존에 보던 카드 개수가 갑자기 줄어들지 않도록 처리
      setVisibleCount(currentCount => Math.max(currentCount, nextBatchSize));
    }

    // 처음 렌더링될 때 현재 화면 크기 확인
    handleBreakpointChange();

    // 화면 크기가 breakpoint를 넘을 때마다 실행
    mobileMediaQuery.addEventListener("change", handleBreakpointChange);
    tabletMediaQuery.addEventListener("change", handleBreakpointChange);

    // 컴포넌트가 사라질 때 이벤트 제거
    return () => {
      mobileMediaQuery.removeEventListener("change", handleBreakpointChange);
      tabletMediaQuery.removeEventListener("change", handleBreakpointChange);
    };
  }, []);

  // view나 검색 결과가 바뀌면 현재 화면 크기의 초기 카드 개수로 reset
  useEffect(() => {
    setVisibleCount(batchSizeRef.current);
  }, [view, currentUserId, normalizedSearchTerm, resultKey]);

  // 무한 스크롤 동작
  useEffect(() => {
    const sentinel = sentinelRef.current;

    // 감지할 요소가 없거나 더 보여줄 카드가 없으면 종료
    if (!sentinel || !hasMore) {
      return undefined;
    }

    // sentinel이 화면 근처에 들어왔는지 감지
    const observer = new IntersectionObserver(
      entries => {
        if (!entries[0]?.isIntersecting) {
          return;
        }

        // 현재 화면 크기의 batchSize만큼 카드 추가
        setVisibleCount(currentCount => Math.min(currentCount + batchSize, summaryCards.length));
      },
      {
        root: null,

        // 사용자가 끝까지 내려가기 약 200px 전에 다음 카드 추가
        rootMargin: "200px 0px",

        threshold: 0,
      },
    );

    // sentinel 감시 시작
    observer.observe(sentinel);

    // effect 재실행 또는 컴포넌트 제거 시 감시 종료
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

            {/* 아이콘 버튼의 용도를 스크린 리더 사용자에게 전달 */}
            <button className={styles["bookmark-btn"]} type="button" aria-label="북마크">
              <span className={`material-symbols-outlined ${styles["bookmark-icon"]}`} aria-hidden="true">
                bookmark_add
              </span>
            </button>
          </div>

          <div className={styles["search-box"]}>
            {/* 주제 검색 */}
            <input
              type="text"
              placeholder="주제 검색하기"
              value={searchTerm}
              onChange={event => setSearchTerm(event.target.value)}
            />

            <span className={`material-symbols-outlined ${styles["search-icon"]}`} aria-hidden="true">
              search
            </span>
          </div>
        </div>

        <div className={styles["summary-content"]}>
          {/* 현재 화면에 보여줄 카드 개수만 렌더링 */}
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

        {/* 다음 카드 묶음을 불러오기 위한 무한 스크롤 감지 지점 */}
        {hasMore && <div className={styles["scroll-sentinel"]} ref={sentinelRef} aria-hidden="true" />}
      </section>
    </main>
  );
}

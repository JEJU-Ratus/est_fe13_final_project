"use client";

import styles from "./AllSummary.module.scss";
import SummaryItemCard from "./SummaryItemCard";
import summaries from "@/mocks/summaries.json";
import users from "@/mocks/users.json";
import bookmarks from "@/mocks/bookmarks.json";
import { useEffect, useRef, useState } from "react";

//한 화면에 보여줄 카드의 수
const BATCH_SIZE = {
  mobile: 3,
  tablet: 6,
  pc: 12,
};

// 현재 화면이 모바일,태블릿,pc인지 판단하는 함수
function getBatchSize(mobileMediaQuery, tabletMediaQuery) {
  if (mobileMediaQuery.matches) {
    return BATCH_SIZE.mobile;
  }

  if (tabletMediaQuery.matches) {
    return BATCH_SIZE.tablet;
  }

  return BATCH_SIZE.pc;
}

//전체요약본 or 내 요약본 or 북마크 요약본인지 구분하는 함수
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

//컴포넌트 시작
export default function AllSummary({ title, view = "all", currentUserId }) {
  const [searchTerm, setSearchTerm] = useState(""); //검색어 저장
  /* 현재 화면에서 스크롤하면 몇 개씩 추가될지
  batchSize -> 한 번에 몇 개씩 증가하는지 , 
  visibleCount -> 현재 총 몇 개를 화면에 보여주고 있는지 */
  const [batchSize, setBatchSize] = useState(BATCH_SIZE.mobile);
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE.mobile);
  const batchSizeRef = useRef(BATCH_SIZE.mobile);
  const sentinelRef = useRef(null); // 무한스크롤 끝 감지 센서
  const normalizedSearchTerm = searchTerm.trim().toLowerCase(); //검색어 정리
  const summariesByView = getSummariesByView(view, currentUserId); //현재 페이지에 맞는 데이터 가져오기
  // TODO: Supabase 연결 시 client-side 검색 필터를 DB 검색 쿼리로 교체
  // 검색기능
  const filteredSummaries = normalizedSearchTerm
    ? summariesByView.filter(summary => summary.topic.toLowerCase().includes(normalizedSearchTerm))
    : summariesByView;
  // 카드에 필요한 추가정보 체크
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
  //현재 검색/필터값이 바뀌었는지 알아차리는 표시값
  const resultKey = summaryCards.map(summary => summary.summaryId).join("|");
  // 더 보여줄 데이터가 있는지 확인하는 코드
  const hasMore = visibleCount < summaryCards.length;
  // TODO: Supabase 연결 시 client-side slice 방식에서 DB pagination 조회·append 방식으로 교체
  // 실제 브라우저에서 보여줄 데이터
  const visibleSummaryCards = summaryCards.slice(0, visibleCount);
  //화면 크기감지
  useEffect(() => {
    const mobileMediaQuery = window.matchMedia("(max-width: 480px)");
    const tabletMediaQuery = window.matchMedia("(min-width: 481px) and (max-width: 1024px)");

    function handleBreakpointChange() {
      const nextBatchSize = getBatchSize(mobileMediaQuery, tabletMediaQuery);
      // 화면이 갑자기 줄어드는 걸 방지
      batchSizeRef.current = nextBatchSize;
      setBatchSize(nextBatchSize);
      setVisibleCount(currentCount => Math.max(currentCount, nextBatchSize));
    }
    //모바일 경계를 넘으면 실행할 함수
    handleBreakpointChange();
    mobileMediaQuery.addEventListener("change", handleBreakpointChange);
    tabletMediaQuery.addEventListener("change", handleBreakpointChange);
    //이벤트 제거
    return () => {
      mobileMediaQuery.removeEventListener("change", handleBreakpointChange);
      tabletMediaQuery.removeEventListener("change", handleBreakpointChange);
    };
  }, []);
  // 검색/뷰가 바뀌면 초기화
  useEffect(() => {
    setVisibleCount(batchSizeRef.current);
  }, [view, currentUserId, normalizedSearchTerm, resultKey]);

  useEffect(() => {
    //무한 스크롤 동작 구현
    const sentinel = sentinelRef.current;

    if (!sentinel || !hasMore) {
      return undefined;
    }
    // 특정 요소가 화면에 들어왔는지 감지하는 기능
    const observer = new IntersectionObserver(
      entries => {
        if (!entries[0]?.isIntersecting) {
          return;
        }

        setVisibleCount(currentCount => Math.min(currentCount + batchSize, summaryCards.length));
      },
      {
        root: null,
        //스크롤 200px 전 로딩
        rootMargin: "200px 0px",
        threshold: 0,
      },
    );
    // 스크롤 감지 종료
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
            // 검색 기능
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
          // 현재 화면에 보여줄 카드 개수만 렌더링
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

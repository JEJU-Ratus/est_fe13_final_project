"use client";

import styles from "./AllSummary.module.scss";
import EmptyState from "./EmptyState";
import SummaryItemCard from "./SummaryItemCard";
import { useEffect, useRef, useState } from "react";

// 화면 크기별 한 번에 보여줄 카드 개수
const BATCH_SIZE = {
  mobile: 3,
  tablet: 6,
  pc: 12,
};

// 현재 화면이 모바일, 태블릿, PC인지 판단해 카드 개수를 반환
function getBatchSize(mobileMediaQuery, tabletMediaQuery) {
  if (mobileMediaQuery.matches) {
    return BATCH_SIZE.mobile;
  }

  if (tabletMediaQuery.matches) {
    return BATCH_SIZE.tablet;
  }

  return BATCH_SIZE.pc;
}

export default function AllSummary({ title, summaries = [] }) {
  // 검색어 저장
  const [searchTerm, setSearchTerm] = useState("");

  // 무한 스크롤 시 한 번에 추가할 카드 개수
  const [batchSize, setBatchSize] = useState(BATCH_SIZE.mobile);

  // 현재 화면에 표시할 카드 개수
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE.mobile);

  // 현재 화면 크기의 batchSize 값을 유지
  const batchSizeRef = useRef(BATCH_SIZE.mobile);

  // 무한 스크롤의 마지막 지점을 감지하기 위한 ref
  const sentinelRef = useRef(null);

  // 검색어의 앞뒤 공백을 제거하고 소문자로 변환
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  // TODO: 추후 검색 데이터가 많아지면 Supabase 검색 쿼리 방식으로 변경
  // topic에 검색어가 포함된 요약 노트만 필터링
  const filteredSummaries = normalizedSearchTerm
    ? summaries.filter(summary => summary.topic?.toLowerCase().includes(normalizedSearchTerm))
    : summaries;

  // 화면에 사용할 요약 카드 목록
  const summaryCards = filteredSummaries;

  // 검색 결과가 변경됐는지 확인하기 위한 id 조합
  const resultKey = summaryCards.map(summary => summary.id).join("|");

  // 추가로 보여줄 카드가 남아 있는지 확인
  const hasMore = visibleCount < summaryCards.length;

  // TODO: 추후 데이터가 많아지면 Supabase pagination 방식으로 변경
  // 현재 visibleCount만큼의 카드만 화면에 표시
  const visibleSummaryCards = summaryCards.slice(0, visibleCount);

  // 화면 크기가 변경될 때 한 번에 표시할 카드 개수 조정
  useEffect(() => {
    const mobileMediaQuery = window.matchMedia("(max-width: 480px)");
    const tabletMediaQuery = window.matchMedia("(min-width: 481px) and (max-width: 1024px)");

    function handleBreakpointChange() {
      // 현재 화면 크기에 맞는 카드 개수 계산
      const nextBatchSize = getBatchSize(mobileMediaQuery, tabletMediaQuery);

      batchSizeRef.current = nextBatchSize;
      setBatchSize(nextBatchSize);

      // 화면 크기가 변경돼도 기존에 보던 카드 개수가 갑자기 줄어들지 않도록 처리
      setVisibleCount(currentCount => Math.max(currentCount, nextBatchSize));
    }

    // 처음 렌더링될 때 현재 화면 크기 확인
    handleBreakpointChange();

    // 화면 크기가 breakpoint를 넘을 때마다 카드 개수 다시 계산
    mobileMediaQuery.addEventListener("change", handleBreakpointChange);
    tabletMediaQuery.addEventListener("change", handleBreakpointChange);

    // 컴포넌트가 사라질 때 이벤트 제거
    return () => {
      mobileMediaQuery.removeEventListener("change", handleBreakpointChange);
      tabletMediaQuery.removeEventListener("change", handleBreakpointChange);
    };
  }, []);

  // 검색 결과가 바뀌면 현재 화면 크기의 초기 카드 개수로 reset
  useEffect(() => {
    setVisibleCount(batchSizeRef.current);
  }, [normalizedSearchTerm, resultKey]);

  // 화면 하단 감지 지점을 이용한 무한 스크롤 처리
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
        {/* 페이지 제목 및 검색 영역 */}
        <div className={styles["summary-header"]}>
          <div className={styles["summary-title-row"]}>
            <h2 className={styles["summary-title"]}>{title}</h2>

            {/* 북마크 아이콘 버튼의 용도를 보조 기술 사용자에게 전달 */}
            <button className={styles["bookmark-btn"]} type="button" aria-label="북마크">
              <span className={`material-symbols-outlined ${styles["bookmark-icon"]}`} aria-hidden="true">
                bookmark_add
              </span>
            </button>
          </div>

          {/* 주제를 기준으로 요약 노트 검색 */}
          <div className={styles["search-box"]}>
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

        {/* 현재 화면에 표시할 요약 카드 목록 */}
        <div className={styles["summary-content"]}>
          {visibleSummaryCards.map(summary => (
            <SummaryItemCard
              key={summary.id}
              summaryId={summary.id}
              nickname={summary.nickname ?? "알 수 없는 사용자"}
              profileImageUrl={summary.profile_image_url ?? "/images/main_profile.webp"}
              title={summary.title}
              excerpt={summary.excerpt}
              createdAt={summary.created_at}
              isPrivate={summary.is_locked}
              initialIsBookmarked={summary.isBookmarked ?? false}
            />
          ))}
        </div>

        {/* 다음 카드 묶음을 불러오기 위한 무한 스크롤 감지 지점 */}
        {hasMore && <div className={styles["scroll-sentinel"]} ref={sentinelRef} aria-hidden="true" />}
      </section>
    </main>
  );
}

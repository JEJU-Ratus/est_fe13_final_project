"use client";

import styles from "./AllSummary.module.scss";
import EmptyState from "../EmptyState";
import SummaryItemCard from "../SummaryItemCard";
import useAll from "./useAll";

export default function AllSummary({ title, summaries = [] }) {
  //useAll.js 실행
  const allSummary = useAll(summaries);

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
              value={allSummary.searchTerm}
              onChange={event => allSummary.setSearchTerm(event.target.value)}
            />

            <span className={`material-symbols-outlined ${styles["search-icon"]}`} aria-hidden="true">
              search
            </span>
          </div>
        </div>

        {/* 현재 화면에 표시할 요약 카드 목록 */}
        <div className={styles["summary-content"]}>
          {allSummary.visibleSummaryCards.map(summary => (
            <SummaryItemCard
              key={summary.id}
              summaryId={summary.id}
              nickname={summary.nickname ?? "알 수 없는 사용자"}
              profileImageUrl={summary.profile_image_url ?? "/images/main_profile.webp"}
              title={summary.title}
              excerpt={summary.excerpt}
              createdAt={summary.created_at}
              isPrivate={summary.is_locked}
              isBookmarked={summary.isBookmarked ?? false}
              onBookmarkToggle={allSummary.handleBookmarkToggle}
            />
          ))}
        </div>

        {/* 다음 카드 묶음을 불러오기 위한 무한 스크롤 감지 지점 */}
        {allSummary.hasMore && (
          <div className={styles["scroll-sentinel"]} ref={allSummary.sentinelRef} aria-hidden="true" />
        )}
      </section>
    </main>
  );
}

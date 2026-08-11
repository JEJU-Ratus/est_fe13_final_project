import styles from "./AllSummary.module.scss";
import EmptyState from "./EmptyState";
import SummaryItemCard from "./SummaryItemCard";
import summaries from "@/mocks/summaries.json";
import users from "@/mocks/users.json";
import bookmarks from "@/mocks/bookmarks.json";

function getSummariesByView(view, currentUserId) {
  if (view === "mine") {
    return summaries
      .filter((summary) => summary.authorId === currentUserId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  if (view === "bookmarks") {
    return bookmarks
      .filter((bookmark) => bookmark.userId === currentUserId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map((bookmark) =>
        summaries.find((summary) => summary.summaryId === bookmark.summaryId),
      )
      .filter(Boolean);
  }

  return summaries;
}

export default function AllSummary({ title, view = "all", currentUserId }) {
  const filteredSummaries = getSummariesByView(view, currentUserId);
  const summaryCards = filteredSummaries.map((summary) => {
    const author = users.find((user) => user.userId === summary.authorId);
    const isBookmarked = bookmarks.some(
      (bookmark) =>
        bookmark.userId === currentUserId && bookmark.summaryId === summary.summaryId,
    );

    return {
      ...summary,
      nickname: author?.nickname ?? "알 수 없는 사용자",
      profileImageUrl: author?.profileImageUrl ?? "/images/main_profile.webp",
      isBookmarked,
    };
  });
  const emptyStateMessage =
    view === "bookmarks"
      ? "북마크한 요약 노트가 없습니다."
      : "요약 노트가 아직 생성되지 않았습니다.";

  return (
    <main className={styles["summary-page"]}>
      <section className={styles["summary-container"]}>
        <div className={styles["summary-header"]}>
          <h2 className={styles["summary-title"]}>{title}</h2>

          <div className={styles["search-box"]}>
            <input type="text" placeholder="주제 검색하기" />

            <span className={`material-symbols-outlined ${styles["search-icon"]}`} aria-hidden="true">
              search
            </span>
          </div>
        </div>

        <div className={styles["summary-content"]}>
          {summaryCards.length === 0 ? (
            <EmptyState message={emptyStateMessage} />
          ) : (
            summaryCards.map((summary) => (
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
            ))
          )}
        </div>
      </section>
    </main>
  );
}

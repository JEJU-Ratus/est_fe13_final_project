import styles from "./AllSummary.module.scss";
import SummaryItemCard from "./SummaryItemCard";
import summaries from "@/mocks/summaries.json";
import users from "@/mocks/users.json";
import bookmarks from "@/mocks/bookmarks.json";

const currentUserId = "user-001";

export default function AllSummary({ title }) {
  const summaryCards = summaries.map((summary) => {
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
          {summaryCards.map((summary) => (
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
      </section>
    </main>
  );
}

import styles from "./AllSummary.module.scss";
import SummaryItemCard from "./SummaryItemCard";

export default function AllSummary() {
  const DemoCards = Array.from({ length: 12 });

  return (
    <section className={styles["summary-container"]}>
      <div className={styles["summary-header"]}>
        <h2 className={styles["summary-title"]}>Title</h2>

        <div className={styles["search-box"]}>
          <input type="text" placeholder="주제 검색하기" />

          <span className={`material-symbols-outlined ${styles["search-icon"]}`} aria-hidden="true">
            search
          </span>
        </div>
      </div>

      <div className={styles["summary-content"]}>
        {DemoCards.map((_, index) => (
          <SummaryItemCard key={index} />
        ))}
      </div>
    </section>
  );
}

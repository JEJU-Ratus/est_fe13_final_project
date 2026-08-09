import styles from "./AllSummary.module.scss";
import SummaryItemCard from "./SummaryItemCard";

export default function AllSummary({ title }) {
  const demoCards = Array.from({ length: 12 });

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
          {demoCards.map((_, index) => (
            <SummaryItemCard key={index} />
          ))}
        </div>
      </section>
    </main>
  );
}

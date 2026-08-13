"use client";

import styles from "./AllNotes.module.scss";

export default function AllNotes({
  scope = "mine",
  summaryId,
  banner,
  loadPage,
  initialPage,
  accessState = "checking",
}) {
  const normalizedScope = scope === "summary" ? "summary" : "mine";
  const initialItemCount = Array.isArray(initialPage?.items)
    ? initialPage.items.length
    : 0;
  const hasPageLoader = typeof loadPage === "function";
  const hasBanner = typeof banner?.imageSrc === "string" && banner.imageSrc.trim() !== "";

  return (
    <section
      className={styles["all-notes"]}
      data-scope={normalizedScope}
      data-summary-id={typeof summaryId === "string" ? summaryId : undefined}
      data-access-state={accessState}
      data-has-page-loader={hasPageLoader}
      data-initial-item-count={initialItemCount}
      data-has-banner={hasBanner}
    >
      <div className={styles["all-notes-header"]} />
      <div className={styles["all-notes-content"]} />
    </section>
  );
}

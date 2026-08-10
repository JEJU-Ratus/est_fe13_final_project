"use client";

import Image from "next/image";
import styles from "./SummaryItemCard.module.scss";
import { useState } from "react";

function formatCreatedAt(createdAt) {
  if (!createdAt) {
    return "";
  }

  const [year, month, day] = createdAt.slice(0, 10).split("-");

  if (!year || !month || !day) {
    return createdAt;
  }

  return `${year}년 ${month}월 ${day}일`;
}

export default function SummaryItemCard({
  summaryId,
  nickname = "",
  profileImageUrl = "/images/main_profile.webp",
  title = "",
  excerpt = "",
  createdAt = "",
  isPrivate = false,
  initialIsBookmarked = false,
}) {
  const [isBookmarked, setBookmarked] = useState(initialIsBookmarked);
  const formattedCreatedAt = formatCreatedAt(createdAt);

  return (
    <article className={styles["item-card"]} data-summary-id={summaryId}>
      <div className={styles["card-main"]}>
        <div className={styles["card-header"]}>
          <div className={styles["user-info"]}>
            <Image
              className={styles["profile-img"]}
              src={profileImageUrl}
              alt="사용자 프로필"
              width={32}
              height={32}
            />

            <p className={styles["nickname"]}>{nickname}</p>
          </div>

          <button
            className={styles["bookmark-btn"]}
            type="button"
            aria-label={isBookmarked ? "북마크 삭제" : "북마크 추가"}
            aria-pressed={isBookmarked}
            onClick={() => setBookmarked(!isBookmarked)}
          >
            <span
              className={`material-symbols-outlined ${styles["bookmark-icon"]} ${isBookmarked ? styles["is-active"] : ""}`}
              aria-hidden="true"
            >
              bookmark_add
            </span>
          </button>
        </div>

        <div className={styles["card-content"]}>
          <h4 className={styles["card-title"]}>{title}</h4>

          <p className={styles["card-desc"]}>{excerpt}</p>
        </div>
      </div>

      <div className={styles["card-footer"]}>
        <time className={styles["created-date"]} dateTime={createdAt}>
          {formattedCreatedAt}
        </time>

        {isPrivate && (
          <span className={`material-symbols-outlined ${styles["lock-icon"]}`} aria-label="비공개 게시물">
            lock
          </span>
        )}
      </div>
    </article>
  );
}

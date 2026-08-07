"use client";

import Image from "next/image";
import styles from "./SummaryItemCard.module.scss";
import { useState } from "react";
import Link from "next/link";

export default function SummaryItemCard() {
  const [isBookmarked, setBookmarked] = useState(false);

  return (
    <article className={styles["item-card"]}>
      <div className={styles["card-main"]}>
        <div className={styles["card-header"]}>
          <div className={styles["user-info"]}>
            <Image
              className={styles["profile-img"]}
              src="/images/main_profile.webp"
              alt="사용자 프로필"
              width={32}
              height={32}
            />

            <p className={styles["nickname"]}>NickName</p>
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
          <h4 className={styles["card-title"]}>Lorem ipsum dolor sit amet</h4>

          <p className={styles["card-desc"]}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt Lorem ipsum dolor
            sit amet, consectetur.
          </p>
        </div>
      </div>

      <div className={styles["card-footer"]}>
        <time className={styles["created-date"]} dateTime="2026-08-06">
          2026년 08월 06일
        </time>

        <span className={`material-symbols-outlined ${styles["lock-icon"]}`} aria-label="비공개 게시물">
          lock
        </span>
      </div>
    </article>
  );
}

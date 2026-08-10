"use client";

import { useState } from "react";
import Image from "next/image";
import SummaryItemCard from "@/components/SummaryItemCard";
import styles from "./page.module.scss";

const summaryCards = Array.from({ length: 4 });

export default function Mypage() {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [nickname, setNickname] = useState("사용자 닉네임");
  const [introduction, setIntroduction] = useState("프론트엔드 학습을 기록하고 있어요.");
  const [draftNickname, setDraftNickname] = useState(nickname);
  const [draftIntroduction, setDraftIntroduction] = useState(introduction);

  function handleStartProfileEdit() {
    setDraftNickname(nickname);
    setDraftIntroduction(introduction);
    setIsEditingProfile(true);
  }

  function handleCompleteProfileEdit() {
    setNickname(draftNickname);
    setIntroduction(draftIntroduction);
    setIsEditingProfile(false);
  }

  return (
    <main className={styles["mypage"]}>
      <div className={styles.container}>
        <h1>마이페이지</h1>

        <section className={styles["profile-section"]} aria-labelledby="profile-title">
          <h2 id="profile-title">내 프로필</h2>

          <div className={styles["profile-content"]}>
            <div className={styles["profile-image"]}>
              <Image src="/images/프로필.webp" alt="사용자 프로필 이미지" width={120} height={120} />
            </div>

            <div className={styles["profile-details"]}>
              {isEditingProfile ? (
                <div className={styles["profile-form"]}>
                  <label>
                    <span>닉네임</span>
                    <input value={draftNickname} onChange={event => setDraftNickname(event.target.value)} />
                  </label>
                  <label>
                    <span>한 줄 소개</span>
                    <input value={draftIntroduction} onChange={event => setDraftIntroduction(event.target.value)} />
                  </label>
                </div>
              ) : (
                <div className={styles["profile-text"]}>
                  <p className={styles.nickname}>{nickname}</p>
                  <p>{introduction}</p>
                </div>
              )}

              <button
                className={styles["profile-edit-button"]}
                type="button"
                onClick={isEditingProfile ? handleCompleteProfileEdit : handleStartProfileEdit}
              >
                {isEditingProfile ? "수정완료" : "프로필 수정"}
              </button>
            </div>
          </div>
        </section>

        <section className={styles["learning-note-section"]} aria-labelledby="learning-note-title">
          <div className={styles["section-heading"]}>
            <h2 id="learning-note-title">학습 노트</h2>
            <div className={styles["more-link"]}>
              <span>더보기</span>
              <span className={`material-symbols-outlined ${styles["more-icon"]}`} aria-hidden="true">
                arrow_forward_ios
              </span>
            </div>
          </div>

          <div className={styles["learning-note-table"]}>
            <div className={styles["table-header"]}>
              <span>상태</span>
              <span>작성자</span>
              <span>학습 노트 제목</span>
              <span>연관 요약 노트 주제</span>
              <span>작성일</span>
            </div>
            <p className={styles["empty-message"]}>현재 리스트가 없습니다.</p>
          </div>
        </section>

        <section className={styles["summary-section"]} aria-labelledby="my-summary-title">
          <div className={styles["section-heading"]}>
            <h2 id="my-summary-title">내 요약 노트</h2>
            <div className={styles["more-link"]}>
              <span>더보기</span>
              <span className={`material-symbols-outlined ${styles["more-icon"]}`} aria-hidden="true">
                arrow_forward_ios
              </span>
            </div>
          </div>

          <div className={styles["summary-list"]}>
            {summaryCards.map((_, index) => (
              <SummaryItemCard key={`my-summary-${index}`} />
            ))}
          </div>
        </section>

        <section className={styles["summary-section"]} aria-labelledby="bookmark-title">
          <div className={styles["section-heading"]}>
            <h2 id="bookmark-title">북마크</h2>
            <div className={styles["more-link"]}>
              <span>더보기</span>
              <span className={`material-symbols-outlined ${styles["more-icon"]}`} aria-hidden="true">
                arrow_forward_ios
              </span>
            </div>
          </div>

          <div className={styles["summary-list"]}>
            {summaryCards.map((_, index) => (
              <SummaryItemCard key={`bookmark-${index}`} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

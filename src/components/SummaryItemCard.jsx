"use client";

import Image from "next/image";
import Link from "next/link";
import NotePwModal from "./NotePwModal";
import styles from "./SummaryItemCard.module.scss";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// 작성일을 "YYYY년 MM월 DD일" 형식으로 변환
function formatCreatedAt(createdAt) {
  if (!createdAt) {
    return "";
  }

  const [year, month, day] = createdAt.slice(0, 10).split("-");

  // 날짜 형식이 올바르지 않으면 원래 값을 그대로 반환
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
  // 북마크 여부와 비밀번호 모달 열림 상태 관리
  const [isBookmarked, setBookmarked] = useState(initialIsBookmarked);
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);

  // 카드에 표시할 작성일 형식 변환
  const formattedCreatedAt = formatCreatedAt(createdAt);

  // 비공개 요약 노트 비밀번호 모달 열기
  function handlePasswordModalOpen() {
    setPasswordModalOpen(true);
  }

  // 비밀번호 모달 닫기
  function handlePasswordModalClose() {
    setPasswordModalOpen(false);
  }

  // 비공개 요약 노트 비밀번호 검증
  function handlePasswordSubmit() {
    // TODO: Supabase/서버 연결 시 실제 비밀번호 검증 요청으로 교체
    // TODO: 비밀번호 검증 성공 시 /summary/${summaryId}로 이동
    // TODO: 비밀번호 검증 실패 시 서버 응답에 따라 errorMessage 설정
    // TODO: 실제 비밀번호 검증 데이터 연결 후 제거/교체
  }

  // 북마크 추가/삭제 처리
  async function handleBookmarkToggle(e) {
    // 북마크 클릭 시 카드 상세 페이지 이동 방지
    e.preventDefault();
    e.stopPropagation();

    // 브라우저에서 사용할 Supabase 클라이언트 생성
    const supabase = createClient();

    // 현재 로그인 사용자 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 로그인 사용자가 없으면 북마크 동작 중단
    if (!user) return;

    // 이미 북마크된 경우 bookmarks 테이블에서 삭제
    if (isBookmarked) {
      const { error } = await supabase.from("bookmarks").delete().eq("user_id", user.id).eq("summary_id", summaryId);

      if (error) {
        console.error("북마크 삭제 실패:", error);
        return;
      }
    } else {
      // 북마크되지 않은 경우 bookmarks 테이블에 추가
      const { error } = await supabase.from("bookmarks").insert({
        user_id: user.id,
        summary_id: summaryId,
      });

      if (error) {
        console.error("북마크 추가 실패:", error);
        return;
      }
    }

    // DB 작업 성공 후 화면의 북마크 상태 변경
    setBookmarked(!isBookmarked);
  }

  return (
    <>
      <article className={styles["item-card"]} data-summary-id={summaryId}>
        {/* 공개 요약은 상세 페이지로 이동하고, 비공개 요약은 비밀번호 모달을 엶 */}
        {isPrivate ? (
          <button
            className={styles["card-link"]}
            type="button"
            aria-label={`${title || "요약 노트"} 비밀번호 입력`}
            aria-haspopup="dialog"
            aria-expanded={isPasswordModalOpen}
            onClick={handlePasswordModalOpen}
          />
        ) : (
          <Link
            className={styles["card-link"]}
            href={`/summary/${summaryId}`}
            aria-label={`${title || "요약 노트"} 상세 보기`}
          />
        )}

        {/* 작성자 정보와 북마크 버튼 영역 */}
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

            {/* 현재 북마크 상태에 따라 추가/삭제 동작 실행 */}
            <button
              className={styles["bookmark-btn"]}
              type="button"
              aria-label={isBookmarked ? "북마크 삭제" : "북마크 추가"}
              aria-pressed={isBookmarked}
              onClick={handleBookmarkToggle}
            >
              <span
                className={`material-symbols-outlined ${styles["bookmark-icon"]} ${isBookmarked ? styles["is-active"] : ""}`}
                aria-hidden="true"
              >
                bookmark_add
              </span>
            </button>
          </div>

          {/* 요약 노트 제목과 미리보기 내용 */}
          <div className={styles["card-content"]}>
            <h4 className={styles["card-title"]}>{title}</h4>

            <p className={styles["card-desc"]}>{excerpt}</p>
          </div>
        </div>

        {/* 작성일과 비공개 여부 표시 */}
        <div className={styles["card-footer"]}>
          <time className={styles["created-date"]} dateTime={createdAt}>
            {formattedCreatedAt}
          </time>

          {/* 비공개 요약 노트인 경우 잠금 아이콘 표시 */}
          {isPrivate && (
            <span className={`material-symbols-outlined ${styles["lock-icon"]}`} aria-label="비공개 게시물">
              lock
            </span>
          )}
        </div>
      </article>

      {/* 비공개 요약 노트 비밀번호 입력 모달 */}
      <NotePwModal isOpen={isPasswordModalOpen} onSubmit={handlePasswordSubmit} onClose={handlePasswordModalClose} />
    </>
  );
}

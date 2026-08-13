"use client";
import AuthGuard from "@/components/AuthGuard";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import EmptyState from "@/components/EmptyState";
import NoteItem from "@/components/NoteItem";
import SummaryItemCard from "@/components/SummaryItemCard";
import styles from "./page.module.scss";

// 프로필 이미지 Storage 연동: 업로드 이미지 형식과 최대 크기 설정.
const PROFILE_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const PROFILE_IMAGE_MAX_SIZE = 5 * 1024 * 1024;
const PROFILE_IMAGE_EXTENSIONS = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const mySummaryCards = [
  {
    summaryId: "summary-1",
    nickname: "프다",
    title: "React 상태 관리 핵심 정리",
    excerpt: "컴포넌트 상태와 전역 상태 관리의 차이를 핵심만 정리했어요.",
    createdAt: "2026-08-10",
  },
  {
    summaryId: "summary-2",
    nickname: "프다",
    title: "CSS Flexbox 레이아웃",
    excerpt: "자주 사용하는 Flexbox 속성과 활용 방법을 정리했어요.",
    createdAt: "2026-08-08",
  },
  {
    summaryId: "summary-3",
    nickname: "프다",
    title: "Next.js App Router 구조",
    excerpt: "App Router의 페이지와 레이아웃 구성 방식을 알아봐요.",
    createdAt: "2026-08-05",
  },
  {
    summaryId: "summary-4",
    nickname: "프다",
    title: "JavaScript 비동기 처리",
    excerpt: "Promise와 async/await를 활용하는 방법을 정리했어요.",
    createdAt: "2026-08-02",
  },
];

// TODO: 학습노트 테이블 연동 후 로그인 사용자의 작성 목록으로 교체.
const learningNotes = [
  {
    summaryId: "summary-001",
    noteId: "note-001",
    authorNickname: "사용자 닉네임",
    topic: "JavaScript 비동기 처리 학습노트",
    createdAt: "2026-08-13",
    quizStatus: "completed",
  },
];

// 실제 북마크 데이터가 연결되기 전까지 북마크 섹션의 빈 상태만 표현.
const bookmarkCards = [];

export default function Mypage() {
  // 공통 인증 정보에서 현재 로그인한 사용자와 Supabase 연결 객체를 가져오기.
  const { supabase, user } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  // 저장 요청이 진행되는 동안 수정완료 버튼을 다시 누르지 못하게 하기.
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [nickname, setNickname] = useState('사용자 닉네임');
  const [introduction, setIntroduction] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('/images/프로필.webp');
  // 프로필 이미지 Storage 연동: 저장 전 선택 파일과 미리보기 주소 관리.
  const [draftProfileImage, setDraftProfileImage] = useState(null);
  const [draftProfileImageUrl, setDraftProfileImageUrl] = useState('');
  const [draftNickname, setDraftNickname] = useState(nickname);
  const [draftIntroduction, setDraftIntroduction] = useState(introduction);
  const summaryListDragRef = useRef({
    element: null,
    startX: 0,
    startScrollLeft: 0,
    isDragging: false,
  });

  // 프로필 이미지 Storage 연동: 미리보기 변경 또는 화면 이탈 시 임시 주소 정리.
  useEffect(() => {
    // 사용이 끝난 로컬 이미지 미리보기 주소 해제.
    return () => {
      if (draftProfileImageUrl) {
        URL.revokeObjectURL(draftProfileImageUrl);
      }
    };
  }, [draftProfileImageUrl]);

  useEffect(() => {
    // 로그인 사용자 정보가 준비된 뒤에만 프로필을 조회
    if (!user) {
      return undefined;
    }

    // 사용자가 바뀌거나 페이지를 벗어나면 이전 요청 결과를 화면에 반영x.
    let isCurrentRequest = true;

    async function fetchProfile() {
      // 로그인 사용자 ID와 같은 profiles 행에서 화면에 필요한 정보만 가져오기.
      const { data, error } = await supabase
        .from("profiles")
        .select("nickname, profile_image_url, bio")
        .eq("id", user.id)
        .single();

      if (!isCurrentRequest || error) {
        return;
      }

      // 비어 있는 값은 마이페이지에서 사용하는 기본값으로 바꿔 표시.
      setNickname(data.nickname ?? "사용자 닉네임");
      setIntroduction(data.bio?.trim() ?? "");
      setProfileImageUrl(data.profile_image_url || "/images/프로필.webp");
    }

    fetchProfile();

    return () => {
      // 이미 끝난 화면의 조회 결과가 나중에 상태를 바꾸지 못하게 표시.
      isCurrentRequest = false;
    };
  }, [supabase, user]);

  function handleStartProfileEdit() {
    setDraftNickname(nickname);
    setDraftIntroduction(introduction);
    setDraftProfileImage(null);
    setDraftProfileImageUrl('');
    setIsEditingProfile(true);
  }

  // 프로필 이미지 Storage 연동: 선택 이미지 형식·크기 검증과 미리보기 표시.
  function handleProfileImageChange(event) {
    const selectedImage = event.target.files?.[0];

    if (!selectedImage) {
      return;
    }

    // JPEG, PNG, WebP 형식과 5MB 이하 파일만 허용.
    if (
      !PROFILE_IMAGE_TYPES.includes(selectedImage.type) ||
      selectedImage.size > PROFILE_IMAGE_MAX_SIZE
    ) {
      event.target.value = '';
      return;
    }

    setDraftProfileImage(selectedImage);
    setDraftProfileImageUrl(URL.createObjectURL(selectedImage));
  }

  async function handleCompleteProfileEdit() {
    if (!user || isSavingProfile) {
      return;
    }

    const nextNickname = draftNickname.trim();
    const nextIntroduction = draftIntroduction.trim();
    let nextProfileImageUrl = profileImageUrl;
    setIsSavingProfile(true);

    try {
      // 프로필 이미지 Storage 연동: 새 선택 이미지만 Public 버킷에 업로드.
      if (draftProfileImage) {
        const fileExtension = PROFILE_IMAGE_EXTENSIONS[draftProfileImage.type];
        const filePath = `${user.id}/profile.${fileExtension}`;

        // Storage 정책에 맞춰 사용자 ID 폴더에 이미지 저장.
        const { error: uploadError } = await supabase.storage
          .from('profile-images')
          .upload(filePath, draftProfileImage, {
            cacheControl: '3600',
            contentType: draftProfileImage.type,
            upsert: true,
          });

        if (uploadError) {
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from('profile-images')
          .getPublicUrl(filePath);
        nextProfileImageUrl = publicUrlData.publicUrl;
      }

      // 프로필 이미지 Storage 연동: 새 업로드 이미지가 있을 때만 DB 이미지 URL 변경.
      const profileUpdates = {
        nickname: nextNickname,
        bio: nextIntroduction,
      };

      if (draftProfileImage) {
        profileUpdates.profile_image_url = nextProfileImageUrl;
      }

      // 새 이미지의 공개 URL을 profiles 테이블에 저장.
      const { error } = await supabase
        .from("profiles")
        .update(profileUpdates)
        .eq("id", user.id);

      if (error) {
        return;
      }

      // Supabase 저장에 성공한 경우에만 화면 값을 바꾸고 수정 상태를 끝내기.
      setNickname(nextNickname);
      setIntroduction(nextIntroduction);
      // Storage 덮어쓰기 직후 이전 이미지 캐시 사용 방지.
      setProfileImageUrl(
        draftProfileImage
          ? `${nextProfileImageUrl}?updated=${Date.now()}`
          : nextProfileImageUrl,
      );
      setDraftProfileImage(null);
      setDraftProfileImageUrl('');
      setIsEditingProfile(false);
      // 저장된 프로필의 헤더 재조회 알림.
      window.dispatchEvent(new Event("profile-updated"));
    } finally {
      // 성공과 실패에 관계없이 저장 요청이 끝나면 버튼을 다시 사용
      setIsSavingProfile(false);
    }
  }

  function handleSummaryListPointerDown(event) {
    if (event.pointerType !== "mouse" || event.button !== 0) {
      return;
    }

    summaryListDragRef.current = {
      element: event.currentTarget,
      startX: event.clientX,
      startScrollLeft: event.currentTarget.scrollLeft,
      isDragging: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleSummaryListPointerMove(event) {
    const dragState = summaryListDragRef.current;

    if (dragState.element !== event.currentTarget) {
      return;
    }

    const dragDistance = event.clientX - dragState.startX;

    if (Math.abs(dragDistance) > 5) {
      dragState.isDragging = true;
    }

    if (dragState.isDragging) {
      event.preventDefault();
      event.currentTarget.scrollLeft = dragState.startScrollLeft - dragDistance;
    }
  }

  function handleSummaryListPointerEnd(event) {
    const dragState = summaryListDragRef.current;

    if (dragState.element !== event.currentTarget) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    dragState.element = null;
  }

  function handleSummaryListPointerCancel(event) {
    handleSummaryListPointerEnd(event);
    summaryListDragRef.current.isDragging = false;
  }

  function handleSummaryListClickCapture(event) {
    if (!summaryListDragRef.current.isDragging) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    summaryListDragRef.current.isDragging = false;
  }

  return (
    <AuthGuard>
      <main className={styles["mypage"]}>
        <div className={styles.container}>
          <h1>마이페이지</h1>

          <section className={styles["profile-section"]} aria-labelledby="profile-title">
            <h2 id="profile-title">내 프로필</h2>

            <div className={styles["profile-content"]}>
              {/* 프로필 이미지 Storage 연동: 수정 중 이미지 미리보기와 파일 선택 버튼 표시. */}
              <div className={styles["profile-image"]}>
                <Image
                  src={draftProfileImageUrl || profileImageUrl}
                  alt="사용자 프로필 이미지"
                  width={120}
                  height={120}
                  unoptimized={(draftProfileImageUrl || profileImageUrl).startsWith("http") || Boolean(draftProfileImageUrl)}
                />
                {isEditingProfile && (
                  <label className={styles["profile-image-selector"]}>
                    {/* 키보드·스크린 리더 사용자를 위한 프로필 이미지 선택 설명. */}
                    <span className="material-symbols-outlined" aria-hidden="true">
                      photo_camera
                    </span>
                    <span className={styles["visually-hidden"]}>프로필 이미지 선택</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      disabled={isSavingProfile}
                      onChange={handleProfileImageChange}
                    />
                  </label>
                )}
              </div>

            <div className={styles['profile-details']}>
              {isEditingProfile ? (
                <div className={styles['profile-form']}>
                  <label>
                    <input
                      value={draftNickname}
                      onChange={event => setDraftNickname(event.target.value)}
                    />
                  </label>
                  <label>
                    <input
                      value={draftIntroduction}
                      placeholder="한줄소개를 입력 해주세요"
                      onChange={event =>
                        setDraftIntroduction(event.target.value)
                      }
                    />
                  </label>
                </div>
              ) : (
                <div className={styles['profile-text']}>
                  <p className={styles.nickname}>{nickname}</p>
                  <p>{introduction || "한줄소개를 입력 해주세요"}</p>
                </div>
              )}

                <button
                  className={styles["profile-edit-button"]}
                  type="button"
                  onClick={isEditingProfile ? handleCompleteProfileEdit : handleStartProfileEdit}
                  disabled={isSavingProfile}
                >
                  {isEditingProfile ? "수정완료" : "프로필 수정"}
                </button>
              </div>
            </div>
          </section>

          <section
            className={styles["learning-note-section"]}
            aria-labelledby="learning-note-title"
          >
            <div className={styles["section-heading"]}>
              <h2 id="learning-note-title">내 학습노트 리스트</h2>
              <Link href="#" className={styles["more-link"]}>
                <span>더보기</span>
                <span
                  className={`material-symbols-outlined ${styles["more-icon"]}`}
                  aria-hidden="true"
                >
                  arrow_forward_ios
                </span>
              </Link>
            </div>

            <div className={styles["learning-note-table"]}>
              <div className={styles["table-header"]}>
                <div className={styles["table-leading"]}>
                  <span>상태</span>
                  <span>작성자</span>
                </div>
                <span className={styles["table-topic"]}>주제</span>
                <span>작성일</span>
              </div>
              {learningNotes.length === 0 ? (
                <p className={styles["empty-message"]}>현재 리스트가 없습니다.</p>
              ) : (
                learningNotes.map(note => <NoteItem key={note.noteId} {...note} />)
              )}
            </div>
          </section>

          <section className={styles["summary-section"]} aria-labelledby="my-summary-title">
            <div className={styles["section-heading"]}>
              <h2 id="my-summary-title">내 요약 노트</h2>
              <Link href="/mypage/mysummaries" className={styles["more-link"]}>
                <span>더보기</span>
                <span
                  className={`material-symbols-outlined ${styles["more-icon"]}`}
                  aria-hidden="true"
                >
                  arrow_forward_ios
                </span>
              </Link>
            </div>

            {/* 가로 카드 목록을 키보드 사용자도 직접 탐색할 수 있도록 스크롤 영역에 포커스를 허용. */}
            <div
              className={styles["summary-list"]}
              aria-label="내 요약 노트 목록"
              tabIndex={0}
              onPointerDown={handleSummaryListPointerDown}
              onPointerMove={handleSummaryListPointerMove}
              onPointerUp={handleSummaryListPointerEnd}
              onPointerCancel={handleSummaryListPointerCancel}
              onClickCapture={handleSummaryListClickCapture}
            >
              {mySummaryCards.map(summary => (
                <SummaryItemCard key={summary.summaryId} {...summary} />
              ))}
            </div>
          </section>

          <section className={styles["summary-section"]} aria-labelledby="bookmark-title">
            <div className={styles["section-heading"]}>
              <h2 id="bookmark-title">북마크</h2>
              <Link href="/mypage/bookmarks" className={styles["more-link"]}>
                <span>더보기</span>
                <span
                  className={`material-symbols-outlined ${styles["more-icon"]}`}
                  aria-hidden="true"
                >
                  arrow_forward_ios
                </span>
              </Link>
            </div>

            {/* 가로 카드 목록을 키보드 사용자도 직접 탐색할 수 있도록 스크롤 영역에 포커스를 허용. */}
            <div
              className={styles["summary-list"]}
              aria-label="북마크 목록"
              tabIndex={0}
              onPointerDown={handleSummaryListPointerDown}
              onPointerMove={handleSummaryListPointerMove}
              onPointerUp={handleSummaryListPointerEnd}
              onPointerCancel={handleSummaryListPointerCancel}
              onClickCapture={handleSummaryListClickCapture}
            >
              {bookmarkCards.map(summary => (
                <SummaryItemCard
                  key={`bookmark-${summary.summaryId}`}
                  {...summary}
                  initialIsBookmarked
                />
              ))}
            </div>
          </section>
        </div>
      </main>
    </AuthGuard>
  );
}

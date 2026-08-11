'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import EmptyState from '@/components/EmptyState';
import NoteItem from '@/components/NoteItem';
import SummaryItemCard from '@/components/SummaryItemCard';
import styles from './page.module.scss';

const mySummaryCards = [
  {
    summaryId: 'summary-1',
    nickname: '프다',
    title: 'React 상태 관리 핵심 정리',
    excerpt: '컴포넌트 상태와 전역 상태 관리의 차이를 핵심만 정리했어요.',
    createdAt: '2026-08-10',
  },
  {
    summaryId: 'summary-2',
    nickname: '프다',
    title: 'CSS Flexbox 레이아웃',
    excerpt: '자주 사용하는 Flexbox 속성과 활용 방법을 정리했어요.',
    createdAt: '2026-08-08',
  },
  {
    summaryId: 'summary-3',
    nickname: '프다',
    title: 'Next.js App Router 구조',
    excerpt: 'App Router의 페이지와 레이아웃 구성 방식을 알아봐요.',
    createdAt: '2026-08-05',
  },
  {
    summaryId: 'summary-4',
    nickname: '프다',
    title: 'JavaScript 비동기 처리',
    excerpt: 'Promise와 async/await를 활용하는 방법을 정리했어요.',
    createdAt: '2026-08-02',
  },
];

const learningNotes = [];
// 실제 북마크 데이터가 연결되기 전까지 북마크 섹션의 빈 상태만 표현합니다.
const bookmarkCards = [];

export default function Mypage() {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [nickname, setNickname] = useState('사용자 닉네임');
  const [introduction, setIntroduction] = useState(
    '프론트엔드 학습을 기록하고 있어요.',
  );
  const [draftNickname, setDraftNickname] = useState(nickname);
  const [draftIntroduction, setDraftIntroduction] = useState(introduction);
  const summaryListDragRef = useRef({
    element: null,
    startX: 0,
    startScrollLeft: 0,
    isDragging: false,
  });

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

  function handleSummaryListPointerDown(event) {
    if (event.pointerType !== 'mouse' || event.button !== 0) {
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
    <main className={styles['mypage']}>
      <div className={styles.container}>
        <h1>마이페이지</h1>

        <section
          className={styles['profile-section']}
          aria-labelledby='profile-title'>
          <h2 id='profile-title'>내 프로필</h2>

          <div className={styles['profile-content']}>
            <div className={styles['profile-image']}>
              <Image
                src='/images/프로필.webp'
                alt='사용자 프로필 이미지'
                width={120}
                height={120}
              />
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
                      onChange={event =>
                        setDraftIntroduction(event.target.value)
                      }
                    />
                  </label>
                </div>
              ) : (
                <div className={styles['profile-text']}>
                  <p className={styles.nickname}>{nickname}</p>
                  <p>{introduction}</p>
                </div>
              )}

              <button
                className={styles['profile-edit-button']}
                type='button'
                onClick={
                  isEditingProfile
                    ? handleCompleteProfileEdit
                    : handleStartProfileEdit
                }>
                {isEditingProfile ? '수정완료' : '프로필 수정'}
              </button>
            </div>
          </div>
        </section>

        <section
          className={styles['learning-note-section']}
          aria-labelledby='learning-note-title'>
          <div className={styles['section-heading']}>
            <h2 id='learning-note-title'>내 학습노트 리스트</h2>
            <Link href='#' className={styles['more-link']}>
              <span>더보기</span>
              <span
                className={`material-symbols-outlined ${styles['more-icon']}`}
                aria-hidden='true'>
                arrow_forward_ios
              </span>
            </Link>
          </div>

          <div className={styles['learning-note-table']}>
            <div className={styles['table-header']}>
              <div className={styles['table-leading']}>
                <span>상태</span>
                <span>작성자</span>
              </div>
              <span className={styles['table-topic']}>주제</span>
              <span>작성일</span>
            </div>
            {learningNotes.length === 0 ? (
              <p className={styles['empty-message']}>현재 리스트가 없습니다.</p>
            ) : (
              learningNotes.map(note => (
                <NoteItem key={note.noteId} {...note} />
              ))
            )}
          </div>
        </section>

        <section
          className={styles['summary-section']}
          aria-labelledby='my-summary-title'>
          <div className={styles['section-heading']}>
            <h2 id='my-summary-title'>내 요약 노트</h2>
            <Link href='/mypage/mysummaries' className={styles['more-link']}>
              <span>더보기</span>
              <span
                className={`material-symbols-outlined ${styles['more-icon']}`}
                aria-hidden='true'>
                arrow_forward_ios
              </span>
            </Link>
          </div>

          {/* 가로 카드 목록을 키보드 사용자도 직접 탐색할 수 있도록 스크롤 영역에 포커스를 허용합니다. */}
          <div
            className={styles['summary-list']}
            aria-label='내 요약 노트 목록'
            tabIndex={0}
            onPointerDown={handleSummaryListPointerDown}
            onPointerMove={handleSummaryListPointerMove}
            onPointerUp={handleSummaryListPointerEnd}
            onPointerCancel={handleSummaryListPointerCancel}
            onClickCapture={handleSummaryListClickCapture}>
            {summaryCards.map(summary => (
              <SummaryItemCard key={summary.summaryId} {...summary} />
            ))}
          </div>
        </section>

        <section
          className={styles['summary-section']}
          aria-labelledby='bookmark-title'>
          <div className={styles['section-heading']}>
            <h2 id='bookmark-title'>북마크</h2>
            <Link href='/mypage/bookmarks' className={styles['more-link']}>
              <span>더보기</span>
              <span
                className={`material-symbols-outlined ${styles['more-icon']}`}
                aria-hidden='true'>
                arrow_forward_ios
              </span>
            </Link>
          </div>

          {/* 가로 카드 목록을 키보드 사용자도 직접 탐색할 수 있도록 스크롤 영역에 포커스를 허용합니다. */}
          <div
            className={styles['summary-list']}
            aria-label='북마크 목록'
            tabIndex={0}
            onPointerDown={handleSummaryListPointerDown}
            onPointerMove={handleSummaryListPointerMove}
            onPointerUp={handleSummaryListPointerEnd}
            onPointerCancel={handleSummaryListPointerCancel}
            onClickCapture={handleSummaryListClickCapture}>
            {summaryCards.map(summary => (
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
  );
}

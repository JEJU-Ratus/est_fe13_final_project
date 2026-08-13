"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import EmptyState from "./EmptyState";
import Loading from "./Loading";
import NoteItem from "./NoteItem";
import styles from "./AllNotes.module.scss";

const EMPTY_MESSAGE = "학습 노트 리스트가 아직 생성되지 않았습니다.";

function createScope(scope, summaryId) {
  if (scope === "summary") {
    return { type: "summary", summaryId };
  }

  return { type: "mine" };
}

function normalizeCursor(cursor) {
  if (
    !cursor ||
    typeof cursor.createdAt !== "string" ||
    typeof cursor.noteId !== "string"
  ) {
    return null;
  }

  return {
    createdAt: cursor.createdAt,
    noteId: cursor.noteId,
  };
}

function normalizePage(page) {
  const items = Array.isArray(page?.items)
    ? page.items.filter(
        item =>
          item &&
          typeof item.noteId === "string" &&
          typeof item.summaryId === "string",
      )
    : [];
  const nextCursor = normalizeCursor(page?.nextCursor);
  const totalCount = Number.isInteger(page?.totalCount) && page.totalCount >= 0
    ? page.totalCount
    : items.length;

  return {
    totalCount,
    items,
    nextCursor,
    hasMore: Boolean(page?.hasMore && nextCursor),
  };
}

function getItemKey(item) {
  return `${item.summaryId}:${item.noteId}`;
}

function getCursorKey(cursor) {
  return cursor ? `${cursor.createdAt}:${cursor.noteId}` : "initial";
}

function getScopeKey(scope, summaryId) {
  return scope === "summary" ? `${scope}:${summaryId ?? ""}` : scope;
}

function createInitialState(initialPage) {
  const page = normalizePage(initialPage);

  return {
    ...page,
    hasLoaded: Boolean(initialPage),
    isInitialLoading: !initialPage,
    isLoadingMore: false,
    error: null,
  };
}

export default function AllNotes({
  scope = "mine",
  summaryId,
  banner,
  loadPage,
  initialPage,
  accessState = "checking",
}) {
  const normalizedScope = scope === "summary" ? "summary" : "mine";
  const scopeKey = getScopeKey(normalizedScope, summaryId);
  const [listState, setListState] = useState(() => createInitialState(initialPage));
  const sentinelRef = useRef(null);
  const isMountedRef = useRef(false);
  const scopeKeyRef = useRef(scopeKey);
  const requestTrackerRef = useRef({
    scopeKey,
    inFlightCursor: null,
    requestedCursors: new Set(),
  });

  scopeKeyRef.current = scopeKey;

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (initialPage || typeof loadPage !== "function") {
      return undefined;
    }

    const tracker = requestTrackerRef.current;

    if (tracker.scopeKey !== scopeKey) {
      tracker.scopeKey = scopeKey;
      tracker.inFlightCursor = null;
      tracker.requestedCursors = new Set();
    }

    const cursorKey = getCursorKey(null);

    if (
      tracker.inFlightCursor === cursorKey ||
      tracker.requestedCursors.has(cursorKey)
    ) {
      return undefined;
    }

    tracker.inFlightCursor = cursorKey;
    tracker.requestedCursors.add(cursorKey);

    async function loadInitialPage() {
      try {
        const response = await loadPage(createScope(normalizedScope, summaryId), null);

        if (!isMountedRef.current || scopeKeyRef.current !== scopeKey) {
          return;
        }

        const page = normalizePage(response);

        setListState(currentState => ({
          ...currentState,
          ...page,
          hasLoaded: true,
          isInitialLoading: false,
          error: null,
        }));
      } catch (error) {
        if (!isMountedRef.current || scopeKeyRef.current !== scopeKey) {
          return;
        }

        setListState(currentState => ({
          ...currentState,
          hasLoaded: true,
          hasMore: false,
          isInitialLoading: false,
          error,
        }));
      } finally {
        if (tracker.inFlightCursor === cursorKey) {
          tracker.inFlightCursor = null;
        }
      }
    }

    void loadInitialPage();

    return undefined;
  }, [initialPage, loadPage, normalizedScope, scopeKey, summaryId]);

  const handleLoadMore = useCallback(async () => {
    if (
      typeof loadPage !== "function" ||
      !listState.hasLoaded ||
      listState.isInitialLoading ||
      listState.isLoadingMore ||
      !listState.hasMore ||
      !listState.nextCursor
    ) {
      return;
    }

    const cursor = listState.nextCursor;
    const cursorKey = getCursorKey(cursor);
    const tracker = requestTrackerRef.current;

    if (tracker.scopeKey !== scopeKey) {
      tracker.scopeKey = scopeKey;
      tracker.inFlightCursor = null;
      tracker.requestedCursors = new Set();
    }

    if (
      tracker.inFlightCursor === cursorKey ||
      tracker.requestedCursors.has(cursorKey)
    ) {
      return;
    }

    tracker.inFlightCursor = cursorKey;
    tracker.requestedCursors.add(cursorKey);
    setListState(currentState => ({
      ...currentState,
      isLoadingMore: true,
      error: null,
    }));

    try {
      const response = await loadPage(createScope(normalizedScope, summaryId), cursor);

      if (!isMountedRef.current || scopeKeyRef.current !== scopeKey) {
        return;
      }

      const page = normalizePage(response);

      setListState(currentState => {
        const existingKeys = new Set(currentState.items.map(getItemKey));
        const newItems = page.items.filter(item => !existingKeys.has(getItemKey(item)));
        const responseCursorKey = getCursorKey(page.nextCursor);
        const hasValidNextCursor =
          page.hasMore && page.nextCursor && responseCursorKey !== cursorKey;

        return {
          ...currentState,
          items: [...currentState.items, ...newItems],
          totalCount: page.totalCount,
          nextCursor: hasValidNextCursor ? page.nextCursor : null,
          hasMore: Boolean(hasValidNextCursor),
          isLoadingMore: false,
          error: null,
        };
      });
    } catch (error) {
      tracker.requestedCursors.delete(cursorKey);

      if (!isMountedRef.current || scopeKeyRef.current !== scopeKey) {
        return;
      }

      setListState(currentState => ({
        ...currentState,
        hasMore: false,
        isLoadingMore: false,
        error,
      }));
    } finally {
      if (tracker.inFlightCursor === cursorKey) {
        tracker.inFlightCursor = null;
      }
    }
  }, [listState, loadPage, normalizedScope, scopeKey, summaryId]);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (
      !sentinel ||
      !listState.hasLoaded ||
      listState.isInitialLoading ||
      listState.isLoadingMore ||
      !listState.hasMore
    ) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          void handleLoadMore();
        }
      },
      {
        rootMargin: "200px 0px",
        threshold: 0,
      },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [handleLoadMore, listState.hasLoaded, listState.hasMore, listState.isInitialLoading, listState.isLoadingMore]);

  const initialItemCount = Array.isArray(initialPage?.items)
    ? initialPage.items.length
    : 0;
  const hasPageLoader = typeof loadPage === "function";
  const hasBanner = typeof banner?.imageSrc === "string" && banner.imageSrc.trim() !== "";
  const hasInitialError = Boolean(listState.error && listState.items.length === 0);

  const pageContent = listState.isInitialLoading ? (
    <Loading />
  ) : (
    <>
      <div className={styles["all-notes-header"]}>
        <h1 className={styles["all-notes-summary"]}>
          총 {listState.totalCount}개의 학습노트
        </h1>
      </div>

      <div className={styles["all-notes-content"]}>
        {/* 목록의 열 구조를 보조기기가 같은 순서로 이해할 수 있도록 표 역할과 열 이름을 제공합니다. */}
        <div className={styles["all-notes-table"]} role="table" aria-label="학습노트 목록">
          <div className={styles["all-notes-table-header"]} role="row">
            <span role="columnheader">상태</span>
            <span role="columnheader">작성자</span>
            <span role="columnheader">주제</span>
            <span role="columnheader">작성일</span>
          </div>

          <div className={styles["all-notes-table-body"]}>
            {hasInitialError ? (
              <>
                {/* 초기 조회 실패는 빈 목록과 구분해 보조기기에 즉시 전달합니다. */}
                <p className={styles["all-notes-status"]} role="alert">
                  학습노트를 불러오지 못했습니다.
                </p>
              </>
            ) : listState.items.length === 0 ? (
              <EmptyState message={EMPTY_MESSAGE} />
            ) : (
              listState.items.map(item => (
                <NoteItem
                  key={getItemKey(item)}
                  summaryId={item.summaryId}
                  noteId={item.noteId}
                  authorNickname={item.authorNickname}
                  topic={item.topic}
                  createdAt={item.createdAtDisplay}
                  quizStatus={item.quizStatus}
                />
              ))
            )}
          </div>
        </div>

        {listState.hasMore && listState.items.length > 0 && (
          <>
            {/* 추가 조회 감지용 요소는 화면에 의미 있는 콘텐츠로 낭독되지 않게 숨깁니다. */}
            <div
              ref={sentinelRef}
              className={styles["all-notes-sentinel"]}
              aria-hidden="true"
            />
          </>
        )}
      </div>
    </>
  );

  return (
    <main
      className={styles["all-notes"]}
      data-scope={normalizedScope}
      data-summary-id={typeof summaryId === "string" ? summaryId : undefined}
      data-access-state={accessState}
      data-has-page-loader={hasPageLoader}
      data-initial-item-count={initialItemCount}
      data-has-banner={hasBanner}
      data-loading-more={listState.isLoadingMore}
    >
      {pageContent}
    </main>
  );
}

import learningNotes from "./learning-notes.json";
import summaries from "./summaries.json";
import users from "./users.json";

export const MOCK_CURRENT_USER_ID = "user-001";
export const ALL_NOTES_PAGE_SIZE = 12;

export const MOCK_SUMMARY_IDS = {
  public: "summary-001",
  locked: "summary-002",
  empty: "summary-empty",
  error: "summary-error",
  notFound: "summary-not-found",
};

const SAME_TIMESTAMP = "2026-08-15T12:00:00.000Z";
const MOCK_AUTHORS = ["user-001", "user-002", "user-003", "user-004", "user-005", "user-006"];
const verifiedSummaryIds = new Set();

const usersById = new Map(users.map(user => [user.userId, user]));
const summariesById = new Map(summaries.map(summary => [summary.summaryId, summary]));

function createGeneratedNotes({ prefix, summaryId, count, authorIds = MOCK_AUTHORS }) {
  return Array.from({ length: count }, (_, index) => {
    const sequence = String(index + 1).padStart(3, "0");
    const createdAt =
      index < 4
        ? SAME_TIMESTAMP
        : new Date(
            Date.UTC(2026, 7, 14 - Math.floor((index - 4) / 4), 12 - ((index - 4) % 4), 0, 0),
          ).toISOString();

    return {
      noteId: `${prefix}-${sequence}`,
      summaryId,
      authorId: authorIds[index % authorIds.length],
      title: `${summariesById.get(summaryId)?.topic ?? "학습 주제"} 테스트 노트 ${sequence}`,
      content: `${summariesById.get(summaryId)?.topic ?? "학습 주제"}를 복습하기 위한 UI 검증용 학습노트입니다.`,
      isQuizCompleted: index % 2 === 0,
      createdAt,
      updatedAt: createdAt,
    };
  });
}

const generatedNotes = [
  ...createGeneratedNotes({
    prefix: "mine-note",
    summaryId: MOCK_SUMMARY_IDS.public,
    count: 30,
    authorIds: [MOCK_CURRENT_USER_ID],
  }),
  ...createGeneratedNotes({
    prefix: "public-note",
    summaryId: MOCK_SUMMARY_IDS.public,
    count: 30,
  }),
  ...createGeneratedNotes({
    prefix: "locked-note",
    summaryId: MOCK_SUMMARY_IDS.locked,
    count: 30,
  }),
];

const noteFixtures = [...learningNotes, ...generatedNotes];

function formatDate(dateTime) {
  if (typeof dateTime !== "string") {
    return "";
  }

  return dateTime.slice(0, 10).replaceAll("-", ".");
}

function normalizeStudyNote(note) {
  const summary = summariesById.get(note.summaryId);
  const author = usersById.get(note.authorId);

  return {
    noteId: note.noteId,
    summaryId: note.summaryId,
    authorNickname: author?.nickname ?? "알 수 없는 사용자",
    topic: summary?.topic ?? "알 수 없는 주제",
    createdAt: note.createdAt,
    createdAtDisplay: formatDate(note.createdAt),
    quizStatus: note.isQuizCompleted ? "completed" : "notStarted",
  };
}

function compareNotes(firstNote, secondNote) {
  const createdAtDifference = Date.parse(secondNote.createdAt) - Date.parse(firstNote.createdAt);

  if (createdAtDifference !== 0) {
    return createdAtDifference;
  }

  return secondNote.noteId.localeCompare(firstNote.noteId);
}

function createMockError(code) {
  const error = new Error(`Mock 학습노트 조회 오류: ${code}`);
  error.code = code;
  return error;
}

function normalizeScope(scope) {
  if (scope?.type === "all") {
    return { type: "all" };
  }

  if (scope?.type === "mine") {
    return { type: "mine" };
  }

  if (scope?.type === "summary" && typeof scope.summaryId === "string") {
    return { type: "summary", summaryId: scope.summaryId };
  }

  throw createMockError("REQUEST_FAILED");
}

function getScopedNotes(scope) {
  if (scope.type === "all") {
    return noteFixtures.filter(note => {
      const summary = summariesById.get(note.summaryId);
      return summary && !summary.isPrivate;
    });
  }

  if (scope.type === "mine") {
    return noteFixtures.filter(note => note.authorId === MOCK_CURRENT_USER_ID);
  }

  if (scope.summaryId === MOCK_SUMMARY_IDS.error) {
    throw createMockError("REQUEST_FAILED");
  }

  if (scope.summaryId === MOCK_SUMMARY_IDS.notFound) {
    throw createMockError("NOT_FOUND");
  }

  if (scope.summaryId === MOCK_SUMMARY_IDS.empty) {
    return [];
  }

  return noteFixtures.filter(note => note.summaryId === scope.summaryId);
}

function getPageStartIndex(notes, cursor) {
  if (cursor === null || cursor === undefined) {
    return 0;
  }

  if (typeof cursor.createdAt !== "string" || typeof cursor.noteId !== "string") {
    throw createMockError("REQUEST_FAILED");
  }

  const cursorIndex = notes.findIndex(
    note => note.createdAt === cursor.createdAt && note.noteId === cursor.noteId,
  );

  if (cursorIndex === -1) {
    throw createMockError("REQUEST_FAILED");
  }

  return cursorIndex + 1;
}

export async function loadMockStudyNotePage(scope, cursor = null) {
  const normalizedScope = normalizeScope(scope);
  const notes = getScopedNotes(normalizedScope).sort(compareNotes);
  const startIndex = getPageStartIndex(notes, cursor);
  const pageItems = notes.slice(startIndex, startIndex + ALL_NOTES_PAGE_SIZE);
  const lastItem = pageItems[pageItems.length - 1];
  const hasMore = startIndex + pageItems.length < notes.length;

  return {
    totalCount: notes.length,
    items: pageItems.map(normalizeStudyNote),
    nextCursor: hasMore ? { createdAt: lastItem.createdAt, noteId: lastItem.noteId } : null,
    hasMore,
  };
}

export function getMockSummaryNoteAccess(summaryId, { isPasswordVerified = false } = {}) {
  if (summaryId === MOCK_SUMMARY_IDS.error) {
    return "error";
  }

  if (summaryId === MOCK_SUMMARY_IDS.notFound || summaryId === MOCK_SUMMARY_IDS.empty) {
    return summaryId === MOCK_SUMMARY_IDS.empty ? "public" : "notFound";
  }

  const summary = summariesById.get(summaryId);

  if (!summary) {
    return "notFound";
  }

  if (!summary.isPrivate) {
    return "public";
  }

  return isPasswordVerified || verifiedSummaryIds.has(summaryId)
    ? "authorized"
    : "passwordRequired";
}

export async function verifyMockSummaryNotePassword(summaryId, password) {
  const summary = summariesById.get(summaryId);

  if (!summary) {
    return { isValid: false, code: "NOT_FOUND" };
  }

  if (!summary.isPrivate) {
    return { isValid: true };
  }

  // 실제 비밀번호 검증 전 UI 흐름만 확인하므로 원문·고정 비밀번호를 저장하지 않습니다.
  if (typeof password !== "string" || password.trim().length < 4) {
    return {
      isValid: false,
      code: "INVALID_PASSWORD",
      errorMessage: "비밀번호가 일치하지 않습니다.",
    };
  }

  verifiedSummaryIds.add(summaryId);
  return { isValid: true };
}

export function resetMockSummaryNoteAccess() {
  verifiedSummaryIds.clear();
}

export const MOCK_BANNERS = {
  validInternal: {
    imageSrc: "/images/banner.jpg",
    destinationUrl: "/summary",
    alt: "전체 요약 노트로 이동하는 이벤트 광고",
  },
  validExternal: {
    imageSrc: "/images/banner.jpg",
    destinationUrl: "https://example.com",
    alt: "외부 이벤트 페이지로 이동하는 이벤트 광고",
  },
  missingDestination: {
    imageSrc: "/images/banner.jpg",
    destinationUrl: null,
    alt: "목적지가 없는 이벤트 광고",
  },
  missingImage: {
    imageSrc: "",
    destinationUrl: "/summary",
    alt: "이미지가 없는 이벤트 광고",
  },
};

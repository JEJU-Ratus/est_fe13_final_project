import bookmarks from "./bookmarks.json";
import learningNotes from "./learning-notes.json";
import summaries from "./summaries.json";
import users from "./users.json";

export const MOCK_CURRENT_USER_ID = "user-001";

const usersById = new Map(users.map(user => [user.userId, user]));

function formatDate(dateTime) {
  if (typeof dateTime !== "string") {
    return "";
  }

  return dateTime.slice(0, 10).replaceAll("-", ".");
}

function normalizeSummary(summary) {
  return {
    summaryId: summary.summaryId,
    authorId: summary.authorId,
    topic: summary.topic,
    title: summary.title,
    aiSummary: {
      title: summary.aiSummary?.title ?? "",
      sections: (summary.aiSummary?.sections ?? []).map(section => ({
        sectionId: section.sectionId,
        heading: section.heading,
        content: [...(section.content ?? [])],
      })),
    },
    isPrivate: summary.isPrivate,
  };
}

function normalizeStudyNote(note) {
  const author = usersById.get(note.authorId);

  return {
    noteId: note.noteId,
    summaryId: note.summaryId,
    authorId: note.authorId,
    authorNickname: author?.nickname ?? "알 수 없는 사용자",
    title: note.title,
    learnedSummary: note.content,
    reflection: "",
    references: "",
    createdAt: note.createdAt,
    createdAtDisplay: formatDate(note.createdAt),
    quizStatus: note.isQuizCompleted ? "completed" : "notStarted",
  };
}

export function getMockSummary(summaryId) {
  const summary = summaries.find(item => item.summaryId === summaryId);

  return summary ? normalizeSummary(summary) : null;
}

export function getMockSummaryNotes(summaryId) {
  return learningNotes
    .filter(note => note.summaryId === summaryId)
    .sort((firstNote, secondNote) =>
      secondNote.createdAt.localeCompare(firstNote.createdAt),
    )
    .map(normalizeStudyNote);
}

export function getMockStudyNote(summaryId, noteId) {
  if (!getMockSummary(summaryId)) {
    return null;
  }

  const note = learningNotes.find(
    item => item.summaryId === summaryId && item.noteId === noteId,
  );

  return note ? normalizeStudyNote(note) : null;
}

export function getMockBookmarkState(summaryId, userId) {
  return bookmarks.some(
    bookmark =>
      bookmark.summaryId === summaryId && bookmark.userId === userId,
  );
}

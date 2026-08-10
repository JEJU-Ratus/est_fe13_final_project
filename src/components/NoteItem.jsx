import Image from "next/image";
import Link from "next/link";
import styles from "./NoteItem.module.scss";

const QUIZ_STATUS = {
  notStarted: {
    label: "학습 전",
    imageSrc: "/images/quiz-not-started.png",
  },
  completed: {
    label: "학습 완료",
    imageSrc: "/images/quiz-completed.png",
  },
};

export default function NoteItem({
  summaryId,
  noteId,
  authorNickname,
  topic,
  createdAt,
  quizStatus,
}) {
  const status = QUIZ_STATUS[quizStatus] ?? QUIZ_STATUS.notStarted;

  return (
    <Link
      className={styles["note-item"]}
      href={`/Summary/${summaryId}/notes/${noteId}`}
    >
      <span className={styles["status-cell"]}>
        <span className={styles["status-image"]}>
          <Image src={status.imageSrc} alt="" fill sizes="40px" />
        </span>
        <span className={styles["status-label"]}>{status.label}</span>
      </span>
      <span className={styles["author-cell"]}>{authorNickname}</span>
      <span className={styles["topic-cell"]}>{topic}</span>
      <time className={styles["date-cell"]}>{createdAt}</time>
    </Link>
  );
}

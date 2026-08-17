"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams } from "next/navigation";
import styles from "./SummaryId.module.scss";
import QuizModal from "@/components/QuizModal";

export default function AiSummaryLayoutClient({ summaryId, type }) {
  //서버에서 실제 북마크 상태를 받아오도록 변경
  const [isBookmarked, setBookmarked] = useState(null);

  // 현재 북마크 상태에 따라 버튼 안내 문구 설정
  const bookmarkLabel = isBookmarked ? "북마크 삭제" : "북마크 담기";

  //현재 URL에 noteId가 있는지 확인
  const params = useParams();
  const noteId = params.noteId;

  //퀴즈 생성 버튼 표시 여부
  const [canCreateQuiz, setCanCreateQuiz] = useState(false);

  //퀴즈 모달 열림 상태 관리
  const [isQuizModalOpen, setQuizModalOpen] = useState(false);

  // 퀴즈
  const [quiz, setQuiz] = useState(null);
  const [isQuizUnavailable, setQuizUnavailable] = useState(true);

  // 현재 사용자의 북마크 상태 조회
  useEffect(() => {
    async function checkBookmarkStatus() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setBookmarked(false);
        return;
      }

      const { data, error } = await supabase
        .from("bookmarks")
        .select("summary_id")
        .eq("user_id", user.id)
        .eq("summary_id", summaryId)
        .maybeSingle();

      if (error) {
        console.error("북마크 상태 조회 실패:", error);
        return;
      }

      setBookmarked(!!data);
    }

    checkBookmarkStatus();
  }, [summaryId]);

  useEffect(() => {
    async function checkQuizPermission() {
      //noteId가 없거나 새 학습노트 작성 페이지면 퀴즈 버튼 숨김
      if (!noteId || noteId === "new") {
        setCanCreateQuiz(false);
        return;
      }
      const supabase = createClient();

      //현재 로그인 사용자 확인
      const {
        data: { user },
      } = await supabase.auth.getUser();

      //로그인 사용자가 없으면 동작 중단
      if (!user) {
        setCanCreateQuiz(false);
        return;
      }

      //현재 학습노트 작성자 확인
      const { data: learningNote, error } = await supabase
        .from("learning_notes")
        .select("author_id")
        .eq("id", noteId)
        .eq("summary_id", summaryId)
        .maybeSingle();

      if (error) {
        console.error("학습노트 작성자 조회 실패:", error);
        setCanCreateQuiz(false);
        return;
      }

      //현재 로그인 사용자와 작성자가 같을 때만 버튼 표시
      setCanCreateQuiz(learningNote?.author_id === user.id);
    }

    checkQuizPermission();
  }, [noteId, summaryId]);

  useEffect(() => {
    async function fetchQuiz() {
      if (!summaryId) return;

      const supabase = createClient();

      const { data, error } = await supabase
        .from("quizzes")
        .select("id, question, options, answer_index, explanation")
        .eq("summary_id", summaryId)
        .maybeSingle();

      if (error) {
        console.error("퀴즈 조회 실패:", error);
        setQuiz(null);
        setQuizUnavailable(true);
        return;
      }

      if (!data) {
        setQuiz(null);
        setQuizUnavailable(true);
        return;
      }

      const formattedQuiz = {
        id: data.id,
        question: data.question,
        options: data.options.map((option, index) => ({
          optionId: String(index),
          label: option,
        })),
        correctOptionId: String(data.answer_index),
        explanation: data.explanation,
      };

      setQuiz(formattedQuiz);
      setQuizUnavailable(false);
    }

    fetchQuiz();
  }, [summaryId]);

  //북마크 추가/삭제 처리
  async function handleBookmarkToggle() {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // 이미 북마크 되어 있으면 삭제
    if (isBookmarked) {
      const { error } = await supabase.from("bookmarks").delete().eq("user_id", user.id).eq("summary_id", summaryId);

      if (error) {
        console.error("북마크 삭제 실패:", error);
        return;
      }
    } else {
      // 북마크 되어 있지 않으면 추가
      const { error } = await supabase.from("bookmarks").insert({
        user_id: user.id,
        summary_id: summaryId,
      });

      if (error) {
        console.error("북마크 추가 실패:", error);
        return;
      }
    }
    //DB 작업 성공 후 화면 상태 변경
    setBookmarked(current => !current);
  }

  //퀴즈 모달 열기
  function handleQuizModalOpen() {
    setQuizModalOpen(true);
  }

  //퀴즈 모달 닫기
  function handleQuizModalClose() {
    setQuizModalOpen(false);
  }

  if (type === "bookmark") {
    if (isBookmarked === null) {
      return null;
    }
    return (
      <button
        className={styles["bookmark-btn"]}
        type="button"
        aria-label={bookmarkLabel}
        aria-pressed={isBookmarked}
        data-tooltip={bookmarkLabel}
        onClick={handleBookmarkToggle}
      >
        <span
          className={`material-symbols-outlined ${styles["bookmark-icon"]} ${isBookmarked ? styles["is-active"] : ""}`}
          aria-hidden="true"
        >
          bookmark_add
        </span>
      </button>
    );
  }

  if (type === "quiz" && canCreateQuiz) {
    return (
      <>
        <div className={styles["quiz-action"]}>
          <button type="button" onClick={handleQuizModalOpen}>
            퀴즈 풀기
          </button>
        </div>

        <QuizModal
          isOpen={isQuizModalOpen}
          quiz={quiz}
          isUnavailable={isQuizUnavailable}
          onClose={handleQuizModalClose}
        />
      </>
    );
  }

  return null;
}

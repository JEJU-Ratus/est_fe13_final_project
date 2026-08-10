"use client";

import { useState } from "react";
import styles from "./QuizModal.module.scss";

export default function QuizModal({ isOpen, quiz = null, isUnavailable = false, onClose }) {
  if (!isOpen) {
    return null;
  }

  return <QuizModalContent quiz={quiz} isUnavailable={isUnavailable} onClose={onClose} />;
}

function QuizModalContent({ quiz, isUnavailable, onClose }) {
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [result, setResult] = useState("idle");

  function handleOptionChange(event) {
    setSelectedOptionId(event.target.value);
    setResult("idle");
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!quiz || isUnavailable || !selectedOptionId || result !== "idle") {
      return;
    }

    setResult(selectedOptionId === quiz.correctOptionId ? "correct" : "incorrect");
  }

  function handleClose() {
    setSelectedOptionId(null);
    setResult("idle");
    onClose();
  }

  const isQuizUnavailable = isUnavailable || !quiz;
  const isSubmitted = result !== "idle";

  return (
    <div className={styles["modal-backdrop"]}>
      {/* 보조기기가 모달의 경계와 제목을 함께 인식하도록 대화상자 의미를 제공합니다. */}
      <section
        className={styles["modal-container"]}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quiz-modal-title"
      >
        <div className={styles["modal-heading"]}>
          <h2 id="quiz-modal-title">퀴즈 풀기</h2>
          <button className={styles["close-button"]} type="button" onClick={handleClose}>
            {/* 숨김 텍스트가 닫기 동작을 설명하므로 아이콘의 중복 낭독을 막습니다. */}
            <span className="material-symbols-outlined" aria-hidden="true">
              close
            </span>
            <span className={styles["screen-reader-only"]}>퀴즈 모달 닫기</span>
          </button>
        </div>

        {isQuizUnavailable ? (
          <div className={styles["unavailable-state"]}>
            <p>현재 풀 수 있는 퀴즈가 없습니다.</p>
          </div>
        ) : (
          <form className={styles["quiz-form"]} onSubmit={handleSubmit}>
            <fieldset className={styles["question-box"]} disabled={isSubmitted}>
              <legend>{quiz.question}</legend>
              <ol className={styles["option-list"]}>
                {quiz.options.map(option => (
                  <li key={option.optionId}>
                    <label className={styles["option-label"]}>
                      <input
                        type="radio"
                        name="quiz-option"
                        value={option.optionId}
                        checked={selectedOptionId === option.optionId}
                        onChange={handleOptionChange}
                      />
                      <span>{option.label}</span>
                    </label>
                  </li>
                ))}
              </ol>
            </fieldset>

            {/* 키보드 포커스를 이동하지 않고 채점 결과를 보조기기에 알립니다. */}
            <p className={styles["result-message"]} aria-live="polite">
              {result === "correct" && "정답입니다."}
              {result === "incorrect" && "오답입니다."}
            </p>

            <button
              className={styles["submit-button"]}
              type="submit"
              disabled={!selectedOptionId || isSubmitted}
            >
              퀴즈 제출
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

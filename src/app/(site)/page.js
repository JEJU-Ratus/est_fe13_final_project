"use client";

import { useState } from "react";
import Image from "next/image";
import Banner from "@/components/Banner";
import CommonModal from "@/components/CommonModal";
import { useAuth } from "@/components/AuthProvider";
import styles from "./page.module.scss";
import Link from "next/link";

export default function Home() {
  const { isAuthenticated, isAuthLoading } = useAuth();
  const [isPreparingModalOpen, setIsPreparingModalOpen] = useState(false);
  const [isSuggestLoginModalOpen, setIsSuggestLoginModalOpen] = useState(false);
  const [isPasswordEnabled, setIsPasswordEnabled] = useState(false);
  const [password, setPassword] = useState("");

  function handlePasswordEnabledChange(event) {
    const isChecked = event.target.checked;

    setIsPasswordEnabled(isChecked);

    if (!isChecked) {
      setPassword("");
    }
  }

  function handleSummarySubmit(event) {
    event.preventDefault();

    if (!isAuthenticated) {
      setIsSuggestLoginModalOpen(true);
    }
  }

  function handlePasswordChange(event) {
    setPassword(event.target.value.replace(/\D/g, "").slice(0, 4));
  }

  return (
    <main className={styles["main-page"]}>
      <div className={styles.container}>
        <section className={styles["intro-section"]} aria-labelledby="main-title">
          <div className={styles["mascot-image"]}>
            <Image src="/images/프비메인.webp" alt="프다 마스코트 프비" width={357} height={338} priority />
          </div>

          <div className={styles["intro-content"]}>
            <div className={styles["intro-copy"]}>
              <div>
                <p className={styles.greeting}>
                  <span>프다 친구들, 안녕!</span> 🐝
                </p>
                <h1 id="main-title">프론트엔드 지식을 더 쉽게!</h1>
              </div>
              <p className={styles.description}>궁금한 건 프비에게 물어보세요!</p>
            </div>

            <form className={styles["summary-form"]} onSubmit={handleSummarySubmit}>
              <div className={styles["topic-input"]}>
                <span className="material-symbols-outlined" aria-hidden="true">
                  add
                </span>
                <input
                  type="text"
                  aria-label="요약할 내용"
                  placeholder="궁금한 내용을 입력하면 프비가 핵심만 요약해 드려요."
                  required
                />
                <button
                  className={styles["submit-button"]}
                  type="submit"
                  aria-label="요약 요청"
                  formNoValidate={!isAuthenticated}
                >
                  <span className={`material-symbols-outlined ${styles["submit-icon"]}`} aria-hidden="true">
                    arrow_upward
                  </span>
                </button>
              </div>

              <div className={styles["form-bottom"]}>
                <p className={styles.notice}>
                  Front Digest는 프론트엔드 학습을 위한 서비스입니다.
                  <br />
                  프론트엔드와 관련이 없거나 부적절한 콘텐츠는 사전 안내 없이 비공개 처리 또는 삭제될 수 있습니다.
                </p>

                <div className={styles["password-option"]}>
                  <label className={styles["password-label"]}>
                    <input
                      className={styles["checkbox-input"]}
                      type="checkbox"
                      checked={isPasswordEnabled}
                      onChange={handlePasswordEnabledChange}
                    />
                    <span className={`material-symbols-outlined ${styles["checkbox-icon"]}`} aria-hidden="true">
                      {isPasswordEnabled ? "check_box" : "check_box_outline_blank"}
                    </span>
                    <span className={isPasswordEnabled ? styles["visually-hidden"] : undefined}>비밀번호 입력</span>
                  </label>
                  {isPasswordEnabled && (
                    <div className={styles["password-field"]}>
                      {/* 입력 조건을 시각적 문구뿐 아니라 스크린 리더 사용자에게도 함께 전달합니다. */}
                      <input
                        className={styles["password-input"]}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]{4}"
                        maxLength={4}
                        value={password}
                        onChange={handlePasswordChange}
                        placeholder="비밀번호"
                        aria-describedby={password.length !== 4 ? "password-error" : undefined}
                        aria-invalid={password.length !== 4}
                        required
                      />
                      <span
                        id="password-error"
                        className={`${styles["password-error"]} ${
                          password.length === 4 ? styles["is-hidden"] : ""
                        }`}
                      >
                        숫자 4자리를 입력해주세요
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
        </section>

        <section className={styles["content-section"]} aria-label="주요 콘텐츠">
          <div className={styles["wide-parent"]}>
              <Banner href="/dev" alt="넓은 영역의 프론트엔드 스킬업 이벤트" />
          </div>

          <div className={styles["quick-menu"]}>
            <Link href="/summary" className={styles["quick-menu-card"]}>
              <span className="material-symbols-outlined" aria-hidden="true">
                assignment_add
              </span>
              <span>전체 요약 노트</span>
            </Link>
            <button
              className={styles["quick-menu-card"]}
              type="button"
              onClick={() => setIsPreparingModalOpen(true)}
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                quiz
              </span>
              <span>퀴즈</span>
            </button>
            {/* 로그인 후 마이페이지 이동 */}
            {isAuthenticated ? (
              <Link href="/mypage" className={styles["quick-menu-card"]}>
                <span className="material-symbols-outlined" aria-hidden="true">
                  person
                </span>
                <span>마이페이지</span>
              </Link>
            ) : (
              //로그아웃하면 마이페이지는 모달, true
              <button
                className={styles["quick-menu-card"]}
                type="button"
                onClick={() => setIsSuggestLoginModalOpen(true)}
                disabled={isAuthLoading}
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  person
                </span>
                <span>마이페이지</span>
              </button>
            )}
          </div>
        </section>
      </div>
      <CommonModal
        isOpen={isPreparingModalOpen}
        mode="preparing"
        onClose={() => setIsPreparingModalOpen(false)}
      />
      <CommonModal
        isOpen={isSuggestLoginModalOpen}
        mode="suggestLogin"
        onClose={() => setIsSuggestLoginModalOpen(false)}
      />
    </main>
  );
}

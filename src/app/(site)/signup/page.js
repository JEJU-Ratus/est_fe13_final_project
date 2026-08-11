"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./page.module.scss";

export default function SignupPage() {
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isPasswordConfirmVisible, setIsPasswordConfirmVisible] = useState(false);

  // 각 입력을 제어 상태로 유지해 이후 검증 결과가 현재 화면 값과 항상 일치하게 합니다.
  function handleNicknameChange(event) {
    setNickname(event.target.value);
  }

  function handleEmailChange(event) {
    setEmail(event.target.value);
  }

  function handlePasswordChange(event) {
    setPassword(event.target.value);
  }

  function handlePasswordConfirmChange(event) {
    setPasswordConfirm(event.target.value);
  }

  // 포인터나 키보드를 누르기 시작한 동안에만 첫 번째 비밀번호를 평문으로 공개합니다.
  function handlePasswordVisibilityStart() {
    setIsPasswordVisible(true);
  }

  // 버튼에서 손을 떼거나 포커스를 잃는 모든 종료 경로에서 비밀번호를 다시 숨깁니다.
  function handlePasswordVisibilityEnd() {
    setIsPasswordVisible(false);
  }

  // 비밀번호 확인 입력은 첫 번째 입력과 공개 상태를 공유하지 않습니다.
  function handlePasswordConfirmVisibilityStart() {
    setIsPasswordConfirmVisible(true);
  }

  // 확인 입력의 누름 동작이 끝나면 해당 값만 다시 마스킹합니다.
  function handlePasswordConfirmVisibilityEnd() {
    setIsPasswordConfirmVisible(false);
  }

  // 기본 button 클릭과 별개로 키보드 사용자가 Enter 또는 Space를 누르는 동안 공개할 수 있게 합니다.
  function handlePasswordVisibilityKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handlePasswordVisibilityStart();
    }
  }

  // 키를 놓는 순간 첫 번째 비밀번호를 숨겨 마우스의 pointerup과 같은 동작을 제공합니다.
  function handlePasswordVisibilityKeyUp(event) {
    if (event.key === "Enter" || event.key === " ") {
      handlePasswordVisibilityEnd();
    }
  }

  // 확인 입력에도 동일한 키보드 누름 동작을 독립적으로 적용합니다.
  function handlePasswordConfirmVisibilityKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handlePasswordConfirmVisibilityStart();
    }
  }

  // 확인 입력의 Enter 또는 Space를 놓으면 즉시 다시 마스킹합니다.
  function handlePasswordConfirmVisibilityKeyUp(event) {
    if (event.key === "Enter" || event.key === " ") {
      handlePasswordConfirmVisibilityEnd();
    }
  }

  // 현재 UI 단계에서는 브라우저 기본 제출만 막고 실제 인증 계약이 연결될 자리를 보존합니다.
  function handleSubmit(event) {
    event.preventDefault();
  }

  return (
    <main className={styles["signup-page"]}>
      <section className={styles["signup-content"]}>
        <header className={styles["title-area"]}>
          <h1>회원가입</h1>
        </header>

        <form className={styles["signup-form"]} onSubmit={handleSubmit} noValidate>
          <fieldset className={styles["terms-section"]}>
            <legend>
              약관 동의 <span aria-hidden="true">*</span>
            </legend>

            <div className={styles["terms-box"]}>
              <label className={styles["all-terms"]}>
                <input type="checkbox" />
                <span>
                  <strong>전체동의</strong>
                  <small>
                    필수 및 선택항목에 모두 동의합니다.
                    <br />
                    선택항목은 동의하지 않아도 서비스를 이용할 수 있습니다.
                  </small>
                </span>
              </label>

              <div className={styles["terms-divider"]} aria-hidden="true" />

              <label className={styles["term-option"]}>
                <input type="checkbox" />
                <span>(필수) 서비스 이용약관 동의</span>
              </label>

              <label className={styles["term-option"]}>
                <input type="checkbox" />
                <span>(필수) AI 생성 콘텐츠 이용 안내 동의</span>
              </label>
            </div>
          </fieldset>

          <div className={styles["fields-section"]}>
            <div className={styles["field-row"]}>
              <label htmlFor="signup-nickname">
                닉네임 <span aria-hidden="true">*</span>
              </label>
              <input
                id="signup-nickname"
                name="nickname"
                type="text"
                value={nickname}
                placeholder="닉네임"
                autoComplete="nickname"
                onChange={handleNicknameChange}
              />
            </div>

            <div className={styles["field-row"]}>
              <label htmlFor="signup-email">
                이메일 <span aria-hidden="true">*</span>
              </label>
              <input
                id="signup-email"
                name="email"
                type="email"
                value={email}
                placeholder="사용할 이메일을 입력해 주세요."
                autoComplete="email"
                onChange={handleEmailChange}
              />
            </div>

            <div className={styles["field-row"]}>
              <label htmlFor="signup-password">
                비밀번호 <span aria-hidden="true">*</span>
              </label>
              <div className={styles["password-field"]}>
                <div className={styles["password-input"]}>
                  <input
                    id="signup-password"
                    name="password"
                    type={isPasswordVisible ? "text" : "password"}
                    value={password}
                    placeholder="비밀번호"
                    autoComplete="new-password"
                    onChange={handlePasswordChange}
                  />
                  <button
                    type="button"
                    // 아이콘만 있는 버튼의 기능을 보조기기가 알 수 있도록 현재 동작을 이름으로 제공합니다.
                    aria-label="누르고 있는 동안 비밀번호 보기"
                    // 현재 비밀번호가 표시되는지 버튼의 눌림 상태로 전달합니다.
                    aria-pressed={isPasswordVisible}
                    onPointerDown={handlePasswordVisibilityStart}
                    onPointerUp={handlePasswordVisibilityEnd}
                    onPointerCancel={handlePasswordVisibilityEnd}
                    onPointerLeave={handlePasswordVisibilityEnd}
                    onKeyDown={handlePasswordVisibilityKeyDown}
                    onKeyUp={handlePasswordVisibilityKeyUp}
                    onBlur={handlePasswordVisibilityEnd}
                  >
                    <span className="material-symbols-outlined" aria-hidden="true">
                      {isPasswordVisible ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className={styles["field-row"]}>
              <label htmlFor="signup-password-confirm">
                비밀번호 확인 <span aria-hidden="true">*</span>
              </label>
              <div className={styles["password-input"]}>
                <input
                  id="signup-password-confirm"
                  name="passwordConfirm"
                  type={isPasswordConfirmVisible ? "text" : "password"}
                  value={passwordConfirm}
                  placeholder="비밀번호 확인"
                  autoComplete="new-password"
                  onChange={handlePasswordConfirmChange}
                />
                <button
                  type="button"
                  // 아이콘만 있는 버튼의 기능을 보조기기가 알 수 있도록 현재 동작을 이름으로 제공합니다.
                  aria-label="누르고 있는 동안 비밀번호 확인 보기"
                  // 확인 입력의 공개 여부를 첫 번째 비밀번호와 독립된 눌림 상태로 전달합니다.
                  aria-pressed={isPasswordConfirmVisible}
                  onPointerDown={handlePasswordConfirmVisibilityStart}
                  onPointerUp={handlePasswordConfirmVisibilityEnd}
                  onPointerCancel={handlePasswordConfirmVisibilityEnd}
                  onPointerLeave={handlePasswordConfirmVisibilityEnd}
                  onKeyDown={handlePasswordConfirmVisibilityKeyDown}
                  onKeyUp={handlePasswordConfirmVisibilityKeyUp}
                  onBlur={handlePasswordConfirmVisibilityEnd}
                >
                  <span className="material-symbols-outlined" aria-hidden="true">
                    {isPasswordConfirmVisible ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className={styles["action-area"]}>
            <button className={styles["signup-button"]} type="submit" disabled>
              가입하기
            </button>
            <Link className={styles["login-link"]} href="/login">
              이미 계정이 있습니다.
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./page.module.scss";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d\s])\S{8,16}$/;

// 빈 값과 이메일 형식 오류의 우선순위를 한곳에서 관리합니다.
function validateEmail(email) {
  if (!email.trim()) {
    return "이메일을 입력해 주세요.";
  }

  if (!EMAIL_PATTERN.test(email)) {
    return "올바른 이메일 형식을 입력해 주세요.";
  }

  return "";
}

// 비밀번호는 공백 없이 영문·숫자·특수문자를 포함한 8~16자인지 확인합니다.
function validatePassword(password) {
  if (!password) {
    return "비밀번호를 입력해 주세요.";
  }

  if (!PASSWORD_PATTERN.test(password)) {
    return "영문, 숫자, 특수문자를 포함해 8~16자로 입력해 주세요.";
  }

  return "";
}

export default function SignupPage() {
  const [nickname, setNickname] = useState(""); // 닉네임 입력값
  const [email, setEmail] = useState(""); // 이메일 입력값
  const [password, setPassword] = useState(""); // 비밀번호 입력값
  const [passwordConfirm, setPasswordConfirm] = useState(""); // 비밀번호 확인 입력값
  const [isServiceTermsAccepted, setIsServiceTermsAccepted] = useState(false); // 서비스 이용약관 동의 여부
  const [isAiTermsAccepted, setIsAiTermsAccepted] = useState(false); // AI 콘텐츠 이용 안내 동의 여부
  const [isNicknameTouched, setIsNicknameTouched] = useState(false); // 닉네임 오류 공개 여부
  const [isEmailTouched, setIsEmailTouched] = useState(false); // 이메일 오류 공개 여부
  const [isPasswordTouched, setIsPasswordTouched] = useState(false); // 비밀번호 오류 공개 여부
  const [isPasswordConfirmTouched, setIsPasswordConfirmTouched] = useState(false); // 비밀번호 확인 오류 공개 여부
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); // 비밀번호 공개 여부
  const [isPasswordConfirmVisible, setIsPasswordConfirmVisible] = useState(false); // 비밀번호 확인 공개 여부

  const isAllTermsAccepted = isServiceTermsAccepted && isAiTermsAccepted;
  const nicknameError = nickname.trim() ? "" : "닉네임을 입력해 주세요.";
  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);
  const passwordConfirmError = !passwordConfirm
    ? "비밀번호 확인을 입력해 주세요."
    : passwordConfirm !== password
      ? "비밀번호가 일치하지 않습니다."
      : "";
  const visibleNicknameError = isNicknameTouched ? nicknameError : "";
  const visibleEmailError = isEmailTouched ? emailError : "";
  const visiblePasswordError = isPasswordTouched ? passwordError : "";
  const visiblePasswordConfirmError = isPasswordConfirmTouched
    ? passwordConfirmError
    : "";
  const isFormLocallyValid =
    isAllTermsAccepted &&
    !nicknameError &&
    !emailError &&
    !passwordError &&
    !passwordConfirmError;

  // 각 입력을 제어 상태로 유지해 검증 결과가 현재 화면 값과 항상 일치하게 합니다.
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

  // 전체 동의는 별도 원본 상태로 저장하지 않고 두 필수 약관을 같은 값으로 변경합니다.
  function handleAllTermsChange(event) {
    const isChecked = event.target.checked;
    setIsServiceTermsAccepted(isChecked);
    setIsAiTermsAccepted(isChecked);
  }

  function handleServiceTermsChange(event) {
    setIsServiceTermsAccepted(event.target.checked);
  }

  function handleAiTermsChange(event) {
    setIsAiTermsAccepted(event.target.checked);
  }

  // 입력을 한 번 벗어난 뒤부터 오류를 공개하기 위해 입력별 touched 상태를 기록합니다.
  function handleNicknameBlur() {
    setIsNicknameTouched(true);
  }

  function handleEmailBlur() {
    setIsEmailTouched(true);
  }

  function handlePasswordBlur() {
    setIsPasswordTouched(true);
  }

  function handlePasswordConfirmBlur() {
    setIsPasswordConfirmTouched(true);
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

  // 키보드 사용자가 Enter 또는 Space를 누르는 동안에도 비밀번호를 확인할 수 있게 합니다.
  function handlePasswordVisibilityKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handlePasswordVisibilityStart();
    }
  }

  function handlePasswordVisibilityKeyUp(event) {
    if (event.key === "Enter" || event.key === " ") {
      handlePasswordVisibilityEnd();
    }
  }

  function handlePasswordConfirmVisibilityKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handlePasswordConfirmVisibilityStart();
    }
  }

  function handlePasswordConfirmVisibilityKeyUp(event) {
    if (event.key === "Enter" || event.key === " ") {
      handlePasswordConfirmVisibilityEnd();
    }
  }

  // 제출 시 모든 로컬 오류를 공개하지만 실제 회원가입이나 중복 확인은 실행하지 않습니다.
  function handleSubmit(event) {
    event.preventDefault();
    setIsNicknameTouched(true);
    setIsEmailTouched(true);
    setIsPasswordTouched(true);
    setIsPasswordConfirmTouched(true);
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
                <input
                  type="checkbox"
                  checked={isAllTermsAccepted}
                  onChange={handleAllTermsChange}
                />
                <span>
                  <strong>전체동의</strong>
                  <small>두 필수 약관에 모두 동의합니다.</small>
                </span>
              </label>

              <div className={styles["terms-divider"]} aria-hidden="true" />

              <label className={styles["term-option"]}>
                <input
                  type="checkbox"
                  checked={isServiceTermsAccepted}
                  onChange={handleServiceTermsChange}
                />
                <span>(필수) 서비스 이용약관 동의</span>
              </label>

              <label className={styles["term-option"]}>
                <input
                  type="checkbox"
                  checked={isAiTermsAccepted}
                  onChange={handleAiTermsChange}
                />
                <span>(필수) AI 생성 콘텐츠 이용 안내 동의</span>
              </label>
            </div>
          </fieldset>

          <div className={styles["fields-section"]}>
            <div className={styles["field-row"]}>
              <label htmlFor="signup-nickname">
                닉네임 <span aria-hidden="true">*</span>
              </label>
              <div className={styles["field-control"]}>
                <input
                  id="signup-nickname"
                  name="nickname"
                  type="text"
                  value={nickname}
                  placeholder="닉네임"
                  autoComplete="nickname"
                  // 검증 이후 잘못된 값임을 보조기기에 전달합니다.
                  aria-invalid={Boolean(visibleNicknameError)}
                  // 공개된 오류가 있을 때만 입력과 해당 설명을 연결합니다.
                  aria-describedby={visibleNicknameError ? "signup-nickname-error" : undefined}
                  onChange={handleNicknameChange}
                  onBlur={handleNicknameBlur}
                />
                {visibleNicknameError && (
                  <p id="signup-nickname-error" role="alert">
                    {visibleNicknameError}
                  </p>
                )}
              </div>
            </div>

            <div className={styles["field-row"]}>
              <label htmlFor="signup-email">
                이메일 <span aria-hidden="true">*</span>
              </label>
              <div className={styles["field-control"]}>
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  value={email}
                  placeholder="사용할 이메일을 입력해 주세요."
                  autoComplete="email"
                  // 검증 이후 잘못된 값임을 보조기기에 전달합니다.
                  aria-invalid={Boolean(visibleEmailError)}
                  // 공개된 오류가 있을 때만 입력과 해당 설명을 연결합니다.
                  aria-describedby={visibleEmailError ? "signup-email-error" : undefined}
                  onChange={handleEmailChange}
                  onBlur={handleEmailBlur}
                />
                {visibleEmailError && (
                  <p id="signup-email-error" role="alert">
                    {visibleEmailError}
                  </p>
                )}
              </div>
            </div>

            <div className={styles["field-row"]}>
              <label htmlFor="signup-password">
                비밀번호 <span aria-hidden="true">*</span>
              </label>
              <div className={styles["field-control"]}>
                <div className={styles["password-input"]}>
                  <input
                    id="signup-password"
                    name="password"
                    type={isPasswordVisible ? "text" : "password"}
                    value={password}
                    placeholder="비밀번호"
                    autoComplete="new-password"
                    // 검증 이후 잘못된 값임을 보조기기에 전달합니다.
                    aria-invalid={Boolean(visiblePasswordError)}
                    // 공개된 오류가 있을 때만 입력과 해당 설명을 연결합니다.
                    aria-describedby={visiblePasswordError ? "signup-password-error" : undefined}
                    onChange={handlePasswordChange}
                    onBlur={handlePasswordBlur}
                  />
                  <button
                    type="button"
                    // 아이콘만 있는 버튼의 기능을 보조기기가 알 수 있도록 동작을 이름으로 제공합니다.
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
                {visiblePasswordError && (
                  <p id="signup-password-error" role="alert">
                    {visiblePasswordError}
                  </p>
                )}
              </div>
            </div>

            <div className={styles["field-row"]}>
              <label htmlFor="signup-password-confirm">
                비밀번호 확인 <span aria-hidden="true">*</span>
              </label>
              <div className={styles["field-control"]}>
                <div className={styles["password-input"]}>
                  <input
                    id="signup-password-confirm"
                    name="passwordConfirm"
                    type={isPasswordConfirmVisible ? "text" : "password"}
                    value={passwordConfirm}
                    placeholder="비밀번호 확인"
                    autoComplete="new-password"
                    // 검증 이후 잘못된 값임을 보조기기에 전달합니다.
                    aria-invalid={Boolean(visiblePasswordConfirmError)}
                    // 공개된 오류가 있을 때만 입력과 해당 설명을 연결합니다.
                    aria-describedby={
                      visiblePasswordConfirmError ? "signup-password-confirm-error" : undefined
                    }
                    onChange={handlePasswordConfirmChange}
                    onBlur={handlePasswordConfirmBlur}
                  />
                  <button
                    type="button"
                    // 아이콘만 있는 버튼의 기능을 보조기기가 알 수 있도록 동작을 이름으로 제공합니다.
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
                {visiblePasswordConfirmError && (
                  <p id="signup-password-confirm-error" role="alert">
                    {visiblePasswordConfirmError}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className={styles["action-area"]}>
            <button
              className={styles["signup-button"]}
              type="submit"
              disabled={!isFormLocallyValid}
            >
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

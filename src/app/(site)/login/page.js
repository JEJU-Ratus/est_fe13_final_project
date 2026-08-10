"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import CommonModal from "@/components/CommonModal";
import Loading from "@/components/Loading";
import styles from "./page.module.scss";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email) {
  if (!email.trim()) {
    return "이메일을 입력해 주세요.";
  }

  if (!EMAIL_PATTERN.test(email)) {
    return "올바른 이메일 형식을 입력해 주세요.";
  }

  return "";
}

function validatePassword(password) {
  return password ? "" : "비밀번호를 입력해 주세요.";
}

export default function LoginPage() {
  // 사용자가 입력한 이메일 값을 제어하고 이메일 검증에 사용합니다.
  const [email, setEmail] = useState("");
  // 사용자가 입력한 비밀번호 값을 제어하며 실제 인증 연동 시 요청 값으로 사용합니다.
  const [password, setPassword] = useState("");
  // 이메일 입력란을 한 번이라도 벗어났는지 기록해 오류 문구의 공개 시점을 결정합니다.
  const [isEmailTouched, setIsEmailTouched] = useState(false);
  // 비밀번호 입력란을 한 번이라도 벗어났는지 기록해 오류 문구의 공개 시점을 결정합니다.
  const [isPasswordTouched, setIsPasswordTouched] = useState(false);
  // 로그인 상태 유지 체크박스의 선택 여부만 관리하며 세션 저장은 아직 수행하지 않습니다.
  const [isLoginPersistent, setIsLoginPersistent] = useState(false);

  // 실제 인증 연동 전에는 요청을 시작하지 않으며, 추후 요청 생명주기만 이 상태에 연결합니다.
  const [isLoading] = useState(false);
  // 자격 정보 실패 문구는 실제 인증 결과가 연결된 뒤 이 상태로 관리합니다.
  const [formError] = useState("");
  // 실제 로그인 사용자 판정이나 시스템 오류가 연결되기 전에는 모달을 열지 않습니다.
  const [loginModal] = useState({
    isOpen: false,
    mode: "alreadyLoggedIn",
    status: undefined,
  });

  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);
  const shouldShowValidation = isEmailTouched || isPasswordTouched;
  const validationMessage = shouldShowValidation ? emailError || passwordError : "";
  const visibleErrorMessage = formError || validationMessage;
  const hasVisibleEmailError = shouldShowValidation && Boolean(emailError);
  const hasVisiblePasswordError = shouldShowValidation && !emailError && Boolean(passwordError);
  const isFormValid = !emailError && !passwordError;
  const isLoginDisabled = !isFormValid || isLoading;

  function handleEmailChange(event) {
    setEmail(event.target.value);
  }

  function handlePasswordChange(event) {
    setPassword(event.target.value);
  }

  function handleEmailBlur() {
    setIsEmailTouched(true);
  }

  function handlePasswordBlur() {
    setIsPasswordTouched(true);
  }

  function handlePersistenceChange(event) {
    setIsLoginPersistent(event.target.checked);
  }

  function handleSubmit(event) {
    event.preventDefault();
    setIsEmailTouched(true);
    setIsPasswordTouched(true);

    // 실제 Supabase 인증 계약이 확정되기 전에는 검증을 통과해도 요청이나 이동을 실행하지 않습니다.
  }

  return (
    <main className={styles["login-page"]}>
      <div className={styles["login-content"]}>
        <div className={styles["brand-area"]}>
          <Image
            className={styles["brand-logo"]}
            src="/images/프다로고.png"
            alt="프다!"
            width={550}
            height={237}
            priority
          />
          <p className={styles["brand-description"]}>프론트엔드 지식을, 더 쉽게</p>
        </div>

        <form className={styles["login-form"]} onSubmit={handleSubmit} noValidate>
          <div className={styles["credential-row"]}>
            <div className={styles["input-section"]}>
              <div className={styles["field-group"]}>
                <label className={styles["visually-hidden"]} htmlFor="login-email">
                  이메일
                </label>
                <div className={styles["input-box"]}>
                  {/* 아이콘은 장식용이며 입력 이름은 연결된 label이 전달하므로 중복 낭독을 막습니다. */}
                  <span className="material-symbols-outlined" aria-hidden="true">
                    person
                  </span>
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    value={email}
                    placeholder="이메일"
                    autoComplete="email"
                    disabled={isLoading}
                    // 오류 상태와 문구의 관계를 보조기기가 함께 인식하도록 연결합니다.
                    aria-invalid={hasVisibleEmailError}
                    aria-describedby={
                      hasVisibleEmailError ? "login-validation-message" : undefined
                    }
                    onChange={handleEmailChange}
                    onBlur={handleEmailBlur}
                  />
                </div>
              </div>

              <div className={styles["field-group"]}>
                <label className={styles["visually-hidden"]} htmlFor="login-password">
                  비밀번호
                </label>
                <div className={styles["input-box"]}>
                  {/* 아이콘은 장식용이며 입력 이름은 연결된 label이 전달하므로 중복 낭독을 막습니다. */}
                  <span className="material-symbols-outlined" aria-hidden="true">
                    lock
                  </span>
                  <input
                    id="login-password"
                    name="password"
                    type="password"
                    value={password}
                    placeholder="비밀번호"
                    autoComplete="current-password"
                    disabled={isLoading}
                    // 오류 상태와 문구의 관계를 보조기기가 함께 인식하도록 연결합니다.
                    aria-invalid={hasVisiblePasswordError}
                    aria-describedby={
                      hasVisiblePasswordError ? "login-validation-message" : undefined
                    }
                    onChange={handlePasswordChange}
                    onBlur={handlePasswordBlur}
                  />
                </div>
              </div>
            </div>

            <button
              className={styles["login-button"]}
              type="submit"
              disabled={isLoginDisabled}
            >
              로그인
            </button>
          </div>

          {/* 오류가 없어도 영역을 유지해 메시지 표시 전후에 로그인 레이아웃이 움직이지 않게 합니다. */}
          <p
            className={styles["form-error"]}
            id="login-validation-message"
            // 현재 사용자가 수정해야 할 단일 오류 문구를 즉시 알립니다.
            role={visibleErrorMessage ? "alert" : undefined}
          >
            {visibleErrorMessage}
          </p>

          <label className={styles["persistence-option"]}>
            <input
              type="checkbox"
              checked={isLoginPersistent}
              disabled={isLoading}
              onChange={handlePersistenceChange}
            />
            <span>로그인 상태 유지</span>
          </label>

          <div className={styles["social-divider"]}>
            <span aria-hidden="true" />
            <p>간편 로그인</p>
            <span aria-hidden="true" />
          </div>

          <div className={styles["social-buttons"]}>
            <button
              className={styles["social-button"]}
              type="button"
              disabled={isLoading}
              aria-label="카카오로 로그인"
            >
              {/* 접근 가능한 이름은 버튼이 제공하므로 아이콘의 중복 낭독을 막습니다. */}
              <Image src="/images/kakao-icon.svg" alt="" width={56} height={56} />
            </button>
            <button
              className={styles["social-button"]}
              type="button"
              disabled={isLoading}
              aria-label="구글로 로그인"
            >
              {/* 접근 가능한 이름은 버튼이 제공하므로 아이콘의 중복 낭독을 막습니다. */}
              <Image src="/images/google-icon.svg" alt="" width={56} height={56} />
            </button>
          </div>

          <p className={styles["signup-guide"]}>
            아직 계정이 없으신가요?
            <Link href="/signup">회원가입</Link>
          </p>
        </form>
      </div>

      {isLoading && <Loading />}
      <CommonModal
        isOpen={loginModal.isOpen}
        mode={loginModal.mode}
        status={loginModal.status}
      />
    </main>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "./CommonModal.module.scss";

const AUTO_DESTINATIONS = {
  requireLogin: "/login",
  alreadyLoggedIn: "/",
};

const MODE_MESSAGES = {
  preparing: "현재 준비 중입니다.",
  suggestLogin: "로그인이 필요합니다.",
  requireLogin: "로그인이 필요합니다.",
  alreadyLoggedIn: "이미 로그인하셨습니다. 메인페이지로 이동합니다.",
};

export default function CommonModal(props) {
  const { isOpen, mode, onClose } = props;
  const router = useRouter();
  const timerRef = useRef(null);
  const autoDestination = AUTO_DESTINATIONS[mode];
  const message = MODE_MESSAGES[mode] ?? "";

  useEffect(() => {
    if (!isOpen || !autoDestination) {
      return undefined;
    }

    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      router.replace(autoDestination);
    }, 3000);

    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [autoDestination, isOpen, router]);

  function handleClose() {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (autoDestination) {
      router.replace(autoDestination);
      return;
    }

    onClose?.();
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles["modal-backdrop"]}>
      <section
        className={styles["modal-container"]}
        role="dialog"
        aria-modal="true"
        aria-label="공통 안내"
        data-mode={mode}
      >
        <button
          className={styles["close-button"]}
          type="button"
          aria-label="닫기"
          onClick={handleClose}
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            close
          </span>
        </button>

        <div className={styles["mascot-wrapper"]}>
          <Image
            className={styles["mascot-image"]}
            src="/images/프비메인.webp"
            alt=""
            fill
            sizes="220px"
            priority
          />
        </div>

        <p className={styles["modal-message"]} aria-live="polite">
          {message}
        </p>

        {mode === "suggestLogin" && (
          <div className={styles["button-group"]}>
            <Link className={styles["link-button"]} href="/login">
              로그인 하러가기
            </Link>
            <Link className={styles["secondary-link"]} href="/summary">
              전체 요약 노트
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

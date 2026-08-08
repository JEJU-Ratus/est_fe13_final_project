"use client";

import Image from "next/image";
import styles from "./CommonModal.module.scss";

export default function CommonModal(props) {
  const { isOpen, mode, onClose } = props;

  function handleClose() {
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

        <p className={styles["modal-message"]} aria-live="polite" />
        <div className={styles["button-group"]} />
      </section>
    </div>
  );
}

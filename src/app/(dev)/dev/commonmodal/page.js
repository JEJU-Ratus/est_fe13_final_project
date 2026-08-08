"use client";

import { useState } from "react";
import CommonModal from "@/components/CommonModal";

const MODES = [
  "preparing",
  "confirmDelete",
  "suggestLogin",
  "requireLogin",
  "alreadyLoggedIn",
  "error",
];

export default function CommonModalDevPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState("preparing");
  const [resultMessage, setResultMessage] = useState("대기 중");

  function handleModeChange(event) {
    setMode(event.target.value);
  }

  function handleModalOpen() {
    setResultMessage(`${mode} 모달 열림`);
    setIsOpen(true);
  }

  function handleModalClose() {
    setResultMessage(`${mode} 모달 닫힘`);
    setIsOpen(false);
  }

  function handleConfirm() {
    setResultMessage("삭제 승인 전달 확인");
  }

  return (
    <main>
      <h1>CommonModal 개발 확인</h1>

      <label htmlFor="common-modal-mode">모달 모드</label>
      <select id="common-modal-mode" value={mode} onChange={handleModeChange}>
        {MODES.map((modeOption) => (
          <option key={modeOption} value={modeOption}>
            {modeOption}
          </option>
        ))}
      </select>

      <button type="button" onClick={handleModalOpen}>
        공통 모달 열기
      </button>

      <p aria-live="polite">확인 결과: {resultMessage}</p>

      <CommonModal
        isOpen={isOpen}
        mode={mode}
        status={500}
        onClose={handleModalClose}
        onConfirm={handleConfirm}
      />
    </main>
  );
}

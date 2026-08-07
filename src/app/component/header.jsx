"use client";

import { useState } from "react";
import styles from "./header.module.scss";

const menuItems = ["요약 노트 생성", "전체 요약 노트", "퀴즈", "마이페이지"];

export default function Header({ isLoggedIn = false, isCollapsed = false }) {
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(isCollapsed);

  function handleCollapse() {
    setIsHeaderCollapsed(true);
  }

  function handleExpand() {
    setIsHeaderCollapsed(false);
  }

  const headerClassName = [
    styles.header,
    isHeaderCollapsed && styles["is-collapsed"],
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <aside className={headerClassName} aria-label="사이드 헤더">
      <div className={styles["header-top"]}>
        {isHeaderCollapsed ? (
          <button
            className={styles["collapsed-logo-button"]}
            type="button"
            aria-label="헤더 펼치기"
            aria-expanded="false"
            onClick={handleExpand}
          >
            <span className={styles["logo-slot"]} aria-hidden="true" />
          </button>
        ) : (
          <div className={styles["logo-slot"]} aria-label="로고 이미지 영역" />
        )}
        {!isHeaderCollapsed && (
          <button
            className={styles["panel-button"]}
            type="button"
            aria-label="헤더 접기"
            aria-expanded="true"
            onClick={handleCollapse}
          >
            <span className={styles["icon-slot"]} aria-hidden="true" />
          </button>
        )}
      </div>

      {!isHeaderCollapsed && (
        <div className={styles["user-section"]}>
          {isLoggedIn ? (
            <div className={styles["logged-in-user"]}>
              <div className={styles["profile-slot"]} aria-label="프로필 이미지 영역" />
              <div className={styles["profile-content"]}>
                <p className={styles["user-name"]}>user name</p>
                <div className={styles["account-buttons"]}>
                  <button className={styles["profile-button"]} type="button">
                    프로필 수정
                  </button>
                  <button className={styles["logout-button"]} type="button">
                    로그아웃
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles["guest-buttons"]}>
              <button className={styles["login-button"]} type="button">
                로그인
              </button>
              <button className={styles["signup-button"]} type="button">
                가입하기
              </button>
            </div>
          )}
        </div>
      )}

      <nav className={styles["menu-list"]} aria-label="주요 메뉴">
        {menuItems.map((menuItem) => (
          <button className={styles["menu-item"]} type="button" key={menuItem}>
            <span className={styles["menu-icon-slot"]} aria-label={`${menuItem} 아이콘 영역`} />
            {!isHeaderCollapsed && <span className={styles["menu-label"]}>{menuItem}</span>}
          </button>
        ))}
      </nav>

      {isHeaderCollapsed ? (
        <div className={styles["collapsed-user-slot"]} aria-label="사용자 이미지 영역" />
      ) : (
        <footer className={styles.footer}>
          <span>이용약관</span>
          <span aria-hidden="true">|</span>
          <span>개인정보처리방침</span>
          <span aria-hidden="true">|</span>
          <span>고객센터</span>
        </footer>
      )}
    </aside>
  );
}

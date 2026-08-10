"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import CommonModal from "./CommonModal";
import styles from "./Header.module.scss";

const menuItems = [
  {
    label: "요약 노트 생성",
    icon: "assignment_add",
    href: "/",
  },
  {
    label: "전체 요약 노트",
    icon: "book_4",
    href: "/Summary",
  },
  {
    label: "퀴즈",
    icon: "quiz",
    modalMode: "preparing",
  },
  {
    label: "마이페이지",
    icon: "person",
    href: "/mypage",
    requiresLogin: true,
  },
];

//헤더가 접힌 페이지
const COLLAPSED_PATHS = ["/login", "/signup", "/signup/complete"];


export default function Header({ isLoggedIn = false }) {
   // 최초 헤더 렌더링 시 현재 경로를 기준으로 접힘/펼침 상태 결정
   // useState의 초기값, 페이지 이동 시 사용자가 선택된 상태 유지
  const pathname = usePathname();
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(() =>
    COLLAPSED_PATHS.includes(pathname)
  );
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isPreparingModalOpen, setIsPreparingModalOpen] = useState(false);


  function handleCollapse() {
    setIsHeaderCollapsed(true);
  }

  function handleExpand() {
    setIsHeaderCollapsed(false);
  }

  function handleMypageClick() {
    if (!isLoggedIn) {
      setIsLoginModalOpen(true);
    }
  }

  function handleQuizClick() {
    setIsPreparingModalOpen(true);
  }

  const headerClassName = [styles.header, isHeaderCollapsed && styles["is-collapsed"]].filter(Boolean).join(" ");

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
            <Image src="/images/프! 로고.png" alt="로고" width={40} height={36} />
          </button>
        ) : (
          <Link href="/" className={styles["logo-button"]} aria-label="홈으로 이동">
            <Image src="/images/프다로고.png" alt="로고" width={59} height={25} />
          </Link>
        )}

        {!isHeaderCollapsed && (
          <button
            className={styles["panel-button"]}
            type="button"
            aria-label="헤더 접기"
            aria-expanded={!isHeaderCollapsed}
            onClick={handleCollapse}
          >
            <span className={`material-symbols-outlined left_panel_close ${styles.icon}`}>left_panel_close</span>
          </button>
        )}
      </div>

      {!isHeaderCollapsed && (
        <div className={styles["user-section"]}>
          {isLoggedIn ? (
            <div className={styles["logged-in-user"]}>
              <div className={styles["profile-slot"]}>
                <Image src="/images/main_profile.webp" alt="프로필 이미지" width={48} height={48} />
              </div>
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
              <Link href="#" className={styles["login-button"]} type="button">
                로그인
              </Link>
              <Link href="#" className={styles["signup-button"]} type="button">
                가입하기
              </Link>
            </div>
          )}
        </div>
      )}

      <nav className={styles["menu-list"]} aria-label="주요 메뉴">
        {menuItems.map((menu) => {
          const menuContent = (
            <>
              <span className={`material-symbols-outlined ${styles["menu-icon-slot"]}`} aria-hidden="true">
                {menu.icon}
              </span>

              {!isHeaderCollapsed && <span className={styles["menu-label"]}>{menu.label}</span>}
            </>
          );

          if (menu.href && (!menu.requiresLogin || isLoggedIn)) {
            return (
              <Link className={styles["menu-item"]} href={menu.href} key={menu.label}>
                {menuContent}
              </Link>
            );
          }

          return (
            <button
              className={styles["menu-item"]}
              type="button"
              key={menu.label}
              onClick={menu.requiresLogin ? handleMypageClick : menu.modalMode ? handleQuizClick : undefined}
            >
              {menuContent}
            </button>
          );
        })}
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
      <CommonModal
        isOpen={isLoginModalOpen}
        mode="suggestLogin"
        onClose={() => setIsLoginModalOpen(false)}
      />
      <CommonModal
        isOpen={isPreparingModalOpen}
        mode="preparing"
        onClose={() => setIsPreparingModalOpen(false)}
      />
    </aside>
  );
}

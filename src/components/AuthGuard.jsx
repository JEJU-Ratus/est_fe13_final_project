"use client";

import CommonModal from "./CommonModal";
import Loading from "./Loading";
import { useAuth } from "./AuthProvider";

export default function AuthGuard({ children }) {
  const { isAuthenticated, isAuthLoading, isLoggingOut } = useAuth();

  // 최초 세션 확인 중에는 보호 화면을 먼저 공개하지 않습니다.
  if (isAuthLoading || isLoggingOut) {
    return <Loading />;
  }

  // 비로그인 사용자는 보호 화면 대신 로그인 안내만 확인할 수 있습니다.
  if (!isAuthenticated) {
    return <CommonModal isOpen mode="requireLogin" />;
  }

  return children;
}

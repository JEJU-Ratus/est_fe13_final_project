"use client";

import CommonModal from "./CommonModal";
import Loading from "./Loading";
import { useAuth } from "./AuthProvider";
import { useEffect, useState } from "react";

export default function GuestGuard({ children }) {
  const { isAuthenticated, isAuthLoading } = useAuth();

  // 페이지 최초 진입 시의 인증 상태만 판정하고 이후 로그인 변화에는 유지합니다
  const [accessStatus, setAccessStatus] = useState("checking");

  useEffect(() => {
    if (isAuthLoading || accessStatus !== "checking") {
      return;
    }
    setAccessStatus(isAuthenticated ? "blocked" : "allowed");
  }, [accessStatus, isAuthenticated, isAuthLoading]);

  if (isAuthLoading || accessStatus === "checking") {
    return <Loading />;
  }

  return (
    <>
      {children}

      <CommonModal isOpen={accessStatus === "blocked"} mode="alreadyLoggedIn" />
    </>
  );
}

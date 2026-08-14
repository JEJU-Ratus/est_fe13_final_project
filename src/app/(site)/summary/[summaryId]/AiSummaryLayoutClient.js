"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import styles from "./SummaryId.module.scss";

export default function AiSummaryLayoutClient({ summaryId }) {
  //서버에서 실제 북마크 상태를 받아오도록 변경
  const [isBookmarked, setBookmarked] = useState(false);

  // 현재 북마크 상태에 따라 버튼 안내 문구 설정
  const bookmarkLabel = isBookmarked ? "북마크 삭제" : "북마크 담기";

  //북마크 추가/삭제 처리
  async function handleBookmarkToggle() {
    const supabase = createClient();

    //현재 로그인 사용자 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    //로그인 사용자가 없으면 동작 중단
    if (!user) return;

    // 이미 북마크 되어 있으면 삭제
    if (isBookmarked) {
      const { error } = await supabase;
    }
  }
}

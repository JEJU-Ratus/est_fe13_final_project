import AllSummary from "@/components/Allsummary";
import AuthGuard from "@/components/AuthGuard";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Bookmarks() {
  const supabase = await createClient();
  // 현재 로그인한 사용자 정보를 가져와서 user에 저장
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  // 로그인 한 사용자가 없을 때
  if (userError || !user) {
    redirect("/login");
  }
  // 내가 북마크한 summary_id 조회
  const { data: bookmarks, error: bookmarksError } = await supabase
    .from("bookmarks")
    .select("summary_id")
    .eq("user_id", user.id);

  if (bookmarksError) {
    console.error("북마크 조회 실패:", bookmarksError);
    return null;
  }

  // 북마크한 summary_id만 배열로 만들기
  const summaryIds = (bookmarks ?? []).map(bookmark => bookmark.summary_id);

  // 북마크한 요약본 조회
  const { data: summaries, error: summariesError } = await supabase
    .from("summaries")
    .select(
      `
    id,
    author_id,
    topic,
    title,
    excerpt,
    is_locked,
    created_at
    `,
    )
    .in("id", summaryIds);

  if (summariesError) {
    console.error("북마크 요약 조회 실패:", summariesError);
    return null;
  }
  // 작성자 닉네임 + 프로필 이미지 연결
  const authorIds = [...new Set((summaries ?? []).map(summary => summary.author_id))];

  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("id,nickname,profile_image_url")
    .in("id", authorIds);

  if (profileError) {
    console.error("프로필 조회 실패:", profileError);
    return null;
  }

  const profileMap = new Map((profiles ?? []).map(profile => [profile.id, profile]));

  //북마크 페이지에 있는 카드는 전부 북마크된 상태
  const summaryCards = (summaries ?? []).map(summary => {
    const profile = profileMap.get(summary.author_id);

    return {
      ...summary,
      nickname: profile?.nickname,
      profile_image_url: profile?.profile_image_url,
      isBookmarked: true,
    };
  });

  return (
    <AuthGuard>
      <AllSummary title="북마크" summaries={summaryCards} />
    </AuthGuard>
  );
}

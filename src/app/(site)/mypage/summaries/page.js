import AllSummary from "@/components/Allsummary";
import AuthGuard from "@/components/AuthGuard";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Summaries() {
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

  const { data: summaries, error: summariesError } = await supabase
    .from("summaries")
    // 테이블에서 가져올 컬럼을 고르는 것
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
    .eq("author_id", user.id) //내가 작성한 요약본만 조회
    .order("created_at", { ascending: false }); //created_at 기준으로 최신순으로 정렬

  // profiles 테이블에서 id가 현재 로그인 한 user.id와 같은 사람 찾기
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("nickname, profile_image")
    .eq("id", user.id)
    .maybeSingle(); //0개 또는 1개일 거라고 예상할 때

  // 요약본 조회 실패
  if (summariesError) {
    console.error("내 요약노트 조회 실패:", summariesError);
    return null;
  }
  // 프로필 조회 실패
  if (profileError) {
    console.error("프로필 조회 실패:", profileError);
    return null;
  }

  // 요약본 데이터에 프로필 정보 합치기
  const summaryCards = (summaries ?? []).map(summary => ({
    ...summary,
    nickname: profile?.nickname,
    profile_image: profile?.profile_image,
  }));

  console.log("내 요약 데이터:", summaryCards);

  return (
    <AuthGuard>
      <AllSummary title="내 요약 노트" summaries={summaries} />
    </AuthGuard>
  );
}

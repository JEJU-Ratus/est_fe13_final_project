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

  const { data: bookmarks, error: bookmarksError } = await supabase
    .from("bookmarks")
    .select("summary_id")
    .eq("user_id", user.id);

  if (bookmarksError) {
    console.error("북마크 조회 실패:", bookmarksError);
    return null;
  }

  return (
    <AuthGuard>
      <AllSummary title="북마크" summaries={[]} />
    </AuthGuard>
  );
}

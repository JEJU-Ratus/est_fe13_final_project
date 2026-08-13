import AllSummary from "@/components/Allsummary";
import AuthGuard from "@/components/AuthGuard";

export default function Bookmarks() {
  return (
    <AuthGuard>
      <AllSummary title="북마크" view="bookmarks" currentUserId="user-001" />
    </AuthGuard>
  );
}

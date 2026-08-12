import AllSummary from "@/components/Allsummary";
import AuthGuard from "@/components/AuthGuard";

export default function Mysummeries() {
  return (
    <AuthGuard>
      <AllSummary title="내 요약 노트" view="mine" currentUserId="user-001" />
    </AuthGuard>
  );
}

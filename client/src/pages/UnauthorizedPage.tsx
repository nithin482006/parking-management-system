import { useAuth } from "@/_core/hooks/useAuth";
import { UnauthorizedView } from "@/components/UnauthorizedView";

export default function UnauthorizedPage() {
  const { loginUrl, oauthError } = useAuth();

  return <UnauthorizedView loginUrl={loginUrl} oauthError={oauthError} />;
}

import { useAuth } from "../hooks/useAuth";

export default function DashboardSimple() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Not authenticated</div>;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {(user as any)?.email}!</p>
    </div>
  );
}
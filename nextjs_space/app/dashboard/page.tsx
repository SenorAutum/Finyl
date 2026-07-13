// app/dashboard/page.tsx
import DashboardClient from './_components/dashboard-client';

/**
 * DashboardPage - Main Server Component Entry Point for Finyl.
 * This component acts as the secure shell for the dashboard route
 * and serves the interactive client-side application layer.
 */
export default function DashboardPage() {
  return <DashboardClient />;
}

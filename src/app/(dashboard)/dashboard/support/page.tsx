import type { Metadata } from "next";
import { auth } from "@/auth";
import { getUserTickets } from "@/server/dashboard";
import { SupportTickets } from "@/components/dashboard/support-tickets";

export const metadata: Metadata = {
  title: "Поддержка",
};

export default async function DashboardSupport() {
  const session = await auth();
  const tickets = await getUserTickets(session!.user!.id);

  return <SupportTickets tickets={tickets} />;
}

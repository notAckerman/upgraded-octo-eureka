import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export const metadata: Metadata = {
  title: {
    template: "%s · Админка · Узел",
    default: "Админка · Узел",
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="min-h-dvh bg-[var(--bg)]">
      <AdminSidebar />
      <main className="px-4 pb-12 pt-16 lg:pl-60 lg:pt-8">
        <div className="mx-auto max-w-6xl lg:px-8">{children}</div>
      </main>
    </div>
  );
}

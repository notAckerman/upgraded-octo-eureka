import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { getUserKeys } from "@/server/dashboard";
import { KeysManager } from "@/components/dashboard/keys-manager";

export const metadata: Metadata = {
  title: "Ключи",
};

export default async function DashboardKeys() {
  const t = await getTranslations("dashboard");
  const session = await auth();
  const keys = await getUserKeys(session!.user!.id);

  return (
    <KeysManager
      keys={keys}
      labels={{
        createKey: t("createKey"),
        keyName: t("keyName"),
        revokeKey: t("revokeKey"),
        keyCreated: t("keyCreated"),
        emptyKeys: t("emptyKeys"),
      }}
    />
  );
}

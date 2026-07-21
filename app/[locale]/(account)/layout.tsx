import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getMemberSettings } from "@/lib/member-settings";
import { getCurrentUser } from "@/lib/session";
import {
  getUserRatings,
  getShortlistedWallpaperIds,
} from "@/lib/db/queries/wallpapers";
import { UserInteractionsProvider } from "@/components/user-interactions-provider";

export default async function AccountShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [{ canRegister, canSubmit }, user] = await Promise.all([
    getMemberSettings(),
    getCurrentUser(),
  ]);
  const isAdmin = user?.roleId === 1;
  const isStaff = isAdmin || user?.roleId === 3;

  const [ratings, shortlisted] = user
    ? await Promise.all([
        getUserRatings(user.id),
        getShortlistedWallpaperIds(user.id),
      ])
    : [[], []];

  return (
    <UserInteractionsProvider
      initialRatings={ratings}
      initialShortlisted={shortlisted}
    >
      <div className="min-h-screen flex flex-col">
        <Header canRegister={canRegister} canSubmit={canSubmit} isStaff={isStaff} isAdmin={isAdmin} />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </UserInteractionsProvider>
  );
}

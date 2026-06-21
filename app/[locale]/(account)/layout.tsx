import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getMemberSettings } from "@/lib/member-settings";

export default async function AccountShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { canRegister, canSubmit } = await getMemberSettings();

  return (
    <div className="min-h-screen flex flex-col">
      <Header canRegister={canRegister} canSubmit={canSubmit} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

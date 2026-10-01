import { redirect } from "next/navigation";

/**
 * Flag to control visibility of the News section.
 * Change to `true` when ready to unlock the news pages.
 */
export const NEWS_ENABLED = false;

export default function NewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!NEWS_ENABLED) {
    redirect("/");
  }

  return <>{children}</>;
}

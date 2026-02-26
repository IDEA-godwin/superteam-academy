import { useTranslations } from "next-intl";

import Header from "~/components/Header";
import { Button } from "~/components/ui/button";

export default function Home() {
  const t = useTranslations("IndexPage")
  return (
    <div className="flex flex-col items-center justify-center font-sans dark:bg-foreground">
      <Header />
      <main className="flex flex-col lg:flex-row w-full max-w-8xl md:max-w-6xl items-center justify-between py-32 px-3">
        <div>
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-7xl">
            {t("welcomeMessage")}
          </h1>
          <p className="mt-5 text-2xl text-gray-500 dark:text-gray-400">
            {t("description")}
          </p>
        </div>
        <div>
          <Button
            className="
            bg-[#008c4c] hover:bg-[#2f6b3f] text-background font-extrabold uppercase tracking-wide
            text-md w-64 rounded-xl px-8 py-4 shadow-[0_4px_0_#3a8a00] active:shadow-none
            hover:shadow-[0_4px_0_#3a8a00] hover:translate-y-0.5
            active:translate-y-1 transition-all duration-100
          ">
            Get Started
          </Button>
        </div>
      </main>
    </div>
  );
}

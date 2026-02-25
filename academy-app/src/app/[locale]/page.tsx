import { useTranslations } from "next-intl";


export default function Home() {
  const t = useTranslations("IndexPage")
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-8xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-7xl">
          { t("welcomeMessage") }
        </h1>
        <p className="mt-5 text-2xl text-gray-500 dark:text-gray-400">
          { t("description") }
        </p>
      </main>
    </div>
  );
}

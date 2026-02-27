import { useTranslations } from "next-intl";

import Footer from "~/components/Footer";
import Header from "~/components/Header";
import LandingPageMain from "~/components/LandingPageMain";

export default function Home() {
  const t = useTranslations("IndexPage")
  return (
    <div className="flex flex-col items-center justify-center font-sans dark:bg-foreground">
      <Header />
       <LandingPageMain />
      <Footer />
    </div>
  );
}

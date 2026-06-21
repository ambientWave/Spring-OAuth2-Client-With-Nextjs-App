"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";

export default function Home() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const [location, setLocation] = useState("Global");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Close mobile menu on scroll or navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Simulate loading bar for internal links
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const href = e.currentTarget.getAttribute("href");
    if (href && (href.startsWith("#") || href === "")) return;

    e.preventDefault();
    setIsLoading(true);
    setIsMobileMenuOpen(false);
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };

  const toggleLanguage = () => {
    const newLocale = locale === 'en' ? 'ar' : 'en';
    router.replace(pathname, { locale: newLocale });
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="relative min-h-screen selection:bg-teal-200 selection:text-teal-900">
      {/* Upper Loading Bar */}
      {isLoading && (
        <div className="fixed top-0 left-0 z-[100] h-1 w-full overflow-hidden bg-teal-50">
          <div className="h-full bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-500 animate-progress origin-left"></div>
        </div>
      )}

      {/* Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-700">
        <div className="absolute -top-24 -left-24 h-[600px] w-[600px] rounded-full bg-teal-400/20 blur-[120px] dark:bg-teal-500/10 transition-opacity"></div>
        <div className="absolute top-0 left-0 h-[300px] w-[300px] rounded-full bg-white opacity-40 blur-[100px] dark:opacity-5"></div>
        <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] animate-blob rounded-full bg-teal-100 opacity-50 blur-3xl filter dark:bg-teal-900/20"></div>
        <div className="animation-delay-2000 absolute top-[20%] right-[-5%] h-[45%] w-[45%] animate-blob rounded-full bg-rose-50 opacity-50 blur-3xl filter dark:bg-rose-900/10"></div>
        <div className="animation-delay-4000 absolute bottom-[-10%] left-[20%] h-[50%] w-[50%] animate-blob rounded-full bg-blue-50 opacity-40 blur-3xl filter dark:bg-blue-900/20"></div>
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 z-50 w-full transition-all duration-500 border-b py-4 ${isScrolled ? "bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-slate-200/50 dark:border-slate-800/50 shadow-sm" : "bg-transparent border-transparent"}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          <div className="text-2xl font-bold tracking-tighter text-teal-600 dark:text-teal-400">
            MEDIGIZE<span className="text-slate-800 dark:text-white">.</span>
          </div>

          {/* Desktop Links */}
          <div className="hidden space-x-8 text-sm font-medium text-slate-600 dark:text-slate-400 md:flex items-center">
            <a href="#" onClick={handleLinkClick} className="hover:text-teal-600 transition-colors">{t('nav.specialties')}</a>
            <a href="#" onClick={handleLinkClick} className="hover:text-teal-600 transition-colors">{t('nav.destinations')}</a>
            <a href="#" onClick={handleLinkClick} className="hover:text-teal-600 transition-colors">{t('nav.howItWorks')}</a>
          </div>

          <div className="flex items-center space-x-4">
            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/login" className="rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-teal-600 dark:bg-teal-500 dark:hover:bg-teal-400">
                {t('nav.getStarted')}
              </Link>
              <button
                onClick={toggleLanguage}
                className="px-3 py-1 rounded-md border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs uppercase"
              >
                {locale === 'en' ? 'العربية' : 'English'}
              </button>
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 md:hidden text-slate-800 dark:text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              <div className="w-6 space-y-1.5 focus:outline-none">
                <span className={`block h-0.5 w-6 bg-current transition-all duration-300 ${isMobileMenuOpen ? "translate-y-2 rotate-45" : ""}`}></span>
                <span className={`block h-0.5 w-6 bg-current transition-all duration-300 ${isMobileMenuOpen ? "opacity-0" : ""}`}></span>
                <span className={`block h-0.5 w-6 bg-current transition-all duration-300 ${isMobileMenuOpen ? "-translate-y-2 -rotate-45" : ""}`}></span>
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay - Moved outside nav to avoid containing block issues with backdrop-filter */}
      <div className={`fixed inset-0 z-[100] md:hidden transition-all duration-300 ${isMobileMenuOpen ? "visible opacity-100" : "invisible opacity-0"}`}>
        <div
          className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
        <div className={`absolute top-0 bottom-0 w-72 glass p-8 shadow-2xl transition-transform duration-500 ${isMobileMenuOpen ? "translate-x-0" : (locale === 'ar' ? "translate-x-full" : "-translate-x-full")} ${locale === 'ar' ? "right-0" : "left-0"}`}>
          <div className="text-xl font-bold tracking-tighter text-teal-600 dark:text-teal-400 mb-12">
            MEDIGIZE<span className="text-slate-800 dark:text-white">.</span>
          </div>
          <div className="flex flex-col space-y-6">
            <a href="#" onClick={handleLinkClick} className="text-lg font-medium text-slate-900 dark:text-white hover:text-teal-600">{t('nav.specialties')}</a>
            <a href="#" onClick={handleLinkClick} className="text-lg font-medium text-slate-900 dark:text-white hover:text-teal-600">{t('nav.destinations')}</a>
            <a href="#" onClick={handleLinkClick} className="text-lg font-medium text-slate-900 dark:text-white hover:text-teal-600">{t('nav.howItWorks')}</a>

            <div className="pt-8 space-y-4">
              <Link href="/login" className="flex items-center justify-center w-full rounded-2xl bg-teal-600 px-6 py-4 text-base font-bold text-white shadow-xl shadow-teal-500/20 transition-all hover:bg-teal-700">
                {t('nav.getStarted')}
              </Link>
              <button
                onClick={toggleLanguage}
                className="w-full flex items-center justify-center space-x-2 px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-900"
              >
                <span className="text-lg">🌐</span>
                <span className="font-semibold uppercase">{locale === 'en' ? 'العربية' : 'English'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <main>
        {/* Hero Section */}
        <section className="relative flex min-h-screen items-center justify-center pt-24 pb-12 overflow-hidden">
          <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-2 lg:items-center">
            <div className="relative z-10 space-y-6 md:space-y-8 text-center lg:text-left rtl:lg:text-right">
              <div className="inline-block rounded-full bg-teal-50 px-4 py-1.5 text-xs md:text-sm font-medium text-teal-700 ring-1 ring-inset ring-teal-600/20 dark:bg-teal-900/30 dark:text-teal-300 dark:ring-teal-500/30">
                {t('hero.badge', { location })}
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl dark:text-white leading-[1.1]">
                {t('hero.title')} <br />
                <span className="bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent">
                  {t('hero.subtitle')}
                </span>
              </h1>
              <p className="mx-auto lg:mx-0 max-w-xl text-base md:text-lg leading-relaxed text-slate-600 dark:text-slate-400">
                {t('hero.description')}
              </p>
              <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 lg:justify-start justify-center rtl:sm:space-x-reverse">
                <button className="flex items-center justify-center rounded-2xl bg-teal-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-teal-500/20 transition-all hover:scale-105 hover:bg-teal-700">
                  {t('hero.findClinic')}
                </button>
                <button className="glass flex items-center justify-center rounded-2xl px-8 py-4 text-base font-bold text-slate-900 transition-all hover:bg-white/50 dark:text-white dark:hover:bg-slate-800/10">
                  {t('hero.consultSpecialist')}
                </button>
              </div>
            </div>

            <div className="relative aspect-[16/10] w-full lg:aspect-[4/3] xl:aspect-[16/10] mt-8 lg:mt-0">
              <div className="glass absolute inset-0 z-10 rounded-[2.5rem] md:rounded-[3rem] overflow-hidden">
                <Image
                  src="/Primary_Care_-_splash.webp"
                  alt="Medical Care Visualization"
                  fill
                  className="object-cover opacity-90 transition-transform duration-700 hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-teal-950/20 via-transparent to-white/10"></div>
              </div>
              {/* Floating Stat Card */}
              <div className={`glass absolute -bottom-6 z-20 hidden rounded-3xl p-6 md:block ${locale === 'ar' ? '-right-6' : '-left-6'}`}>
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                  <div className="h-12 w-12 rounded-2xl bg-teal-500/20 flex items-center justify-center">
                    <span className="text-teal-600 text-2xl font-bold">{t('hero.stats.count')}</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('hero.stats.label')}</div>
                    <div className="text-lg font-bold text-slate-900 dark:text-white">{t('hero.stats.network')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-20 md:py-24 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">{t('services.title')}</h2>
            <p className="mt-4 text-base md:text-lg text-slate-600 dark:text-slate-400">{t('services.description')}</p>

            <div className="mt-12 md:mt-16 grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { title: t('services.items.matching.title'), desc: t('services.items.matching.description'), icon: "🏥" },
                { title: t('services.items.logistics.title'), desc: t('services.items.logistics.description'), icon: "✈️" },
                { title: t('services.items.postCare.title'), desc: t('services.items.postCare.description'), icon: "🤝" }
              ].map((service, i) => (
                <div key={i} className="glass group rounded-3xl p-6 md:p-8 transition-all hover:-translate-y-2 hover:bg-white dark:hover:bg-slate-800">
                  <div className="text-4xl mb-6">{service.icon}</div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{service.title}</h3>
                  <p className="mt-4 text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                    {service.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="py-24">
          <div className="mx-auto max-w-5xl px-6">
            <div className="glass overflow-hidden rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-12 text-center relative">
              <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 h-64 w-64 bg-teal-400/20 rounded-full blur-3xl opacity-50 capitalize"></div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">{t('cta.title')}</h2>
              <p className="mx-auto mt-6 max-w-xl text-base md:text-lg text-slate-600 dark:text-slate-400">
                {t('cta.description')}
              </p>
              <button className="mt-10 rounded-2xl bg-teal-600 px-10 py-4 text-lg font-bold text-white transition-all hover:scale-105 hover:bg-teal-700">
                {t('cta.button')}
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-6 flex flex-col items-center justify-between space-y-6 md:flex-row md:space-y-0">
          <div className="text-xl font-bold tracking-tighter text-teal-600">
            MEDIGIZE<span className="text-slate-800 dark:text-white">.</span>
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400 text-center md:text-left rtl:md:text-right">
            {t('footer.rights')}
          </div>
          <div className="flex space-x-6 rtl:space-x-reverse text-sm font-medium text-slate-600 dark:text-slate-400">
            <a href="#" className="hover:text-teal-600">{t('footer.privacy')}</a>
            <a href="#" className="hover:text-teal-600">{t('footer.terms')}</a>
            <a href="#" className="hover:text-teal-600">{t('footer.contact')}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

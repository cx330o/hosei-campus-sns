import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useLocale } from "../i18n";
import ParticleBackground from "../components/ui/ParticleBackground";

type TechItem = {
  name: string;
  version: string;
  description: string;
  color: string;
};

const techCategories: {
  key: "tech.frontend" | "tech.animation" | "tech.dataValidation" | "tech.devTools";
  items: TechItem[];
}[] = [
  {
    key: "tech.frontend",
    items: [
      { name: "React", version: "19.1", description: "UI Library", color: "from-cyan-500 to-blue-500" },
      { name: "TypeScript", version: "5.8", description: "Type Safety", color: "from-blue-600 to-blue-400" },
      { name: "Tailwind CSS", version: "4.1", description: "Utility-first CSS", color: "from-teal-500 to-cyan-400" },
      { name: "React Router", version: "7.6", description: "Client Routing", color: "from-red-500 to-pink-500" },
      { name: "Radix UI", version: "—", description: "Accessible Primitives", color: "from-purple-600 to-violet-400" },
    ],
  },
  {
    key: "tech.animation",
    items: [
      { name: "GSAP", version: "3.13", description: "Professional Animations", color: "from-green-500 to-emerald-400" },
      { name: "Phosphor Icons", version: "2.1", description: "Icon System", color: "from-amber-500 to-yellow-400" },
    ],
  },
  {
    key: "tech.dataValidation",
    items: [
      { name: "Zod", version: "3.25", description: "Schema Validation", color: "from-indigo-500 to-blue-400" },
      { name: "Google Analytics", version: "GA4", description: "Analytics", color: "from-orange-500 to-amber-400" },
    ],
  },
  {
    key: "tech.devTools",
    items: [
      { name: "Vite", version: "6.3", description: "Build Tool", color: "from-violet-500 to-purple-400" },
      { name: "Vitest", version: "4.1", description: "Unit Testing", color: "from-lime-500 to-green-400" },
      { name: "PWA", version: "—", description: "Installable App", color: "from-pink-500 to-rose-400" },
      { name: "ESLint", version: "9.25", description: "Code Quality", color: "from-indigo-400 to-blue-300" },
    ],
  },
];

const features = [
  { emoji: "🚆", text: "Real-time train timetable with 3 stations" },
  { emoji: "🚆", text: "Train schedule integration (Ekitan data)" },
  { emoji: "⏱️", text: "Live countdown to next train" },
  { emoji: "🏫", text: "Estimated arrival at 4 campus buildings" },
  { emoji: "🌙", text: "Dark mode with system preference detection" },
  { emoji: "🌐", text: "i18n: Japanese / Chinese / English" },
  { emoji: "📱", text: "PWA: installable, offline-capable" },
  { emoji: "💀", text: "Skeleton loading states" },
  { emoji: "✨", text: "Particle background & GSAP animations" },
  { emoji: "🔒", text: "Zod runtime schema validation" },
];

export default function TechPage() {
  const { t } = useLocale();

  return (
    <div className="relative bg-gradient-to-bl from-slate-900 to-indigo-950 min-h-screen text-white overflow-hidden">
      <title>{t("tech.title")}</title>
      <ParticleBackground />

      <div className="relative z-10 mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 mb-8 text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span>{t("tech.backToHome")}</span>
        </Link>

        <h1 className="mb-2 font-bold text-4xl md:text-5xl tracking-tight">
          {t("tech.heading")}
        </h1>
        <p className="mb-12 text-lg text-white/60">{t("tech.subtitle")}</p>

        {/* Tech categories */}
        {techCategories.map((cat) => (
          <section key={cat.key} className="mb-10">
            <h2 className="mb-4 pb-2 border-b border-white/10 font-semibold text-xl text-white/80">
              {t(cat.key)}
            </h2>
            <div className="gap-3 grid grid-cols-2 md:grid-cols-3">
              {cat.items.map((item) => (
                <div
                  key={item.name}
                  className="group relative bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-white/20 rounded-xl p-4 transition-all duration-300 hover:scale-[1.03]"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300`}
                  />
                  <p className="relative font-bold text-lg">{item.name}</p>
                  <p className="relative text-white/40 text-xs">{item.version}</p>
                  <p className="relative mt-1 text-sm text-white/60">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Features */}
        <section className="mb-10">
          <h2 className="mb-4 pb-2 border-b border-white/10 font-semibold text-xl text-white/80">
            {t("tech.features")}
          </h2>
          <div className="gap-2 grid grid-cols-1 md:grid-cols-2">
            {features.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-3 transition-all duration-200"
              >
                <span className="text-2xl">{f.emoji}</span>
                <span className="text-sm text-white/80">{f.text}</span>
              </div>
            ))}
          </div>
        </section>

        <footer className="pt-8 border-t border-white/10 text-center text-sm text-white/40">
          <div className="flex items-center justify-center gap-3 mb-3">
            <img
              src="/images/hosei-cis-logo.jpg"
              alt="法政大学 情報科学研究科"
              width={40}
              height={40}
              className="rounded-md opacity-70"
            />
            <span>法政大学 情報科学研究科</span>
          </div>
          <p>©CODE MATES︎</p>
        </footer>
      </div>
    </div>
  );
}

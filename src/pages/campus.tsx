import { Suspense } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import CampusMap3D from "../components/ui/CampusMap3D";
import { useLocale } from "../i18n";

export default function CampusPage() {
  const { t } = useLocale();

  return (
    <div className="relative bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 min-h-screen text-white">
      <title>3D Campus Map - いちっぷ</title>

      {/* Header */}
      <div className="relative z-10 flex items-center gap-4 px-6 pt-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span>{t("tech.backToHome")}</span>
        </Link>
      </div>

      <div className="relative z-10 px-6 pt-4 pb-2 text-center">
        <h1 className="font-bold text-3xl md:text-4xl tracking-tight">
          🏫 3D Campus Map
        </h1>
        <p className="mt-2 text-sm text-white/50">
          ドラッグで回転 ・ スクロールでズーム ・ 建物にホバーで名前表示
        </p>
      </div>

      {/* 3D Canvas */}
      <Suspense
        fallback={
          <div className="flex justify-center items-center h-[70vh]">
            <div className="border-4 border-white/20 border-t-white rounded-full w-10 h-10 animate-spin" />
          </div>
        }
      >
        <CampusMap3D className="relative w-full h-[70vh]" />
      </Suspense>

      {/* Legend */}
      <div className="relative z-10 flex flex-wrap justify-center gap-3 px-6 pb-8">
        {[
          { color: "bg-blue-500", label: "ボアソナード・タワー" },
          { color: "bg-violet-500", label: "富士見ゲート" },
          { color: "bg-emerald-500", label: "外濠校舎" },
          { color: "bg-amber-500", label: "富士見坂校舎" },
          { color: "bg-pink-500", label: "80年館（図書館）" },
          { color: "bg-cyan-500", label: "大内山校舎" },
          { color: "bg-red-500", label: "市ケ谷駅" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5 text-xs text-white/70">
            <div className={`w-3 h-3 rounded-sm ${item.color}`} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

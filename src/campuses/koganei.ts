import type { CampusConfig } from "./types";

const koganeiConfig: CampusConfig = {
  id: "koganei",
  appName: "こがっぷ",
  basePath: "/kogamap",
  storagePrefix: "kogamap",
  logoPath: "/images/kogamap_logo.webp",
  mapImagePath: "/images/koganei-map.webp",
  sceneryImagePath: "/images/koganei-scenery.webp",
  subtitle: "⟨ 法政大学 小金井キャンパス ⟩",
  transportMode: "train",
  hasDirectionSwap: false,
  gaTrackingId: "G-4F3PMM48SS",
  defaultStation: "higashikoganei",
  stations: [
    {
      id: "higashikoganei",
      nameJa: "東小金井",
      lines: ["JR中央線"],
      walkMinutes: 15,
    },
    {
      id: "musashikoganei",
      nameJa: "武蔵小金井",
      lines: ["JR中央線"],
      walkMinutes: 20,
    },
  ],
  buildings: [
    { key: "cis", labelKey: "home.cis", walkMinutes: 3 },
    { key: "engineering", labelKey: "home.engineering", walkMinutes: 5 },
    { key: "bioscience", labelKey: "home.bioscience", walkMinutes: 4 },
  ],
  theme: {
    bgGradient:
      "bg-gradient-to-b from-gray-950 via-slate-900 to-gray-950",
    accent: "cyan-500",
    accentSecondary: "fuchsia-500",
    cardBg: "bg-black/40 backdrop-blur-xl",
    cardBorder: "border-cyan-500/20",
    glowShadow: "shadow-cyan-500/10",
    stationActive:
      "bg-cyan-500/20 text-cyan-300 border-cyan-400/60 shadow-lg shadow-cyan-500/20 scale-105",
    stationInactive:
      "bg-white/5 text-white/60 border-white/10 hover:bg-cyan-500/10 hover:border-cyan-500/30",
    linkGradients: {
      discount:
        "bg-gradient-to-r from-fuchsia-600/80 to-pink-600/80 hover:shadow-fuchsia-500/40",
      tech: "bg-gradient-to-r from-violet-600/80 to-indigo-600/80 hover:shadow-violet-500/40",
      campus:
        "bg-gradient-to-r from-cyan-600/80 to-teal-600/80 hover:shadow-cyan-500/40",
    },
  },
};

export default koganeiConfig;

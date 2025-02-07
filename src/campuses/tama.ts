import type { CampusConfig } from "./types";

const tamaConfig: CampusConfig = {
  id: "tama",
  appName: "たまっぷ",
  basePath: "/tamap",
  storagePrefix: "tamap",
  logoPath: "/images/tamap_logo.webp",
  mapImagePath: "/images/tama-map.jpg",
  sceneryImagePath: "/images/tama-scenery.jpg",
  subtitle: "🌿 法政大学 多摩キャンパス",
  transportMode: "bus",
  hasDirectionSwap: true,
  gaTrackingId: "G-4F3PMM48SS",
  defaultStation: "nishihachioji",
  stations: [
    {
      id: "nishihachioji",
      nameJa: "西八王子",
      lines: ["JR中央線"],
      walkMinutes: 0,
    },
    {
      id: "mejirodai",
      nameJa: "めじろ台",
      lines: ["京王線"],
      walkMinutes: 0,
    },
    {
      id: "aihara",
      nameJa: "相原",
      lines: ["JR横浜線"],
      walkMinutes: 0,
    },
  ],
  buildings: [
    { key: "economics", labelKey: "home.economics", walkMinutes: 5 },
    { key: "health", labelKey: "home.health", walkMinutes: 4 },
    { key: "sport", labelKey: "home.sport", walkMinutes: 8 },
    { key: "gym", labelKey: "home.gym", walkMinutes: 15 },
  ],
  theme: {
    bgGradient:
      "bg-gradient-to-b from-green-800 via-emerald-700 to-green-900 dark:from-[#0a1f0a] dark:via-[#0d2b0d] dark:to-[#061206]",
    accent: "green-500",
    accentSecondary: "emerald-400",
    cardBg: "bg-white/10 dark:bg-white/5 backdrop-blur-sm",
    cardBorder: "border-green-400/30 dark:border-green-500/20",
    glowShadow: "shadow-green-900/15",
    stationActive:
      "bg-green-500/20 text-green-200 border-green-400/60 shadow-lg shadow-green-500/20 scale-105",
    stationInactive:
      "bg-white/10 text-white/60 border-white/10 hover:bg-green-500/10 hover:border-green-500/30",
    linkGradients: {
      discount:
        "bg-gradient-to-r from-amber-700/80 via-yellow-600/70 to-amber-600/80 hover:shadow-amber-500/40",
      tech: "bg-gradient-to-r from-teal-700/80 via-emerald-600/70 to-teal-600/80 hover:shadow-teal-500/40",
      campus:
        "bg-gradient-to-r from-green-800/80 via-lime-600/70 to-green-700/80 hover:shadow-green-500/40",
    },
  },
};

export default tamaConfig;

/**
 * Campus configuration types.
 * Each campus (Ichigaya, Koganei, Tama) is driven by a config object
 * so the same codebase renders different data/themes per campus.
 */

export type CampusId = "ichigaya" | "koganei" | "tama";

export interface BuildingConfig {
  /** building key used in code */
  key: string;
  /** i18n translation key for the building name */
  labelKey: string;
  /** extra walk minutes from station arrival to this building */
  walkMinutes: number;
}

export interface StationConfig {
  id: string;
  /** Japanese display name */
  nameJa: string;
  /** Train/bus lines available at this station */
  lines: string[];
  /** Walk minutes from station to campus gate */
  walkMinutes: number;
}

export interface ThemeConfig {
  /** Tailwind gradient classes for main background */
  bgGradient: string;
  /** Accent color for buttons, borders, highlights */
  accent: string;
  /** Secondary accent */
  accentSecondary: string;
  /** Card background */
  cardBg: string;
  /** Card border */
  cardBorder: string;
  /** Neon/glow shadow */
  glowShadow: string;
  /** Station button active classes */
  stationActive: string;
  /** Station button inactive classes */
  stationInactive: string;
  /** Link button gradient classes */
  linkGradients: {
    discount: string;
    tech: string;
    campus: string;
  };
}

export type TransportMode = "train" | "bus";

export interface CampusConfig {
  id: CampusId;
  /** App display name (e.g. いちっぷ, こがっぷ, たまっぷ) */
  appName: string;
  /** URL base path for deployment */
  basePath: string;
  /** localStorage key prefix to avoid collisions */
  storagePrefix: string;
  /** Logo image path */
  logoPath: string;
  /** Campus map image path */
  mapImagePath: string;
  /** Campus scenery image path (used on landing page) */
  sceneryImagePath: string;
  /** Subtitle shown under logo */
  subtitle: string;
  /** Primary transport mode */
  transportMode: TransportMode;
  /** Whether direction swap (大学行き/駅行�? is supported */
  hasDirectionSwap: boolean;
  /** Station configs */
  stations: StationConfig[];
  /** Default station id */
  defaultStation: string;
  /** Building configs for arrival time overlay */
  buildings: BuildingConfig[];
  /** Theme configuration */
  theme: ThemeConfig;
  /** Google Analytics tracking ID */
  gaTrackingId: string;
}
// updated: CampusConfig��sceneryImagePath׷��

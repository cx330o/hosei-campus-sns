/**
 * Data-driven color mapping for train lines and train types.
 * Replaces the original if-else chains with lookup tables.
 */

/** Line name → Tailwind background class */
const LINE_STYLES: Record<string, string> = {
  "ＪＲ中央線": "bg-orange-500",
  "ＪＲ中央・総武線": "bg-yellow-500",
  "京王高尾線": "bg-pink-600",
  "京王相模原線": "bg-pink-600",
  "京王線": "bg-pink-600",
  "ＪＲ横浜線": "bg-green-600",
  "ＪＲ相模線": "bg-teal-500",
  "ＪＲ八高線": "bg-gray-500",
  "東京メトロ有楽町線": "bg-amber-600",
  "東京メトロ南北線": "bg-emerald-500",
  "東京メトロ東西線": "bg-sky-500",
  "東京メトロ半蔵門線": "bg-purple-600",
  "都営新宿線": "bg-lime-600",
  "都営大江戸線": "bg-rose-600",
};

/** Line name → (train type → Tailwind background class) */
const TRAIN_TYPE_STYLES: Record<string, Record<string, string>> = {
  "ＪＲ中央線": {
    "快速": "",
    "各駅停車": "bg-yellow-500",
    "中央特快": "bg-blue-500",
    "通勤快速": "bg-sky-500",
    "あずさ": "bg-red-500",
    "かいじ": "bg-red-500",
    "富士回遊": "bg-red-500",
    "普通": "bg-yellow-600",
    "むさしの号": "bg-orange-800",
    "通勤特別快速": "bg-pink-600",
  },
  "京王": {
    "各駅停車": "bg-transparent",
    "快速": "bg-blue-600",
    "区間急行": "bg-lime-300",
    "急行": "bg-green-500",
    "急行・新線新宿から各停": "bg-green-500",
    "各停・高幡不動から急行": "bg-green-500",
    "特急": "bg-red-500",
    "各停・京王多摩センターから特急": "bg-red-500",
    "各停・高幡不動から特急": "bg-red-500",
    "京王ライナー": "bg-pink-600",
    "Ｍｔ．ＴＡＫＡＯ": "bg-green-700",
  },
  "ＪＲ横浜線": {
    "快速": "bg-pink-500",
  },
  "ＪＲ相模線": {},
  "ＪＲ八高線": {},
};

/** Lines that share the common 京王 train-type map */
const KEIO_LINES = new Set(["京王高尾線", "京王相模原線", "京王線"]);

/**
 * Default train-type style per line when no specific match is found.
 * Mirrors the original else-branch behavior.
 */
const DEFAULT_TRAIN_TYPE_STYLE: Record<string, string> = {
  "ＪＲ中央線": "bg-transparent",
  "京王": "bg-gray-500",
  "ＪＲ横浜線": "bg-transparent",
  "ＪＲ相模線": "bg-2ray-500",
  "ＪＲ八高線": "bg-transparent",
};

function getTrainTypeMapKey(line: string): string | undefined {
  if (KEIO_LINES.has(line)) return "京王";
  if (line in TRAIN_TYPE_STYLES) return line;
  return undefined;
}

export function typeColor({ line, trainType }: { line: string; trainType: string }) {
  const lineStyles = LINE_STYLES[line] ?? "";
  const mapKey = getTrainTypeMapKey(line);

  let trainTypeStyles = "";
  if (mapKey !== undefined) {
    const typeMap = TRAIN_TYPE_STYLES[mapKey];
    trainTypeStyles =
      trainType in typeMap
        ? typeMap[trainType]
        : (DEFAULT_TRAIN_TYPE_STYLE[mapKey] ?? "");
  }

  return { trainTypeStyles, lineStyles };
}

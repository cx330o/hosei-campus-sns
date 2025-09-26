import ichigayaConfig from "./ichigaya";
import koganeiConfig from "./koganei";
import tamaConfig from "./tama";
import type { CampusConfig, CampusId } from "./types";

export type { CampusConfig, CampusId } from "./types";

export const campusConfigs: Record<CampusId, CampusConfig> = {
  ichigaya: ichigayaConfig,
  koganei: koganeiConfig,
  tama: tamaConfig,
};

export const campusList = Object.values(campusConfigs);

export function getCampusConfig(id: CampusId): CampusConfig {
  return campusConfigs[id];
}
// updated: 3キャンパスのindex.ts厚仟

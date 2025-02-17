import { useEffect, useState } from "react";
import { stateSchema, stationSchema } from "./types";
import * as z from "zod/v4"
import { useCampus } from "../campuses/CampusContext";

export default function useUserInput() {
  const campus = useCampus();
  const storageKey = `${campus.storagePrefix}_station`;
  const directionKey = `${campus.storagePrefix}_isComingToHosei`;

  const [state, setState] = useState<z.infer<typeof stateSchema>>({
    isComingToHosei: true,
    station: campus.defaultStation as z.infer<typeof stationSchema>,
  })

  // 初回マウント時: localStorage から保存済みの状態を復元
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const station = stationSchema.parse(saved);
        // Only restore if the station belongs to this campus
        if (campus.stations.some(s => s.id === station)) {
          const isComingToHosei = localStorage.getItem(directionKey) === "true";
          setState({ station, isComingToHosei });
        }
      }
    } catch (e) {
      console.error("Invalid localStorage data:", e);
    }
  }, [])

  // 状態変更時: localStorage に永続化
  useEffect(() => {
    localStorage.setItem(storageKey, state.station)
    localStorage.setItem(directionKey, String(state.isComingToHosei))
  }, [state.station, state.isComingToHosei])

  return { state, setState }
}
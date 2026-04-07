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

  // åˆå›žãƒžã‚¦ãƒ³ãƒˆæ™? localStorage ã‹ã‚‰ä¿å­˜æ¸ˆã¿ã®çŠ¶æ…‹ã‚’å¾©å…ƒ
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

  // çŠ¶æ…‹å¤‰æ›´æ™? localStorage ã«æ°¸ç¶šåŒ–
  useEffect(() => {
    localStorage.setItem(storageKey, state.station)
    localStorage.setItem(directionKey, String(state.isComingToHosei))
  }, [state.station, state.isComingToHosei])

  return { state, setState }
}
// updated: useUserInput¤Î¥­¥ã¥ó¥Ñ¥¹„e¥Ç¥Õ¥©¥ë¥ÈñkÐÞÕý

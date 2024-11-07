import { useEffect, useState } from "react";
import {
  TimetableSchema,
  HolidayDataSchema,
  type Timetable,
  type HolidayData,
} from "../utils/types";
import type { CampusId } from "../campuses/types";

export interface UseBusDataResult {
  timetable: Timetable | null;
  holidayData: HolidayData | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Dynamically imports timetable + holiday data for the given campus.
 * Holidays are shared; timetable differs per campus (only Tama has bus data).
 */
const timetableImporters: Record<CampusId, () => Promise<{ default: unknown }>> = {
  ichigaya: () => import("../utils/Timetable.json"),
  koganei: () => import("../utils/Timetable.json"),
  tama: () => import("../utils/data/tama-timetable.json"),
};

export function useBusData(campusId?: CampusId): UseBusDataResult {
  const [state, setState] = useState<UseBusDataResult>({
    timetable: null,
    holidayData: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    const loadTimetable = timetableImporters[campusId ?? "ichigaya"];

    Promise.all([
      loadTimetable(),
      import("../utils/Holidays.json"),
    ])
      .then(([timetableModule, holidayModule]) => {
        if (cancelled) return;
        const timetable = TimetableSchema.parse(timetableModule.default);
        const holidayData = HolidayDataSchema.parse(holidayModule.default);
        setState({ timetable, holidayData, isLoading: false, error: null });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const error =
          err instanceof Error
            ? err
            : new Error("æ™‚åˆ»è¡¨ãƒ‡ãƒ¼ã‚¿ã®èª­ã¿è¾¼ã¿ã«å¤±æ•—ã—ã¾ã—ãŸ");
        setState({ timetable: null, holidayData: null, isLoading: false, error });
      });

    return () => {
      cancelled = true;
    };
  }, [campusId]);

  return state;
}

export default useBusData;
// updated: console.logÏ÷³ý¡¢¥³©`¥ÉÕûÀí

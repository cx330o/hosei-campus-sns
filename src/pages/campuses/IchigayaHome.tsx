/**
 * Ichigaya Campus Home - 🌸 Sakura theme
 * Train timetable for Ichigaya/Iidabashi/Kudanshita stations
 */
import { useEffect, useMemo, useRef } from "react";
import { findNextTrains, minutesToTime } from "../../utils/timeHandlers";
import { stationNames } from "../../utils/constants";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Card from "../../components/ui/card";
import { Link } from "react-router-dom";
import Menu from "../../components/menu";
import { stateSchema, type StationId } from "../../utils/types";
import type { TrainWithDate } from "../../utils/types";
import { Toaster } from "sonner";
import useUserInput from "../../utils/useUserInput";
import Clock from "../../components/ui/Clock";
import { useClock } from "../../hooks/useClock";
import { useBusData } from "../../hooks/useBusData";
import SakuraBackground from "../../components/ui/SakuraBackground";
import Countdown from "../../components/ui/Countdown";
import { HomeSkeleton } from "../../components/ui/Skeleton";
import { useLocale } from "../../i18n";
import ekitanDataJSON from "../../utils/data/ichigaya-ekitan.json";
import { ekitanSchema } from "../../utils/types";
import TrainDetail from "../../components/ui/TrainDetail";
import { ScrollArea } from "../../components/ui/scroll-area";
import { TrainIcon, MapPinIcon } from "lucide-react";
import { useCampus } from "../../campuses/CampusContext";

gsap.ticker.fps(60);
gsap.ticker.lagSmoothing(1000, 16);

const ekitanData = ekitanSchema.parse(ekitanDataJSON);

export default function IchigayaHome() {
  const campus = useCampus();
  const { holidayData, isLoading, error } = useBusData(campus.id);
  const now = useClock(1000);
  const { locale, setLocale, t } = useLocale();
  const mainContainer = useRef<HTMLDivElement>(null);
  const timesContainer = useRef(null);
  const buildingRefs = Object.fromEntries(campus.buildings.map(b => [b.key, useRef(null)]));

  const { contextSafe } = useGSAP({ scope: mainContainer });
  const animateText = contextSafe(() => {
    if (!timesContainer.current) return;
    gsap.fromTo(timesContainer.current, { opacity: 0, y: 10 }, { y: 0, duration: 0.4, opacity: 1 });
    gsap.fromTo(Object.values(buildingRefs).map(ref => ref.current).filter(Boolean), { opacity: 0, y: 5 }, { y: 0, duration: 0.3, opacity: 1, stagger: 0.05 });
  });
  const { setState, state } = useUserInput();

  useEffect(() => { localStorage.setItem("station", state.station); }, [state.station]);

  const handleStationButtonClicked = (station: StationId) => {
    setState(prev => stateSchema.parse({ ...prev, station }));
  };

  useEffect(() => {
    if (!timesContainer.current) return;
    animateText();
  }, [state.station, isLoading]);

  const stationNameMap: Record<string, string> = Object.fromEntries(
    campus.stations.map(s => [s.id, s.nameJa + "駅"])
  );
  const walkMinutesMap: Record<string, number> = Object.fromEntries(
    campus.stations.map(s => [s.id, s.walkMinutes])
  );
  const stationLinesMap: Record<string, string[]> = Object.fromEntries(
    campus.stations.map(s => [s.id, s.lines])
  );

  const nextTrains = useMemo<TrainWithDate[]>(() => {
    if (!holidayData) return [];
    return findNextTrains({ ekitanData, station: stationNameMap[state.station] ?? campus.stations[0].nameJa + "駅", holidayData, date: new Date(now) });
  }, [holidayData, state.station, now]);

  const [nextTrain, ...restTrains] = nextTrains;

  const overlay: Record<string, string> = Object.fromEntries(campus.buildings.map(b => [b.key, "--:--"]));
  if (nextTrain) {
    const walk = walkMinutesMap[state.station] ?? campus.stations[0].walkMinutes;
    const arriveMin = nextTrain.hour * 60 + nextTrain.minute + walk;
    for (const b of campus.buildings) {
      overlay[b.key] = minutesToTime(arriveMin + b.walkMinutes);
    }
  }

  const menuLabels = { theme: t("menu.theme"), language: t("menu.language"), sourceCode: t("menu.sourceCode"), title: t("menu.title") };

  const positionMap: Record<string, string> = { 0: "top-2 left-2", 1: "top-2 right-2", 2: "bottom-2 left-2", 3: "bottom-2 right-2" };

  return (
    <>
      <title>{t("home.title")}</title>
      <meta name="description" content={t("home.description")} />
      <Toaster />
      <header className="fixed top-0 right-0 z-30">
        <Menu locale={locale} onLocaleChange={setLocale} labels={menuLabels} />
      </header>

      <main className="relative overflow-hidden bg-gradient-to-b from-pink-100 via-rose-50 to-pink-200 dark:from-slate-950 dark:via-rose-950/30 dark:to-slate-900 p-3 md:p-7 w-full min-h-screen text-gray-800 dark:text-white">
        <SakuraBackground />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-300 via-rose-400 to-pink-300 dark:from-pink-800 dark:via-rose-600 dark:to-pink-800 z-20" />

        <Clock now={now} />
        <div className="relative z-10 text-center">
          <img
            src={campus.sceneryImagePath}
            alt={`${campus.appName}キャンパス景色`}
            className="mx-auto mb-4 w-full max-w-2xl h-48 object-cover rounded-2xl border border-pink-200/30 shadow-lg"
          />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">{campus.appName}</h1>
          <p className="text-pink-600/60 dark:text-pink-300/40 text-xs tracking-widest">🌸 {campus.subtitle} 🌸</p>
        </div>

        {error ? (
          <div className="relative z-10 mx-auto p-4 max-w-2xl text-center" role="alert">
            <Card><p className="py-4 font-semibold text-red-600 dark:text-red-400">{t("home.error")}</p>
              <button className="bg-rose-500 mx-auto mb-4 px-4 py-2 rounded-lg min-w-[44px] min-h-[44px] text-white" onClick={() => window.location.reload()}>{t("home.reload")}</button>
            </Card>
          </div>
        ) : isLoading ? (
          <HomeSkeleton />
        ) : (
        <div className="relative z-10 gap-4 grid mx-auto p-3 max-w-2xl touch-manipulation" ref={mainContainer}>
          {/* 駅選択 */}
          <div className="bg-white/30 dark:bg-white/5 backdrop-blur-lg shadow-lg shadow-pink-200/30 dark:shadow-pink-900/20 p-4 border border-pink-200/50 dark:border-pink-800/30 rounded-3xl">
            <nav aria-label="駅選択">
              <div className={`gap-3 grid grid-cols-${campus.stations.length} font-semibold text-base text-center`}>
                {campus.stations.map(s => (
                  <button key={s.id} onClick={() => handleStationButtonClicked(s.id as StationId)}
                    className={`rounded-2xl p-3 min-h-[44px] transition-all duration-300 border ${
                      state.station === s.id
                        ? "bg-gradient-to-br from-pink-400 to-rose-500 text-white border-pink-300 shadow-lg shadow-pink-400/30 scale-105"
                        : "bg-white/40 dark:bg-white/10 text-gray-700 dark:text-white/70 border-pink-200/30 dark:border-white/10 hover:bg-pink-100/50 dark:hover:bg-white/15"
                    }`}
                    aria-pressed={state.station === s.id} type="button">
                    {s.nameJa}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                {(stationLinesMap[state.station] ?? []).map(line => (
                  <span key={line} className="bg-pink-500/10 dark:bg-pink-400/10 px-2.5 py-0.5 border border-pink-300/30 dark:border-pink-600/30 rounded-full text-pink-700 dark:text-pink-300 text-xs">{line}</span>
                ))}
              </div>
              <div className="flex justify-center items-center gap-1 mt-2 text-pink-500/60 dark:text-pink-400/50 text-xs">
                <MapPinIcon size={12} />
                <span>キャンパスまで徒歩約{walkMinutesMap[state.station] ?? 7}分</span>
              </div>
            </nav>
          </div>

          {/* 電車時刻 */}
          <div className="bg-white/30 dark:bg-white/5 backdrop-blur-lg shadow-lg shadow-pink-200/30 dark:shadow-pink-900/20 p-4 border border-pink-200/50 dark:border-pink-800/30 rounded-3xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-gradient-to-br from-pink-400 to-rose-500 p-1.5 rounded-lg">
                <TrainIcon size={18} className="text-white" />
              </div>
              <h2 className="font-bold text-lg text-gray-800 dark:text-white">{stationNames[state.station]} 発車時刻</h2>
            </div>
            <Countdown now={now} targetDate={nextTrain ? (() => { const d = new Date(now); d.setHours(nextTrain.hour, nextTrain.minute, 0, 0); if (d < now) d.setDate(d.getDate() + 1); return d; })() : undefined} labelBefore={t("home.nextTrainIn")} labelAfter={t("home.departed")} />
            {nextTrain && <TrainDetail destination={nextTrain.destination} direction={nextTrain.direction} hour={nextTrain.hour} minute={nextTrain.minute} line={nextTrain.line} trainType={nextTrain.trainType} isNext />}
            <div aria-live="polite" ref={timesContainer}>
              <ScrollArea className="h-64">
                {restTrains.map((train, i) => (
                  <TrainDetail key={i} destination={train.destination} direction={train.direction} hour={train.hour} minute={train.minute} line={train.line} trainType={train.trainType} />
                ))}
              </ScrollArea>
            </div>
          </div>

          {/* キャンパスマップ */}
          <div className="bg-white/30 dark:bg-white/5 backdrop-blur-lg shadow-lg shadow-pink-200/30 dark:shadow-pink-900/20 p-4 border border-pink-200/50 dark:border-pink-800/30 rounded-3xl">
            <h2 className="mb-3 font-bold text-center text-gray-800 dark:text-white">🌸 各棟への到着予測</h2>
            <div className="relative font-semibold text-center">
              <img src={campus.mapImagePath} alt="市ヶ谷キャンパス" width={300} className="mx-auto h-56 rounded-2xl border border-pink-200/30 object-cover" height={300} />
              {campus.buildings.map((b, i) => (
                <div key={b.key} className={`absolute ${positionMap[i] ?? "top-2 left-2"} bg-white/70 dark:bg-black/60 backdrop-blur-md rounded-xl px-3 py-2 min-w-[28%] border border-pink-200/40 dark:border-pink-700/30 shadow-sm`}>
                  <p className="text-[10px] text-pink-600 dark:text-pink-300">{t(b.labelKey as Parameters<typeof t>[0])}</p>
                  <span className="block font-mono font-bold text-lg text-gray-800 dark:text-white" ref={buildingRefs[b.key]}>{overlay[b.key]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* リンク */}
          <div className="gap-3 grid grid-cols-1 md:grid-cols-3">
            <Link to="discount" className="block bg-gradient-to-r from-rose-400 to-pink-500 shadow-lg p-4 rounded-2xl min-h-[44px] font-bold text-white text-lg text-center transition-all hover:scale-[1.02]">🍽️ {t("home.discountLink")}</Link>
            <Link to="tech" className="block bg-gradient-to-r from-purple-400 to-indigo-500 shadow-lg p-4 rounded-2xl min-h-[44px] font-bold text-white text-lg text-center transition-all hover:scale-[1.02]">⚡ {t("home.techLink")}</Link>
            <Link to="campus" className="block bg-gradient-to-r from-teal-400 to-emerald-500 shadow-lg p-4 rounded-2xl min-h-[44px] font-bold text-white text-lg text-center transition-all hover:scale-[1.02]">🏫 {t("home.campusMap")}</Link>
          </div>
        </div>
        )}

        <p className="relative z-10 mx-auto mt-4 text-pink-600/50 dark:text-pink-300/30 text-center text-xs">{t("home.disclaimer")}<br />{t("home.disclaimer2")}</p>
        <footer className="relative z-10 mt-2 text-pink-500/40 dark:text-pink-400/30 text-center text-xs"><p>{t("footer.copyright")}</p></footer>
      </main>
    </>
  );
}

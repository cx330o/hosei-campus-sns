/**
 * Koganei Campus Home - ⟨ CYBER/NEON theme ⟩
 * Train timetable for Higashi-Koganei / Musashi-Koganei stations
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
import CyberBackground from "../../components/ui/CyberBackground";
import Countdown from "../../components/ui/Countdown";
import { HomeSkeleton } from "../../components/ui/Skeleton";
import { useLocale } from "../../i18n";
import ekitanDataJSON from "../../utils/data/koganei-ekitan.json";
import { ekitanSchema } from "../../utils/types";
import TrainDetail from "../../components/ui/TrainDetail";
import { ScrollArea } from "../../components/ui/scroll-area";
import { TrainIcon, MapPinIcon } from "lucide-react";
import { useCampus } from "../../campuses/CampusContext";

gsap.ticker.fps(60);
gsap.ticker.lagSmoothing(1000, 16);

const ekitanData = ekitanSchema.parse(ekitanDataJSON);

export default function KoganeiHome() {
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

  const positionMap: Record<number, string> = { 0: "top-2 left-2", 1: "top-2 right-2", 2: "bottom-2 left-1/2 -translate-x-1/2" };

  return (
    <>
      <title>{t("home.title")}</title>
      <meta name="description" content={t("home.description")} />
      <Toaster />
      <header className="fixed top-0 right-0 z-30">
        <Menu locale={locale} onLocaleChange={setLocale} labels={menuLabels} />
      </header>

      <main className="relative overflow-hidden bg-gradient-to-b from-gray-950 via-slate-900 to-gray-950 p-3 md:p-7 w-full min-h-screen text-cyan-50">
        <CyberBackground />

        {/* ネオンライン */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-cyan-500 z-20 shadow-[0_0_15px_rgba(0,255,255,0.5)]" />

        <Clock now={now} />
        <div className="relative z-10 text-center">
          <img
            src={campus.sceneryImagePath}
            alt={`${campus.appName}キャンパス景色`}
            className="mx-auto mb-4 w-full max-w-2xl h-48 object-cover rounded-xl border border-cyan-500/20 shadow-lg opacity-90"
          />
          <h1 className="text-2xl font-bold text-cyan-100 font-mono mb-1">{campus.appName}</h1>
          <p className="text-cyan-400/60 text-xs tracking-[0.3em] font-mono">{campus.subtitle}</p>
        </div>

        {error ? (
          <div className="relative z-10 mx-auto p-4 max-w-2xl text-center" role="alert">
            <Card><p className="py-4 font-semibold text-red-400">{t("home.error")}</p>
              <button className="bg-red-600 mx-auto mb-4 px-4 py-2 rounded-lg min-w-[44px] min-h-[44px] text-white" onClick={() => window.location.reload()}>{t("home.reload")}</button>
            </Card>
          </div>
        ) : isLoading ? (
          <HomeSkeleton />
        ) : (
        <div className="relative z-10 gap-4 grid mx-auto p-3 max-w-2xl touch-manipulation" ref={mainContainer}>

          {/* 駅選択カード */}
          <div className="bg-black/40 backdrop-blur-xl shadow-lg shadow-cyan-500/10 p-4 border border-cyan-500/20 rounded-2xl">
            <nav aria-label="駅選択">
              <div className={`gap-3 grid grid-cols-${campus.stations.length} font-semibold text-base text-center`}>
                {campus.stations.map(s => (
                  <button key={s.id} onClick={() => handleStationButtonClicked(s.id as StationId)}
                    className={`rounded-xl p-3 min-h-[44px] transition-all duration-300 border font-mono ${
                      state.station === s.id
                        ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/60 shadow-lg shadow-cyan-500/20 scale-105"
                        : "bg-white/5 text-white/60 border-white/10 hover:bg-cyan-500/10 hover:border-cyan-500/30"
                    }`}
                    aria-pressed={state.station === s.id} type="button">
                    {s.nameJa}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                {(stationLinesMap[state.station] ?? []).map(line => (
                  <span key={line} className="bg-fuchsia-500/10 px-2.5 py-0.5 border border-fuchsia-500/30 rounded-full text-fuchsia-300 text-xs font-mono">{line}</span>
                ))}
              </div>
              <div className="flex justify-center items-center gap-1 mt-2 text-cyan-500/50 text-xs font-mono">
                <MapPinIcon size={12} />
                <span>キャンパスまで徒歩約{walkMinutesMap[state.station] ?? campus.stations[0].walkMinutes}分</span>
              </div>
            </nav>
          </div>

          {/* 電車時刻カード */}
          <div className="bg-black/40 backdrop-blur-xl shadow-lg shadow-cyan-500/10 p-4 border border-cyan-500/20 rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-gradient-to-br from-cyan-500 to-fuchsia-500 p-1.5 rounded-lg shadow-[0_0_10px_rgba(0,255,255,0.3)]">
                <TrainIcon size={18} className="text-white" />
              </div>
              <h2 className="font-bold text-lg text-cyan-100 font-mono">{stationNames[state.station]} 発車時刻</h2>
            </div>

            <Countdown
              now={now}
              targetDate={nextTrain ? (() => { const d = new Date(now); d.setHours(nextTrain.hour, nextTrain.minute, 0, 0); if (d < now) d.setDate(d.getDate() + 1); return d; })() : undefined}
              labelBefore={t("home.nextTrainIn")}
              labelAfter={t("home.departed")}
            />

            {nextTrain && (
              <TrainDetail destination={nextTrain.destination} direction={nextTrain.direction} hour={nextTrain.hour} minute={nextTrain.minute} line={nextTrain.line} trainType={nextTrain.trainType} isNext />
            )}

            <div aria-live="polite" ref={timesContainer}>
              <ScrollArea className="h-64">
                {restTrains.map((train, i) => (
                  <TrainDetail key={i} destination={train.destination} direction={train.direction} hour={train.hour} minute={train.minute} line={train.line} trainType={train.trainType} />
                ))}
              </ScrollArea>
            </div>
          </div>

          {/* キャンパスマップ */}
          <div className="bg-black/40 backdrop-blur-xl shadow-lg shadow-cyan-500/10 p-4 border border-cyan-500/20 rounded-2xl">
            <h2 className="mb-3 font-bold text-center text-cyan-300 font-mono">⟨ 各棟への到着予測 ⟩</h2>
            <div className="relative font-semibold text-center">
              <img src={campus.mapImagePath} alt="小金井キャンパス" width={300} className="mx-auto h-56 rounded-xl border border-cyan-500/20 object-cover opacity-80" height={300} />
              {campus.buildings.map((b, i) => (
                <div key={b.key} className={`absolute ${positionMap[i] ?? "top-2 left-2"} bg-black/70 backdrop-blur-md rounded-lg px-3 py-2 min-w-[28%] border border-cyan-500/30 shadow-[0_0_8px_rgba(0,255,255,0.15)]`}>
                  <p className="text-[10px] text-fuchsia-400 font-mono">{t(b.labelKey as Parameters<typeof t>[0])}</p>
                  <span className="block font-mono font-bold text-lg text-cyan-300" ref={buildingRefs[b.key]}>{overlay[b.key]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* リンクボタン */}
          <div className="gap-3 grid grid-cols-1 md:grid-cols-3">
            <Link to="discount" className="block bg-gradient-to-r from-fuchsia-600/80 to-pink-600/80 shadow-lg shadow-fuchsia-500/20 p-4 border border-fuchsia-500/30 rounded-xl min-h-[44px] font-bold text-white text-lg text-center transition-all hover:shadow-fuchsia-500/40 hover:scale-[1.02] font-mono">
              🍽️ {t("home.discountLink")}
            </Link>
            <Link to="tech" className="block bg-gradient-to-r from-violet-600/80 to-indigo-600/80 shadow-lg shadow-violet-500/20 p-4 border border-violet-500/30 rounded-xl min-h-[44px] font-bold text-white text-lg text-center transition-all hover:shadow-violet-500/40 hover:scale-[1.02] font-mono">
              ⚡ {t("home.techLink")}
            </Link>
            <Link to="campus" className="block bg-gradient-to-r from-cyan-600/80 to-teal-600/80 shadow-lg shadow-cyan-500/20 p-4 border border-cyan-500/30 rounded-xl min-h-[44px] font-bold text-white text-lg text-center transition-all hover:shadow-cyan-500/40 hover:scale-[1.02] font-mono">
              🏫 {t("home.campusMap")}
            </Link>
          </div>
        </div>
        )}

        <p className="relative z-10 mx-auto mt-4 text-cyan-500/30 text-center text-xs font-mono">{t("home.disclaimer")}<br />{t("home.disclaimer2")}</p>
        <footer className="relative z-10 mt-2 text-fuchsia-500/30 text-center text-xs font-mono">
          <p>{t("footer.copyright")}</p>
        </footer>
      </main>
    </>
  );
}

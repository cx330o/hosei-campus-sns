import { useEffect, useMemo, useRef } from "react";
import { findNextTrains, minutesToTime } from "../utils/timeHandlers";
import { buildings, stationNames } from "../utils/constants";
import gsap from "gsap"
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";
import Card from "../components/ui/card"
import { Link } from "react-router-dom";
import Menu from "../components/menu";
import { stateSchema, type StationId } from "../utils/types";
import type { TrainWithDate } from "../utils/types";
import tamapLogo from "/images/tamap_logo.webp"
import mapImage from "/images/Map.webp"
import { Toaster } from "sonner";
import useUserInput from "../utils/useUserInput";
import Clock from "../components/ui/Clock";
import { useClock } from "../hooks/useClock";
import { useBusData } from "../hooks/useBusData";
import SakuraBackground from "../components/ui/SakuraBackground";
import Countdown from "../components/ui/Countdown";
import { HomeSkeleton } from "../components/ui/Skeleton";
import { useLocale } from "../i18n";
import ekitanDataJSON from "../utils/ekitan.json";
import { ekitanSchema } from "../utils/types";
import TrainDetail from "../components/ui/TrainDetail";
import { ScrollArea } from "../components/ui/scroll-area";
import { TrainIcon, MapPinIcon } from "lucide-react";

gsap.registerPlugin(useGSAP);
gsap.registerPlugin(ScrollTrigger);
gsap.ticker.fps(60);
gsap.ticker.lagSmoothing(1000, 16);

const ekitanData = ekitanSchema.parse(ekitanDataJSON);

const stationLines: Record<string, string[]> = {
  ichigaya: ["JR中央�?, "都営新宿�?, "メトロ南北線"],
  iidabashi: ["JR中央�?, "都営大江戸線", "メトロ南北線", "メトロ東西線"],
  kudanshita: ["都営新宿�?, "メトロ半蔵門�?, "メトロ東西線"],
};

const walkMinutes: Record<string, number> = {
  ichigaya: 7,
  iidabashi: 8,
  kudanshita: 10,
};

export default function Home() {
  const { holidayData, isLoading, error } = useBusData();
  const now = useClock(1000);
  const { locale, setLocale, t } = useLocale();
  const mainContainer = useRef<HTMLDivElement>(null);
  const timesContainer = useRef(null);
  const times = {
    law: useRef(null),
    letters: useRef(null),
    business: useRef(null),
    intercultural: useRef(null),
  };

  const { contextSafe } = useGSAP({ scope: mainContainer });
  const animateText = contextSafe(() => {
    if (!timesContainer.current) return;
    gsap.fromTo(timesContainer.current, { opacity: 0, y: 10 }, { y: 0, duration: 0.4, opacity: 1 });
    gsap.fromTo(Object.values(times).map(ref => ref.current).filter(Boolean), { opacity: 0, y: 5 }, { y: 0, duration: 0.3, opacity: 1, stagger: 0.05 });
  });
  const { setState, state } = useUserInput()

  useEffect(() => { localStorage.setItem("station", state.station) }, [state.station])

  const handleStationButtonClicked = (station: StationId) => {
    setState(prev => stateSchema.parse({ ...prev, station }))
  }

  useEffect(() => {
    if (!timesContainer.current) return;
    animateText()
  }, [state.station, isLoading])

  const stationNameMap: Record<string, string> = {
    ichigaya: "市ケ谷駅", iidabashi: "飯田橋駅", kudanshita: "九段下駅",
  };

  const nextTrains = useMemo<TrainWithDate[]>(() => {
    if (!holidayData) return [];
    return findNextTrains({ ekitanData, station: stationNameMap[state.station] ?? "市ケ谷駅", holidayData, date: new Date(now) });
  }, [holidayData, state.station, now]);

  const [nextTrain, ...restTrains] = nextTrains;

  const overlay = { law: "--:--", letters: "--:--", business: "--:--", intercultural: "--:--" }
  if (nextTrain) {
    const walk = walkMinutes[state.station] ?? 7;
    const arriveMin = nextTrain.hour * 60 + nextTrain.minute + walk;
    overlay.law = minutesToTime(arriveMin + buildings.law)
    overlay.letters = minutesToTime(arriveMin + buildings.letters)
    overlay.business = minutesToTime(arriveMin + buildings.business)
    overlay.intercultural = minutesToTime(arriveMin + buildings.intercultural)
  }

  const menuLabels = { theme: t("menu.theme"), language: t("menu.language"), sourceCode: t("menu.sourceCode"), title: t("menu.title") };

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

        {/* 桜の装飾ライ�?*/}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-300 via-rose-400 to-pink-300 dark:from-pink-800 dark:via-rose-600 dark:to-pink-800 z-20" />

        <Clock now={now} />
        <div className="relative z-10 text-center">
          <img alt="いちっぷのロ�? src={tamapLogo} height={400} width={400} className="mx-auto -mb-4 w-48 h-48 object-contain drop-shadow-lg" />
          <p className="text-pink-600/60 dark:text-pink-300/40 text-xs tracking-widest">🌸 法政大学 市ヶ谷キャンパス 🌸</p>
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

          {/* 駅選択カード */}
          <div className="bg-white/30 dark:bg-white/5 backdrop-blur-lg shadow-lg shadow-pink-200/30 dark:shadow-pink-900/20 p-4 border border-pink-200/50 dark:border-pink-800/30 rounded-3xl">
            <nav aria-label="駅選�?>
              <div className="gap-3 grid grid-cols-3 font-semibold text-base text-center">
                {(["ichigaya", "iidabashi", "kudanshita"] as StationId[]).map(sid => (
                  <button key={sid} onClick={() => handleStationButtonClicked(sid)}
                    className={`rounded-2xl p-3 min-h-[44px] transition-all duration-300 border ${
                      state.station === sid
                        ? "bg-gradient-to-br from-pink-400 to-rose-500 text-white border-pink-300 shadow-lg shadow-pink-400/30 scale-105"
                        : "bg-white/40 dark:bg-white/10 text-gray-700 dark:text-white/70 border-pink-200/30 dark:border-white/10 hover:bg-pink-100/50 dark:hover:bg-white/15"
                    }`}
                    aria-pressed={state.station === sid} type="button">
                    {t(`station.${sid}` as "station.ichigaya" | "station.iidabashi" | "station.kudanshita")}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                {(stationLines[state.station] ?? []).map(line => (
                  <span key={line} className="bg-pink-500/10 dark:bg-pink-400/10 px-2.5 py-0.5 border border-pink-300/30 dark:border-pink-600/30 rounded-full text-pink-700 dark:text-pink-300 text-xs">{line}</span>
                ))}
              </div>
              <div className="flex justify-center items-center gap-1 mt-2 text-pink-500/60 dark:text-pink-400/50 text-xs">
                <MapPinIcon size={12} />
                <span>キャンパスまで徒歩約{walkMinutes[state.station] ?? 7}�?/span>
              </div>
            </nav>
          </div>

          {/* 電車時刻カー�?*/}
          <div className="bg-white/30 dark:bg-white/5 backdrop-blur-lg shadow-lg shadow-pink-200/30 dark:shadow-pink-900/20 p-4 border border-pink-200/50 dark:border-pink-800/30 rounded-3xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-gradient-to-br from-pink-400 to-rose-500 p-1.5 rounded-lg">
                <TrainIcon size={18} className="text-white" />
              </div>
              <h2 className="font-bold text-lg text-gray-800 dark:text-white">{stationNames[state.station]} 発車時刻</h2>
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
          <div className="bg-white/30 dark:bg-white/5 backdrop-blur-lg shadow-lg shadow-pink-200/30 dark:shadow-pink-900/20 p-4 border border-pink-200/50 dark:border-pink-800/30 rounded-3xl">
            <h2 className="mb-3 font-bold text-center text-gray-800 dark:text-white">🌸 各棟への到着予測</h2>
            <div className="relative font-semibold text-center">
              <img src={mapImage} alt="市ヶ谷キャンパス" width={300} className="mx-auto h-56 rounded-2xl border border-pink-200/30 object-cover" height={300} />
              {([
                { key: "law", label: t("home.law"), val: overlay.law, ref: times.law, pos: "top-2 left-2" },
                { key: "letters", label: t("home.letters"), val: overlay.letters, ref: times.letters, pos: "top-2 right-2" },
                { key: "business", label: t("home.business"), val: overlay.business, ref: times.business, pos: "bottom-2 left-2" },
                { key: "intercultural", label: t("home.intercultural"), val: overlay.intercultural, ref: times.intercultural, pos: "bottom-2 right-2" },
              ] as const).map(item => (
                <div key={item.key} className={`absolute ${item.pos} bg-white/70 dark:bg-black/60 backdrop-blur-md rounded-xl px-3 py-2 min-w-[28%] border border-pink-200/40 dark:border-pink-700/30 shadow-sm`}>
                  <p className="text-[10px] text-pink-600 dark:text-pink-300">{item.label}</p>
                  <span className="block font-mono font-bold text-lg text-gray-800 dark:text-white" ref={item.ref}>{item.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* リンクボタン */}
          <div className="gap-3 grid grid-cols-1 md:grid-cols-3">
            <Link to="/discount" className="block bg-gradient-to-r from-rose-400 to-pink-500 shadow-lg shadow-pink-300/30 p-4 border border-pink-300/30 rounded-2xl min-h-[44px] font-bold text-white text-lg text-center transition-all hover:shadow-pink-400/40 hover:scale-[1.02]">
              🍽�?{t("home.discountLink")}
            </Link>
            <Link to="/tech" className="block bg-gradient-to-r from-purple-400 to-indigo-500 shadow-lg shadow-purple-300/30 p-4 border border-purple-300/30 rounded-2xl min-h-[44px] font-bold text-white text-lg text-center transition-all hover:shadow-purple-400/40 hover:scale-[1.02]">
              �?{t("home.techLink")}
            </Link>
            <Link to="/campus" className="block bg-gradient-to-r from-teal-400 to-emerald-500 shadow-lg shadow-teal-300/30 p-4 border border-teal-300/30 rounded-2xl min-h-[44px] font-bold text-white text-lg text-center transition-all hover:shadow-teal-400/40 hover:scale-[1.02]">
              🏫 {t("home.campusMap")}
            </Link>
          </div>
        </div>
        )}

        <p className="relative z-10 mx-auto mt-4 text-pink-600/50 dark:text-pink-300/30 text-center text-xs">{t("home.disclaimer")}<br />{t("home.disclaimer2")}</p>
        <footer className="relative z-10 mt-2 text-pink-500/40 dark:text-pink-400/30 text-center text-xs">
          <p>{t("footer.copyright")}</p>
        </footer>
      </main>
    </>
  );
}
// updated: ѧ��ĩ���`������

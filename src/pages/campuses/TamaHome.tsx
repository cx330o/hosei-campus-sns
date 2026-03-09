/**
 * Tama Campus Home - ðŸŒ¿ Forest/Green theme
 * Bus timetable for Nishihachioji/Mejirodai/Aihara stations
 */
import { useEffect, useMemo, useRef } from "react";
import { findNextBuses, minutesToTime } from "../../utils/timeHandlers";
import { stationNames } from "../../utils/constants";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Card from "../../components/ui/card";
import { Link } from "react-router-dom";
import Menu from "../../components/menu";
import { stateSchema, type BusWithDate, type StationId } from "../../utils/types";
import type { SpecialDateConfig } from "../../utils/types";
import StationButton from "../../components/ui/station-button";
import { toast, Toaster } from "sonner";
import AccordionArea from "../../components/AccordionArea";
import useUserInput from "../../utils/useUserInput";
import { ArrowsCounterClockwiseIcon } from "@phosphor-icons/react";
import Clock from "../../components/ui/Clock";
import { useClock } from "../../hooks/useClock";
import { useBusData } from "../../hooks/useBusData";
import specialDatesConfig from "../../utils/data/tama-specialDates.json";
import ParticleBackground from "../../components/ui/ParticleBackground";
import Countdown from "../../components/ui/Countdown";
import { HomeSkeleton } from "../../components/ui/Skeleton";
import { useLocale } from "../../i18n";
import { useCampus } from "../../campuses/CampusContext";

gsap.ticker.fps(60);
gsap.ticker.lagSmoothing(1000, 16);

export default function TamaHome() {
  const campus = useCampus();
  const { timetable, holidayData, isLoading, error } = useBusData(campus.id);
  const now = useClock(1000);
  const { locale, setLocale, t } = useLocale();
  const mainContainer = useRef<HTMLDivElement>(null);
  const arrowsRef = useRef(null);
  const departureRef = useRef(null);
  const destinationRef = useRef(null);
  const arrowsContainer = useRef(null);
  const timesContainer = useRef(null);
  const directionContainer = useRef(null);
  const buildingRefs = Object.fromEntries(
    campus.buildings.map((b) => [b.key, useRef(null)])
  );

  const { contextSafe } = useGSAP({ scope: mainContainer });

  const animateArrows = contextSafe(() => {
    if (!arrowsRef.current) return;
    gsap.fromTo(arrowsRef.current, { rotate: 0 }, { rotate: 180, duration: 0.3 });
  });
  const animateDirectionButton = contextSafe(() => {
    if (!arrowsContainer.current) return;
    gsap.fromTo(arrowsContainer.current, { scale: 1.05 }, { scale: 1, duration: 0.3 });
  });
  const animateText = contextSafe(() => {
    if (!timesContainer.current) return;
    gsap.fromTo(timesContainer.current, { opacity: 0, y: 10 }, { y: 0, duration: 0.3, opacity: 1, stagger: 0.01 });
    gsap.fromTo(
      Object.values(buildingRefs).map((ref) => ref.current).filter(Boolean),
      { opacity: 0, y: 5 },
      { y: 0, duration: 0.3, opacity: 1, stagger: 0.01 }
    );
  });

  const { setState, state } = useUserInput();
  const waribikiRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("station", state.station);
    localStorage.setItem("isComingToHosei", state.isComingToHosei ? "true" : "false");
    for (const config of specialDatesConfig as SpecialDateConfig[]) {
      if (
        config.notificationStart &&
        config.notificationEnd &&
        now >= new Date(config.notificationStart) &&
        now < new Date(config.notificationEnd) &&
        config.affectedStations.includes(state.station as SpecialDateConfig["affectedStations"][number])
      ) {
        const dateLabel = config.date.replace(/^(\d{4})-(\d{1,2})-(\d{1,2})$/, "$1å¹?2æœ?3æ—?);
        toast(`${dateLabel}äº¬çŽ‹ãƒã‚¹ã¯ç‰¹åˆ¥ãƒ€ã‚¤ãƒ¤ã§ã™(${config.description})`);
      }
    }
  }, [state.station, state.isComingToHosei]);

  const handleDirectionButtonClicked = () => {
    setState((prev) => stateSchema.parse({ ...prev, isComingToHosei: !prev.isComingToHosei }));
  };

  const handleStationButtonClicked = (station: StationId) => {
    setState((prev) => stateSchema.parse({ ...prev, station }));
  };

  useEffect(() => {
    if (!timesContainer.current) return;
    animateText();
  }, [state.isComingToHosei, state.station, isLoading]);

  useEffect(() => {
    if (!directionContainer.current) return;
    animateDirectionButton();
    animateArrows();
    gsap.fromTo(directionContainer.current, { rotateY: 180, autoAlpha: 0 }, { rotateY: 0, duration: 0.3, autoAlpha: 1 });
  }, [state.isComingToHosei, isLoading]);

  useEffect(() => {
    if (state.isComingToHosei) {
      if (!departureRef.current) return;
      gsap.fromTo(departureRef.current, { y: -20, autoAlpha: 0 }, { y: 0, duration: 0.3, autoAlpha: 1 });
    } else {
      if (!destinationRef.current) return;
      gsap.fromTo(destinationRef.current, { y: -20, autoAlpha: 0 }, { y: 0, duration: 0.3, autoAlpha: 1 });
    }
  }, [state.station, isLoading]);

  const previousBuses = useMemo<BusWithDate[]>(() => {
    if (!timetable || !holidayData) return [];
    return findNextBuses({ timetable, station: state.station, isComingToHosei: state.isComingToHosei, holidayData, currentDate: now, length: -2 });
  }, [timetable, holidayData, state.station, state.isComingToHosei, now]);

  const futureBuses = useMemo<BusWithDate[]>(() => {
    if (!timetable || !holidayData) return [];
    return findNextBuses({ timetable, station: state.station, isComingToHosei: state.isComingToHosei, holidayData, currentDate: now, length: 3 });
  }, [timetable, holidayData, state.station, state.isComingToHosei, now]);

  const [nextBus] = futureBuses;

  let departure = "";
  let destination = "";
  const overlay: Record<string, string> = Object.fromEntries(
    campus.buildings.map((b) => [b.key, "--:--"])
  );
  departure = stationNames[state.station];
  destination = t("home.hosei");
  if (!state.isComingToHosei) {
    [departure, destination] = [destination, departure];
  }
  if (state.isComingToHosei && nextBus) {
    for (const b of campus.buildings) {
      overlay[b.key] = minutesToTime(nextBus.arriveHour * 60 + nextBus.arriveMinute + b.walkMinutes);
    }
  }

  const menuLabels = {
    theme: t("menu.theme"),
    language: t("menu.language"),
    sourceCode: t("menu.sourceCode"),
    title: t("menu.title"),
  };

  return (
    <>
      <title>{t("home.title")}</title>
      <meta name="description" content={t("home.description")} />
      <Toaster />
      <header className="fixed top-0 right-0 z-30">
        <Menu locale={locale} onLocaleChange={setLocale} labels={menuLabels} />
      </header>
      <main className="relative overflow-hidden bg-gradient-to-b from-green-800 via-emerald-700 to-green-900 dark:from-[#0a1f0a] dark:via-[#0d2b0d] dark:to-[#061206] p-3 md:p-7 w-full min-h-screen text-white dark:text-white">
        {/* Forest canopy overlay */}
        <div className="absolute inset-0 z-[1] pointer-events-none bg-[radial-gradient(ellipse_at_top,rgba(255,255,150,0.12)_0%,transparent_50%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(144,238,144,0.06)_0%,transparent_50%)]" />
        {/* Vignette */}
        <div className="absolute inset-0 z-[1] pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,20,0,0.3)_100%)] dark:bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.5)_100%)]" />
        <ParticleBackground />
        <Clock now={now} />
        <div className="relative z-10 text-center">
          <img
            src={campus.sceneryImagePath}
            alt={`${campus.appName}ã‚­ãƒ£ãƒ³ãƒ‘ã‚¹æ™¯è‰²`}
            className="mx-auto mb-4 w-full max-w-2xl h-48 object-cover rounded-xl border border-green-400/30 shadow-lg opacity-90"
          />
          <h1 className="text-2xl font-bold text-white mb-1">{campus.appName}</h1>
          <p className="text-white/60 text-xs tracking-widest">{campus.subtitle}</p>
        </div>
        {error ? (
          <div className="relative z-10 mx-auto p-4 max-w-2xl text-center" role="alert">
            <Card>
              <p className="py-4 font-semibold text-red-600 dark:text-red-400">{t("home.error")}</p>
              <button
                className="bg-green-800/60 dark:bg-green-700/50 mx-auto mb-4 px-4 py-2 rounded-lg min-w-[44px] min-h-[44px] text-white dark:text-white"
                onClick={() => window.location.reload()}
              >
                {t("home.reload")}
              </button>
            </Card>
          </div>
        ) : isLoading ? (
          <HomeSkeleton />
        ) : (
        <div className="relative z-10 gap-3 grid mx-auto p-3 max-w-2xl touch-manipulation" ref={mainContainer}>
          <Card>
            <div className="grid grid-cols-5 mx-auto mt-5 px-8 font-semibold text-xl text-center" ref={directionContainer}>
              <p className="inline-block col-span-2 h-8 text-center js-departure" ref={departureRef}>{departure}</p>
              <p className="col-span-1 h-4">â‡?/p>
              <p className="inline-block col-span-2 h-8 text-center js-arrival" ref={destinationRef}>{destination}</p>
            </div>
            {/* Countdown */}
            <Countdown
              now={now}
              targetDate={nextBus?.date}
              labelBefore={t("home.nextBusIn")}
              labelAfter={t("home.departed")}
            />
            <div aria-live="polite">
              <AccordionArea previousBuses={previousBuses} futureBuses={futureBuses} timesContainer={timesContainer} />
            </div>
            <button
              className="flex relative overflow-hidden bg-gradient-to-r from-green-700/40 to-emerald-600/40 dark:from-green-800/40 dark:to-emerald-700/30 backdrop-blur-sm shadow-lg shadow-green-900/15 border border-green-400/30 mx-auto mt-3 rounded-xl w-1/2 min-h-[44px] text-white text-center transition-all hover:from-green-600/50 hover:to-emerald-500/50 before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,200,0.1),transparent_70%)] before:pointer-events-none"
              onClick={handleDirectionButtonClicked}
              ref={arrowsContainer}
              aria-label="è¡Œãå…ˆã‚’åˆ‡ã‚Šæ›¿ãˆã‚?
            >
              <ArrowsCounterClockwiseIcon size={28} ref={arrowsRef} className="mt-[8px] ml-3 rotate-x-180" />
              <span className="mx-auto my-2 font-semibold text-lg text-center">{t("home.swap")}</span>
            </button>
          </Card>

          <Card>
            <div className="relative font-semibold text-lg text-center">
              <img src={campus.mapImagePath} alt="åœ°å›³ã®ã‚¤ãƒ©ã‚¹ãƒ? width={300} className="mx-auto h-48 object-cover" height={300} />
              {campus.buildings.map((b, i) => {
                const positions = ["top-0 left-0", "top-0 right-0", "bottom-0 left-0", "right-0 bottom-0"];
                return (
                  <Card key={b.key} className={`${positions[i] ?? "top-0 left-0"} absolute backdrop-blur-sm rounded-lg w-1/3 h-16`}>
                    {t(b.labelKey as Parameters<typeof t>[0])}
                    <span className="block" ref={buildingRefs[b.key]}>{overlay[b.key]}</span>
                  </Card>
                );
              })}
            </div>
          </Card>

          <Card>
            <nav aria-label="é§…é¸æŠ?>
              <div className={`gap-3 grid grid-cols-${campus.stations.length} font-semibold text-lg text-center`}>
                {campus.stations.map((s) => (
                  <StationButton
                    key={s.id}
                    station={s.id}
                    onClick={() => handleStationButtonClicked(s.id as StationId)}
                    selectedStation={state.station}
                  >
                    {t(`station.${s.id}` as Parameters<typeof t>[0])}
                  </StationButton>
                ))}
              </div>
            </nav>
          </Card>

          <Link
            to="discount"
            className="group relative block overflow-hidden bg-gradient-to-r from-amber-700/80 via-yellow-600/70 to-amber-600/80 backdrop-blur-sm shadow-lg shadow-amber-900/20 md:m-0 my-2 p-3 border border-amber-400/30 rounded-full w-full min-h-[44px] font-bold text-white text-3xl text-center transition-all hover:shadow-amber-500/40 hover:scale-[1.02] before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,200,0.15),transparent_60%)] before:pointer-events-none"
            ref={waribikiRef}
          >
            {t("home.discountLink")}
          </Link>

          <Link
            to="tech"
            className="group relative block overflow-hidden bg-gradient-to-r from-teal-700/80 via-emerald-600/70 to-teal-600/80 backdrop-blur-sm shadow-lg shadow-teal-900/20 p-3 border border-teal-400/30 rounded-full w-full min-h-[44px] font-bold text-white text-xl text-center transition-all hover:shadow-teal-500/40 hover:scale-[1.02] before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_30%_50%,rgba(200,255,200,0.1),transparent_60%)] before:pointer-events-none"
          >
            {t("home.techLink")}
          </Link>

          <Link
            to="campus"
            className="group relative block overflow-hidden bg-gradient-to-r from-green-800/80 via-lime-600/70 to-green-700/80 backdrop-blur-sm shadow-lg shadow-green-900/20 p-3 border border-lime-400/30 rounded-full w-full min-h-[44px] font-bold text-white text-xl text-center transition-all hover:shadow-green-500/40 hover:scale-[1.02] before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_30%_50%,rgba(200,255,200,0.1),transparent_60%)] before:pointer-events-none"
          >
            {t("home.campusMap")}
          </Link>
        </div>
        )}
        <p className="relative z-10 mx-auto mt-2 font-medium text-white/70 dark:text-white/50 text-center text-sm">{t("home.disclaimer")}<br />{t("home.disclaimer2")}</p>
        <footer className="relative z-10 text-white/60 dark:text-white/40 text-center">
          <p>{t("footer.copyright")}</p>
        </footer>
      </main>
    </>
  );
}
// updated: ¥°¥é¥Ç©`¥·¥ç¥ó?¥°¥í©`¥¨¥Õ¥§¥¯¥È½yÒ»

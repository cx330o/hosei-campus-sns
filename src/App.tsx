import { BrowserRouter, Routes, Route, useLocation, useParams, Navigate } from "react-router-dom";
import ReactGA from "react-ga4";
import { useEffect, lazy, Suspense } from "react";
import { ThemeProvider } from "./components/theme-provider";
import ErrorBoundary from "./components/ErrorBoundary";
import { CampusProvider } from "./campuses/CampusContext";
import { campusConfigs, type CampusId } from "./campuses";

const Landing = lazy(() => import("./pages/landing"));
const IchigayaHome = lazy(() => import("./pages/campuses/IchigayaHome"));
const TamaHome = lazy(() => import("./pages/campuses/TamaHome"));
const KoganeiHome = lazy(() => import("./pages/campuses/KoganeiHome"));
const Discount = lazy(() => import("./pages/discount/discount"));
const ShopDetail = lazy(() => import("./pages/discount/ShopDetail"));
const TechPage = lazy(() => import("./pages/tech"));
const CampusPage = lazy(() => import("./pages/campus"));
const NotFound = lazy(() => import("./pages/NotFound"));

const TRACKING_ID = "G-4F3PMM48SS";
if (TRACKING_ID) {
  ReactGA.initialize(TRACKING_ID);
}

const TrackPageViews = () => {
  const location = useLocation();
  useEffect(() => {
    if (TRACKING_ID) {
      ReactGA.send({ hitType: "pageview", page: location.pathname + location.search });
    }
  }, [location]);
  return null;
};

const LazyFallback = () => (
  <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-zinc-950 text-black dark:text-white">
    <p>Ë™≠„ÅøËæº„Åø‰∏?..</p>
  </div>
);

const campusHomeMap: Record<CampusId, React.LazyExoticComponent<() => React.JSX.Element>> = {
  ichigaya: IchigayaHome,
  koganei: KoganeiHome,
  tama: TamaHome,
};

/** Wraps campus-specific routes with the CampusProvider */
function CampusRoutes() {
  const { campusId } = useParams<{ campusId: string }>();

  if (!campusId || !(campusId in campusConfigs)) {
    return <Navigate to="/" replace />;
  }

  const id = campusId as CampusId;
  const config = campusConfigs[id];
  const HomeComponent = campusHomeMap[id];

  return (
    <CampusProvider config={config}>
      <Routes>
        <Route index element={<HomeComponent />} />
        <Route path="discount" element={<Discount />} />
        <Route path="discount/:shopId" element={<ShopDetail />} />
        <Route path="tech" element={<TechPage />} />
        <Route path="campus" element={<CampusPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </CampusProvider>
  );
}

const App = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="hosei-campus-theme">
      <BrowserRouter>
        <TrackPageViews />
        <ErrorBoundary>
          <Suspense fallback={<LazyFallback />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/:campusId/*" element={<CampusRoutes />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
// updated: App.tsx§Œ•Î©`•∆•£•Û•∞’˚¿Ì

import { Link } from "react-router-dom";
import { useLocale } from "../i18n";

const NotFound = () => {
  const { t } = useLocale();
  return (
    <div className="flex flex-col justify-center items-center bg-gray-100 dark:bg-zinc-950 min-h-screen text-black dark:text-white">
      <title>404 - たまっぷ</title>
      <h1 className="font-bold text-6xl">{t("notfound.title")}</h1>
      <p className="mt-4 text-lg">{t("notfound.message")}</p>
      <Link
        to="/"
        className="mt-6 px-6 py-3 bg-rose-500 min-w-[44px] min-h-[44px] text-white rounded-lg hover:bg-rose-600 transition-colors"
      >
        {t("notfound.back")}
      </Link>
    </div>
  );
};

export default NotFound;

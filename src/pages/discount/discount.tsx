import { Link } from "react-router-dom"
import StoreCard from '../../components/store-card'
import { Undo2 } from "lucide-react"
import { shopDataByCampus } from "../../utils/shopData"
import { useCampus } from "../../campuses/CampusContext"
import { useLocale } from "../../i18n"

const DiscountPage = () => {
  const campus = useCampus();
  const { t } = useLocale();
  const shops = Object.values(shopDataByCampus[campus.id] ?? {});

  return (
    <div className='bg-zinc-100 dark:bg-zinc-950 min-h-screen text-black dark:text-white'>
      <title>{campus.appName} {t("discount.title")}</title>
      <meta name="description" content={t("discount.description")} />
      <header className='bg-[#ff6347] text-white'>
        <h1 className='mx-auto p-3 font-bold text-2xl text-center'>{campus.appName} {t("discount.title")}</h1>
      </header>
      <Link to={`/${campus.id}`} className='top-2 left-2 fixed bg-white dark:bg-black p-4 border-2 border-rose-500 rounded-full min-w-[44px] min-h-[44px] font-semibold text-black dark:text-white text-lg'>
        <Undo2 />
      </Link>
      <div className='gap-8 grid grid-cols-1 md:grid-cols-2 mx-auto mt-4 p-8 max-w-5xl'>
        {shops.map((shop) => (
          <StoreCard
            key={shop.id}
            storeName={shop.name}
            storeImage={shop.image}
            storeDescription={shop.shortDescription}
            url={`discount/${shop.id}`}
          >
            <p>{shop.discountContent.slice(0, 2).join(" / ")}</p>
          </StoreCard>
        ))}
      </div>
    </div>
  )
}

export default DiscountPage

import { useParams, Navigate } from "react-router-dom";
import ShopDetailTemplate from "../../components/ShopDetailTemplate";
import { shopDataByCampus } from "../../utils/shopData";
import { useCampus } from "../../campuses/CampusContext";

const ShopDetail = () => {
  const { shopId } = useParams<{ shopId: string }>();
  const campus = useCampus();
  const campusShops = shopDataByCampus[campus.id] ?? {};
  const shop = shopId ? campusShops[shopId] : undefined;

  if (!shop) {
    return <Navigate to="/404" replace />;
  }

  return <ShopDetailTemplate shop={shop} />;
};

export default ShopDetail;

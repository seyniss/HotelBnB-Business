import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { businessStatsApi } from "../../api/businessStatsApi";
import { businessHotelApi } from "../../api/businessHotelApi";
import BusinessStatsCards from "../../components/business/dashboard/BusinessStatsCards";
import BusinessChartArea from "../../components/business/dashboard/BusinessChartArea";
import BusinessRecentTable from "../../components/business/dashboard/BusinessRecentTable";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import { extractApiData, extractApiArray, extractErrorMessage } from "../../utils/apiUtils";

const BusinessDashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    checkHotelAndFetchStats();
  }, []);

  const checkHotelAndFetchStats = async () => {
    try {
      setLoading(true);
      // 먼저 호텔 정보 확인
      try {
        const hotelData = await businessHotelApi.getMyHotel();
        const hotel = hotelData?.data || hotelData;
        
        // 호텔 정보가 없으면 호텔 설정 페이지로 리다이렉트
        if (!hotel || !hotel.id) {
          navigate("/business/settings");
          return;
        }
      } catch (hotelError) {
        // 호텔 정보가 없거나 404 에러인 경우 호텔 설정 페이지로 리다이렉트
        if (hotelError.response?.status === 404) {
          navigate("/business/settings");
          return;
        }
        // 다른 에러는 무시하고 계속 진행
      }
      
      // 호텔 정보가 있으면 대시보드 데이터 가져오기
      const response = await businessStatsApi.getDashboardStats();
      const data = extractApiData(response);
      setStats(data);
    } catch (err) {
      const errorMessage = extractErrorMessage(err, "데이터를 불러오는데 실패했습니다.");
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader fullScreen />;
  if (error) return <ErrorMessage message={error} onRetry={checkHotelAndFetchStats} />;

  return (
    <div className="business-dashboard-page">
      <h1 className="page-title">대시보드</h1>

      <BusinessStatsCards stats={stats} />
      <BusinessChartArea data={stats?.chartData || stats?.chart || stats} />

      <div className="recent-activity">
        <h2>최근 활동</h2>
        <BusinessRecentTable bookings={stats?.recentBookings || stats?.bookings || stats?.recent || []} />
      </div>
    </div>
  );
};

export default BusinessDashboardPage;

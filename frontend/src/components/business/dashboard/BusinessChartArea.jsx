import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  Line,
} from "recharts";
import EmptyState from "../../common/EmptyState";

const BusinessChartArea = ({ data }) => {
  const formatCurrency = (value) =>
    new Intl.NumberFormat("ko-KR", {
      maximumFractionDigits: 0,
    }).format(value);

  // 백엔드 응답 구조에 맞게 데이터 추출
  // data.data가 있으면 data를 사용, 없으면 data를 직접 사용
  // 백엔드 응답 구조: { labels: [...], revenue: [...], bookings: [...] }
  const rawChartData = data?.data || data || {};
  
  // 데이터 유효성 검사
  const labels = rawChartData?.labels || [];
  const revenues = rawChartData?.revenue || [];
  const bookings = rawChartData?.bookings || [];
  
  // 데이터가 없는 경우 빈 상태 표시 (labels가 있으면 데이터가 있다고 간주)
  // bookings가 0이어도 유효한 데이터로 처리
  const hasData = labels.length > 0 && (revenues.length > 0 || bookings.length > 0);
  
  if (!hasData) {
    return (
      <div className="chart-section">
        <div className="chart-header">
          <h2>매출 추이</h2>
          <p className="chart-subtitle">최근 6개월 매출과 예약 수</p>
        </div>
        <div className="chart-wrapper" style={{ minHeight: "320px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <EmptyState message="매출 데이터가 없습니다. 예약이 발생하면 그래프가 표시됩니다." />
        </div>
      </div>
    );
  }

  // 데이터 길이가 일치하지 않으면 최소 길이로 맞춤
  const minLength = Math.min(labels.length, revenues.length, bookings.length);
  const chartData = Array.from({ length: minLength }, (_, index) => ({
    month: labels[index] || `기간 ${index + 1}`,
    revenue: revenues[index] || 0,
    bookings: bookings[index] || 0,
  }));

  return (
    <div className="chart-section">
      <div className="chart-header">
        <h2>매출 추이</h2>
        <p className="chart-subtitle">최근 6개월 매출과 예약 수</p>
      </div>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={chartData} margin={{ top: 10, right: 24, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" tick={{ fill: "#6b7280" }} />
            <YAxis
              yAxisId="left"
              tickFormatter={(value) => `${Math.round(value / 10000)}만`}
              tick={{ fill: "#6b7280" }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: "#6b7280" }}
            />
            <Tooltip
              formatter={(value, name) =>
                name === "매출"
                  ? [`${formatCurrency(value)}원`, name]
                  : [`${value}건`, name]
              }
            />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="revenue"
              name="매출"
              fill="#7FD8BE"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="bookings"
              name="예약 수"
              stroke="#F97316"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BusinessChartArea;

import { useState, useEffect } from "react";
import { businessStatsApi } from "../../api/businessStatsApi";
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
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import { extractApiData, extractErrorMessage } from "../../utils/apiUtils";

const PERIOD_OPTIONS = [
  { value: "week", label: "주간" },
  { value: "month", label: "월간" },
  { value: "quarter", label: "분기" },
  { value: "year", label: "연간" },
];

const BusinessStatisticsPage = () => {
  const [stats, setStats] = useState(null);
  const [revenueTrend, setRevenueTrend] = useState(null);
  const [period, setPeriod] = useState("month");
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
    fetchRevenueTrend("month");
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await businessStatsApi.getStatistics();
      const data = extractApiData(response);
      setStats(data);
    } catch (err) {
      const errorMessage = extractErrorMessage(err, "통계를 불러오는데 실패했습니다.");
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenueTrend = async (nextPeriod) => {
    try {
      setChartLoading(true);
      setPeriod(nextPeriod);
      const response = await businessStatsApi.getRevenueStats(nextPeriod);
      const data = extractApiData(response);
      setRevenueTrend(data);
    } catch (err) {
      const errorMessage = extractErrorMessage(err, "매출 추이를 불러오는데 실패했습니다.");
      setError(errorMessage);
    } finally {
      setChartLoading(false);
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
      maximumFractionDigits: 0,
    }).format(amount || 0);

  const formatPercent = (value) => {
    if (value === undefined || value === null) return "-";
    return `${(value * 100).toFixed(1)}%`;
  };

  // revenueTrend 데이터 처리
  const trendData = revenueTrend?.data || revenueTrend || {};
  const chartData =
    trendData?.labels?.length
      ? trendData.labels.map((label, index) => ({
          period: label,
          revenue: trendData.revenue?.[index] ?? 0,
          bookings: trendData.bookings?.[index] ?? 0,
        }))
      : revenueTrend?.labels?.length
      ? revenueTrend.labels.map((label, index) => ({
          period: label,
          revenue: revenueTrend.revenue?.[index] ?? 0,
          bookings: revenueTrend.bookings?.[index] ?? 0,
        }))
      : [];

  if (loading && !stats) return <Loader fullScreen />;
  if (error && !stats) return <ErrorMessage message={error} onRetry={fetchStats} />;

  // stats 데이터 안전하게 접근
  const statsData = stats?.data || stats || {};
  const today = statsData.today || {};
  const thisMonth = statsData.thisMonth || {};

  const summaryCards = stats
    ? [
        {
          title: "오늘 매출",
          value: formatCurrency(today.revenue || 0),
          delta: today.change?.revenue,
        },
        {
          title: "오늘 예약",
          value: `${today.bookings || 0}건`,
          delta: today.change?.bookings,
        },
        {
          title: "이번 달 매출",
          value: formatCurrency(thisMonth.revenue || 0),
          delta: thisMonth.change?.revenue,
        },
        {
          title: "이번 달 취소율",
          value:
            thisMonth.bookings && thisMonth.bookings > 0
              ? `${((thisMonth.cancellations || 0) / thisMonth.bookings * 100).toFixed(1)}%`
              : "0%",
          delta: thisMonth.change?.cancellations,
          invert: true,
        },
      ]
    : [];

  return (
    <div className="business-statistics-page">
      <div className="page-header">
        <div>
          <h1>매출 통계</h1>
          <p>호텔 예약 및 매출 지표를 기간별로 확인합니다.</p>
        </div>
      </div>

      <div className="stats-summary-grid">
        {summaryCards.map((card) => (
          <div className="summary-card" key={card.title}>
            <div className="summary-card__header">
              <p>{card.title}</p>
              {card.delta !== undefined && (
                <span className={`delta ${card.invert && card.delta < 0 ? "positive" : card.delta >= 0 ? "positive" : "negative"}`}>
                  {card.delta >= 0 ? "+" : ""}
                  {(card.delta * 100).toFixed(1)}%
                </span>
              )}
            </div>
            <p className="summary-card__value">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="statistics-section card">
        <div className="statistics-section__header">
          <div>
            <h2>매출 추이</h2>
            <p>기간별 매출과 예약 수를 비교해 보세요.</p>
          </div>
          <div className="chart-filter-group">
            {PERIOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`chart-filter-btn ${period === option.value ? "active" : ""}`}
                onClick={() => fetchRevenueTrend(option.value)}
                disabled={chartLoading && period === option.value}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {statsData?.trendComparison && (
          <div className="trend-summary">
            <div>
              <p className="label">이번 기간 매출</p>
              <p className="value">{formatCurrency(statsData.trendComparison.current || 0)}</p>
            </div>
            <div>
              <p className="label">전 기간</p>
              <p className="value muted">{formatCurrency(statsData.trendComparison.previous || 0)}</p>
            </div>
            <div className={`trend-badge ${(statsData.trendComparison.yoyChange || 0) >= 0 ? "positive" : "negative"}`}>
              {(statsData.trendComparison.yoyChange || 0) >= 0 ? "▲" : "▼"} {((statsData.trendComparison.yoyChange || 0) * 100).toFixed(1)}% YoY
            </div>
          </div>
        )}

        <div className="chart-wrapper">
          {chartLoading && (
            <div className="chart-overlay">
              <div className="chart-spinner" />
            </div>
          )}
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={chartData} margin={{ top: 10, right: 24, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="period" tick={{ fill: "#6b7280" }} />
              <YAxis
                yAxisId="left"
                tickFormatter={(value) => `${Math.round(value / 10000)}만`}
                tick={{ fill: "#6b7280" }}
              />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: "#6b7280" }} />
              <Tooltip
                formatter={(value, name) =>
                  name === "매출" ? [`${formatCurrency(value)}원`, name] : [`${value}건`, name]
                }
              />
              <Legend />
              <Bar yAxisId="left" dataKey="revenue" name="매출" fill="#7FD8BE" radius={[4, 4, 0, 0]} maxBarSize={32} />
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
    </div>
  );
};

export default BusinessStatisticsPage;

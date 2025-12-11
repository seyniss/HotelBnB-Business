const StatusBadge = ({ status, type = "booking" }) => {
  const getStatusConfig = () => {
    if (type === "booking") {
      const statusMap = {
        pending: { label: "대기", className: "badge-warning" },
        confirmed: { label: "확정", className: "badge-success" },
        cancelled: { label: "취소", className: "badge-danger" },
        completed: { label: "완료", className: "badge-info" },
      };
      return (
        statusMap[status] || { label: status, className: "badge-secondary" }
      );
    }

    if (type === "room") {
      const statusMap = {
        available: { label: "판매중", className: "badge-success" },
        unavailable: { label: "판매중지", className: "badge-danger" },
        maintenance: { label: "정비중", className: "badge-warning" },
      };
      return (
        statusMap[status] || { label: status, className: "badge-secondary" }
      );
    }

    if (type === "review") {
      const statusMap = {
        approved: { label: "승인", className: "badge-success" },
        pending: { label: "대기", className: "badge-warning" },
        reported: { label: "신고됨", className: "badge-danger" },
      };
      return (
        statusMap[status] || { label: status, className: "badge-secondary" }
      );
    }

    return { label: status, className: "badge-secondary" };
  };

  const config = getStatusConfig();

  return <span className={`badge ${config.className}`}>{config.label}</span>;
};

export default StatusBadge;

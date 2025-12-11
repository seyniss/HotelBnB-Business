const EmptyState = ({ message, icon = "📭", action }) => {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <p>{message || "데이터가 없습니다."}</p>
      {action && (
        <button onClick={action.onClick} className="btn btn-primary">
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;

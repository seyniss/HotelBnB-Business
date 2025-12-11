const BusinessBookingFilter = ({ values, onChange, onSearch, onReset }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch?.();
  };

  return (
    <form className="filter-bar booking-filter" onSubmit={handleSubmit}>
      <div className="filter-group grow">
        <label>검색</label>
        <input
          type="text"
          placeholder="예약번호 또는 고객명"
          value={values.search || ""}
          onChange={(e) => onChange("search", e.target.value)}
        />
      </div>

      <div className="filter-group">
        <label>상태</label>
        <select
          value={values.status || ""}
          onChange={(e) => onChange("status", e.target.value)}
        >
          <option value="">전체</option>
          <option value="confirmed">확정</option>
          <option value="pending">대기</option>
          <option value="completed">완료</option>
          <option value="cancelled">취소</option>
        </select>
      </div>

      <div className="filter-group">
        <label>시작일</label>
        <input
          type="date"
          placeholder="연도-월-일"
          value={values.startDate || ""}
          onChange={(e) => onChange("startDate", e.target.value)}
        />
      </div>

      <div className="filter-group">
        <label>종료일</label>
        <input
          type="date"
          placeholder="연도-월-일"
          value={values.endDate || ""}
          onChange={(e) => onChange("endDate", e.target.value)}
        />
      </div>

      <div className="filter-actions">
        <button type="submit" className="btn btn-primary">
          검색
        </button>
        <button type="button" className="btn btn-outline" onClick={onReset}>
          초기화
        </button>
      </div>
    </form>
  );
};

export default BusinessBookingFilter;

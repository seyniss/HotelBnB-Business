const BusinessReviewFilter = ({ filters, onFilterChange }) => {
  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label>상태</label>
        <select
          value={filters.status || ""}
          onChange={(e) => onFilterChange("status", e.target.value)}
        >
          <option value="">전체</option>
          <option value="approved">승인</option>
          <option value="pending">대기</option>
          <option value="reported">신고됨</option>
        </select>
      </div>

      <div className="filter-group">
        <label>평점</label>
        <select
          value={filters.rating || ""}
          onChange={(e) => onFilterChange("rating", e.target.value)}
        >
          <option value="">전체</option>
          <option value="5">5점</option>
          <option value="4">4점</option>
          <option value="3">3점</option>
          <option value="2">2점</option>
          <option value="1">1점</option>
        </select>
      </div>

      <div className="filter-group">
        <label>검색</label>
        <input
          type="text"
          placeholder="작성자명 검색"
          value={filters.search || ""}
          onChange={(e) => onFilterChange("search", e.target.value)}
        />
      </div>
    </div>
  );
};

export default BusinessReviewFilter;

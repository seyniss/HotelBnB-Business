const BusinessRoomFilter = ({ filters, onFilterChange }) => {
  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label>상태</label>
        <select
          value={filters.status || ""}
          onChange={(e) => onFilterChange("status", e.target.value)}
        >
          <option value="">전체</option>
          <option value="available">판매중</option>
          <option value="unavailable">판매중지</option>
          <option value="maintenance">정비중</option>
        </select>
      </div>

      <div className="filter-group">
        <label>객실 타입</label>
        <select
          value={filters.type || ""}
          onChange={(e) => onFilterChange("type", e.target.value)}
        >
          <option value="">전체</option>
          <option value="standard">스탠다드</option>
          <option value="deluxe">디럭스</option>
          <option value="suite">스위트</option>
        </select>
      </div>

      <div className="filter-group">
        <label>검색</label>
        <input
          type="text"
          placeholder="객실명 검색"
          value={filters.search || ""}
          onChange={(e) => onFilterChange("search", e.target.value)}
        />
      </div>
    </div>
  );
};

export default BusinessRoomFilter;

import { useState, useEffect } from "react";
import Select from "react-select";

const TYPE_OPTIONS = [
  { value: "standard", label: "스탠다드" },
  { value: "deluxe", label: "디럭스" },
  { value: "suite", label: "스위트" },
];

const STATUS_OPTIONS = [
  { value: "available", label: "판매중" },
  { value: "unavailable", label: "판매중지" },
  { value: "maintenance", label: "정비중" },
];

const selectStyles = {
  control: (provided, state) => ({
    ...provided,
    minHeight: "40px",
    borderRadius: "8px",
    borderColor: state.isFocused ? "#7FD8BE" : "rgba(15, 23, 42, 0.15)",
    boxShadow: state.isFocused ? "0 0 0 3px rgba(127, 216, 190, 0.1)" : "none",
    paddingLeft: 4,
    paddingRight: 4,
    "&:hover": {
      borderColor: "#7FD8BE",
    },
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: "0 12px",
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "#0f172a",
    fontWeight: 500,
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "rgba(15, 23, 42, 0.5)",
  }),
  option: (provided, state) => ({
    ...provided,
    fontSize: "14px",
    fontWeight: 500,
    color: state.isSelected ? "#ffffff" : "#0f172a",
    backgroundColor: state.isSelected
      ? "#7FD8BE"
      : state.isFocused
        ? "rgba(127, 216, 190, 0.08)"
        : "#ffffff",
    cursor: "pointer",
    padding: "12px 16px",
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow:
      "0 20px 45px rgba(15, 23, 42, 0.18), 0 10px 18px rgba(15, 23, 42, 0.08)",
    marginTop: "8px",
  }),
  menuList: (provided) => ({
    ...provided,
    padding: 0,
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    color: "#0f172a",
    paddingRight: 12,
  }),
};

const BusinessRoomForm = ({ room, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "standard",
    price: "",
    maxGuests: "",
    quantity: "",
    description: "",
    amenities: [],
    status: "available",
  });

  useEffect(() => {
    if (room) {
      setFormData({
        name: room.name || "",
        type: room.type || "standard",
        price: room.price || "",
        maxGuests: room.maxGuests || "",
        quantity: room.quantity || "",
        description: room.description || "",
        amenities: room.amenities || [],
        status: room.status || "available",
      });
    }
  }, [room]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (selectedOption) => {
    setFormData((prev) => ({ ...prev, type: selectedOption.value }));
  };

  const handleStatusChange = (selectedOption) => {
    setFormData((prev) => ({ ...prev, status: selectedOption.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="form-group">
        <label>객실명</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>타입</label>
        <Select
          name="type"
          value={TYPE_OPTIONS.find((option) => option.value === formData.type)}
          onChange={handleTypeChange}
          options={TYPE_OPTIONS}
          styles={selectStyles}
          isSearchable={false}
          className="room-type-select"
          classNamePrefix="room-type-select"
        />
      </div>

      <div className="form-group">
        <label>가격 (1박)</label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>최대 인원</label>
        <input
          type="number"
          name="maxGuests"
          value={formData.maxGuests}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>객실 수량</label>
        <input
          type="number"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>설명</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
        />
      </div>

      <div className="form-group">
        <label>상태</label>
        <Select
          name="status"
          value={STATUS_OPTIONS.find((option) => option.value === formData.status)}
          onChange={handleStatusChange}
          options={STATUS_OPTIONS}
          styles={selectStyles}
          isSearchable={false}
          className="room-status-select"
          classNamePrefix="room-status-select"
        />
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel}>
          취소
        </button>
        <button type="submit" className="btn btn-primary">
          {room ? "수정" : "등록"}
        </button>
      </div>
    </form>
  );
};

export default BusinessRoomForm;

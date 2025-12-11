import { useState, useEffect, useRef } from "react";

const FACILITY_OPTIONS = [
  { value: "spa", label: "스파/월풀", icon: "🛁" },
  { value: "wifi", label: "무선인터넷", icon: "📶" },
  { value: "parking", label: "주차장", icon: "🚗" },
  { value: "halfBath", label: "반신욕", icon: "✔️" },
  { value: "mirrorRoom", label: "거울룸", icon: "🪞" },
  { value: "twinBed", label: "트윈베드", icon: "🛏️" },
  { value: "karaoke", label: "노래방", icon: "🎤" },
  { value: "couplePc", label: "커플 PC", icon: "🖥️" },
  { value: "gamingPc", label: "게이밍PC", icon: "🎮" },
];

const BusinessHotelSettingsForm = ({ hotel, onSubmit }) => {
  const [formData, setFormData] = useState({
    lodgingName: "",
    description: "",
    address: "",
    detailAddress: "",
    phoneNumber: "",
    email: "",
    policies: "",
    amenities: [],
  });
  const addressInputRef = useRef(null);

  useEffect(() => {
    if (hotel) {
      // 주소에서 기본 주소와 상세 주소 분리
      const fullAddress = hotel.address || "";
      const addressParts = fullAddress.split(" ");
      const baseAddress = addressParts.slice(0, -1).join(" ") || fullAddress;
      const detailAddress = addressParts[addressParts.length - 1] || "";
      
      setFormData({
        lodgingName: hotel.lodgingName || hotel.name || "",
        description: hotel.description || "",
        address: baseAddress,
        detailAddress: detailAddress,
        phoneNumber: hotel.phoneNumber || "",
        email: hotel.email || "",
        policies: hotel.policies || "",
        amenities: hotel.amenities || [],
      });
    }
  }, [hotel]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleAmenity = (value) => {
    setFormData((prev) => {
      const exists = prev.amenities.includes(value);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((item) => item !== value)
          : [...prev.amenities, value],
      };
    });
  };

  const handleAddressSearch = () => {
    // Daum Postcode Service 사용
    if (window.daum && window.daum.Postcode) {
      new window.daum.Postcode({
        oncomplete: function(data) {
          // 도로명 주소 선택 시
          let fullAddress = '';
          let extraAddress = '';

          // 사용자가 선택한 주소 타입에 따라 해당 주소 값을 가져온다.
          if (data.userSelectedType === 'R') {
            // 사용자가 도로명 주소를 선택했을 경우
            fullAddress = data.roadAddress;
          } else {
            // 사용자가 지번 주소를 선택했을 경우(J)
            fullAddress = data.jibunAddress;
          }

          // 사용자가 선택한 주소가 도로명 타입일때 참고항목을 조합한다.
          if(data.userSelectedType === 'R'){
            // 법정동명이 있을 경우 추가한다. (법정리는 제외)
            // 법정동의 경우 마지막 문자가 "동/로/가"로 끝난다.
            if(data.bname !== '' && /[동|로|가]$/g.test(data.bname)){
              extraAddress += data.bname;
            }
            // 건물명이 있고, 공동주택일 경우 추가한다.
            if(data.buildingName !== '' && data.apartment === 'Y'){
              extraAddress += (extraAddress !== '' ? ', ' + data.buildingName : data.buildingName);
            }
            // 표시할 참고항목이 있을 경우, 괄호까지 추가한 최종 문자열을 만든다.
            if(extraAddress !== ''){
              extraAddress = ' (' + extraAddress + ')';
            }
            // 조합된 참고항목을 해당 필드에 넣는다.
            fullAddress += extraAddress;
          }

          // 주소 필드에 값 설정 (상세 주소는 초기화)
          setFormData((prev) => ({
            ...prev,
            address: fullAddress,
            detailAddress: ""
          }));
        },
        width: '100%',
        height: '100%',
        maxSuggestItems: 5
      }).open({
        q: formData.address || '', // 검색어가 있으면 자동 입력
        left: window.screen.width / 2 - 300,
        top: window.screen.height / 2 - 300
      });
    } else {
      alert('주소 검색 서비스를 불러올 수 없습니다. 페이지를 새로고침해주세요.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // 주소와 상세 주소를 합쳐서 전송
    const submitData = {
      ...formData,
      address: formData.detailAddress 
        ? `${formData.address} ${formData.detailAddress}`.trim()
        : formData.address
    };
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <h4>호텔 정보</h4>

      <div className="form-group">
        <label>호텔명</label>
        <input
          type="text"
          name="lodgingName"
          value={formData.lodgingName}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>호텔 소개</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
        />
      </div>

      <div className="form-group">
        <label>주소</label>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <input
            ref={addressInputRef}
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="주소를 검색하세요"
            required
            style={{ flex: 1 }}
            readOnly
          />
          <button
            type="button"
            onClick={handleAddressSearch}
            className="btn btn-secondary"
            style={{ whiteSpace: 'nowrap', minWidth: '100px' }}
          >
            주소 검색
          </button>
        </div>
        <input
          type="text"
          name="detailAddress"
          value={formData.detailAddress}
          onChange={handleChange}
          placeholder="상세 주소를 입력하세요 (선택사항)"
          style={{ width: '100%' }}
        />
      </div>

      <div className="form-group">
        <label>연락처</label>
        <input
          type="tel"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>이메일</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>이용 정책</label>
        <textarea
          name="policies"
          value={formData.policies}
          onChange={handleChange}
          rows={4}
          placeholder="호텔 이용 정책을 입력하세요..."
        />
      </div>

      <div className="form-group">
        <label>부대시설</label>
        <div className="facility-selector">
          {FACILITY_OPTIONS.map((facility) => {
            const selected = formData.amenities.includes(facility.value);
            return (
              <button
                type="button"
                key={facility.value}
                className={`facility-item ${selected ? "selected" : ""}`}
                onClick={() => toggleAmenity(facility.value)}
                aria-pressed={selected}
              >
                <span className="facility-icon">{facility.icon}</span>
                <span className="facility-label">{facility.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          저장
        </button>
      </div>
    </form>
  );
};

export default BusinessHotelSettingsForm;

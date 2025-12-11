import { useState, useEffect } from "react";
import { businessAuthApi } from "../../api/businessAuthApi";
import BusinessProfileForm from "../../components/business/settings/BusinessProfileForm";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import AlertModal from "../../components/common/AlertModal";
import { extractApiData, extractErrorMessage } from "../../utils/apiUtils";

const BusinessMyProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: "", type: "info" });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await businessAuthApi.getMyInfo();
      const profileData = extractApiData(response);
      setProfile(profileData);
    } catch (err) {
      const errorMessage = extractErrorMessage(err, "프로필 정보를 불러오는데 실패했습니다.");
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data) => {
    try {
      const profileData = {
        name: data.name,
        phoneNumber: data.phoneNumber,
        businessNumber: data.businessNumber
      };
      
      await businessAuthApi.updateProfile(profileData);
      
      if (data.newPassword && data.currentPassword) {
        try {
          await businessAuthApi.changePassword({
            currentPassword: data.currentPassword,
            newPassword: data.newPassword
          });
          setAlertModal({ isOpen: true, message: "프로필과 비밀번호가 저장되었습니다.", type: "success" });
        } catch (passwordErr) {
          // 비밀번호 변경 실패 시 프로필은 이미 저장됨
          const passwordErrorMsg = extractErrorMessage(passwordErr, "비밀번호 변경에 실패했습니다.");
          setAlertModal({ isOpen: true, message: `프로필은 저장되었지만 ${passwordErrorMsg}`, type: "warning" });
          fetchProfile();
          return;
        }
      } else {
        setAlertModal({ isOpen: true, message: "프로필이 저장되었습니다.", type: "success" });
      }
      
      fetchProfile();
    } catch (err) {
      const errorMessage = extractErrorMessage(err, "저장에 실패했습니다.");
      setAlertModal({ isOpen: true, message: errorMessage, type: "error" });
    }
  };

  if (loading) return <Loader fullScreen />;
  if (error) return <ErrorMessage message={error} onRetry={fetchProfile} />;

  return (
    <div className="business-my-profile-page">
      <div className="page-header">
        <h1>내 프로필</h1>
      </div>

      <div className="card">
        <BusinessProfileForm profile={profile} onSubmit={handleSubmit} />
      </div>

      <AlertModal
        isOpen={alertModal.isOpen}
        message={alertModal.message}
        type={alertModal.type}
        onClose={() => setAlertModal({ isOpen: false, message: "", type: "info" })}
      />
    </div>
  );
};

export default BusinessMyProfilePage;

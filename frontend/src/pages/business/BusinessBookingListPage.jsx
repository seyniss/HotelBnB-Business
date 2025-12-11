import { useState, useEffect } from "react";
import { businessBookingApi } from "../../api/businessBookingApi";
import BusinessBookingFilter from "../../components/business/bookings/BusinessBookingFilter";
import BusinessBookingTable from "../../components/business/bookings/BusinessBookingTable";
import Pagination from "../../components/common/Pagination";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import EmptyState from "../../components/common/EmptyState";
import AlertModal from "../../components/common/AlertModal";
import { extractApiArray, extractPagination, extractErrorMessage } from "../../utils/apiUtils";

const BusinessBookingListPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    startDate: "",
    endDate: "",
  });
  const [filterInputs, setFilterInputs] = useState(filters);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: "", type: "info" });

  useEffect(() => {
    fetchBookings();
  }, [filters, currentPage]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await businessBookingApi.getBookings({
        ...filters,
        page: currentPage,
      });
      const bookingsData = extractApiArray(response, "bookings");
      setBookings(bookingsData);
      const pagination = extractPagination(response);
      setTotalPages(pagination.totalPages);
    } catch (err) {
      const errorMessage = extractErrorMessage(err, "예약 목록을 불러오는데 실패했습니다.");
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterInputChange = (key, value) => {
    setFilterInputs((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setFilters(filterInputs);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    const initial = { search: "", status: "", startDate: "", endDate: "" };
    setFilterInputs(initial);
    setFilters(initial);
    setCurrentPage(1);
  };

  const handleStatusChange = async (id, status) => {
    try {
      await businessBookingApi.updateBookingStatus(id, status);
      fetchBookings();
    } catch (err) {
      const errorMessage = extractErrorMessage(err, "상태 변경에 실패했습니다.");
      setAlertModal({ isOpen: true, message: errorMessage, type: "error" });
    }
  };

  if (loading) return <Loader fullScreen />;
  if (error) return <ErrorMessage message={error} onRetry={fetchBookings} />;

  return (
    <div className="business-booking-list-page">
      <div className="page-header">
        <h1>예약 관리</h1>
      </div>

      <BusinessBookingFilter
        values={filterInputs}
        onChange={handleFilterInputChange}
        onSearch={applyFilters}
        onReset={resetFilters}
      />

      {bookings.length === 0 ? (
        <EmptyState message="예약 내역이 없습니다." />
      ) : (
        <>
          <div className="card">
            <BusinessBookingTable
              bookings={bookings}
              onStatusChange={handleStatusChange}
            />
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      <AlertModal
        isOpen={alertModal.isOpen}
        message={alertModal.message}
        type={alertModal.type}
        onClose={() => setAlertModal({ isOpen: false, message: "", type: "info" })}
      />
    </div>
  );
};

export default BusinessBookingListPage;

import { Navigate } from "react-router-dom";
import BusinessLayout from "../components/layout/BusinessLayout";
import BusinessLoginPage from "../pages/auth/BusinessLoginPage";
import BusinessSignupPage from "../pages/auth/BusinessSignupPage";
import BusinessForgotPasswordPage from "../pages/auth/BusinessForgotPasswordPage";
import BusinessKakaoCompletePage from "../pages/auth/BusinessKakaoCompletePage";
import BusinessDashboardPage from "../pages/business/BusinessDashboardPage";
import BusinessBookingListPage from "../pages/business/BusinessBookingListPage";
import BusinessBookingDetailPage from "../pages/business/BusinessBookingDetailPage";
import BusinessRoomListPage from "../pages/business/BusinessRoomListPage";
import BusinessRoomCreatePage from "../pages/business/BusinessRoomCreatePage";
import BusinessRoomEditPage from "../pages/business/BusinessRoomEditPage";
import BusinessStatisticsPage from "../pages/business/BusinessStatisticsPage";
import BusinessReviewListPage from "../pages/business/BusinessReviewListPage";
import BusinessReviewDetailPage from "../pages/business/BusinessReviewDetailPage";
import BusinessSettingsPage from "../pages/business/BusinessSettingsPage";
import BusinessMyProfilePage from "../pages/business/BusinessMyProfilePage";

const businessRoutes = [
  {
    path: "/business/login",
    element: <BusinessLoginPage />,
  },
  {
    path: "/business/signup",
    element: <BusinessSignupPage />,
  },
  {
    path: "/business/forgot-password",
    element: <BusinessForgotPasswordPage />,
  },
  {
    path: "/business/kakao/complete",
    element: <BusinessKakaoCompletePage />,
  },
  {
    path: "/business",
    element: <BusinessLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/business/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <BusinessDashboardPage />,
      },
      {
        path: "bookings",
        element: <BusinessBookingListPage />,
      },
      {
        path: "bookings/:id",
        element: <BusinessBookingDetailPage />,
      },
      {
        path: "rooms",
        element: <BusinessRoomListPage />,
      },
      {
        path: "rooms/create",
        element: <BusinessRoomCreatePage />,
      },
      {
        path: "rooms/:id/edit",
        element: <BusinessRoomEditPage />,
      },
      {
        path: "statistics",
        element: <BusinessStatisticsPage />,
      },
      {
        path: "reviews",
        element: <BusinessReviewListPage />,
      },
      {
        path: "reviews/:id",
        element: <BusinessReviewDetailPage />,
      },
      {
        path: "settings",
        element: <BusinessSettingsPage />,
      },
      {
        path: "profile",
        element: <BusinessMyProfilePage />,
      },
    ],
  },
];

export default businessRoutes;

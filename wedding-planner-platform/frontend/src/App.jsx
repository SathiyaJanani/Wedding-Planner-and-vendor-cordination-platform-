import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Common / Shared Pages
import SettingsPage from './pages/common/SettingsPage';
import MessagesPage from './pages/common/MessagesPage';
import NotificationsPage from './pages/common/NotificationsPage';
import ReportsPage from './pages/common/ReportsPage';

// Planner Pages
import PlannerDashboard from './pages/planner/PlannerDashboard';
import MyCustomers from './pages/planner/MyCustomers';
import CustomerRequests from './pages/planner/CustomerRequests';
import WeddingProjects from './pages/planner/WeddingProjects';
import VendorDirectory from './pages/planner/VendorDirectory';
import VendorRequests from './pages/planner/VendorRequests';
import RequestTracking from './pages/planner/RequestTracking';
import SelectedVendors from './pages/planner/SelectedVendors';
import ServiceManagement from './pages/planner/ServiceManagement';
import WeddingSchedule from './pages/planner/WeddingSchedule';
import BudgetManagement from './pages/planner/BudgetManagement';
import PlannerPayments from './pages/planner/PlannerPayments';
import PlannerInvoices from './pages/planner/PlannerInvoices';
import ContractsDocuments from './pages/planner/ContractsDocuments';
import PlannerSupport from './pages/planner/PlannerSupport';

// Vendor Pages
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorProfile from './pages/vendor/VendorProfile';
import VendorServices from './pages/vendor/VendorServices';
import VendorCategories from './pages/vendor/VendorCategories';
import VendorAvailabilityCalendar from './pages/vendor/VendorAvailabilityCalendar';
import VendorBookingRequests from './pages/vendor/VendorBookingRequests';
import VendorPendingRequests from './pages/vendor/VendorPendingRequests';
import VendorAcceptedBookings from './pages/vendor/VendorAcceptedBookings';
import VendorDeclinedRequests from './pages/vendor/VendorDeclinedRequests';
import VendorSchedule from './pages/vendor/VendorSchedule';
import VendorCustomers from './pages/vendor/VendorCustomers';
import VendorPayments from './pages/vendor/VendorPayments';
import VendorInvoices from './pages/vendor/VendorInvoices';
import VendorReviews from './pages/vendor/VendorReviews';
import VendorDocuments from './pages/vendor/VendorDocuments';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerProfile from './pages/customer/CustomerProfile';
import CustomerWedding from './pages/customer/CustomerWedding';
import CustomerRequirements from './pages/customer/CustomerRequirements';
import MyPlanner from './pages/customer/MyPlanner';
import CustomerVendorSelection from './pages/customer/CustomerVendorSelection';
import CustomerBookingStatus from './pages/customer/CustomerBookingStatus';
import CustomerSchedule from './pages/customer/CustomerSchedule';
import CustomerBudgetTracker from './pages/customer/CustomerBudgetTracker';
import CustomerPayments from './pages/customer/CustomerPayments';
import CustomerInvoices from './pages/customer/CustomerInvoices';
import CustomerWishlist from './pages/customer/CustomerWishlist';
import CustomerReviews from './pages/customer/CustomerReviews';
import CustomerSupport from './pages/customer/CustomerSupport';

export default function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* PLANNER PORTAL ROUTES */}
      <Route path="/planner" element={<DashboardLayout allowedRoles={['PLANNER']} />}>
        <Route index element={<Navigate to="/planner/dashboard" replace />} />
        <Route path="dashboard" element={<PlannerDashboard />} />
        <Route path="customers" element={<MyCustomers />} />
        <Route path="customer-requests" element={<CustomerRequests />} />
        <Route path="projects" element={<WeddingProjects />} />
        <Route path="vendors" element={<VendorDirectory />} />
        <Route path="vendor-availability" element={<Navigate to="/planner/vendors" replace />} />
        <Route path="vendor-requests" element={<VendorRequests />} />
        <Route path="request-tracking" element={<RequestTracking />} />
        <Route path="selected-vendors" element={<SelectedVendors />} />
        <Route path="services" element={<ServiceManagement />} />
        <Route path="schedule" element={<WeddingSchedule />} />
        <Route path="budget" element={<BudgetManagement />} />
        <Route path="payments" element={<PlannerPayments />} />
        <Route path="invoices" element={<PlannerInvoices />} />
        <Route path="documents" element={<ContractsDocuments />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="support" element={<PlannerSupport />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* VENDOR PORTAL ROUTES */}
      <Route path="/vendor" element={<DashboardLayout allowedRoles={['VENDOR']} />}>
        <Route index element={<Navigate to="/vendor/dashboard" replace />} />
        <Route path="dashboard" element={<VendorDashboard />} />
        <Route path="profile" element={<VendorProfile />} />
        <Route path="services" element={<VendorServices />} />
        <Route path="categories" element={<VendorCategories />} />
        <Route path="availability" element={<VendorAvailabilityCalendar />} />
        <Route path="booking-requests" element={<VendorBookingRequests />} />
        <Route path="pending-requests" element={<Navigate to="/vendor/booking-requests?status=PENDING" replace />} />
        <Route path="accepted-bookings" element={<Navigate to="/vendor/booking-requests?status=ACCEPTED" replace />} />
        <Route path="declined-requests" element={<Navigate to="/vendor/booking-requests?status=DECLINED" replace />} />
        <Route path="schedule" element={<VendorSchedule />} />
        <Route path="customers" element={<VendorCustomers />} />
        <Route path="payments" element={<VendorPayments />} />
        <Route path="invoices" element={<VendorInvoices />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="documents" element={<VendorDocuments />} />
        <Route path="reviews" element={<VendorReviews />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* CUSTOMER PORTAL ROUTES */}
      <Route path="/customer" element={<DashboardLayout allowedRoles={['CUSTOMER']} />}>
        <Route index element={<Navigate to="/customer/dashboard" replace />} />
        <Route path="dashboard" element={<CustomerDashboard />} />
        <Route path="profile" element={<CustomerProfile />} />
        <Route path="wedding" element={<CustomerWedding />} />
        <Route path="requirements" element={<CustomerRequirements />} />
        <Route path="planner" element={<MyPlanner />} />
        <Route path="vendor-selection" element={<CustomerVendorSelection />} />
        <Route path="booking-status" element={<CustomerBookingStatus />} />
        <Route path="schedule" element={<CustomerSchedule />} />
        <Route path="budget" element={<CustomerBudgetTracker />} />
        <Route path="payments" element={<CustomerPayments />} />
        <Route path="invoices" element={<CustomerInvoices />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="documents" element={<ContractsDocuments />} />
        <Route path="wishlist" element={<CustomerWishlist />} />
        <Route path="reviews" element={<CustomerReviews />} />
        <Route path="support" element={<CustomerSupport />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

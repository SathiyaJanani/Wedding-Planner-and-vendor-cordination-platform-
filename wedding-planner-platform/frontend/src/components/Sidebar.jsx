import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  LayoutDashboard, Users, FileText, CalendarCheck, Store, Calendar, Send,
  ListOrdered, CheckSquare, Layers, Clock, DollarSign, CreditCard, Receipt,
  FolderOpen, MessageSquare, Bell, BarChart3, Settings, LogOut, User, Heart,
  Tag, AlertCircle, HelpCircle, Star, Sparkles, HeartHandshake, X
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user, role, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Navigations by Role
  const plannerNav = [
    { to: '/planner/dashboard', label: t('nav_dashboard'), icon: LayoutDashboard },
    { to: '/planner/customers', label: t('nav_my_customers'), icon: Users },
    { to: '/planner/customer-requests', label: t('nav_customer_requests'), icon: FileText },
    { to: '/planner/projects', label: t('nav_wedding_projects'), icon: HeartHandshake },
    { to: '/planner/vendors', label: t('nav_vendor_category'), icon: Store },
    { to: '/planner/vendor-requests', label: t('nav_vendor_requests'), icon: Send },
    { to: '/planner/request-tracking', label: t('nav_request_tracking'), icon: ListOrdered },
    { to: '/planner/selected-vendors', label: t('nav_selected_vendors'), icon: CheckSquare },
    { to: '/planner/services', label: t('nav_service_management'), icon: Layers },
    { to: '/planner/schedule', label: t('nav_wedding_schedule'), icon: Clock },
    { to: '/planner/budget', label: t('nav_budget_management'), icon: DollarSign },
    { to: '/planner/payments', label: t('nav_payments'), icon: CreditCard },
    { to: '/planner/invoices', label: t('nav_invoices'), icon: Receipt },
    { to: '/planner/documents', label: t('nav_contracts_documents'), icon: FolderOpen },
    { to: '/planner/messages', label: t('nav_messages'), icon: MessageSquare },
    { to: '/planner/support', label: t('nav_support') || 'Support Desk', icon: HelpCircle },
    { to: '/planner/notifications', label: t('nav_notifications'), icon: Bell },
    { to: '/planner/reports', label: t('nav_reports'), icon: BarChart3 },
    { to: '/planner/settings', label: t('nav_settings'), icon: Settings }
  ];

  const vendorNav = [
    { to: '/vendor/dashboard', label: t('nav_dashboard'), icon: LayoutDashboard },
    { to: '/vendor/profile', label: t('nav_my_profile'), icon: User },
    { to: '/vendor/services', label: t('nav_my_services'), icon: Layers },
    { to: '/vendor/categories', label: t('nav_service_categories'), icon: Tag },
    { to: '/vendor/availability', label: t('nav_availability_calendar'), icon: Calendar },
    { to: '/vendor/booking-requests', label: t('nav_booking_requests'), icon: Send },
    { to: '/vendor/schedule', label: t('nav_my_schedule'), icon: Clock },
    { to: '/vendor/customers', label: t('nav_vendor_customers'), icon: Users },
    { to: '/vendor/payments', label: t('nav_payments'), icon: CreditCard },
    { to: '/vendor/invoices', label: t('nav_invoices'), icon: Receipt },
    { to: '/vendor/messages', label: t('nav_messages'), icon: MessageSquare },
    { to: '/vendor/notifications', label: t('nav_notifications'), icon: Bell },
    { to: '/vendor/reviews', label: t('nav_reviews_ratings'), icon: Star },
    { to: '/vendor/reports', label: t('nav_reports'), icon: BarChart3 },
    { to: '/vendor/settings', label: t('nav_settings'), icon: Settings }
  ];

  const customerNav = [
    { to: '/customer/dashboard', label: t('nav_dashboard'), icon: LayoutDashboard },
    { to: '/customer/wedding', label: t('nav_my_wedding'), icon: Sparkles },
    { to: '/customer/requirements', label: t('nav_wedding_requirements'), icon: FileText },
    { to: '/customer/planner', label: t('nav_my_planner'), icon: HeartHandshake },
    { to: '/customer/vendor-selection', label: t('nav_vendor_selection'), icon: CheckSquare },
    { to: '/customer/wishlist', label: t('nav_wishlist'), icon: Heart },
    { to: '/customer/booking-status', label: t('nav_booking_status'), icon: ListOrdered },
    { to: '/customer/schedule', label: t('nav_wedding_schedule'), icon: Clock },
    { to: '/customer/budget', label: t('nav_budget_tracker'), icon: DollarSign },
    { to: '/customer/invoices', label: t('nav_invoices'), icon: Receipt },
    { to: '/customer/payments', label: t('nav_payments'), icon: CreditCard },
    { to: '/customer/documents', label: t('nav_contracts_documents'), icon: FolderOpen },
    { to: '/customer/messages', label: t('nav_messages'), icon: MessageSquare },
    { to: '/customer/notifications', label: t('nav_notifications'), icon: Bell },
    { to: '/customer/reviews', label: t('nav_reviews_ratings'), icon: Star },
    { to: '/customer/support', label: t('nav_support'), icon: HelpCircle },
    { to: '/customer/profile', label: t('nav_my_profile'), icon: User },
    { to: '/customer/settings', label: t('nav_settings'), icon: Settings }
  ];

  let navItems = customerNav;
  if (role === 'PLANNER') navItems = plannerNav;
  else if (role === 'VENDOR') navItems = vendorNav;

  const currentIdText = role === 'CUSTOMER' && user?.customer_id
    ? `CUST-${String(user.customer_id).padStart(4, '0')}`
    : role === 'VENDOR' && user?.vendor_id
      ? `VND-${String(user.vendor_id).padStart(4, '0')}`
      : null;

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: 'var(--primary)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={22} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ fontWeight: 800, fontSize: '0.98rem', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
                VOWS & VEILS
              </div>
              {currentIdText && (
                <span className={`id-badge ${role === 'CUSTOMER' ? 'id-badge-cust' : 'id-badge-vnd'}`} style={{ fontSize: '0.68rem', padding: '1px 5px' }}>
                  {currentIdText}
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 600, textTransform: 'uppercase' }}>
              {role === 'PLANNER' ? 'PLANNER PORTAL' : role === 'VENDOR' ? 'VENDOR PARTNER' : 'WEDDING SUITE'}
            </div>
          </div>
          {isOpen && (
            <button
              onClick={onClose}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', padding: '0.3rem' }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={idx}
                to={item.to}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={() => {
                  if (isOpen && onClose) onClose();
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div style={{ padding: '1rem 0.75rem', borderTop: '1px solid var(--sidebar-border)' }}>
          <button
            onClick={handleLogout}
            className="btn btn-secondary btn-block"
            style={{ display: 'flex', gap: '0.6rem', color: 'var(--status-danger)' }}
          >
            <LogOut size={18} />
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>

      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 45
          }}
        />
      )}
    </>
  );
}

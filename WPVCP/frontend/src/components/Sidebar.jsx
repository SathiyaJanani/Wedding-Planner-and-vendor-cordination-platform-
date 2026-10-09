import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useRecentlyAccessed } from '../context/RecentlyAccessedContext';
import {
  LayoutDashboard, Users, FileText, Store, Calendar, Send,
  ListOrdered, CheckSquare, Layers, Clock, DollarSign, CreditCard, Receipt,
  FolderOpen, MessageSquare, Bell, BarChart3, Settings, LogOut, User, Heart,
  Tag, HelpCircle, Star, Sparkles, HeartHandshake, ShieldCheck, X, Trash2
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user, role, logout } = useAuth();
  const { t } = useLanguage();
  const { items: recentItems, clearRecent } = useRecentlyAccessed();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Navigations matching Image 1 exactly:
  // 19 navigation items for Planner and Admin portals
  const plannerNav = [
    { to: '/planner/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/planner/customers', label: 'My Customers', icon: Users },
    { to: '/planner/customer-requests', label: 'Customer Requests', icon: FileText },
    { to: '/planner/projects', label: 'Wedding Projects', icon: HeartHandshake },
    { to: '/planner/vendors', label: 'Vendor Category', icon: Store },
    { to: '/planner/vendor-requests', label: 'Vendor Requests', icon: Send },
    { to: '/planner/request-tracking', label: 'Request Tracking', icon: ListOrdered },
    { to: '/planner/selected-vendors', label: 'Selected Vendors', icon: CheckSquare },
    { to: '/planner/services', label: 'Service Management', icon: Layers },
    { to: '/planner/schedule', label: 'Wedding Schedule', icon: Clock },
    { to: '/planner/budget', label: 'Budget Management', icon: DollarSign },
    { to: '/planner/payments', label: 'Payments & Milestones', icon: CreditCard },
    { to: '/planner/invoices', label: 'Invoices', icon: Receipt },
    { to: '/planner/documents', label: 'Contracts & Documents', icon: FolderOpen },
    { to: '/planner/messages', label: 'Messages', icon: MessageSquare },
    { to: '/planner/support', label: 'Support Desk', icon: HelpCircle },
    { to: '/planner/notifications', label: 'Notifications', icon: Bell },
    { to: '/planner/reports', label: 'Reports & Analytics', icon: BarChart3 },
    { to: '/planner/settings', label: 'Settings', icon: Settings }
  ];

  const adminNav = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: ShieldCheck },
    { to: '/planner/customers', label: 'My Customers', icon: Users },
    { to: '/planner/customer-requests', label: 'Customer Requests', icon: FileText },
    { to: '/planner/projects', label: 'Wedding Projects', icon: HeartHandshake },
    { to: '/planner/vendors', label: 'Vendor Category', icon: Store },
    { to: '/planner/vendor-requests', label: 'Vendor Requests', icon: Send },
    { to: '/planner/request-tracking', label: 'Request Tracking', icon: ListOrdered },
    { to: '/planner/selected-vendors', label: 'Selected Vendors', icon: CheckSquare },
    { to: '/planner/services', label: 'Service Management', icon: Layers },
    { to: '/planner/schedule', label: 'Wedding Schedule', icon: Clock },
    { to: '/planner/budget', label: 'Budget Management', icon: DollarSign },
    { to: '/planner/payments', label: 'Payments & Milestones', icon: CreditCard },
    { to: '/planner/invoices', label: 'Invoices', icon: Receipt },
    { to: '/planner/documents', label: 'Contracts & Documents', icon: FolderOpen },
    { to: '/planner/messages', label: 'Messages', icon: MessageSquare },
    { to: '/planner/support', label: 'Support Desk', icon: HelpCircle },
    { to: '/planner/notifications', label: 'Notifications', icon: Bell },
    { to: '/planner/reports', label: 'Reports & Analytics', icon: BarChart3 },
    { to: '/planner/settings', label: 'Settings', icon: Settings }
  ];

  const vendorNav = [
    { to: '/vendor/dashboard', label: t('nav_dashboard') || 'Dashboard', icon: LayoutDashboard },
    { to: '/vendor/profile', label: t('nav_my_profile') || 'My Profile', icon: User },
    { to: '/vendor/services', label: t('nav_my_services') || 'My Services', icon: Layers },
    { to: '/vendor/categories', label: '15 Vendor Categories', icon: Tag },
    { to: '/vendor/availability', label: t('nav_availability_calendar') || 'Availability Calendar', icon: Calendar },
    { to: '/vendor/booking-requests', label: t('nav_booking_requests') || 'Booking Requests', icon: Send },
    { to: '/vendor/schedule', label: t('nav_my_schedule') || 'My Schedule', icon: Clock },
    { to: '/vendor/customers', label: t('nav_vendor_customers') || 'Customers', icon: Users },
    { to: '/vendor/payments', label: t('nav_payments') || 'Payments & Earnings', icon: CreditCard },
    { to: '/vendor/invoices', label: t('nav_invoices') || 'Invoices', icon: Receipt },
    { to: '/vendor/messages', label: t('nav_messages') || 'Messages', icon: MessageSquare },
    { to: '/vendor/notifications', label: t('nav_notifications') || 'Notifications', icon: Bell },
    { to: '/vendor/reviews', label: t('nav_reviews_ratings') || 'Reviews & Ratings', icon: Star },
    { to: '/vendor/reports', label: t('nav_reports') || 'Reports', icon: BarChart3 },
    { to: '/vendor/settings', label: t('nav_settings') || 'Settings', icon: Settings }
  ];

  const customerNav = [
    { to: '/customer/dashboard', label: t('nav_dashboard') || 'Dashboard', icon: LayoutDashboard },
    { to: '/customer/wedding', label: t('nav_my_wedding') || 'My Wedding', icon: Sparkles },
    { to: '/customer/requirements', label: t('nav_wedding_requirements') || 'Wedding Requirements', icon: FileText },
    { to: '/customer/planner', label: t('nav_my_planner') || 'My Planner', icon: HeartHandshake },
    { to: '/customer/vendor-selection', label: 'Vendor Categories', icon: Store },
    { to: '/customer/wishlist', label: t('nav_wishlist') || 'Wishlist', icon: Heart },
    { to: '/customer/booking-status', label: t('nav_booking_status') || 'Booking Status', icon: ListOrdered },
    { to: '/customer/schedule', label: t('nav_wedding_schedule') || 'Wedding Schedule', icon: Clock },
    { to: '/customer/budget', label: t('nav_budget_tracker') || 'Budget Tracker', icon: DollarSign },
    { to: '/customer/invoices', label: t('nav_invoices') || 'Invoices', icon: Receipt },
    { to: '/customer/payments', label: t('nav_payments') || 'Payments', icon: CreditCard },
    { to: '/customer/documents', label: t('nav_contracts_documents') || 'Contracts & Documents', icon: FolderOpen },
    { to: '/customer/messages', label: t('nav_messages') || 'Messages', icon: MessageSquare },
    { to: '/customer/notifications', label: t('nav_notifications') || 'Notifications', icon: Bell },
    { to: '/customer/reviews', label: t('nav_reviews_ratings') || 'Reviews & Ratings', icon: Star },
    { to: '/customer/support', label: t('nav_support') || 'Support Desk', icon: HelpCircle },
    { to: '/customer/profile', label: t('nav_my_profile') || 'My Profile', icon: User },
    { to: '/customer/settings', label: t('nav_settings') || 'Settings', icon: Settings }
  ];

  let navItems = customerNav;
  if (role === 'ADMIN') navItems = adminNav;
  else if (role === 'PLANNER') navItems = plannerNav;
  else if (role === 'VENDOR') navItems = vendorNav;

  const currentIdText = role === 'CUSTOMER' && user?.customer_id
    ? `CUST-${String(user.customer_id).padStart(4, '0')}`
    : role === 'VENDOR' && user?.vendor_id
      ? `VND-${String(user.vendor_id).padStart(4, '0')}`
      : null;

  const portalSubtitle = role === 'ADMIN' 
    ? 'PLANNER PORTAL' 
    : role === 'PLANNER' 
      ? 'PLANNER PORTAL' 
      : role === 'VENDOR' 
        ? 'VENDOR PARTNER' 
        : 'WEDDING SUITE';

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`} style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Brand Header */}
        <div className="sidebar-header">
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: 'var(--primary, #e11d48)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
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
            <div style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {portalSubtitle}
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

        {/* Scrollable Navigation List */}
        <nav className="sidebar-nav" style={{ flex: 1, overflowY: 'auto' }}>
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

          {/* RECENTLY ACCESSED SIDEBAR SECTION (For Admin, Vendor, Customer) */}
          {recentItems && recentItems.length > 0 && (
            <div style={{
              margin: '1.25rem 0.5rem 0.75rem',
              paddingTop: '0.85rem',
              borderTop: '1px solid var(--sidebar-border, #e2e8f0)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 0.5rem 0.4rem',
                fontSize: '0.68rem',
                fontWeight: 700,
                color: 'var(--text-muted, #94a3b8)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Clock size={13} style={{ color: 'var(--primary)' }} />
                  <span>Recently Accessed</span>
                </div>
                <button
                  type="button"
                  onClick={clearRecent}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '0.65rem',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '2px 4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px'
                  }}
                  title="Clear history"
                >
                  <Trash2 size={11} />
                  <span>Clear</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                {recentItems.slice(0, 5).map((item, idx) => (
                  <NavLink
                    key={item.id || idx}
                    to={item.path}
                    className="nav-link"
                    style={{
                      padding: '0.4rem 0.65rem',
                      fontSize: '0.78rem',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: 'var(--text-muted)',
                      textDecoration: 'none'
                    }}
                    title={item.title}
                    onClick={() => {
                      if (isOpen && onClose) onClose();
                    }}
                  >
                    <span style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: 'var(--primary)',
                      flexShrink: 0
                    }} />
                    <span style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flex: 1
                    }}>
                      {item.title}
                    </span>
                  </NavLink>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* Sign Out Button matching Image 1 */}
        <div style={{ padding: '0.85rem 0.75rem', borderTop: '1px solid var(--sidebar-border)' }}>
          <button
            onClick={handleLogout}
            className="btn btn-secondary btn-block"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              color: 'var(--primary, #e11d48)',
              fontWeight: 600,
              fontSize: '0.88rem'
            }}
          >
            <LogOut size={17} />
            <span>Sign Out</span>
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

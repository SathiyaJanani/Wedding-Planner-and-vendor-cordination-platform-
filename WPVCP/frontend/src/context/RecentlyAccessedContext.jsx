import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const RecentlyAccessedContext = createContext();

const DEFAULT_RECENT_BY_ROLE = {
  ADMIN: [
    { id: 'rec-adm-1', type: 'DASHBOARD', title: 'Admin Executive Suite', subtitle: 'Platform Analytics & Audit', path: '/admin/dashboard', icon: 'ShieldCheck', timestamp: Date.now() - 1000 * 60 * 2 },
    { id: 'rec-adm-2', type: 'CUSTOMERS', title: 'Customer Accounts (5 Clients)', subtitle: 'Barani, Malini, Loha, Ranjani, Siva', path: '/planner/customers', icon: 'User', timestamp: Date.now() - 1000 * 60 * 15 },
    { id: 'rec-adm-3', type: 'VENDORS', title: '15 Vendor Categories (45 Partners)', subtitle: 'Catering, Decors, Venues, Photographers', path: '/planner/vendors', icon: 'Store', timestamp: Date.now() - 1000 * 60 * 30 },
    { id: 'rec-adm-4', type: 'PROJECTS', title: 'Active Wedding Nuptials', subtitle: 'Barani & Anita Royal Nuptials', path: '/planner/projects', icon: 'FolderHeart', timestamp: Date.now() - 1000 * 60 * 60 }
  ],
  PLANNER: [
    { id: 'rec-pln-1', type: 'PROJECT', title: 'Barani & Anita Royal Nuptials', subtitle: 'The Grand Royal Palace • 450 Guests', path: '/planner/projects', icon: 'FolderHeart', timestamp: Date.now() - 1000 * 60 * 5 },
    { id: 'rec-pln-2', type: 'VENDOR', title: 'The Grand Royal Palace & Convention', subtitle: 'Heritage Wedding Venue with Google Maps', path: '/planner/vendors', icon: 'Store', timestamp: Date.now() - 1000 * 60 * 20 },
    { id: 'rec-pln-3', type: 'BUDGET', title: 'Barani & Anita Budget Sheet', subtitle: 'Budget: ₹15,00,000 (Allocated)', path: '/planner/budget', icon: 'Wallet', timestamp: Date.now() - 1000 * 60 * 45 },
    { id: 'rec-pln-4', type: 'SCHEDULE', title: 'Muhurtham & Sangeet Itinerary', subtitle: '2-Day Scheduled Timeline', path: '/planner/schedule', icon: 'Calendar', timestamp: Date.now() - 1000 * 60 * 90 }
  ],
  VENDOR: [
    { id: 'rec-vnd-1', type: 'BOOKING', title: 'Royal Heritage Wedding Coverage', subtitle: 'Client: Barani • Confirmed', path: '/vendor/booking-requests', icon: 'CalendarCheck', timestamp: Date.now() - 1000 * 60 * 10 },
    { id: 'rec-vnd-2', type: 'CATEGORIES', title: '15 Service Category Headings', subtitle: 'Verified Vendor Directory', path: '/vendor/categories', icon: 'Tag', timestamp: Date.now() - 1000 * 60 * 25 },
    { id: 'rec-vnd-3', type: 'PAYMENT', title: 'Advance Retainer Received', subtitle: '₹35,000 • Bank Escrow Verified', path: '/vendor/payments', icon: 'CreditCard', timestamp: Date.now() - 1000 * 60 * 50 },
    { id: 'rec-vnd-4', type: 'SERVICES', title: 'My Catalog Services & Rates', subtitle: 'Available for Bookings', path: '/vendor/services', icon: 'Layers', timestamp: Date.now() - 1000 * 60 * 100 }
  ],
  CUSTOMER: [
    { id: 'rec-cst-1', type: 'BOOKING', title: 'Wedding Booking Status', subtitle: 'Status: PARTIALLY_PAID • 4 Vendors', path: '/customer/booking-status', icon: 'CheckCircle', timestamp: Date.now() - 1000 * 60 * 8 },
    { id: 'rec-cst-2', type: 'VENDORS', title: 'Browse 15 Vendor Categories', subtitle: '45 Verified Wedding Specialists', path: '/customer/vendor-selection', icon: 'Store', timestamp: Date.now() - 1000 * 60 * 20 },
    { id: 'rec-cst-3', type: 'PAYMENTS', title: 'Advance Milestone Payment', subtitle: 'Receipt #RCPT-2026-001 • Paid', path: '/customer/payments', icon: 'Receipt', timestamp: Date.now() - 1000 * 60 * 45 },
    { id: 'rec-cst-4', type: 'BUDGET', title: 'Live Wedding Budget Tracker', subtitle: '₹8,45,000 Contracted of ₹15,00,000', path: '/customer/budget', icon: 'PieChart', timestamp: Date.now() - 1000 * 60 * 80 }
  ]
};

export function RecentlyAccessedProvider({ children }) {
  const { user, role } = useAuth();
  const [items, setItems] = useState([]);

  // Stored strictly per user (by user id or email)
  const userIdentifier = user?.id ? `uid_${user.id}` : user?.email ? `email_${user.email}` : role || 'guest';
  const storageKey = `wpvcp_recent_${userIdentifier}`;

  // Load from localStorage or initialize with role defaults
  useEffect(() => {
    if (!role) return;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed);
          return;
        }
      }
    } catch (e) {
      console.warn('Could not read recently accessed from storage');
    }

    // Default seed for user role
    const defaults = DEFAULT_RECENT_BY_ROLE[role] || DEFAULT_RECENT_BY_ROLE.CUSTOMER;
    setItems(defaults);
    try {
      localStorage.setItem(storageKey, JSON.stringify(defaults));
    } catch (e) {}
  }, [user?.id, user?.email, role, storageKey]);

  // Track an entity: Latest items first, avoids duplicate entries, persists in localStorage
  const trackRecent = useCallback(({ id, type, title, subtitle, path, icon }) => {
    if (!title) return;
    setItems(prev => {
      // Remove any duplicate entry by path, id, or exact title
      const filtered = prev.filter(item => 
        item.path !== path && 
        item.id !== id && 
        item.title?.toLowerCase() !== title?.toLowerCase()
      );

      const newItem = {
        id: id || `rec-${Date.now()}`,
        type: type || 'ACCESSED',
        title: title.trim(),
        subtitle: subtitle ? subtitle.trim() : '',
        path,
        icon: icon || 'FileText',
        timestamp: Date.now()
      };

      const updated = [newItem, ...filtered].slice(0, 8);
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  }, [storageKey]);

  const clearRecent = useCallback(() => {
    setItems([]);
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {}
  }, [storageKey]);

  return (
    <RecentlyAccessedContext.Provider value={{ items, trackRecent, clearRecent }}>
      {children}
    </RecentlyAccessedContext.Provider>
  );
}

export function useRecentlyAccessed() {
  const context = useContext(RecentlyAccessedContext);
  if (!context) {
    throw new Error('useRecentlyAccessed must be used within a RecentlyAccessedProvider');
  }
  return context;
}

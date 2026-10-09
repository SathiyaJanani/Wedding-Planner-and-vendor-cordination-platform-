import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart, Shield, Award, HelpCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--bg-surface)',
      borderTop: '1px solid var(--border)',
      padding: '4rem 2rem 2rem',
      marginTop: 'auto'
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '3rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={18} />
            </div>
            <span style={{ fontFamily: 'var(--font-cinzel)', fontWeight: 800, fontSize: '1.15rem' }}>VOWS & VEILS</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
            The enterprise-grade wedding planning & vendor coordination platform connecting couples, elite planners, and verified artisan vendors under one harmonious workflow.
          </p>
          <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)' }}>
            <Shield size={18} title="Secure & Verified" />
            <Award size={18} title="ISO Standard Coordination" />
            <Heart size={18} title="Crafted with Devotion" />
          </div>
        </div>

        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Platform Roles</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            <li><Link to="/login" style={{ color: 'inherit' }}>Planner & Director Portal</Link></li>
            <li><Link to="/login" style={{ color: 'inherit' }}>Artisan Vendor Portal</Link></li>
            <li><Link to="/login" style={{ color: 'inherit' }}>Couples Wedding Suite</Link></li>
            <li><Link to="/register" style={{ color: 'inherit' }}>Join as Vendor Partner</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Core Services</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            <li>Wedding Halls & Heritage Venues</li>
            <li>Candid & Cinematic Photography</li>
            <li>Luxury Floral & Mandap Decor</li>
            <li>Multi-Cuisine Gourmet Catering</li>
            <li>Bridal Makeover & Styling</li>
            <li>DJ, Sound & Sangeet Lighting</li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Support & Trust</h4>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '0.8rem' }}>
            Available 24/7 for active wedding coordination and emergency logistics assistance.
          </p>
          <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
            concierge@weddingplanner.com
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
            +91 (80) 4122-9000
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: 1280,
        margin: '3rem auto 0',
        paddingTop: '1.5rem',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        fontSize: '0.82rem',
        color: 'var(--text-muted)'
      }}>
        <div>&copy; {new Date().getFullYear()} Wedding Planner and Vendor Coordination Platform (WPVCP). All rights reserved.</div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <span>Privacy Policy</span>
          <span>Terms of Coordination</span>
          <span>Security Protocol</span>
        </div>
      </div>
    </footer>
  );
}

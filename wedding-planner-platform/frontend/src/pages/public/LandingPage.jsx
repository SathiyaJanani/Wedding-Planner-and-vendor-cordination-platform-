import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import {
  Sparkles, CheckCircle, ArrowRight, Shield, Calendar, Users, HeartHandshake,
  DollarSign, Star, Clock, ChevronDown, ChevronUp, Layers, Camera, Palette,
  Building2, Utensils, Heart, Disc, Music, Crown, Shirt, Mail, Flower2, Car, Cake, PartyPopper
} from 'lucide-react';

export default function LandingPage() {
  const [categories, setCategories] = useState([]);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/vendors/categories');
      if (res.data.success) {
        setCategories(res.data.data);
      }
    } catch (e) {
      // quiet fallback
    }
  };

  const getCategoryIcon = (name) => {
    switch (name) {
      case 'Wedding Hall': return Building2;
      case 'Catering': return Utensils;
      case 'Decoration': return Palette;
      case 'Photography': return Camera;
      case 'Makeup': return Heart;
      case 'DJ': return Disc;
      case 'Music': return Music;
      case 'Bridal Wear': return Crown;
      case 'Transportation': return Car;
      default: return Sparkles;
    }
  };

  const faqs = [
    {
      q: 'Can customers directly send booking requests to vendors?',
      a: 'No. To maintain top-tier coordination, prevent double-bookings, and negotiate verified rates, all customer requirements flow through the Planner, who curates vendors, checks calendar availability, and presents the arrangement for your approval.'
    },
    {
      q: 'What happens if an assigned vendor declines a request?',
      a: 'If a vendor declines, they are required by system rules to state a reason. The Planner receives an immediate notification, searches for a verified alternative vendor, checks their availability, and updates the customer arrangement proposal.'
    },
    {
      q: 'How does the milestone payment system work?',
      a: 'Payments are structured in milestones: Advance (Retainer), Second Payment (Vendor lock-in), and Final Settlement. Our integrated payment module issues instant receipts, generates invoices, and notifies all parties.'
    },
    {
      q: 'How does the platform prevent vendor double-booking?',
      a: 'The system enforces database-level calendar locking. When a vendor accepts a request or when a booking is confirmed, that date is locked to prevent any overlapping requests.'
    }
  ];

  return (
    <div className="app-container">
      <Navbar />

      {/* Hero Section */}
      <section style={{
        padding: '6rem 2rem 5rem',
        textAlign: 'center',
        background: 'linear-gradient(180deg, var(--bg-main) 0%, var(--bg-surface) 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            borderRadius: '9999px',
            background: 'var(--primary-glow)',
            color: 'var(--primary)',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '1.5rem',
            border: '1px solid rgba(225, 29, 72, 0.2)'
          }}>
            <Sparkles size={16} />
            <span>The Premier Wedding Coordination Platform</span>
          </div>

          <h1 className="heading-cinzel" style={{
            fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: '1.5rem',
            color: 'var(--text-main)'
          }}>
            Where Royal Weddings Meet <span style={{ color: 'var(--primary)' }}>Seamless Execution</span>
          </h1>

          <p style={{
            fontSize: '1.18rem',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
            marginBottom: '2.5rem',
            maxWidth: '720px',
            margin: '0 auto 2.5rem'
          }}>
            Coordinate your dream celebration with dedicated wedding planners, verified artisan vendors, milestone budgets, and live timeline tracking — all within one synchronized ecosystem.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg" style={{ boxShadow: '0 8px 24px rgba(225, 29, 72, 0.3)' }}>
              <span>Plan Your Wedding</span>
              <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">
              <span>Sign In to Portal</span>
            </Link>
          </div>

          {/* Quick Metrics */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '2rem',
            marginTop: '4.5rem',
            padding: '2rem',
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--card-shadow)'
          }}>
            <div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary)' }}>100%</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Zero Double-Bookings</div>
            </div>
            <div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-gold)' }}>16+</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Service Categories</div>
            </div>
            <div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--status-success)' }}>₹50Cr+</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Budgets Coordinated</div>
            </div>
            <div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)' }}>4.9★</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Client Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" style={{ padding: '5rem 2rem', background: 'var(--bg-surface)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 className="heading-cinzel" style={{ fontSize: '2.2rem', marginBottom: '0.8rem' }}>
              Complete Wedding Service Categories
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '640px', margin: '0 auto' }}>
              Database-driven services arranged and quality-assured by your dedicated wedding planner.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1.5rem'
          }}>
            {(categories.length > 0 ? categories : [
              { id: 1, name: 'Wedding Hall', description: 'Heritage palaces and banquet convention halls' },
              { id: 2, name: 'Catering', description: 'Gourmet vegetarian and multi-cuisine culinary banquets' },
              { id: 3, name: 'Decoration', description: 'Floral stages, entrance gates, and lighting' },
              { id: 4, name: 'Photography', description: 'Candid, traditional portraits, and drone coverage' },
              { id: 5, name: 'Makeup', description: 'Bridal makeover and HD airbrush hair styling' },
              { id: 6, name: 'DJ & Sound', description: 'LED dance floors and top Bollywood-EDM sets' },
              { id: 7, name: 'Mehendi', description: 'Intricate bridal henna and Rajasthani artistry' },
              { id: 8, name: 'Transportation', description: 'Vintage convertibles and luxury guest coaches' }
            ]).map((cat) => {
              const Icon = getCategoryIcon(cat.name);
              return (
                <div key={cat.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: 'var(--primary-glow)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Icon size={24} />
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{cat.name}</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {cat.description || 'Verified top-tier professionals curated for your special day.'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Core Business Workflow Explanation */}
      <section id="how-it-works" style={{ padding: '5rem 2rem', background: 'var(--bg-main)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              The Coordination Architecture
            </span>
            <h2 className="heading-cinzel" style={{ fontSize: '2.2rem', marginTop: '0.4rem', marginBottom: '0.8rem' }}>
              How the Platform Works
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '680px', margin: '0 auto' }}>
              A centralized, error-free workflow ensuring couples get dream arrangements without vendor negotiation friction.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '2rem',
            position: 'relative'
          }}>
            <div className="card">
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>STEP 01</div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.6rem' }}>Customer Submits Requirements</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Couples submit their wedding date, venue preferences, guest count, estimated budget, and required services.
              </p>
            </div>

            <div className="card">
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-gold)', marginBottom: '0.5rem' }}>STEP 02</div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.6rem' }}>Planner Checks Availability</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Planner searches verified vendors, verifies date/time slot availability, and sends official booking requests.
              </p>
            </div>

            <div className="card">
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--status-info)', marginBottom: '0.5rem' }}>STEP 03</div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.6rem' }}>Vendor Accepts or Declines</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Vendors review terms and accept or decline with a reason. If declined, the planner immediately reassigns an alternative.
              </p>
            </div>

            <div className="card">
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--status-success)', marginBottom: '0.5rem' }}>STEP 04</div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.6rem' }}>Customer Approves & Pays</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Customer reviews the curated arrangement, approves the proposal, and completes milestone advance payment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Role Benefits */}
      <section id="features" style={{ padding: '5rem 2rem', background: 'var(--bg-surface)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 className="heading-cinzel" style={{ fontSize: '2.2rem', marginBottom: '0.8rem' }}>
              Engineered for All Three Roles
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
              Tailored workspaces for Wedding Planners, Verified Vendors, and Wedding Couples.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            <div className="card" style={{ borderTop: '4px solid var(--primary)' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-main)' }}>For Couples (Customers)</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <li style={{ display: 'flex', gap: '0.5rem' }}><CheckCircle size={18} color="var(--primary)" /> Zero stress: Planner handles all vendor search and negotiation</li>
                <li style={{ display: 'flex', gap: '0.5rem' }}><CheckCircle size={18} color="var(--primary)" /> Full approval control over all proposed vendor arrangements</li>
                <li style={{ display: 'flex', gap: '0.5rem' }}><CheckCircle size={18} color="var(--primary)" /> Transparent milestone payments with instant invoice receipts</li>
                <li style={{ display: 'flex', gap: '0.5rem' }}><CheckCircle size={18} color="var(--primary)" /> Live day-of wedding schedule and itinerary countdown</li>
              </ul>
            </div>

            <div className="card" style={{ borderTop: '4px solid var(--accent-gold)' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-main)' }}>For Wedding Planners</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <li style={{ display: 'flex', gap: '0.5rem' }}><CheckCircle size={18} color="var(--accent-gold)" /> Centralized customer requirement conversion to projects</li>
                <li style={{ display: 'flex', gap: '0.5rem' }}><CheckCircle size={18} color="var(--accent-gold)" /> Real-time vendor calendar and availability checker</li>
                <li style={{ display: 'flex', gap: '0.5rem' }}><CheckCircle size={18} color="var(--accent-gold)" /> Vendor request dispatch with automated decline alerts</li>
                <li style={{ display: 'flex', gap: '0.5rem' }}><CheckCircle size={18} color="var(--accent-gold)" /> Comprehensive budget tracking and revenue analytics</li>
              </ul>
            </div>

            <div className="card" style={{ borderTop: '4px solid var(--status-success)' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-main)' }}>For Artisan Vendors</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <li style={{ display: 'flex', gap: '0.5rem' }}><CheckCircle size={18} color="var(--status-success)" /> High-value booking requests directly from top planners</li>
                <li style={{ display: 'flex', gap: '0.5rem' }}><CheckCircle size={18} color="var(--status-success)" /> Easy Accept / Decline workflow with reason logging</li>
                <li style={{ display: 'flex', gap: '0.5rem' }}><CheckCircle size={18} color="var(--status-success)" /> Interactive calendar to manage available and blocked dates</li>
                <li style={{ display: 'flex', gap: '0.5rem' }}><CheckCircle size={18} color="var(--status-success)" /> Verified client reviews and milestone payment visibility</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" style={{ padding: '5rem 2rem', background: 'var(--bg-main)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 className="heading-cinzel" style={{ fontSize: '2.2rem', marginBottom: '0.8rem' }}>
              Celebrated Love Stories
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
              Real feedback from couples and planners who coordinated on our platform.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            <div className="card">
              <div style={{ display: 'flex', color: 'var(--accent-gold)', marginBottom: '0.75rem' }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                "Our planner arranged Vikram Rathore for photography and Bloom & Blossom for stage decor. Everything was locked in 48 hours without multiple meetings. Flawless experience!"
              </p>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Rahul & Anita Verma</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--primary)' }}>Bangalore Wedding • The Grand Royal Palace</div>
            </div>

            <div className="card">
              <div style={{ display: 'flex', color: 'var(--accent-gold)', marginBottom: '0.75rem' }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                "The availability calendar saved our destination wedding. When one caterer declined due to renovation, our planner was notified and locked an alternative immediately."
              </p>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Rohit & Sneha Kulkarni</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--primary)' }}>Pastel Garden Wedding • Tamarind Tree Lawns</div>
            </div>

            <div className="card">
              <div style={{ display: 'flex', color: 'var(--accent-gold)', marginBottom: '0.75rem' }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                "As a studio owner, receiving clean, contracted requests from verified planners has doubled our booking efficiency while keeping our schedule synchronized."
              </p>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Vikram Rathore</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--primary)' }}>Vendor Partner • Shutter & Soul Studios</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" style={{ padding: '5rem 2rem', background: 'var(--bg-surface)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 className="heading-cinzel" style={{ fontSize: '2.2rem', marginBottom: '0.8rem' }}>
              Frequently Asked Questions
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
              Learn more about how our platform orchestrates memorable wedding milestones.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {faqs.map((faq, idx) => (
              <div key={idx} className="card" style={{ padding: '1.25rem 1.5rem', cursor: 'pointer' }} onClick={() => setOpenFaq(openFaq === idx ? null : idx)}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{faq.q}</h3>
                  {openFaq === idx ? <ChevronUp size={20} color="var(--primary)" /> : <ChevronDown size={20} color="var(--text-muted)" />}
                </div>
                {openFaq === idx && (
                  <p style={{ marginTop: '0.85rem', color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section style={{
        padding: '5rem 2rem',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(225, 29, 72, 0.08) 0%, rgba(217, 119, 6, 0.08) 100%)',
        borderTop: '1px solid var(--border)'
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 className="heading-cinzel" style={{ fontSize: '2.4rem', marginBottom: '1rem' }}>
            Begin Your Wedding Journey Today
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.6 }}>
            Join hundreds of couples, lead planners, and verified vendors delivering unforgettable celebrations with absolute peace of mind.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg">
              Create Your Free Account
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">
              Sign In to Your Portal
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

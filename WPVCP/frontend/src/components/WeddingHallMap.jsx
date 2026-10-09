import React, { useEffect, useRef, useState } from 'react';
import { isWeddingHallVendor } from '../utils/weddingHallHelper';
import { MapPin, ExternalLink, Navigation, AlertCircle } from 'lucide-react';

/**
 * WeddingHallMap
 * 
 * STRICT CATEGORY RESTRICTION:
 * This component will ONLY render for Wedding Hall / Wedding Venue vendors.
 * For any other vendor category (Photography, Catering, Decoration, etc.),
 * it strictly returns null and performs zero Google Maps operations.
 */
export default function WeddingHallMap({
  vendor,
  title = 'Wedding Hall Location',
  height = '320px',
  showActions = true,
  className = ''
}) {
  // 1. Strict Category Check - Rule: IF vendor category != Wedding Hall -> Do NOT show Google Map
  if (!isWeddingHallVendor(vendor)) {
    return null;
  }

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerInstanceRef = useRef(null);

  const [mapStatus, setMapStatus] = useState('loading'); // 'loading' | 'ready' | 'no_key' | 'no_coords' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  // Extract location fields with support for various vendor object formats
  const businessName = vendor?.business_name || vendor?.name || 'Wedding Hall';
  const address = vendor?.address || vendor?.vendor_address || '';
  const city = vendor?.city || vendor?.vendor_city || '';
  const state = vendor?.state || vendor?.vendor_state || '';
  const postalCode = vendor?.postal_code || vendor?.pincode || vendor?.vendor_postal_code || '';

  const rawLat = vendor?.latitude ?? vendor?.vendor_latitude;
  const rawLng = vendor?.longitude ?? vendor?.vendor_longitude;

  const lat = rawLat !== null && rawLat !== undefined && rawLat !== '' ? parseFloat(rawLat) : NaN;
  const lng = rawLng !== null && rawLng !== undefined && rawLng !== '' ? parseFloat(rawLng) : NaN;

  const hasCoords = !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 && (lat !== 0 || lng !== 0);

  // Address string for display and fallback links
  const addressParts = [address, city, state, postalCode].filter(Boolean);
  const formattedAddress = addressParts.join(', ');
  const locationQuery = hasCoords ? `${lat},${lng}` : (formattedAddress ? `${businessName}, ${formattedAddress}` : businessName);

  // Links for External Google Maps
  const viewOnMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationQuery)}`;
  const getDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(locationQuery)}`;

  useEffect(() => {
    // Check coordinates validity
    if (!hasCoords) {
      setMapStatus('no_coords');
      return;
    }

    // Check API Key
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
                   import.meta.env.GOOGLE_MAPS_API_KEY ||
                   (typeof window !== 'undefined' ? window.GOOGLE_MAPS_API_KEY : '');

    if (!apiKey || apiKey.trim() === '' || apiKey.trim() === 'YOUR_API_KEY') {
      setMapStatus('no_key');
      return;
    }

    let isMounted = true;

    // Function to initialize Google Map
    const initMap = () => {
      if (!isMounted || !mapContainerRef.current || !window.google?.maps) return;

      try {
        const center = { lat, lng };

        // Reuse or create map
        const map = new window.google.maps.Map(mapContainerRef.current, {
          center,
          zoom: 15,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
          styles: [
            {
              featureType: 'poi.business',
              stylers: [{ visibility: 'off' }] // Hide generic businesses, show only wedding hall
            }
          ]
        });
        mapInstanceRef.current = map;

        // Custom Marker specifically for this Wedding Hall location
        const marker = new window.google.maps.Marker({
          position: center,
          map,
          title: businessName,
          animation: window.google.maps.Animation.DROP
        });
        markerInstanceRef.current = marker;

        // Info Window with Wedding Hall details
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="font-family: inherit; padding: 6px 8px; color: #1e293b;">
              <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px;">📍 ${businessName}</div>
              <div style="font-size: 12px; color: #64748b;">${formattedAddress || 'Wedding Venue Location'}</div>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });

        setMapStatus('ready');
      } catch (err) {
        console.error('Google Maps initialization error:', err);
        if (isMounted) {
          setMapStatus('error');
          setErrorMessage('Unable to initialize Google Maps view.');
        }
      }
    };

    // If Google Maps script is already loaded
    if (window.google?.maps) {
      initMap();
      return () => {
        isMounted = false;
      };
    }

    // Check if script tag is already injected
    const existingScript = document.getElementById('wpvcp-google-maps-script');
    if (existingScript) {
      existingScript.addEventListener('load', initMap);
      existingScript.addEventListener('error', () => {
        if (isMounted) setMapStatus('error');
      });
      return () => {
        isMounted = false;
        existingScript.removeEventListener('load', initMap);
      };
    }

    // Inject Google Maps script on-demand ONLY for Wedding Hall
    const script = document.createElement('script');
    script.id = 'wpvcp-google-maps-script';
    script.type = 'text/javascript';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (isMounted) initMap();
    };

    script.onerror = () => {
      if (isMounted) {
        setMapStatus('error');
        setErrorMessage('Failed to load Google Maps script from Google servers.');
      }
    };

    document.head.appendChild(script);

    return () => {
      isMounted = false;
    };
  }, [lat, lng, hasCoords, businessName, formattedAddress]);

  return (
    <div
      className={`card wedding-hall-map-card ${className}`}
      style={{
        padding: '1.25rem',
        marginTop: '1rem',
        borderRadius: 'var(--radius-lg, 12px)',
        border: '1px solid var(--border-color, var(--border, #e2e8f0))',
        background: 'var(--bg-surface, #ffffff)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MapPin size={20} color="var(--primary, #c9956b)" />
          <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main, #0f172a)' }}>
            {title}
          </h4>
        </div>
        <span
          className="badge badge-primary"
          style={{
            fontSize: '0.75rem',
            padding: '0.2rem 0.6rem',
            borderRadius: 'var(--radius-sm, 6px)',
            background: 'rgba(201, 149, 107, 0.15)',
            color: 'var(--primary, #c9956b)',
            fontWeight: 600
          }}
        >
          Wedding Venue Map
        </span>
      </div>

      {/* Map Display Container */}
      <div
        style={{
          width: '100%',
          height,
          minHeight: '240px',
          borderRadius: 'var(--radius-md, 8px)',
          overflow: 'hidden',
          position: 'relative',
          background: 'var(--bg-subtle, #f8fafc)',
          border: '1px solid var(--border, #e2e8f0)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Real Interactive Map Canvas */}
        <div
          ref={mapContainerRef}
          style={{
            width: '100%',
            height: '100%',
            display: mapStatus === 'ready' ? 'block' : 'none'
          }}
        />

        {/* Loading State */}
        {mapStatus === 'loading' && (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted, #64748b)' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                border: '3px solid var(--border, #cbd5e1)',
                borderTopColor: 'var(--primary, #c9956b)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 0.75rem'
              }}
            />
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Loading Wedding Hall Location Map...</div>
          </div>
        )}

        {/* Missing API Key Fallback */}
        {mapStatus === 'no_key' && (
          <div style={{ textAlign: 'center', padding: '1.5rem', maxWidth: '420px', color: 'var(--text-muted, #64748b)' }}>
            <AlertCircle size={32} color="var(--primary, #c9956b)" style={{ margin: '0 auto 0.5rem', opacity: 0.85 }} />
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main, #0f172a)', marginBottom: '0.35rem' }}>
              Map configuration is currently unavailable.
            </div>
            <p style={{ margin: 0, fontSize: '0.82rem', lineHeight: 1.5 }}>
              The interactive map requires a configured Google Maps API key in <code>.env</code>. You can still open the venue location directly on Google Maps below.
            </p>
          </div>
        )}

        {/* Missing Coordinates Fallback */}
        {mapStatus === 'no_coords' && (
          <div style={{ textAlign: 'center', padding: '1.5rem', maxWidth: '420px', color: 'var(--text-muted, #64748b)' }}>
            <MapPin size={32} color="var(--text-muted, #94a3b8)" style={{ margin: '0 auto 0.5rem' }} />
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main, #0f172a)', marginBottom: '0.35rem' }}>
              Location coordinates are not available for this wedding hall.
            </div>
            <p style={{ margin: 0, fontSize: '0.82rem', lineHeight: 1.5 }}>
              Coordinates (latitude & longitude) have not been saved yet for this venue. You can view the street address below.
            </p>
          </div>
        )}

        {/* Error Fallback */}
        {mapStatus === 'error' && (
          <div style={{ textAlign: 'center', padding: '1.5rem', maxWidth: '420px', color: 'var(--text-muted, #64748b)' }}>
            <AlertCircle size={32} color="var(--status-danger, #ef4444)" style={{ margin: '0 auto 0.5rem' }} />
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main, #0f172a)', marginBottom: '0.35rem' }}>
              {errorMessage || 'Unable to load interactive Google Map.'}
            </div>
            <p style={{ margin: 0, fontSize: '0.82rem', lineHeight: 1.5 }}>
              Use the direct buttons below to view this wedding hall location or get turn-by-turn navigation.
            </p>
          </div>
        )}
      </div>

      {/* Address Details & Action Buttons */}
      <div
        style={{
          marginTop: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
          paddingTop: '0.85rem',
          borderTop: '1px solid var(--border, #f1f5f9)'
        }}
      >
        {/* Address Info */}
        <div style={{ flex: '1 1 240px' }}>
          <div style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--text-main, #0f172a)', marginBottom: '0.2rem' }}>
            {businessName}
          </div>
          {address && (
            <div style={{ fontSize: '0.86rem', color: 'var(--text-muted, #64748b)', lineHeight: 1.4 }}>
              {address}
            </div>
          )}
          {(city || state || postalCode) && (
            <div style={{ fontSize: '0.84rem', color: 'var(--text-muted, #64748b)', marginTop: '0.15rem' }}>
              {[city, state].filter(Boolean).join(', ')} {postalCode ? ` - ${postalCode}` : ''}
            </div>
          )}
          {hasCoords && (
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted, #94a3b8)', marginTop: '0.3rem', fontFamily: 'monospace' }}>
              Coordinates: {lat.toFixed(5)}, {lng.toFixed(5)}
            </div>
          )}
        </div>

        {/* Action Buttons: View on Google Maps & Get Directions */}
        {showActions && (
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <a
              href={viewOnMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.85rem',
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-md, 6px)'
              }}
              title="Open location in Google Maps"
            >
              <ExternalLink size={14} />
              <span>View on Google Maps</span>
            </a>

            <a
              href={getDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-sm"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.85rem',
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-md, 6px)'
              }}
              title="Get driving directions to this wedding hall"
            >
              <Navigation size={14} />
              <span>Get Directions</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

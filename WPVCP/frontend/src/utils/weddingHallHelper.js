/**
 * Wedding Hall / Wedding Venue Centralized Helper
 * 
 * STRICT CATEGORY RESTRICTION:
 * Google Maps integration must ONLY be activated for Wedding Hall / Wedding Venue locations.
 * All other vendor categories (Photography, Videography, Makeup, Catering, Decoration,
 * Mehendi, Bridal Wear, Groom Wear, Florist, DJ, Music, Cake, Invitation, Transportation, etc.)
 * are strictly prohibited from loading or displaying Google Maps.
 */

export const WEDDING_HALL_CATEGORY_ID = 1;
export const WEDDING_HALL_CATEGORY_NAME = 'Wedding Hall';
export const WEDDING_HALL_CATEGORY_SLUG = 'wedding-hall';

/**
 * Checks whether a vendor or category represents a Wedding Hall / Wedding Venue.
 * 
 * @param {Object|string|number} vendorOrCategory - Vendor object, category object, name, slug, or ID
 * @returns {boolean} - true ONLY for Wedding Hall / Wedding Venue
 */
export function isWeddingHallVendor(vendorOrCategory) {
  if (!vendorOrCategory) return false;

  // Direct ID check
  if (vendorOrCategory === WEDDING_HALL_CATEGORY_ID || String(vendorOrCategory) === String(WEDDING_HALL_CATEGORY_ID)) {
    return true;
  }

  // String check (name or slug)
  if (typeof vendorOrCategory === 'string') {
    const trimmed = vendorOrCategory.trim().toLowerCase();
    if (trimmed === WEDDING_HALL_CATEGORY_NAME.toLowerCase()) return true;
    if (trimmed === 'wedding halls' || trimmed === 'wedding-halls') return true;
    if (trimmed === WEDDING_HALL_CATEGORY_SLUG.toLowerCase()) return true;
    if (trimmed === 'wedding hall' || trimmed === 'wedding venue' || trimmed === 'wedding-venue') return true;
    return false;
  }

  // Object check (vendor or category entity)
  if (typeof vendorOrCategory === 'object') {
    // 1. Check category_id
    if (vendorOrCategory.category_id === WEDDING_HALL_CATEGORY_ID || String(vendorOrCategory.category_id) === String(WEDDING_HALL_CATEGORY_ID)) {
      return true;
    }

    // 2. Check category_name or category string property
    const catName = vendorOrCategory.category_name || vendorOrCategory.category || vendorOrCategory.name;
    if (typeof catName === 'string') {
      const trimmed = catName.trim().toLowerCase();
      if (trimmed === WEDDING_HALL_CATEGORY_NAME.toLowerCase()) return true;
      if (trimmed === 'wedding halls' || trimmed === 'wedding-halls') return true;
      if (trimmed === WEDDING_HALL_CATEGORY_SLUG.toLowerCase()) return true;
      if (trimmed === 'wedding hall' || trimmed === 'wedding venue' || trimmed === 'wedding-venue') return true;
    }

    // 3. Check category_slug property
    if (typeof vendorOrCategory.category_slug === 'string') {
      const slugTrimmed = vendorOrCategory.category_slug.trim().toLowerCase();
      if (slugTrimmed === WEDDING_HALL_CATEGORY_SLUG.toLowerCase() || slugTrimmed === 'wedding-venue' || slugTrimmed === 'wedding-halls') {
        return true;
      }
    }
  }

  return false;
}

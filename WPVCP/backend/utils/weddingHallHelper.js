/**
 * Wedding Hall / Wedding Venue Centralized Helper (Backend)
 * 
 * STRICT CATEGORY RESTRICTION:
 * Google Maps location coordinates and maps integration are strictly restricted
 * to Wedding Hall / Wedding Venue vendors.
 */

const WEDDING_HALL_CATEGORY_ID = 1;
const WEDDING_HALL_CATEGORY_NAME = 'Wedding Hall';
const WEDDING_HALL_CATEGORY_SLUG = 'wedding-hall';

function isWeddingHallVendor(vendorOrCategory) {
  if (!vendorOrCategory) return false;

  if (vendorOrCategory === WEDDING_HALL_CATEGORY_ID || String(vendorOrCategory) === String(WEDDING_HALL_CATEGORY_ID)) {
    return true;
  }

  if (typeof vendorOrCategory === 'string') {
    const trimmed = vendorOrCategory.trim().toLowerCase();
    return trimmed === WEDDING_HALL_CATEGORY_NAME.toLowerCase() ||
           trimmed === WEDDING_HALL_CATEGORY_SLUG.toLowerCase() ||
           trimmed === 'wedding hall' || trimmed === 'wedding venue';
  }

  if (typeof vendorOrCategory === 'object') {
    if (vendorOrCategory.category_id === WEDDING_HALL_CATEGORY_ID || String(vendorOrCategory.category_id) === String(WEDDING_HALL_CATEGORY_ID)) {
      return true;
    }
    const catName = vendorOrCategory.category_name || vendorOrCategory.category || vendorOrCategory.name;
    if (typeof catName === 'string') {
      const trimmed = catName.trim().toLowerCase();
      if (trimmed === WEDDING_HALL_CATEGORY_NAME.toLowerCase() || trimmed === WEDDING_HALL_CATEGORY_SLUG.toLowerCase()) {
        return true;
      }
    }
    if (typeof vendorOrCategory.category_slug === 'string') {
      const slugTrimmed = vendorOrCategory.category_slug.trim().toLowerCase();
      if (slugTrimmed === WEDDING_HALL_CATEGORY_SLUG.toLowerCase()) {
        return true;
      }
    }
  }

  return false;
}

module.exports = {
  WEDDING_HALL_CATEGORY_ID,
  WEDDING_HALL_CATEGORY_NAME,
  WEDDING_HALL_CATEGORY_SLUG,
  isWeddingHallVendor
};

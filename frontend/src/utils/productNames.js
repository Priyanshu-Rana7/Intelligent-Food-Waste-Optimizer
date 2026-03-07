/**
 * Shared product name mapping for the entire application.
 * Backend/models use product IDs internally; this maps them to human-readable names.
 */
export const PRODUCT_NAMES = {
    P001: "Fresh Tomatoes",
    P002: "Spinach Bunch",
    P003: "Broccoli",
    P004: "Full Cream Milk",
    P005: "Carrots",
    P006: "Bananas",
    P007: "Whole Wheat Bread",
    P008: "Chicken Breast",
    P009: "Orange Juice",
    P010: "Greek Yogurt",
};

/**
 * Returns the display name for a product ID, or the ID itself as fallback.
 */
export const getProductName = (productId) =>
    PRODUCT_NAMES[productId?.toUpperCase()] || productId;

/**
 * Resolves a user's free-text input (partial name OR product ID) to a product ID.
 * e.g. "milk" → "P004", "bread" → "P007", "P001" → "P001"
 * Returns null if no match is found.
 */
export const resolveProductInput = (input) => {
    if (!input) return null;
    const query = input.trim().toUpperCase();

    // Direct ID match (e.g. "P007")
    if (PRODUCT_NAMES[query]) return query;

    // Partial name match (case-insensitive substring)
    const lowerQuery = input.trim().toLowerCase();
    const match = Object.entries(PRODUCT_NAMES).find(([, name]) =>
        name.toLowerCase().includes(lowerQuery)
    );
    return match ? match[0] : null;
};

/**
 * Returns all products as [{id, name}] for suggestion lists.
 */
export const ALL_PRODUCTS = Object.entries(PRODUCT_NAMES).map(([id, name]) => ({ id, name }));

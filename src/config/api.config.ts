const envUrl = import.meta.env.VITE_API_URL;
const WS_BASE_URL = import.meta.env.VITE_WS_URL;

export const API_CONFIG = {
  BASE_URL: envUrl,
  WS_URL: WS_BASE_URL,
  AUTH: {
        REFRESH_TOKEN: 'auth/refresh-token', 
    },
  ADMIN: {
    AUTH: {
      LOGIN: "auth/admin-login",
    },
    DASHBOARD: {
      GET_DASHBOARD: "admin/dashboard",
      EXPORT: "admin/dashboard/export",
      AI_INSIGHTS: "admin/dashboard/ai-insights",
    },

    PRODUCTS: {
      BASE: "admin/products",
      BY_ID: (id: string | number) => `admin/products/${id}`,
      UPLOAD_IMAGE: "admin/products/upload",
      IMPORT_EXCEL: "admin/products/import",
      EXPORT_EXCEL: "admin/products/export",
      OVERVIEW_STATS: "admin/products/overview-stats",
      TOGGLE_STATUS: (id: string | number) =>
        `admin/products/${id}/toggle-status`,
      TOGGLE_FEATURED: (id: string | number) =>
        `admin/products/${id}/toggle-featured`,
      VARIANTS: (id: string | number) => `admin/products/${id}/variants`,
      BULK_STOCK: "admin/products/variants/bulk-stock",
    },

    PRODUCT_COMBOS: {
      BASE: "admin/product-combos",
      BY_ID: (id: string | number) => `admin/product-combos/${id}`,
      BY_MAIN_PRODUCT: (mainProductId: string | number) =>
        `admin/product-combos/main/${mainProductId}`,
    },

    ORDERS: {
      BASE: "admin/orders",
      STATS: "admin/orders/stats",
      EXPORT_EXCEL: "admin/orders/export",
      BULK_STATUS: "admin/orders/bulk-status",
      UPDATE_STATUS: (id: string | number) => `admin/orders/${id}/status`,
    },

    PAYMENTS: {
      BASE: "admin/payments",
      CONFIRM_REFUND: (id: string | number) => `admin/payments/${id}/refunded`,
    },

    USERS: {
      BASE: "admin/users",
      BY_ID: (id: string | number) => `admin/users/${id}`,
      STATS: "admin/users/stats",
      IMPORT_EXCEL: "admin/users/import",
      EXPORT_EXCEL: "admin/users/export",
      TOGGLE_STATUS: (id: string | number) => `admin/users/${id}/toggle-status`,
    },

   
    VOUCHERS: {
      BASE: "admin/vouchers",
      BY_ID: (id: string | number) => `admin/vouchers/${id}`,
    },

    REVIEWS: {
      BASE: "admin/reviews",
      BY_ID: (id: string | number) => `admin/reviews/${id}`,
      UPDATE_STATUS: (id: string | number) => `admin/reviews/${id}/status`,
      REPLY: (id: string | number) => `admin/reviews/${id}/reply`,
    },

    CATEGORIES: {
      BASE: "admin/categories",
      BY_ID: (id: string | number) => `admin/categories/${id}`,
    },
    BRANDS: {
      BASE: "admin/brands",
      BY_ID: (id: string | number) => `admin/brands/${id}`,
    },
    SPEC_GROUPS: {
      BASE: "admin/spec-groups",
      BY_ID: (id: string | number) => `admin/spec-groups/${id}`,
    },
    SPEC_ATTRIBUTES: {
      BASE: "admin/spec-attributes",
      BY_ID: (id: string | number) => `admin/spec-attributes/${id}`,
    },

    CHAT: {
      CONVERSATIONS: "admin/chat/conversations",
      HISTORY: (userId: string | number) => `admin/chat/history/${userId}`,
      SEND_MESSAGE: (userId: string | number) => `admin/chat/send/${userId}`,
    },

    AI: {
      GENERATE_DESCRIPTION: "admin/ai/generate-description",
      EXTRACT_SPECS: "admin/ai/extract-specs",
      ACCESSORY_GENERATE_DESCRIPTION: "admin/ai/accessory/generate-description",
      ACCESSORY_EXTRACT_SPECS: "admin/ai/accessory/extract-specs",
    },
  },
} as const;

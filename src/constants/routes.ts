export const ADMIN_ROUTES = {
    // Auth
    ROOT: '/',
    LOGIN: '/admin/login',
    
    // Core Admin
    ADMIN_ROOT: '/admin',
    
    DASHBOARD: '',
    ORDERS: 'orders',
    PAYMENTS: 'payments',
    VOUCHERS: 'vouchers',
    PRODUCTS: 'products',
    PRODUCTS_CREATE: 'products/create',
    PRODUCTS_EDIT: 'products/edit/:id',
    ACCESSORIES: 'accessories',
    ACCESSORIES_CREATE: 'accessories/create',
    ACCESSORIES_EDIT: 'accessories/edit/:id',
    COMBOS: 'combos',
    CATEGORIES: 'categories',
    BRANDS: 'brands',
    SPECS: 'specs',
    USERS: 'users',
    REVIEWS: 'reviews',
    CHAT: 'chat',
} as const;
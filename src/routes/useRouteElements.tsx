import { Navigate, useRoutes } from "react-router-dom";
import { ADMIN_ROUTES } from "../constants/routes";

import AdminProtectedRoute from "./AdminProtectedRoute";
import AdminLayout from "../layouts/AdminLayout";
import Dashboard from "../pages/Admin/Dashboard/Dashboard";
import OrderManager from "../pages/Admin/OrderManager/OrderManager";
import ProductManager from "../pages/Admin/ProductManager/ProductManager";
import PaymentManager from "../pages/Admin/PaymentManager/PaymentManager";
import VoucherManager from "../pages/Admin/VoucherManager/VoucherManager";
import UserManager from "../pages/Admin/UserManager/UserManager";
import ReviewManager from "../pages/Admin/ReviewManager/ReviewManager";
import LiveChatAdmin from "../pages/Admin/LiveChatAdmin/LiveChatAdmin";
import ProductCreate from "../pages/Admin/ProductManager/ProductCreate/ProductCreate";
import ProductEdit from "../pages/Admin/ProductManager/ProductEdit/ProductEdit";
import AccessoryCreate from "../pages/Admin/ProductManager/AccessoryCreate/AccessoryCreate";
import AccessoryEdit from "../pages/Admin/ProductManager/AccessoryEdit/AccessoryEdit";
import CategoryManager from "../pages/Admin/CategoryManager/CategoryManager";
import BrandManager from "../pages/Admin/BrandManager/BrandManager";
import SpecManager from "../pages/Admin/SpecManager/SpecManager";
import ComboManager from "../pages/Admin/ComboManager/ComboManager";
import AdminLogin from "../pages/AdminLogin";

export default function useRouteElements() {
    const routeElements = useRoutes([
        {
            path: ADMIN_ROUTES.ROOT,
            element: <Navigate to={ADMIN_ROUTES.ADMIN_ROOT} replace />
        },
        {
            path: ADMIN_ROUTES.LOGIN,
            element: <AdminLogin />
        },
        // ==========================================
        // CÁC ROUTE ADMIN
        // ==========================================
        {
            path: ADMIN_ROUTES.ADMIN_ROOT,
            element: <AdminProtectedRoute />,
            children: [
                {
                    element: <AdminLayout />,
                    children: [
                        { index: true, element: <Dashboard /> },
                        { path: ADMIN_ROUTES.ORDERS, element: <OrderManager /> },
                        { path: ADMIN_ROUTES.PAYMENTS, element: <PaymentManager /> }, 
                        { path: ADMIN_ROUTES.VOUCHERS, element: <VoucherManager /> },
                        {
                            path: ADMIN_ROUTES.PRODUCTS,
                            element: <ProductManager defaultType="MAIN" /> 
                        },
                        {
                            path: ADMIN_ROUTES.PRODUCTS_CREATE,
                            element: <ProductCreate /> 
                        },
                        {
                            path: ADMIN_ROUTES.PRODUCTS_EDIT,
                            element: <ProductCreate /> 
                        },
                        {
                            path: ADMIN_ROUTES.ACCESSORIES,
                            element: <ProductManager defaultType="ACCESSORY" /> 
                        },
                        {
                            path: ADMIN_ROUTES.ACCESSORIES_CREATE,
                            element: <AccessoryCreate /> 
                        },
                        {
                            path: ADMIN_ROUTES.ACCESSORIES_EDIT,
                            element: <AccessoryEdit /> 
                        },
                        { path: ADMIN_ROUTES.COMBOS, element: <ComboManager /> }, 
                        { path: ADMIN_ROUTES.CATEGORIES, element: <CategoryManager /> }, 
                        { path: ADMIN_ROUTES.BRANDS, element: <BrandManager /> }, 
                        { path: ADMIN_ROUTES.SPECS, element: <SpecManager /> }, 
                        { path: ADMIN_ROUTES.USERS, element: <UserManager /> },
                        { path: ADMIN_ROUTES.REVIEWS, element: <ReviewManager /> },
                        { path: ADMIN_ROUTES.CHAT, element: <LiveChatAdmin /> },
                    ]
                }
            ]
        }
    ]);

    return routeElements;
}
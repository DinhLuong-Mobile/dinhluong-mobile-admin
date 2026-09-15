import { Navigate, useRoutes } from "react-router-dom";


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
            path: '/',
            element: <Navigate to="/admin" replace />
        },

        {
            path: '/admin/login',
            element: <AdminLogin />
        },
        // ==========================================
        // CÁC ROUTE ADMIN
        // ==========================================
        {
            path: '/admin',
            element: <AdminProtectedRoute />,
            children: [
                {
                    element: <AdminLayout />,
                    children: [
                        { index: true, element: <Dashboard /> },
                        { path: 'orders', element: <OrderManager /> },
                        { path: 'payments', element: <PaymentManager /> }, 
                        { path: 'vouchers', element: <VoucherManager /> },
                        {
                            path: 'products',
                            element: <ProductManager defaultType="MAIN" /> 
                        },
                        {
                            path: 'products/create',
                            element: <ProductCreate /> 
                        },
                        {
                            path: 'products/edit/:id',
                            element: <ProductEdit /> 
                        },
                        {
                            path: 'accessories',
                            element: <ProductManager defaultType="ACCESSORY" /> 
                        },
                        {
                            path: 'accessories/create',
                            element: <AccessoryCreate /> 
                        },
                        {
                            path: 'accessories/edit/:id',
                            element: <AccessoryEdit /> 
                        },
                        { path: 'combos', element: <ComboManager /> }, 
                        { path: 'categories', element: <CategoryManager /> }, 
                        { path: 'brands', element: <BrandManager /> }, 
                        { path: 'specs', element: <SpecManager /> }, 
                        { path: 'users', element: <UserManager /> },
                        { path: 'reviews', element: <ReviewManager /> },
                        { path: 'chat', element: <LiveChatAdmin /> },
                    ]
                }
            ]
        }
    ]);

    return routeElements;
}
import React, { useState, useEffect } from 'react';
import { message, Modal, notification } from 'antd';
import { adminProductService } from '../../../services';
import { adminMasterDataService } from '../../../services';
import type { ProductResponse } from '../../../types/product.types';

// Định nghĩa Type cho Filter (tránh dùng any)
interface FilterOption {
    id: string | number;
    name: string;
}

export const useProductManager = (defaultType: 'MAIN' | 'ACCESSORY' = 'MAIN') => {
    // --- States Dữ Liệu ---
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [total, setTotal] = useState<number>(0);
    const [brands, setBrands] = useState<FilterOption[]>([]);
    const [categories, setCategories] = useState<FilterOption[]>([]);

    // --- States Phân Trang & Bộ Lọc ---
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);
    const [searchText, setSearchText] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [filterBrand, setFilterBrand] = useState<string>('ALL');
    const [filterCategory, setFilterCategory] = useState<string>('ALL');

    // --- States UI ---
    const [stockModalVisible, setStockModalVisible] = useState<boolean>(false);
    const [selectedProduct, setSelectedProduct] = useState<{ id: number; name: string } | null>(null);
    
    // State dùng để trigger reload data an toàn trong useEffect
    const [refreshKey, setRefreshKey] = useState<number>(0);
    const triggerRefresh = () => setRefreshKey(prev => prev + 1);

    // =========================================================================
    // EFFECT 1: FETCH BỘ LỌC (Chỉ chạy 1 lần khi mount)
    // =========================================================================
    useEffect(() => {
        const loadFilters = async () => {
            try {
                // Sửa lại đoạn hứng dữ liệu
                const [catRes, brandRes] = await Promise.all([
                    adminMasterDataService.getCategories(),
                    adminMasterDataService.getBrands()
                ]);
                
                // Trích xuất mảng data thực sự từ ApiResponse
                const categoriesData = catRes.data || [];
                const brandsData = brandRes.data || [];
                
                // Ép kiểu (hoặc map) để chắc chắn khớp với FilterOption[]
                setCategories(categoriesData as unknown as FilterOption[]);
                setBrands(brandsData as unknown as FilterOption[]);
            } catch (error: unknown) {
                console.error('Lỗi tải bộ lọc', error);
            }
        };

        loadFilters();
    }, []);

    // =========================================================================
    // EFFECT 2: FETCH SẢN PHẨM (Chạy khi filter/page thay đổi hoặc triggerRefresh được gọi)
    // =========================================================================
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const apiPage = currentPage > 0 ? currentPage - 1 : 0;
                const params = {
                    page: apiPage,
                    size: pageSize,
                    keyword: searchText,
                    status: filterStatus !== 'ALL' ? filterStatus : undefined,
                    brandId: filterBrand !== 'ALL' ? filterBrand : undefined,
                    categoryId: filterCategory !== 'ALL' ? filterCategory : undefined,
                    productType: defaultType
                };
                
                // Gọi API
                const response = await adminProductService.getProducts(params);
                
                // Xử lý dữ liệu trả về theo chuẩn ApiResponse<PageResponse<T>> của bạn
                if (response.code === 200 || response.status === 'success') {
                    const pageData = response.data;
                    setProducts(pageData?.content || []);
                    setTotal(pageData?.totalElements || 0);
                }
            } catch (error: unknown) {
                // Xử lý lỗi chuẩn TS thay cho `any`
                const err = error as Error;
                message.error(err.message || 'Lỗi tải danh sách sản phẩm');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [currentPage, pageSize, searchText, filterStatus, filterBrand, filterCategory, defaultType, refreshKey]);

    // =========================================================================
    // CÁC HÀM XỬ LÝ SỰ KIỆN TỪ UI (HANDLERS)
    // =========================================================================
    
    const handlePageChange = (page: number, size: number) => {
        setCurrentPage(page);
        setPageSize(size);
    };

    const handleToggleStatus = async (id: number) => {
        try {
            await adminProductService.toggleStatus(id);
            message.success('Đã cập nhật trạng thái!');
            triggerRefresh();
        } catch (error: unknown) {
            const err = error as Error;
            message.error(err.message || 'Lỗi cập nhật trạng thái');
        }
    };

    const handleToggleFeatured = async (id: number) => {
        try {
            const response = await adminProductService.toggleFeatured(id);
            // Cấu trúc response có thể chứa thông báo
            message.success(response.message || 'Cập nhật thành công');
            triggerRefresh();
        } catch (error: unknown) {
            const err = error as Error;
            message.error(err.message || 'Lỗi cập nhật nổi bật');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await adminProductService.deleteProduct(id);
            message.success('Xóa sản phẩm thành công!');
            triggerRefresh();
        } catch (error: unknown) {
            const err = error as Error;
            message.error(err.message || 'Lỗi xóa sản phẩm');
        }
    };

    const handleOpenStockModal = (record: ProductResponse) => {
        setSelectedProduct({ id: record.id, name: record.name });
        setStockModalVisible(true);
    };

    // --- XỬ LÝ EXCEL ---
    const handleExportExcel = async () => {
        try {
            message.loading({ content: 'Đang xuất file...', key: 'export' });
            const blob = await adminProductService.exportExcel({
                productType: defaultType,
                keyword: searchText,
                status: filterStatus !== 'ALL' ? filterStatus : undefined,
                brandId: filterBrand !== 'ALL' ? filterBrand : undefined,
                categoryId: filterCategory !== 'ALL' ? filterCategory : undefined
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `products_${defaultType}_${new Date().getTime()}.xlsx`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            message.success({ content: 'Xuất Excel thành công!', key: 'export' });
        } catch (error: unknown) {
            const err = error as Error;
            message.error({ content: err.message || 'Lỗi xuất file Excel', key: 'export' });
        }
    };

    const handleImportExcel = async (options: any) => {
        const { file, onSuccess, onError } = options;
        const hideLoading = message.loading('Đang phân tích và xử lý file Excel, vui lòng đợi...', 0);

        try {
            const formData = new FormData();
            formData.append('file', file as File);
            const res = await adminProductService.importExcel(formData) as any;
            hideLoading();
            
            // Tùy theo chuẩn trả về của service mà parse data
            const importData = res.data || res;

            if (importData && importData.errors && importData.errors.length > 0) {
                onError?.(new Error("Validation Failed"));
                Modal.error({
                    title: 'Import thất bại: Dữ liệu không hợp lệ',
                    width: 650,
                    content: React.createElement('div', { style: { marginTop: 10 } }, [
                        React.createElement('p', { style: { color: '#cf1322', fontWeight: 'bold' }, key: 'title' }, 'Toàn bộ tiến trình import đã bị hủy. Vui lòng sửa các lỗi sau trong file Excel và thử lại:'),
                        React.createElement('div', { 
                            key: 'list',
                            style: { maxHeight: '350px', overflowY: 'auto', background: '#fff1f0', padding: '12px', border: '1px solid #ffa39e', borderRadius: '4px' } 
                        }, importData.errors.map((err: any, idx: number) => 
                            React.createElement('div', { key: idx, style: { color: '#cf1322', marginBottom: '8px', fontSize: '13px', borderBottom: idx !== importData.errors.length - 1 ? '1px dashed #ffa39e' : 'none', paddingBottom: '8px' } }, [
                                React.createElement('div', { key: 'tags' }, `Dòng ${err.row} | Sheet: ${err.sheet} | Cột: ${err.field}`),
                                React.createElement('div', { key: 'msg', style: { marginTop: '4px', paddingLeft: '4px' } }, `👉 ${err.message}`)
                            ])
                        ))
                    ]),
                    okText: 'Đã hiểu',
                });
            } else if (res.code === 200 || res.status === 'success' || importData) {
                onSuccess?.("ok");
                triggerRefresh(); // Cập nhật lại bảng
                notification.success({
                    message: 'Import Excel Thành Công',
                    description: React.createElement('div', null, [
                        React.createElement('div', { key: 'add' }, `➕ Thêm mới: ${importData.totalAdded || 0}`),
                        React.createElement('div', { key: 'upd' }, `🔄 Cập nhật: ${importData.totalUpdated || 0}`),
                        React.createElement('div', { key: 'skip' }, `⏭️ Bỏ qua: ${importData.totalSkipped || 0}`)
                    ]),
                    duration: 5,
                });
            } else {
                throw new Error(res.message || "Lỗi xử lý file Excel");
            }
        } catch (error: unknown) {
            hideLoading();
            onError?.(error);
            const err = error as Error;
            message.error(err.message || "File Excel không hợp lệ hoặc lỗi kết nối");
        }
    };

    return {
        products, loading, total, currentPage, pageSize,
        searchText, filterStatus, filterBrand, filterCategory,
        brands, categories, stockModalVisible, selectedProduct,
        setSearchText, setFilterStatus, setFilterBrand, setFilterCategory, setStockModalVisible,
        handlePageChange, handleToggleStatus, handleToggleFeatured, handleDelete,
        handleImportExcel, handleExportExcel, handleOpenStockModal, triggerRefresh
    };
};
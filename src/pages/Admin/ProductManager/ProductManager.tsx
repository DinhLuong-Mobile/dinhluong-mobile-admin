import React, { useState, useEffect } from 'react';
import {
    Table,
    Tag,
    Space,
    Typography,
    Input,
    Select,
    Button,
    message,
    Card,
    Switch,
    Popconfirm,
    Image,
    Badge,
    Upload, // <-- Đã thêm Upload
    Modal,
    notification
} from 'antd';

import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    AppstoreOutlined,
    SkinOutlined,
    StarOutlined,
    StarFilled,
    EyeOutlined,
    CopyOutlined,
    DownloadOutlined,
    UploadOutlined // <-- Đã thêm UploadOutlined
} from '@ant-design/icons';

import { useNavigate } from 'react-router-dom';

import StockDetailModal from './StockDetailModal/StockDetailModal';
import { productAdminService } from '../../../services/productAdminService'; // <-- Đảm bảo đường dẫn chính xác
import ProductMiniDashboard from './ProductMiniDashboard';

const { Title, Text } = Typography;
const { Option } = Select;

interface ProductResponse {
    id: number;
    name: string;
    slug: string;
    displayPrice: number;
    originalPrice: number;
    thumbnailUrl: string;
    brandName: string;
    categoryName: string;
    status: string;
    totalVariants: number;
    outOfStockVariantCount: number;
    lowStockVariantCount: number;
    totalStock: number;
    soldQuantity: number;
    isFeatured: boolean;
    createdAt: string;
}

interface ProductManagerProps {
    defaultType?: 'MAIN' | 'ACCESSORY';
}

const ProductManager: React.FC<ProductManagerProps> = ({ defaultType = 'MAIN' }) => {
    // =========================================================
    // STATE
    // =========================================================
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [total, setTotal] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);
    const [searchText, setSearchText] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [filterBrand, setFilterBrand] = useState<string>('ALL');
    const [filterCategory, setFilterCategory] = useState<string>('ALL');
    const [brands, setBrands] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [stockModalVisible, setStockModalVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<{ id: number; name: string } | null>(null);

    const navigate = useNavigate();

    // =========================================================
    // CONFIG
    // =========================================================
    const isMain = defaultType === 'MAIN';
    const pageTitle = isMain ? 'Quản lý Sản phẩm chính' : 'Quản lý Phụ kiện';
    const createRoute = isMain ? '/admin/products/create' : '/admin/accessories/create';
    const editBasePath = isMain ? '/admin/products/edit' : '/admin/accessories/edit';

    // =========================================================
    // FETCH PRODUCTS
    // =========================================================
    const fetchProducts = async (page = 1, size = 10) => {
        setLoading(true);
        try {
            const json = await productAdminService.getProducts({
                page,
                size,
                keyword: searchText,
                status: filterStatus,
                brandId: filterBrand,
                categoryId: filterCategory,
                productType: defaultType
            });
            if (json.status === 'success') {
                setProducts(json.data.content);
                setTotal(json.data.totalElements);
                setCurrentPage(page);
                setPageSize(size);
            }
        } catch (error: any) {
            message.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // FETCH FILTERS
    // =========================================================
    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const [categoriesData, brandsData] = await Promise.all([
                    productAdminService.getCategories(),
                    productAdminService.getBrands()
                ]);
                setCategories(categoriesData);
                setBrands(brandsData);
            } catch (error) {
                console.error('Lỗi tải bộ lọc');
            }
        };
        fetchFilters();
    }, []);

    useEffect(() => {
        fetchProducts(1, pageSize);
    }, [filterStatus, filterBrand, filterCategory, searchText, defaultType]);

    // =========================================================
    // ACTIONS
    // =========================================================
    const handleOpenStockModal = (record: ProductResponse) => {
        setSelectedProduct({ id: record.id, name: record.name });
        setStockModalVisible(true);
    };

    const handleToggleStatus = async (id: number) => {
        try {
            await productAdminService.toggleStatus(id);
            message.success('Đã cập nhật trạng thái!');
            fetchProducts(currentPage, pageSize);
        } catch (error: any) {
            message.error(error.message);
        }
    };

    const handleToggleFeatured = async (id: number) => {
        try {
            const json = await productAdminService.toggleFeatured(id);
            message.success(json.message || 'Cập nhật thành công');
            fetchProducts(currentPage, pageSize);
        } catch (error: any) {
            message.error(error.message);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await productAdminService.deleteProduct(id);
            message.success('Xóa sản phẩm thành công!');
            fetchProducts(currentPage, pageSize);
        } catch (error: any) {
            message.error(error.message);
        }
    };

   const handleImportExcel = async (options: any) => {
        const { file, onSuccess, onError } = options;
        const hideLoading = message.loading('Đang phân tích và xử lý file Excel, vui lòng đợi...', 0);

        try {
            const res = await productAdminService.importExcel(file as File);
            hideLoading();

            // Lấy dữ liệu report từ Backend
            const importData = res.data || res;

            // 1. NẾU CÓ LỖI VALIDATION -> BÁO LỖI VÀ KHÔNG LÀM MỚI BẢNG
            if (importData && importData.errors && importData.errors.length > 0) {
                onError?.(new Error("Validation Failed"));
                
                Modal.error({
                    title: 'Import thất bại: Dữ liệu không hợp lệ',
                    width: 650,
                    content: (
                        <div style={{ marginTop: 10 }}>
                            <p style={{ color: '#cf1322', fontWeight: 'bold' }}>
                                Toàn bộ tiến trình import đã bị hủy. Vui lòng sửa các lỗi sau trong file Excel và thử lại:
                            </p>
                            <div style={{ 
                                maxHeight: '350px', 
                                overflowY: 'auto', 
                                background: '#fff1f0', 
                                padding: '12px', 
                                border: '1px solid #ffa39e',
                                borderRadius: '4px'
                            }}>
                                {importData.errors.map((err: any, index: number) => (
                                    <div key={index} style={{ 
                                        color: '#cf1322', 
                                        marginBottom: '8px', 
                                        fontSize: '13px', 
                                        borderBottom: index !== importData.errors.length - 1 ? '1px dashed #ffa39e' : 'none', 
                                        paddingBottom: '8px' 
                                    }}>
                                        <div>
                                            {/* ĐÃ FIX LỖI THỪA THẺ </Text> Ở DÒNG DƯỚI ĐÂY */}
                                            <Tag color="red">Dòng {err.row}</Tag>
                                            <Tag color="volcano">Sheet: {err.sheet}</Tag>
                                            <Tag color="magenta">Cột: {err.field}</Tag>
                                        </div>
                                        <div style={{ marginTop: '4px', paddingLeft: '4px' }}>
                                            👉 <b>{err.message}</b>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ),
                    okText: 'Đã hiểu',
                });
            } 
            // 2. NẾU KHÔNG CÓ LỖI -> IMPORT THÀNH CÔNG TRỌN VẸN
            else if (res.status === 'success' || importData) {
                onSuccess?.("ok");
                fetchProducts(currentPage, pageSize); // Làm mới bảng

                notification.success({
                    message: 'Import Excel Thành Công',
                    description: (
                        <div>
                            <div>➕ Thêm mới: <b>{importData.totalAdded || 0}</b></div>
                            <div>🔄 Cập nhật: <b>{importData.totalUpdated || 0}</b></div>
                            <div>⏭️ Bỏ qua: <b>{importData.totalSkipped || 0}</b></div>
                        </div>
                    ),
                    duration: 5,
                });
            } else {
                onError?.(new Error("Lỗi Server"));
                message.error(res.message || "Lỗi xử lý file Excel");
            }
        } catch (err: any) {
            hideLoading();
            onError?.(err);
            message.error(err.message || "File Excel không hợp lệ hoặc lỗi kết nối");
        }
    };
    // =========================================================
    // TABLE COLUMNS
    // =========================================================
    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            width: 60,
            render: (id: number) => <Text type="secondary">#{id}</Text>
        },
        {
            title: 'Nổi bật',
            dataIndex: 'isFeatured',
            align: 'center' as const,
            width: 90,
            render: (isFeatured: boolean, record: ProductResponse) => (
                <Button
                    size="small"
                    icon={
                        isFeatured
                            ? <StarFilled style={{ color: '#faad14', fontSize: 16 }} />
                            : <StarOutlined style={{ fontSize: 16 }} />
                    }
                    onClick={() => handleToggleFeatured(record.id)}
                />
            )
        },
        {
            title: 'Sản phẩm',
            key: 'product',
            width: 280,
            render: (_: any, record: ProductResponse) => (
                <Space>
                    <Image
                        src={record.thumbnailUrl}
                        alt={record.name}
                        width={45}
                        height={45}
                        style={{
                            objectFit: 'contain',
                            borderRadius: 4,
                            border: '1px solid #f0f0f0'
                        }}
                        fallback="https://via.placeholder.com/45"
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Text strong style={{ fontSize: 14 }}>{record.name}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {record.brandName} • {record.categoryName}
                        </Text>
                    </div>
                </Space>
            )
        },
        {
            title: 'Giá bán',
            key: 'price',
            render: (_: any, record: ProductResponse) => (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <Text type="danger" strong>
                        {record.displayPrice?.toLocaleString()} đ
                    </Text>
                    {record.originalPrice > record.displayPrice && (
                        <Text delete type="secondary" style={{ fontSize: 12 }}>
                            {record.originalPrice?.toLocaleString()} đ
                        </Text>
                    )}
                </div>
            )
        },
        {
            title: 'Phân loại',
            dataIndex: 'totalVariants',
            align: 'center' as const,
            width: 100,
            render: (total: number) => (
                <Tag color="geekblue">{total || 0} mẫu</Tag>
            )
        },
        {
            title: 'Tồn kho',
            key: 'stockInfo',
            align: 'center' as const,
            width: 140,
            render: (_: any, record: ProductResponse) => {
                let stockColor = 'success';
                let stockText = `Tổng: ${record.totalStock || 0}`;

                if ((record.totalStock || 0) === 0) {
                    stockColor = 'error';
                    stockText = 'Hết hàng toàn bộ';
                }

                const hasWarning = record.outOfStockVariantCount > 0 || record.lowStockVariantCount > 0;

                return (
                    <div
                        style={{
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: 6,
                            background: hasWarning ? '#fafafa' : 'transparent',
                            border: hasWarning ? '1px dashed #d9d9d9' : '1px solid transparent',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                        onClick={() => handleOpenStockModal(record)}
                    >
                        <Badge
                            status={stockColor as any}
                            text={<Text type={stockColor as any} strong>{stockText}</Text>}
                        />
                        {record.outOfStockVariantCount > 0 && (
                            <div style={{ fontSize: 11, color: '#cf1322', background: '#fff1f0', padding: '2px 6px', borderRadius: 4, width: '100%', textAlign: 'center', border: '1px solid #ffa39e' }}>
                                🔴 {record.outOfStockVariantCount} mẫu hết!
                            </div>
                        )}
                        {record.lowStockVariantCount > 0 && (
                            <div style={{ fontSize: 11, color: '#d48806', background: '#fffbe6', padding: '2px 6px', borderRadius: 4, width: '100%', textAlign: 'center', border: '1px solid #ffe58f' }}>
                                ⚠️ {record.lowStockVariantCount} sắp hết
                            </div>
                        )}
                        {!hasWarning && record.totalStock > 0 && (
                            <div style={{ fontSize: 11, color: '#1890ff' }}>✏️ Cập nhật</div>
                        )}
                    </div>
                );
            }
        },
        {
            title: 'Đã bán',
            dataIndex: 'soldQuantity',
            align: 'center' as const,
            width: 90,
            render: (sold: number) => <Text strong>{sold || 0}</Text>
        },
        {
            title: 'Trạng thái',
            key: 'status',
            align: 'center' as const,
            render: (_: any, record: ProductResponse) => (
                <Switch
                    checked={record.status === 'ACTIVE'}
                    onChange={() => handleToggleStatus(record.id)}
                    checkedChildren="Hiện"
                    unCheckedChildren="Ẩn"
                />
            )
        },
        {
            title: 'Hành động',
            key: 'action',
            align: 'center' as const,
            render: (_: any, record: ProductResponse) => (
                <Space size="small" direction="vertical" style={{ width: '100%' }}>
                    <Space size="small">
                        <Button
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => {
                                if (record.status === 'INACTIVE') {
                                    message.warning("Sản phẩm đang ẩn, có thể trang khách hàng sẽ báo lỗi 404!");
                                }
                                const clientUrl = 'https://localhost:5173';
                                window.open(`${clientUrl}/Product/${record.slug}`, '_blank');
                            }}
                        >
                            Xem
                        </Button>
                        <Button
                            size="small"
                            icon={<CopyOutlined />}
                            onClick={() => navigate(createRoute, { state: { cloneFromId: record.id } })}
                        >
                            Copy
                        </Button>
                    </Space>

                    <Space size="small">
                        <Button
                            size="small"
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => navigate(`${editBasePath}/${record.id}`)}
                        >
                            Sửa
                        </Button>
                        <Popconfirm title="Xóa sản phẩm này?" onConfirm={() => handleDelete(record.id)}>
                            <Button size="small" danger icon={<DeleteOutlined />}>
                                Xóa
                            </Button>
                        </Popconfirm>
                    </Space>
                </Space>
            )
        }
    ];

    // =========================================================
    // RENDER
    // =========================================================
    return (
        <div style={{ padding: 24, background: '#fff', borderRadius: 8 }}>

            {/* --- 1. KHỐI HEADER --- */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, alignItems: 'center' }}>
                <Title level={4} style={{ margin: 0 }}>
                    {isMain ? <AppstoreOutlined /> : <SkinOutlined />}
                    {' '} {pageTitle}
                </Title>

                <Space>
                    <Button icon={<DownloadOutlined />} onClick={() =>
    productAdminService.exportExcel({
        productType: defaultType,
        keyword: searchText,
        status: filterStatus !== 'ALL'
            ? filterStatus
            : null,
        brandId: filterBrand !== 'ALL'
            ? filterBrand
            : null,
        categoryId: filterCategory !== 'ALL'
            ? filterCategory
            : null
    })
}>
                        Export Excel
                    </Button>

                    {/* 🔥 NÚT IMPORT EXCEL ĐƯỢC CHÈN VÀO ĐÂY */}
                    <Upload
                        accept=".xlsx, .xls"
                        showUploadList={false}
                        customRequest={handleImportExcel}
                    >
                        <Button icon={<UploadOutlined />} style={{ borderColor: '#52c41a', color: '#52c41a' }}>
                            Import Excel
                        </Button>
                    </Upload>

                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate(createRoute)}
                        style={{
                            opacity: 1,
                            visibility: 'visible',
                            backgroundColor: '#1890ff',
                            color: '#fff'
                        }}
                    >
                        Thêm {isMain ? 'sản phẩm' : 'phụ kiện'} mới
                    </Button>
                </Space>
            </div>

            {/* --- 2. KHỐI MINI DASHBOARD --- */}
            <ProductMiniDashboard />

            {/* --- 3. KHỐI TÌM KIẾM & LỌC --- */}
            <Card size="small" style={{ marginBottom: 20, background: '#fafafa' }}>
                <Space wrap size="middle">
                    <div>
                        <Text strong style={{ marginRight: 8 }}>Tìm kiếm:</Text>
                        <Input.Search
                            placeholder="Tên sản phẩm..."
                            allowClear
                            onSearch={setSearchText}
                            style={{ width: 220 }}
                        />
                    </div>
                    <div>
                        <Text strong style={{ marginRight: 8 }}>Hãng:</Text>
                        <Select value={filterBrand} onChange={setFilterBrand} style={{ width: 140 }}>
                            <Option value="ALL">Tất cả</Option>
                            {brands.map((b) => (
                                <Option key={b.id} value={b.id}>{b.name}</Option>
                            ))}
                        </Select>
                    </div>
                    <div>
                        <Text strong style={{ marginRight: 8 }}>Danh mục:</Text>
                        <Select value={filterCategory} onChange={setFilterCategory} style={{ width: 160 }}>
                            <Option value="ALL">Tất cả</Option>
                            {categories.map((c) => (
                                <Option key={c.id} value={c.id}>{c.name}</Option>
                            ))}
                        </Select>
                    </div>
                    <div>
                        <Text strong style={{ marginRight: 8 }}>Trạng thái:</Text>
                        <Select value={filterStatus} onChange={setFilterStatus} style={{ width: 120 }}>
                            <Option value="ALL">Tất cả</Option>
                            <Option value="ACTIVE">Đang bán</Option>
                            <Option value="INACTIVE">Đã ẩn</Option>
                        </Select>
                    </div>
                </Space>
            </Card>

            {/* --- 4. BẢNG DỮ LIỆU --- */}
            <Table
                columns={columns}
                dataSource={products}
                rowKey="id"
                loading={loading}
                pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: total,
                    showSizeChanger: true,
                    onChange: (page, size) => fetchProducts(page, size)
                }}
            />

            <StockDetailModal
                open={stockModalVisible}
                onClose={() => setStockModalVisible(false)}
                onSuccess={() => fetchProducts(currentPage, pageSize)}
                product={selectedProduct}
            />
        </div>
    );
};

export default ProductManager;
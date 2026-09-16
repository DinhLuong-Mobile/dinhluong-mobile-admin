import React from 'react';
import { Table, Tag, Space, Typography, Input, Select, Button, message, Card, Switch, Popconfirm, Image, Badge, Upload } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, AppstoreOutlined, SkinOutlined, StarOutlined, StarFilled, EyeOutlined, CopyOutlined, DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import StockDetailModal from './StockDetailModal/StockDetailModal';
import ProductMiniDashboard from './ProductMiniDashboard';
import { useProductManager } from './useProductManager';
import type { ProductResponse } from '../../../types/product.types';

const { Title, Text } = Typography;
const { Option } = Select;
interface ProductManagerProps {
    defaultType?: 'MAIN' | 'ACCESSORY';
}

const   ProductManager: React.FC<ProductManagerProps> = ({ defaultType = 'MAIN' }) => {
    const navigate = useNavigate();

    // Lấy toàn bộ logic từ Custom Hook
    const {
        products, loading, total, currentPage, pageSize,
        filterStatus, filterBrand, filterCategory,
        brands, categories, stockModalVisible, selectedProduct,
        setSearchText, setFilterStatus, setFilterBrand, setFilterCategory, setStockModalVisible,
        handlePageChange, handleToggleStatus, handleToggleFeatured, handleDelete,
        handleImportExcel, handleExportExcel, handleOpenStockModal, triggerRefresh
    } = useProductManager(defaultType);

    const isMain = defaultType === 'MAIN';
    const pageTitle = isMain ? 'Quản lý Sản phẩm chính' : 'Quản lý Phụ kiện';
    const createRoute = isMain ? '/admin/products/create' : '/admin/accessories/create';
    const editBasePath = isMain ? '/admin/products/edit' : '/admin/accessories/edit';

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
                    icon={isFeatured ? <StarFilled style={{ color: '#faad14', fontSize: 16 }} /> : <StarOutlined style={{ fontSize: 16 }} />}
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
                        width={45} height={45}
                        style={{ objectFit: 'contain', borderRadius: 4, border: '1px solid #f0f0f0' }}
                        fallback="https://via.placeholder.com/45"
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Text strong style={{ fontSize: 14 }}>{record.name}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>{record.brandName} • {record.categoryName}</Text>
                    </div>
                </Space>
            )
        },
        {
            title: 'Giá bán',
            key: 'price',
            render: (_: any, record: ProductResponse) => (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <Text type="danger" strong>{(record.displayPrice ?? 0).toLocaleString()} đ</Text>
                    {(record.originalPrice ?? 0) > (record.displayPrice ?? 0) && (
                        <Text delete type="secondary" style={{ fontSize: 12 }}>
                            {(record.originalPrice ?? 0).toLocaleString()} đ
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
            render: (total: number) => <Tag color="geekblue">{total || 0} mẫu</Tag>
        },
        {
            title: 'Tồn kho',
            key: 'stockInfo',
            align: 'center' as const,
            width: 140,
            render: (_: any, record: ProductResponse) => {
                const totalStock = record.totalStock || 0;
                let stockColor: 'success' | 'error' = totalStock === 0 ? 'error' : 'success';
                let stockText = totalStock === 0 ? 'Hết hàng toàn bộ' : `Tổng: ${totalStock}`;
                const hasWarning = (record.outOfStockVariantCount ?? 0) > 0 || (record.lowStockVariantCount ?? 0) > 0;

                return (
                    <div
                        style={{
                            cursor: 'pointer', padding: '6px', borderRadius: 6,
                            background: hasWarning ? '#fafafa' : 'transparent',
                            border: hasWarning ? '1px dashed #d9d9d9' : '1px solid transparent',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
                        }}
                        onClick={() => handleOpenStockModal(record)}
                    >
                        <Badge status={stockColor} text={<Text type={stockColor} strong>{stockText}</Text>} />
                        {(record.outOfStockVariantCount ?? 0) > 0 && (
                            <div style={{ fontSize: 11, color: '#cf1322', background: '#fff1f0', padding: '2px 6px', borderRadius: 4, width: '100%', textAlign: 'center', border: '1px solid #ffa39e' }}>
                                🔴 {record.outOfStockVariantCount} mẫu hết!
                            </div>
                        )}
                        {(record.lowStockVariantCount ?? 0) > 0 && (
                            <div style={{ fontSize: 11, color: '#d48806', background: '#fffbe6', padding: '2px 6px', borderRadius: 4, width: '100%', textAlign: 'center', border: '1px solid #ffe58f' }}>
                                ⚠️ {record.lowStockVariantCount} sắp hết
                            </div>
                        )}
                        {!hasWarning && totalStock > 0 && <div style={{ fontSize: 11, color: '#1890ff' }}>✏️ Cập nhật</div>}
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
                    checkedChildren="Hiện" unCheckedChildren="Ẩn"
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
                            size="small" icon={<EyeOutlined />}
                            onClick={() => {
                                if (record.status === 'INACTIVE') message.warning("Sản phẩm đang ẩn!");
                                window.open(`https://localhost:5173/Product/${record.slug}`, '_blank');
                            }}
                        >
                            Xem
                        </Button>
                        <Button size="small" icon={<CopyOutlined />} onClick={() => navigate(createRoute, { state: { cloneFromId: record.id } })}>
                            Copy
                        </Button>
                    </Space>
                    <Space size="small">
                        <Button size="small" type="primary" icon={<EditOutlined />} onClick={() => navigate(`${editBasePath}/${record.id}`)}>
                            Sửa
                        </Button>
                        <Popconfirm title="Xóa sản phẩm này?" onConfirm={() => handleDelete(record.id)}>
                            <Button size="small" danger icon={<DeleteOutlined />}>Xóa</Button>
                        </Popconfirm>
                    </Space>
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: 24, background: '#fff', borderRadius: 8 }}>
            {/* --- HEADER --- */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, alignItems: 'center' }}>
                <Title level={4} style={{ margin: 0 }}>
                    {isMain ? <AppstoreOutlined /> : <SkinOutlined />} {pageTitle}
                </Title>
                <Space>
                    <Button icon={<DownloadOutlined />} onClick={handleExportExcel}>Export Excel</Button>
                    <Upload accept=".xlsx, .xls" showUploadList={false} customRequest={handleImportExcel}>
                        <Button icon={<UploadOutlined />} style={{ borderColor: '#52c41a', color: '#52c41a' }}>Import Excel</Button>
                    </Upload>
                    <Button
                        type="primary" icon={<PlusOutlined />}
                        onClick={() => navigate(createRoute)}
                        style={{ backgroundColor: '#1890ff', color: '#fff' }}
                    >
                        Thêm {isMain ? 'sản phẩm' : 'phụ kiện'} mới
                    </Button>
                </Space>
            </div>

            {/* --- DASHBOARD --- */}
            <ProductMiniDashboard />

            {/* --- TÌM KIẾM & LỌC --- */}
            <Card size="small" style={{ marginBottom: 20, background: '#fafafa' }}>
                <Space wrap size="middle">
                    <div>
                        <Text strong style={{ marginRight: 8 }}>Tìm kiếm:</Text>
                        <Input.Search placeholder="Tên sản phẩm..." allowClear onSearch={setSearchText} style={{ width: 220 }} />
                    </div>
                    <div>
                        <Text strong style={{ marginRight: 8 }}>Hãng:</Text>
                        <Select value={filterBrand} onChange={setFilterBrand} style={{ width: 140 }}>
                            <Option value="ALL">Tất cả</Option>
                            {brands.map((b) => <Option key={b.id} value={b.id}>{b.name}</Option>)}
                        </Select>
                    </div>
                    <div>
                        <Text strong style={{ marginRight: 8 }}>Danh mục:</Text>
                        <Select value={filterCategory} onChange={setFilterCategory} style={{ width: 160 }}>
                            <Option value="ALL">Tất cả</Option>
                            {categories.map((c) => <Option key={c.id} value={c.id}>{c.name}</Option>)}
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

            {/* --- TABLE --- */}
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
                    onChange: handlePageChange
                }}
            />

            <StockDetailModal
                open={stockModalVisible}
                onClose={() => setStockModalVisible(false)}
                onSuccess={triggerRefresh} // Tự động load lại bảng khi cập nhật kho thành công
                product={selectedProduct}
            />
        </div>
    );
};

export default ProductManager;
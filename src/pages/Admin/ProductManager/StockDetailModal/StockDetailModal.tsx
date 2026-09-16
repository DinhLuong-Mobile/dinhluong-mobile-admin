import React from 'react';
import { Modal, Table, Space, Typography, Tag, Button, Avatar, InputNumber } from 'antd';
import { ShoppingCartOutlined, WarningOutlined, SaveOutlined } from '@ant-design/icons';
import { useStockDetail, VariantDetail } from './useStockDetail';

const { Text } = Typography;

interface StockDetailModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    product: { id: number; name: string } | null;
}

const StockDetailModal: React.FC<StockDetailModalProps> = ({ open, onClose, onSuccess, product }) => {

    const {
        variants, loading, isSaving, editingStocks, bulkValue, hasAnyChange,
        setBulkValue, handleStockChange, handleApplyAll, handleSaveAll
    } = useStockDetail(open, product?.id, onClose, onSuccess);


    // Cấu hình Cột của Table
    const stockColumns = [
        {
            title: 'Phiên bản',
            key: 'variant',
            render: (_: any, record: VariantDetail) => (
                <Space>
                    {record.imageUrl && <Avatar src={record.imageUrl} shape="square" />}
                    <div>
                        <Text strong>{record.sku}</Text>
                        <br />
                        <Space size={4}>
                            {record.colorHex && (
                                <div style={{ width: 12, height: 12, borderRadius: '50%', background: record.colorHex, border: '1px solid #ddd' }} />
                            )}
                            <Text type="secondary">{record.colorName} - {record.ram}/{record.rom}</Text>
                        </Space>
                    </div>
                </Space>
            )
        },
        {
            title: 'Trạng thái',
            key: 'status',
            align: 'center' as const,
            width: 130,
            render: (_: any, record: VariantDetail) => {
                const currentStock = editingStocks[record.id] !== undefined ? editingStocks[record.id] : record.stockQuantity;
                if (currentStock === 0) return <Tag color="red" icon={<WarningOutlined />}>Hết hàng</Tag>;
                if (currentStock < 5) return <Tag color="orange" icon={<ShoppingCartOutlined />}>Cần nhập thêm</Tag>;
                return <Tag color="green">Ổn định</Tag>;
            }
        },
        {
            title: 'Sửa tồn kho',
            key: 'edit_stock',
            align: 'center' as const,
            width: 150,
            render: (_: any, record: VariantDetail) => {
                const isChanged = editingStocks[record.id] !== record.stockQuantity;
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <InputNumber 
                            min={0} 
                            value={editingStocks[record.id]} 
                            onChange={(val) => handleStockChange(record.id, val)}
                            style={{ width: 80, borderColor: isChanged ? '#1890ff' : undefined }}
                        />
                        {isChanged && <Text type="success" style={{ fontSize: 11 }}>Đã đổi</Text>}
                    </div>
                );
            }
        }
    ];

    return (
        <Modal
            title={<span>📦 Cập nhật nhanh kho: <Text type="success">{product?.name}</Text></span>}
            open={open}
            onCancel={onClose}
            width={850}
            destroyOnClose
            footer={[
                <Button key="close" onClick={onClose} disabled={isSaving}>Hủy bỏ</Button>,
                <Button 
                    key="save" 
                    type="primary" 
                    icon={<SaveOutlined />} 
                    loading={isSaving} 
                    onClick={handleSaveAll}
                    disabled={!hasAnyChange} 
                >
                    Lưu tất cả thay đổi
                </Button>
            ]}
        >
            {/* Khung thiết lập số lượng hàng loạt */}
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end', background: '#f9f9f9', padding: '10px 16px', borderRadius: 8 }}>
                <Space>
                    <Text strong>Thiết lập nhanh số lượng chung:</Text>
                    <InputNumber 
                        placeholder="VD: 50" 
                        min={0} 
                        value={bulkValue} 
                        onChange={setBulkValue} 
                    />
                    <Button type="default" onClick={handleApplyAll} disabled={bulkValue === null}>
                        Áp dụng tất cả
                    </Button>
                </Space>
            </div>

            {/* Bảng Dữ liệu */}
            <Table 
                columns={stockColumns} 
                dataSource={variants} 
                rowKey="id" 
                loading={loading} 
                pagination={false}
                size="small"
                bordered
            />
        </Modal>
    );
};

export default StockDetailModal;
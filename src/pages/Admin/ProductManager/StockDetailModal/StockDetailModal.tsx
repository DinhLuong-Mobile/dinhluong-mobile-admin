import React, { useState, useEffect } from 'react';
import { Modal, Table, Space, Typography, Tag, Button, Avatar, message, InputNumber } from 'antd';
import { ShoppingCartOutlined, WarningOutlined, SaveOutlined } from '@ant-design/icons';

const { Text } = Typography;

export interface VariantDetail {
    id: number;
    sku: string;
    colorName: string;
    colorHex: string;
    ram: string;
    rom: string;
    stockQuantity: number;
    imageUrl: string;
}

interface StockDetailModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    product: { id: number; name: string } | null;
}

const StockDetailModal: React.FC<StockDetailModalProps> = ({ open, onClose, onSuccess, product }) => {
    const [variants, setVariants] = useState<VariantDetail[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Lưu các giá trị Admin đang nhập
    const [editingStocks, setEditingStocks] = useState<Record<number, number>>({});
    const [isSaving, setIsSaving] = useState(false);

    const getAuthToken = () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr).token : '';
    };

    useEffect(() => {
        if (open && product?.id) {
            fetchVariants(product.id);
        } else {
            setVariants([]);
            setEditingStocks({});
        }
    }, [open, product]);

    const fetchVariants = async (productId: number) => {
        setLoading(true);
        try {
            const token = getAuthToken();
            const res = await fetch(`http://localhost:8080/api/admin/products/${productId}/variants`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            if (res.ok && json.status === 'success') {
                setVariants(json.data);
                const initialStocks: Record<number, number> = {};
                json.data.forEach((v: VariantDetail) => {
                    initialStocks[v.id] = v.stockQuantity;
                });
                setEditingStocks(initialStocks);
            }
        } catch (error) {
            message.error("Lỗi kết nối máy chủ");
        } finally {
            setLoading(false);
        }
    };

    const handleStockChange = (variantId: number, value: number | null) => {
        setEditingStocks(prev => ({
            ...prev,
            [variantId]: value || 0
        }));
    };
    const [bulkValue, setBulkValue] = useState<number | null>(null);
    const handleApplyAll = () => {
        if (bulkValue === null || bulkValue < 0) return;
        const newStocks = { ...editingStocks };
        variants.forEach(v => {
            newStocks[v.id] = bulkValue;
        });
        setEditingStocks(newStocks);
        message.info(`Đã áp dụng số lượng ${bulkValue} cho tất cả phiên bản.`);
    };
    // [MỚI] HÀM LƯU HÀNG LOẠT (BULK SAVE)
    const handleSaveAll = async () => {
        if (!product) return;
        
        // 1. Lọc ra những biến thể có sự thay đổi về số lượng
        const changedStocks = variants
            .filter(v => editingStocks[v.id] !== v.stockQuantity) // So sánh số mới và số cũ
            .map(v => ({
                variantId: v.id,
                stockQuantity: editingStocks[v.id]
            }));

        if (changedStocks.length === 0) {
            message.info("Không có thay đổi nào để lưu.");
            onClose(); // Đóng modal luôn nếu ko có gì đổi
            return;
        }

        setIsSaving(true);
        try {
            const token = getAuthToken();
            const payload = {
                productId: product.id,
                stocks: changedStocks
            };

            // Gọi API Bulk
            const res = await fetch(`http://localhost:8080/api/admin/products/variants/bulk-stock`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const json = await res.json();
            if (res.ok && json.status === 'success') {
                message.success(`Đã cập nhật tồn kho cho ${changedStocks.length} phiên bản!`);
                onSuccess();
                onClose(); // Lưu xong thì tự động đóng cửa sổ lại cho gọn
                // (Lưu ý: Sau khi đóng Modal, ở ProductManager có thể bạn sẽ cần gọi lại fetchProducts() để làm mới UI tổng)
            } else {
                message.error(json.message || "Lỗi khi cập nhật");
            }
        } catch (error) {
            message.error("Lỗi kết nối máy chủ!");
        } finally {
            setIsSaving(false);
        }
    };

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
                            {record.colorHex && <div style={{width: 12, height: 12, borderRadius: '50%', background: record.colorHex, border: '1px solid #ddd'}}></div>}
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
                            style={{ width: 80, borderColor: isChanged ? '#1890ff' : undefined }} // Highlight viền xanh nếu có thay đổi
                        />
                        {isChanged && <Text type="success" style={{ fontSize: 11 }}>Đã đổi</Text>}
                    </div>
                );
            }
        }
    ];

    // Có bản ghi nào được thay đổi không?
    const hasAnyChange = variants.some(v => editingStocks[v.id] !== v.stockQuantity);

    return (
        <Modal
            title={<span>📦 Cập nhật nhanh kho: <Text type="success">{product?.name}</Text></span>}
            open={open}
            onCancel={onClose}
            width={850} // Tăng nhẹ chiều rộng lên 850px để bảng không bị ép do có thêm cột
            destroyOnClose
            footer={[
                <Button key="close" onClick={onClose} disabled={isSaving}>Hủy bỏ</Button>,
                <Button 
                    key="save" 
                    type="primary" 
                    icon={<SaveOutlined />} 
                    loading={isSaving} 
                    onClick={handleSaveAll}
                    disabled={!hasAnyChange} // Vô hiệu hóa nếu không có gì thay đổi
                >
                    Lưu tất cả thay đổi
                </Button>
            ]}
        >
            {/* --- [BỔ SUNG] KHUNG THIẾT LẬP NHANH --- */}
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
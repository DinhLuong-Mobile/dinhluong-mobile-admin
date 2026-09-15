import React, { useState, useEffect } from 'react';
import { 
    Table, Button, Space, Modal, Form, Input, 
    Select, InputNumber, message, Popconfirm, Card, Typography, Tag, Divider 
} from 'antd';
import { 
    PlusOutlined, DeleteOutlined, SettingOutlined 
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const ComboManager: React.FC = () => {
    // States cho dữ liệu chính
    const [mainProducts, setMainProducts] = useState<any[]>([]);
    const [accessories, setAccessories] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // States cho Modal Quản lý Combo
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMainProduct, setSelectedMainProduct] = useState<any>(null);
    const [combos, setCombos] = useState<any[]>([]);
    const [comboLoading, setComboLoading] = useState(false);
    const [form] = Form.useForm();

    const getAuthToken = () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr).token : '';
    };

    // 1. FETCH DỮ LIỆU BAN ĐẦU (Main Products & Accessories)
    const fetchData = async () => {
        setLoading(true);
        try {
            const headers = { 'Authorization': `Bearer ${getAuthToken()}` };
            // Lấy riêng SP chính và Phụ kiện (Giả sử bạn có truyền param type lên API)
            const [mainRes, accRes] = await Promise.all([
                fetch('http://localhost:8080/api/admin/products?productType=MAIN&size=100', { headers }),
                fetch('http://localhost:8080/api/admin/products?productType=ACCESSORY&size=500', { headers })
            ]);

            if (mainRes.ok) {
                const json = await mainRes.json();
                // Tùy theo cấu trúc API của bạn (thường là json.data.content nếu có phân trang)
                setMainProducts(json.data?.content || json.data || []);
            }
            if (accRes.ok) {
                const json = await accRes.json();
                setAccessories(json.data?.content || json.data || []);
            }
        } catch (error) {
            message.error("Lỗi tải dữ liệu sản phẩm");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // 2. MỞ MODAL & LẤY DANH SÁCH COMBO CỦA SP ĐƯỢC CHỌN
    const openComboModal = async (product: any) => {
        setSelectedMainProduct(product);
        setIsModalOpen(true);
        form.resetFields();
        fetchCombosForProduct(product.id);
    };

    const fetchCombosForProduct = async (mainProductId: number) => {
        setComboLoading(true);
        try {
            // Cần API backend lấy combo theo ID sản phẩm chính
            const res = await fetch(`http://localhost:8080/api/admin/product-combos/main/${mainProductId}`, {
                headers: { 'Authorization': `Bearer ${getAuthToken()}` }
            });
            if (res.ok) {
                const data = await res.json();
                setCombos(data);
            }
        } catch (error) {
            message.error("Lỗi tải danh sách combo");
        } finally {
            setComboLoading(false);
        }
    };

    // 3. THÊM COMBO MỚI
    const handleAddCombo = async (values: any) => {
        try {
            const payload = {
                mainProductId: selectedMainProduct.id,
                relatedProductId: values.relatedProductId,
                discountAmount: values.discountAmount,
                note: values.note
            };

            const res = await fetch('http://localhost:8080/api/admin/product-combos', {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${getAuthToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                message.success("Thêm combo thành công!");
                form.resetFields(); // Clear form
                fetchCombosForProduct(selectedMainProduct.id); // Load lại bảng combo
            } else {
                message.error("Lỗi khi thêm combo");
            }
        } catch (error) {
            message.error("Lỗi kết nối");
        }
    };

    // 4. XÓA COMBO
    const handleDeleteCombo = async (comboId: number) => {
        try {
            const res = await fetch(`http://localhost:8080/api/admin/product-combos/${comboId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${getAuthToken()}` }
            });
            if (res.ok) {
                message.success("Đã xóa combo");
                fetchCombosForProduct(selectedMainProduct.id);
            }
        } catch (error) {
            message.error("Lỗi khi xóa combo");
        }
    };

    // ================== CẤU HÌNH BẢNG ==================
    const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

    const mainColumns = [
        {
            title: 'Sản phẩm chính',
            dataIndex: 'name',
            key: 'name',
            render: (text: string, record: any) => (
                <Space>
                    <img src={record.thumbnailUrl} alt={text} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} />
                    <div>
                        <Text strong>{text}</Text><br/>
                        <Text type="secondary" style={{ fontSize: 12 }}>{record.sku || `ID: ${record.id}`}</Text>
                    </div>
                </Space>
            )
        },
        { title: 'Giá bán', dataIndex: 'displayPrice', key: 'price', render: (p: number) => formatPrice(p) },
        { title: 'Tồn kho', dataIndex: 'totalStock', key: 'stock' },
        {
            title: 'Hành động',
            key: 'action',
            render: (_: any, record: any) => (
                <Button type="primary" icon={<SettingOutlined />} onClick={() => openComboModal(record)}>
                    Quản lý Combo
                </Button>
            ),
        },
    ];

    const comboColumns = [
        { 
            title: 'Phụ kiện kèm theo', 
            key: 'accName', 
            render: (_: any, record: any) => (
                <Space>
                    {/* 👇 HIỂN THỊ ẢNH Ở ĐÂY 👇 */}
                    {record.relatedProductThumbnail ? (
                        <img 
                            src={record.relatedProductThumbnail} 
                            alt={record.relatedProductName} 
                            style={{ width: 40, height: 40, objectFit: 'contain', border: '1px solid #f0f0f0', borderRadius: 4, background: '#fff' }} 
                        />
                    ) : (
                        <div style={{ width: 40, height: 40, background: '#f0f0f0', borderRadius: 4 }} />
                    )}
                    <Text strong>{record.relatedProductName}</Text>
                </Space>
            )
        },
        { 
            title: 'Phụ kiện kèm theo', 
            key: 'accName', 
            render: (_: any, record: any) => <Text strong>{record.relatedProduct?.name}</Text> 
        },
        { 
            title: 'Giảm giá', 
            dataIndex: 'discountAmount', 
            key: 'discount',
            render: (p: number) => <Tag color="green">-{formatPrice(p)}</Tag>
        },
        { title: 'Ghi chú', dataIndex: 'note', key: 'note' },
        {
            title: 'Xóa',
            key: 'action',
            render: (_: any, record: any) => (
                <Popconfirm title="Xóa phụ kiện này khỏi combo?" onConfirm={() => handleDeleteCombo(record.id)}>
                    <Button danger type="text" icon={<DeleteOutlined />} />
                </Popconfirm>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Card>
                <div style={{ marginBottom: 16 }}>
                    <Title level={3} style={{ margin: 0 }}>Quản lý Combo mua kèm</Title>
                    <Text type="secondary">Chọn một sản phẩm chính để cấu hình các phụ kiện mua kèm giảm giá.</Text>
                </div>

                <Table 
                    columns={mainColumns} 
                    dataSource={mainProducts} 
                    rowKey="id" 
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    bordered
                />
            </Card>

            {/* MODAL QUẢN LÝ COMBO CỦA 1 SẢN PHẨM */}
            <Modal 
                title={<>Combos cho: <Text type="danger">{selectedMainProduct?.name}</Text></>}
                open={isModalOpen} 
                onCancel={() => setIsModalOpen(false)}
                footer={null} // Không dùng footer mặc định
                width={800}
                destroyOnHidden
            >
                {/* Khu vực 1: Form thêm Combo mới */}
                <div style={{ background: '#fafafa', padding: 16, borderRadius: 8, marginBottom: 16 }}>
                    <Title level={5} style={{ marginTop: 0 }}>Thêm Phụ Kiện Vào Combo</Title>
                    <Form form={form} layout="vertical" onFinish={handleAddCombo}>
                        <Form.Item name="relatedProductId" label="Chọn Phụ kiện" rules={[{ required: true, message: 'Chọn phụ kiện!' }]}>
                            <Select 
                                showSearch 
                                placeholder="Gõ tên phụ kiện để tìm..."
                                optionFilterProp="children"
                                size="large"
                            >
                                {accessories.map(acc => (
                                    <Option key={acc.id} value={acc.id}>
                                        {acc.name} - Giá gốc: {formatPrice(acc.displayPrice)}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                        
                        <div style={{ display: 'flex', gap: 16 }}>
                            <Form.Item name="discountAmount" label="Số tiền giảm (VNĐ)" rules={[{ required: true }]} style={{ flex: 1 }}>
                                <InputNumber 
                                    style={{ width: '100%' }} size="large" min={0} 
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    placeholder="VD: 50000"
                                />
                            </Form.Item>
                            <Form.Item name="note" label="Nhãn hiển thị (Ghi chú)" style={{ flex: 1 }}>
                                <Input placeholder="VD: Tiết kiệm 50K" size="large" />
                            </Form.Item>
                        </div>
                        <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>Thêm vào danh sách</Button>
                    </Form>
                </div>

                <Divider />

                {/* Khu vực 2: Bảng danh sách các phụ kiện đang được kèm */}
                <Title level={5}>Phụ kiện đang áp dụng</Title>
                <Table 
                    columns={comboColumns} 
                    dataSource={combos} 
                    rowKey="id" 
                    loading={comboLoading}
                    pagination={false}
                    size="small"
                />
            </Modal>
        </div>
    );
};

export default ComboManager;
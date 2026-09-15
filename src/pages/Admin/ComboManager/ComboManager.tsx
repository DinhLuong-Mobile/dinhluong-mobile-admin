import React from 'react';
import { 
    Table, Button, Space, Modal, Form, Input, 
    Select, InputNumber, Popconfirm, Card, Typography, Tag, Divider 
} from 'antd';
import { 
    PlusOutlined, DeleteOutlined, SettingOutlined 
} from '@ant-design/icons';
import { useComboManager } from './useComboManager';

const { Title, Text } = Typography;
const { Option } = Select;

const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const ComboManager: React.FC = () => {
    const {
        mainProducts,
        accessories,
        loading,
        isModalOpen,
        selectedMainProduct,
        combos,
        comboLoading,
        form, 
        openComboModal,
        closeModal,
        handleAddCombo,
        handleDeleteCombo
    } = useComboManager();


    const mainColumns = [
        {
            title: 'Sản phẩm chính',
            dataIndex: 'name',
            key: 'name',
            render: (text: string, record: any) => (
                <Space>
                    <img src={record.thumbnailUrl || record.image} alt={text} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} />
                    <div>
                        <Text strong>{text}</Text><br/>
                        <Text type="secondary" style={{ fontSize: 12 }}>{record.sku || `ID: ${record.id}`}</Text>
                    </div>
                </Space>
            )
        },
        { title: 'Giá bán', dataIndex: 'displayPrice', key: 'price', render: (p: number) => formatPrice(p || 0) },
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

    // ================== CẤU HÌNH BẢNG COMBO ==================
    const comboColumns = [
        { 
            title: 'Phụ kiện kèm theo', 
            key: 'accName', 
            render: (_: any, record: any) => {
                const thumbnail = record.relatedProductThumbnail;
                const name = record.relatedProductName;
                return (
                    <Space>
                        {thumbnail ? (
                            <img 
                                src={thumbnail} 
                                alt={name} 
                                style={{ width: 40, height: 40, objectFit: 'contain', border: '1px solid #f0f0f0', borderRadius: 4, background: '#fff' }} 
                            />
                        ) : (
                            <div style={{ width: 40, height: 40, background: '#f0f0f0', borderRadius: 4 }} />
                        )}
                        <Text strong>{name}</Text>
                    </Space>
                );
            }
        },
        { 
            title: 'Giảm giá', 
            dataIndex: 'discountAmount', 
            key: 'discount',
            render: (p: number) => <Tag color="green">-{formatPrice(p || 0)}</Tag>
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
                onCancel={closeModal}
                footer={null} 
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
                                        {acc.name} - Giá gốc: {formatPrice(acc.displayPrice || 0)}
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
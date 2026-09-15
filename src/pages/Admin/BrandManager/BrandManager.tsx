import React, { useState, useEffect } from 'react';
import { 
    Table, Button, Space, Modal, Form, Input, 
    message, Popconfirm, Card, Typography 
} from 'antd';
import { 
    PlusOutlined, EditOutlined, DeleteOutlined 
} from '@ant-design/icons';

const { Title, Text } = Typography;

// Hàm tạo slug tự động
const generateSlug = (str: string) => {
    if (!str) return '';
    return str.toString().toLowerCase()
        .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a")
        .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e")
        .replace(/ì|í|ị|ỉ|ĩ/g, "i")
        .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o")
        .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u")
        .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y")
        .replace(/đ/g, "d")
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
};

const BrandManager: React.FC = () => {
    const [brands, setBrands] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Modal state
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form] = Form.useForm();

    const getAuthToken = () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr).token : '';
    };

    // Hàm gọi API lấy danh sách Brand
    const fetchBrands = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:8080/api/admin/brands', {
                headers: { 'Authorization': `Bearer ${getAuthToken()}` }
            });
            
            if (res.ok) {
                const data = await res.json();
                setBrands(data);
            }
        } catch (error) {
            message.error("Lỗi tải danh sách thương hiệu");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBrands();
    }, []);

    // Mở Modal Thêm mới
    const showAddModal = () => {
        setEditingId(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    // Mở Modal Cập nhật
    const showEditModal = (record: any) => {
        setEditingId(record.id);
        form.setFieldsValue({
            name: record.name,
            slug: record.slug,
            description: record.description,
            thumbnailUrl: record.thumbnailUrl
        });
        setIsModalVisible(true);
    };

    // Tự động generate slug khi gõ tên
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        form.setFieldValue('slug', generateSlug(e.target.value));
    };

    // Xử lý Lưu dữ liệu
    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            const token = getAuthToken();

            const url = editingId 
                ? `http://localhost:8080/api/admin/brands/${editingId}`
                : 'http://localhost:8080/api/admin/brands';
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(values)
            });

            const json = await res.json();
            
            if (res.ok) {
                message.success(editingId ? "Cập nhật thành công!" : "Thêm mới thành công!");
                setIsModalVisible(false);
                fetchBrands(); // Reload lại bảng
            } else {
                message.error(json.message || "Lỗi khi lưu thương hiệu");
            }
        } catch (error) {
            // Lỗi validate form
        }
    };

    // Xử lý Xóa
    const handleDelete = async (id: number) => {
        try {
            const res = await fetch(`http://localhost:8080/api/admin/brands/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${getAuthToken()}` }
            });
            if (res.ok) {
                message.success("Xóa thương hiệu thành công!");
                fetchBrands();
            } else {
                message.error("Không thể xóa (Thương hiệu có thể đang được sử dụng trong Sản phẩm)");
            }
        } catch (error) {
            message.error("Lỗi kết nối mạng");
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: '10%',
        },
        {
            title: 'Tên Thương Hiệu',
            dataIndex: 'name',
            key: 'name',
            width: '35%',
            render: (text: string, record: any) => (
                <Space>
                    {record.thumbnailUrl ? (
                        <img 
                            src={record.thumbnailUrl} 
                            alt={text} 
                            style={{ width: 40, height: 40, objectFit: 'contain', border: '1px solid #f0f0f0', borderRadius: 4, padding: 2, background: '#fff' }} 
                        />
                    ) : (
                        <div style={{ width: 40, height: 40, background: '#f0f0f0', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Text type="secondary" style={{ fontSize: 10 }}>No Img</Text>
                        </div>
                    )}
                    <Text strong>{text}</Text>
                </Space>
            )
        },
        {
            title: 'Đường dẫn (Slug)',
            dataIndex: 'slug',
            key: 'slug',
            width: '30%',
        },
        {
            title: 'Hành động',
            key: 'action',
            width: '25%',
            render: (_: any, record: any) => (
                <Space size="middle">
                    <Button type="primary" ghost icon={<EditOutlined />} onClick={() => showEditModal(record)} size="small">
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Xóa thương hiệu này?"
                        description="Hành động này không thể hoàn tác!"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button danger icon={<DeleteOutlined />} size="small">Xóa</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <Title level={3} style={{ margin: 0 }}>Quản lý Thương hiệu</Title>
                    <Button type="primary" size="large" icon={<PlusOutlined />} onClick={showAddModal}>
                        Thêm Thương hiệu mới
                    </Button>
                </div>

                <Table 
                    columns={columns} 
                    dataSource={brands} 
                    rowKey="id" 
                    loading={loading}
                    pagination={{ pageSize: 10 }} // Phân trang 10 dòng/trang
                    bordered
                />
            </Card>

            {/* MODAL */}
            <Modal 
                title={editingId ? "Cập nhật Thương hiệu" : "Thêm Thương hiệu mới"} 
                open={isModalVisible} 
                onOk={handleModalOk} 
                onCancel={() => setIsModalVisible(false)}
                okText="Lưu thương hiệu"
                cancelText="Hủy"
                destroyOnHidden 
            >
                <Form form={form} layout="vertical">
                    <Form.Item 
                        name="name" 
                        label="Tên thương hiệu" 
                        rules={[{ required: true, message: 'Vui lòng nhập tên thương hiệu!' }]}
                    >
                        <Input placeholder="VD: Apple, Samsung, Xiaomi..." onChange={handleNameChange} />
                    </Form.Item>

                    <Form.Item 
                        name="slug" 
                        label="Đường dẫn (Slug)" 
                        rules={[{ required: true, message: 'Vui lòng nhập slug!' }]}
                    >
                        <Input placeholder="VD: apple" />
                    </Form.Item>

                    <Form.Item name="thumbnailUrl" label="Link Logo / Ảnh đại diện">
                        <Input placeholder="https://..." />
                    </Form.Item>

                    <Form.Item name="description" label="Mô tả">
                        <Input.TextArea rows={3} placeholder="Mô tả ngắn về thương hiệu..." />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default BrandManager;
import React, { useState, useEffect } from 'react';
import { 
    Table, Button, Space, Modal, Form, Input, 
    Select, message, Popconfirm, Tag, Card, Typography 
} from 'antd';
import { 
    PlusOutlined, EditOutlined, DeleteOutlined 
} from '@ant-design/icons';

const { Option } = Select;
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

const CategoryManager: React.FC = () => {
    const [categoriesTree, setCategoriesTree] = useState<any[]>([]); // Dữ liệu hiển thị lên Bảng
    const [flatCategories, setFlatCategories] = useState<any[]>([]); // Dữ liệu nạp vào thẻ Select
    const [loading, setLoading] = useState(false);
    
    // Modal state
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form] = Form.useForm();

    const getAuthToken = () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr).token : '';
    };

    // Hàm chuyển đổi Danh sách phẳng -> Cây lồng nhau
    const buildTree = (data: any[]) => {
        const tree: any[] = [];
        const lookup: any = {};

        // 1. Đưa tất cả vào object lookup và thêm key children
        data.forEach(item => {
            lookup[item.id] = { ...item, children: [] };
        });

        // 2. Gắn con vào cha
        data.forEach(item => {
            if (item.parentId && lookup[item.parentId]) {
                lookup[item.parentId].children.push(lookup[item.id]);
            } else {
                tree.push(lookup[item.id]);
            }
        });

        // 3. Dọn dẹp: Xóa mảng children nếu trống (để Ant Design không hiện nút + vô nghĩa)
        const cleanEmptyChildren = (nodes: any[]) => {
            nodes.forEach(node => {
                if (node.children.length === 0) {
                    delete node.children;
                } else {
                    cleanEmptyChildren(node.children);
                }
            });
        };
        cleanEmptyChildren(tree);

        return tree;
    };

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:8080/api/admin/categories', {
                headers: { 'Authorization': `Bearer ${getAuthToken()}` }
            });
            
            if (res.ok) {
                const flatData = await res.json();
                setFlatCategories(flatData); // Lưu bản phẳng để dùng cho Select
                setCategoriesTree(buildTree(flatData)); // Lưu bản cây để dùng cho Table
            }
        } catch (error) {
            message.error("Lỗi tải danh mục");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // Mở Modal Thêm
    const showAddModal = () => {
        setEditingId(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    // Mở Modal Sửa
    const showEditModal = (record: any) => {
        setEditingId(record.id);
        form.setFieldsValue({
            name: record.name,
            slug: record.slug,
            parentId: record.parentId,
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

            // Tính toán level (Vì Backend ko tự tính)
            let calculatedLevel = 1;
            if (values.parentId) {
                const parent = flatCategories.find(c => c.id === values.parentId);
                if (parent) calculatedLevel = (parent.level || 1) + 1;
            }
            
            const payload = { ...values, level: calculatedLevel };

            const url = editingId 
                ? `http://localhost:8080/api/admin/categories/${editingId}`
                : 'http://localhost:8080/api/admin/categories';
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                message.success(editingId ? "Cập nhật thành công!" : "Thêm thành công!");
                setIsModalVisible(false);
                fetchCategories();
            } else {
                message.error("Lỗi khi lưu danh mục");
            }
        } catch (error) {
            // Validate form failed
        }
    };

    // Xử lý Xóa
    const handleDelete = async (id: number) => {
        try {
            const res = await fetch(`http://localhost:8080/api/admin/categories/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${getAuthToken()}` }
            });
            if (res.ok) {
                message.success("Xóa danh mục thành công!");
                fetchCategories();
            } else {
                message.error("Không thể xóa (Danh mục có thể đang chứa dữ liệu con)");
            }
        } catch (error) {
            message.error("Lỗi kết nối");
        }
    };

    const columns = [
        {
            title: 'Tên Danh mục',
            dataIndex: 'name',
            key: 'name',
            width: '30%',
            render: (text: string, record: any) => (
                <Space>
                    {record.thumbnailUrl && <img src={record.thumbnailUrl} alt={text} style={{ width: 30, height: 30, objectFit: 'cover', borderRadius: 4 }} />}
                    <Text strong={record.level === 1}>{text}</Text>
                </Space>
            )
        },
        {
            title: 'Slug',
            dataIndex: 'slug',
            key: 'slug',
            width: '25%',
        },
        {
            title: 'Cấp độ',
            dataIndex: 'level',
            key: 'level',
            width: '15%',
            render: (level: number) => (
                <Tag color={level === 1 ? 'blue' : level === 2 ? 'cyan' : 'default'}>
                    Cấp {level || 1}
                </Tag>
            )
        },
        {
            title: 'Hành động',
            key: 'action',
            width: '20%',
            render: (_: any, record: any) => (
                <Space size="middle">
                    <Button type="primary" ghost icon={<EditOutlined />} onClick={() => showEditModal(record)} size="small">
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Xóa danh mục này?"
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
                    <Title level={3} style={{ margin: 0 }}>Quản lý Danh mục</Title>
                    <Button type="primary" size="large" icon={<PlusOutlined />} onClick={showAddModal}>
                        Thêm Danh mục mới
                    </Button>
                </div>

                <Table 
                    columns={columns} 
                    dataSource={categoriesTree} // Dùng mảng Tree
                    rowKey="id" 
                    loading={loading}
                    pagination={false} 
                    bordered
                />
            </Card>

            {/* MODAL */}
            <Modal 
                title={editingId ? "Cập nhật Danh mục" : "Thêm Danh mục mới"} 
                open={isModalVisible} 
                onOk={handleModalOk} 
                onCancel={() => setIsModalVisible(false)}
                okText="Lưu danh mục"
                cancelText="Hủy"
                destroyOnClose
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="name" label="Tên danh mục" rules={[{ required: true, message: 'Nhập tên!' }]}>
                        <Input placeholder="VD: Điện thoại" onChange={handleNameChange} />
                    </Form.Item>

                    <Form.Item name="slug" label="Đường dẫn (Slug)" rules={[{ required: true, message: 'Nhập slug!' }]}>
                        <Input placeholder="VD: dien-thoai" />
                    </Form.Item>

                    <Form.Item name="parentId" label="Thuộc danh mục cha">
                        <Select placeholder="-- Là danh mục gốc (Không chọn) --" allowClear>
                            {flatCategories
                                .filter(c => c.id !== editingId) // Chống lỗi nhận chính mình làm cha
                                .map(c => (
                                    <Option key={c.id} value={c.id}>
                                        {/* Vẽ các khoảng trắng để thụt lề trực quan trong ô Select */}
                                        {'\u00A0\u00A0\u00A0\u00A0'.repeat((c.level || 1) - 1)}
                                        {c.level > 1 ? '↳ ' : ''}{c.name}
                                    </Option>
                                ))
                            }
                        </Select>
                    </Form.Item>

                    <Form.Item name="thumbnailUrl" label="Link Ảnh đại diện">
                        <Input placeholder="https://..." />
                    </Form.Item>

                    <Form.Item name="description" label="Mô tả">
                        <Input.TextArea rows={3} placeholder="Mô tả ngắn..." />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default CategoryManager;
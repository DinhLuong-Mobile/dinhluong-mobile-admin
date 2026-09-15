import React, { useEffect } from 'react';
import { 
    Table, Button, Space, Modal, Form, Input, 
    Select, Popconfirm, Tag, Card, Typography 
} from 'antd';
import { 
    PlusOutlined, EditOutlined, DeleteOutlined 
} from '@ant-design/icons';

import { useCategoryManager } from './useCategoryManager';
import type { Category } from '../../../types/category.types';

const { Option } = Select;
const { Title, Text } = Typography;

const CategoryManager: React.FC = () => {
    const {
        categoriesTree,
        flatCategories,
        loading,
        isModalVisible,
        setIsModalVisible,
        editingId,
        form,
        fetchCategories,
        showAddModal,
        showEditModal,
        handleNameChange,
        handleModalOk,
        handleDelete
    } = useCategoryManager();

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const columns = [
        {
            title: 'Tên Danh mục',
            dataIndex: 'name',
            key: 'name',
            width: '30%',
            render: (text: string, record: Category) => (
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
            render: (_: any, record: Category) => (
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
                    dataSource={categoriesTree} 
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
                destroyOnHidden
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
                                .filter(c => c.id !== editingId)
                                .map(c => (
                                    <Option key={c.id} value={c.id}>
                                        {'\u00A0\u00A0\u00A0\u00A0'.repeat((c.level || 1) - 1)}
                                        {c.level! > 1 ? '↳ ' : ''}{c.name}
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
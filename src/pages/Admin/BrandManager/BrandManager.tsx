import React, { useEffect } from 'react';
import {
    Table, Button, Space, Modal, Form, Input,
    Card, Typography
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined
} from '@ant-design/icons';
import Popconfirm from 'antd/es/popconfirm';

import { useBrandManager } from './useBrandManager';
import type { Brand } from '../../../types/brand.types';

const { Title, Text } = Typography;

const BrandManager: React.FC = () => {
    const {
        brands,
        loading,
        isModalVisible,
        setIsModalVisible,
        editingId,
        form,
        fetchBrands,
        showAddModal,
        showEditModal,
        handleNameChange,
        handleModalOk,
        handleDelete
    } = useBrandManager();

    useEffect(() => {
        fetchBrands();
    }, [fetchBrands]);

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
            render: (text: string, record: Brand) => (
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
            render: (_: any, record: Brand) => (
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
                    pagination={{ pageSize: 10 }}
                    bordered
                />
            </Card>

            {/* MODAL */}
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
                {/* 🌟 Thêm prop form={form} vào đây để kết nối */}
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
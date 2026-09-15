import React, { useEffect } from 'react';
import { 
    Table, Button, Space, Modal, Form, Input, 
    InputNumber, Select, Popconfirm, Card, Typography, Tag 
} from 'antd';
import { 
    PlusOutlined, EditOutlined, DeleteOutlined, UnorderedListOutlined 
} from '@ant-design/icons';

import { useSpecManager } from './useSpecManager';
import type { SpecGroup, SpecAttribute } from '../../../types/spec.types';

const { Title, Text } = Typography;
const { Option } = Select;

const SpecManager: React.FC = () => {
    const {
        groups,
        loading,
        fetchSpecGroups,
        isGroupModalOpen,
        setIsGroupModalOpen,
        editingGroup,
        groupForm,
        openGroupModal,
        handleGroupSubmit,
        deleteGroup,
        isAttrModalOpen,
        setIsAttrModalOpen,
        editingAttr,
        attrForm,
        openAttrModal,
        handleAttrSubmit,
        deleteAttr
    } = useSpecManager();

    useEffect(() => {
        fetchSpecGroups();
    }, [fetchSpecGroups]);

    // ================= TABLES SETUP =================
    const groupColumns = [
        { title: 'Tên Nhóm', dataIndex: 'name', key: 'name', render: (t: string) => <Text strong>{t}</Text> },
        { title: 'Thứ tự (Sort)', dataIndex: 'sortOrder', key: 'sortOrder', width: 150 },
        {
            title: 'Hành động', key: 'action', width: 300,
            render: (_: any, record: SpecGroup) => (
                <Space>
                    <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={() => openAttrModal(record.id)}>
                        Thêm Thuộc tính
                    </Button>
                    <Button type="primary" ghost size="small" icon={<EditOutlined />} onClick={() => openGroupModal(record)}>
                        Sửa
                    </Button>
                    <Popconfirm title="Xóa Nhóm này sẽ xóa luôn các Thuộc tính bên trong. Chắc chắn?" onConfirm={() => deleteGroup(record.id)} okText="Xóa" cancelText="Hủy">
                        <Button danger size="small" icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    const expandedRowRender = (record: SpecGroup) => {
        const attrColumns = [
            { title: 'Tên Thuộc tính (Attribute)', dataIndex: 'name', key: 'name' },
            { 
                title: 'Kiểu dữ liệu', dataIndex: 'dataType', key: 'dataType', width: 150,
                render: (type: string) => <Tag color="blue">{type || 'STRING'}</Tag> 
            },
            { title: 'Thứ tự', dataIndex: 'sortOrder', key: 'sortOrder', width: 100 },
            {
                title: 'Hành động', key: 'action', width: 150,
                render: (_: any, attr: SpecAttribute) => (
                    <Space size="middle">
                        <Button type="link" onClick={() => openAttrModal(record.id, attr)}>Sửa</Button>
                        <Popconfirm title="Xóa thuộc tính này?" onConfirm={() => deleteAttr(attr.id)} okText="Xóa" cancelText="Hủy">
                            <Button type="link" danger>Xóa</Button>
                        </Popconfirm>
                    </Space>
                )
            }
        ];

        const sortedAttributes = [...(record.attributes || [])].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

        return (
            <Table 
                columns={attrColumns} 
                dataSource={sortedAttributes} 
                rowKey="id" 
                pagination={false} 
                size="small"
                style={{ margin: '10px 20px 10px 50px', border: '1px dashed #d9d9d9' }}
            />
        );
    };

    return (
        <div style={{ padding: 24 }}>
            <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <Title level={3} style={{ margin: 0 }}>
                        <UnorderedListOutlined style={{ marginRight: 8 }} />
                        Cấu hình Thuộc tính Cơ sở (EAV)
                    </Title>
                    <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => openGroupModal()}>
                        Thêm Nhóm Thông Số
                    </Button>
                </div>

                <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                    Định nghĩa các nhóm và thuộc tính tĩnh (VD: RAM, ROM, Pin) để làm bộ lọc tìm kiếm cho Sản phẩm chính.
                </Text>

                <Table 
                    columns={groupColumns} 
                    dataSource={groups} 
                    rowKey="id" 
                    loading={loading}
                    pagination={false}
                    expandable={{ expandedRowRender, defaultExpandAllRows: true }}
                    bordered
                />
            </Card>

            {/* MODAL 1: NHÓM THÔNG SỐ (GROUP) */}
            <Modal 
                title={editingGroup ? "Cập nhật Nhóm Thông Số" : "Thêm Nhóm Thông Số Mới"} 
                open={isGroupModalOpen} 
                onOk={handleGroupSubmit} 
                onCancel={() => setIsGroupModalOpen(false)}
                destroyOnHidden
            >
                <Form form={groupForm} layout="vertical">
                    <Form.Item name="name" label="Tên Nhóm" rules={[{ required: true, message: 'Nhập tên nhóm!' }]}>
                        <Input placeholder="VD: Màn hình, Bộ nhớ & Lưu trữ..." />
                    </Form.Item>
                    <Form.Item name="sortOrder" label="Thứ tự hiển thị (Sort Order)" rules={[{ required: true }]}>
                        <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </Modal>

            {/* MODAL 2: THUỘC TÍNH (ATTRIBUTE) */}
            <Modal 
                title={editingAttr ? "Cập nhật Thuộc tính" : "Thêm Thuộc tính mới"} 
                open={isAttrModalOpen} 
                onOk={handleAttrSubmit} 
                onCancel={() => setIsAttrModalOpen(false)}
                destroyOnHidden
            >
                <Form form={attrForm} layout="vertical">
                    <Form.Item name="name" label="Tên Thuộc tính" rules={[{ required: true, message: 'Nhập tên thuộc tính!' }]}>
                        <Input placeholder="VD: Kích thước màn hình, Dung lượng RAM..." />
                    </Form.Item>
                    <Form.Item name="dataType" label="Kiểu dữ liệu" rules={[{ required: true }]}>
                        <Select>
                            <Option value="TEXT">Văn bản (String)</Option>
                            <Option value="NUMBER">Số (Number)</Option>
                            <Option value="BOOLEAN">Có/Không (Boolean)</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="sortOrder" label="Thứ tự hiển thị (Sort Order)" rules={[{ required: true }]}>
                        <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default SpecManager;
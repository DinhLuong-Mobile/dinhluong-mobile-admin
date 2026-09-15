import React, { useState, useEffect } from 'react';
import { 
    Table, Button, Space, Modal, Form, Input, 
    InputNumber, Select, message, Popconfirm, Card, Typography, Tag 
} from 'antd';
import { 
    PlusOutlined, EditOutlined, DeleteOutlined, UnorderedListOutlined 
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const SpecManager: React.FC = () => {
    const [groups, setGroups] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    
    // States cho Nhóm (Group)
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<any | null>(null);
    const [groupForm] = Form.useForm();

    // States cho Thuộc tính (Attribute)
    const [isAttrModalOpen, setIsAttrModalOpen] = useState(false);
    const [editingAttr, setEditingAttr] = useState<any | null>(null);
    const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
    const [attrForm] = Form.useForm();

    const getAuthToken = () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr).token : '';
    };

    // 1. FETCH DATA
    const fetchSpecGroups = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:8080/api/admin/spec-groups', {
                headers: { 'Authorization': `Bearer ${getAuthToken()}` }
            });
            if (res.ok) {
                const data = await res.json();
                // Sắp xếp nhóm theo sortOrder
                const sortedData = data.sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));
                setGroups(sortedData);
            }
        } catch (error) {
            message.error("Lỗi tải danh sách nhóm thông số");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSpecGroups();
    }, []);

    // ==========================================
    // 2. XỬ LÝ NHÓM (SPEC GROUP)
    // ==========================================
    const openGroupModal = (record?: any) => {
        if (record) {
            setEditingGroup(record);
            groupForm.setFieldsValue(record);
        } else {
            setEditingGroup(null);
            groupForm.resetFields();
            // Gợi ý sortOrder tiếp theo
            const nextSort = groups.length > 0 ? Math.max(...groups.map(g => g.sortOrder || 0)) + 1 : 1;
            groupForm.setFieldValue('sortOrder', nextSort);
        }
        setIsGroupModalOpen(true);
    };

    const handleGroupSubmit = async () => {
        try {
            const values = await groupForm.validateFields();
            const url = editingGroup 
                ? `http://localhost:8080/api/admin/spec-groups/${editingGroup.id}`
                : 'http://localhost:8080/api/admin/spec-groups';
            const method = editingGroup ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Authorization': `Bearer ${getAuthToken()}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(values)
            });

            if (res.ok) {
                message.success(editingGroup ? "Cập nhật Nhóm thành công!" : "Thêm Nhóm thành công!");
                setIsGroupModalOpen(false);
                fetchSpecGroups();
            } else {
                message.error("Lỗi khi lưu Nhóm");
            }
        } catch (error) {}
    };

    const deleteGroup = async (id: number) => {
        try {
            const res = await fetch(`http://localhost:8080/api/admin/spec-groups/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${getAuthToken()}` }
            });
            if (res.ok) {
                message.success("Đã xóa Nhóm");
                fetchSpecGroups();
            } else {
                message.error("Không thể xóa (Nhóm có thể đang được sử dụng)");
            }
        } catch (error) {}
    };

    // ==========================================
    // 3. XỬ LÝ THUỘC TÍNH (SPEC ATTRIBUTE)
    // ==========================================
    const openAttrModal = (groupId: number, record?: any) => {
        setSelectedGroupId(groupId);
        if (record) {
            setEditingAttr(record);
            attrForm.setFieldsValue(record);
        } else {
            setEditingAttr(null);
            attrForm.resetFields();
            
            // Tìm group hiện tại để gợi ý sortOrder cho thuộc tính mới
            const currentGroup = groups.find(g => g.id === groupId);
            const nextSort = (currentGroup?.attributes?.length || 0) > 0 
                ? Math.max(...currentGroup.attributes.map((a: any) => a.sortOrder || 0)) + 1 
                : 1;
                
            attrForm.setFieldsValue({ sortOrder: nextSort, dataType: 'STRING' });
        }
        setIsAttrModalOpen(true);
    };

    const handleAttrSubmit = async () => {
        try {
            const values = await attrForm.validateFields();
            // Gắn groupId vào payload
            const payload = { ...values, groupId: selectedGroupId };

            const url = editingAttr 
                ? `http://localhost:8080/api/admin/spec-attributes/${editingAttr.id}`
                : 'http://localhost:8080/api/admin/spec-attributes';
            const method = editingAttr ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Authorization': `Bearer ${getAuthToken()}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                message.success(editingAttr ? "Cập nhật Thuộc tính thành công!" : "Thêm Thuộc tính thành công!");
                setIsAttrModalOpen(false);
                fetchSpecGroups();
            } else {
                message.error("Lỗi khi lưu Thuộc tính");
            }
        } catch (error) {}
    };

    const deleteAttr = async (id: number) => {
        try {
            const res = await fetch(`http://localhost:8080/api/admin/spec-attributes/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${getAuthToken()}` }
            });
            if (res.ok) {
                message.success("Đã xóa Thuộc tính");
                fetchSpecGroups();
            } else {
                message.error("Không thể xóa (Đang được dùng trong sản phẩm)");
            }
        } catch (error) {}
    };

    // ==========================================
    // 4. CẤU HÌNH BẢNG (TABLE COLUMNS)
    // ==========================================
    const groupColumns = [
        { title: 'Tên Nhóm', dataIndex: 'name', key: 'name', render: (t: string) => <Text strong>{t}</Text> },
        { title: 'Thứ tự (Sort)', dataIndex: 'sortOrder', key: 'sortOrder', width: 150 },
        {
            title: 'Hành động', key: 'action', width: 300,
            render: (_: any, record: any) => (
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

    // Bảng con: Hiển thị các Attribute của 1 Group
    const expandedRowRender = (record: any) => {
        const attrColumns = [
            { title: 'Tên Thuộc tính (Attribute)', dataIndex: 'name', key: 'name' },
            { 
                title: 'Kiểu dữ liệu', dataIndex: 'dataType', key: 'dataType', width: 150,
                render: (type: string) => <Tag color="blue">{type || 'STRING'}</Tag> 
            },
            { title: 'Thứ tự', dataIndex: 'sortOrder', key: 'sortOrder', width: 100 },
            {
                title: 'Hành động', key: 'action', width: 150,
                render: (_: any, attr: any) => (
                    <Space size="middle">
                        <Button type="link" onClick={() => openAttrModal(record.id, attr)}>Sửa</Button>
                        <Popconfirm title="Xóa thuộc tính này?" onConfirm={() => deleteAttr(attr.id)} okText="Xóa" cancelText="Hủy">
                            <Button type="link" danger>Xóa</Button>
                        </Popconfirm>
                    </Space>
                )
            }
        ];

        // Sắp xếp thuộc tính theo sortOrder trước khi render
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
                    expandable={{ expandedRowRender, defaultExpandAllRows: true }} // Mặc định mở rộng tất cả
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
                            <Option value="STRING">Văn bản (String)</Option>
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
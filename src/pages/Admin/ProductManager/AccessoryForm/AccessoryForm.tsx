import React from 'react';
import { 
    Form, Input, InputNumber, Select, Button, Card, 
    Space, Divider, Row, Col, Typography, Spin, Upload 
} from 'antd';
import { 
    PlusOutlined, MinusCircleOutlined, SaveOutlined, 
    ArrowLeftOutlined, RobotOutlined 
} from '@ant-design/icons';
import { useAccessoryForm } from './useAccessoryForm';
import { normFile } from '../../../../utils/helpers';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const AccessoryForm: React.FC = () => {
    const {
        form, isEdit, loading, submitting, navigate,
        brands, categories, generatingAI, extractingAI,
        rawSpecText, setRawSpecText,
        handleAiGenerateDescription, handleAiExtractSpecs, onFinish
    } = useAccessoryForm();

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <Spin spinning={loading} tip="Đang tải dữ liệu...">
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    {/* Ẩn URL ảnh cũ đi */}
                    <Form.Item name="thumbnailUrl" hidden><Input /></Form.Item>

                    {/* HEADER */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <Space>
                            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/accessories')}>Trở về</Button>
                            <Title level={4} style={{ margin: 0 }}>
                                {isEdit ? "Cập nhật Phụ Kiện" : "Thêm mới Phụ Kiện"}
                            </Title>
                        </Space>
                        <Button type="primary" size="large" icon={<SaveOutlined />} htmlType="submit" loading={submitting}>
                            Lưu Phụ Kiện
                        </Button>
                    </div>

                    <Row gutter={24}>
                        {/* CỘT TRÁI (16 phần) */}
                        <Col span={16}>
                            {/* Card 1: Thông tin cơ bản */}
                            <Card title="Thông tin cơ bản" bordered={false} style={{ marginBottom: 24 }}>
                                <Form.Item name="name" label="Tên phụ kiện" rules={[{ required: true, message: 'Vui lòng nhập tên phụ kiện!' }]}>
                                    <Input size="large" placeholder="Ví dụ: Sạc nhanh Apple 20W" />
                                </Form.Item>

                                <Form.Item 
                                    name="thumbnail" label="Ảnh đại diện" 
                                    valuePropName="fileList" getValueFromEvent={normFile}
                                    rules={[{ required: true, message: 'Vui lòng chọn ảnh đại diện!' }]}
                                >
                                    <Upload listType="picture-card" maxCount={1} beforeUpload={() => false} accept="image/*">
                                        <div><PlusOutlined /><div style={{ marginTop: 8 }}>Chọn ảnh</div></div>
                                    </Upload>
                                </Form.Item>

                                <Divider />

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                    <Text strong>Bài viết giới thiệu sản phẩm</Text>
                                    <Button 
                                        type="primary" ghost icon={<RobotOutlined />} 
                                        loading={generatingAI} onClick={handleAiGenerateDescription}
                                        style={{ borderRadius: '20px' }}
                                    > 
                                        ✨ Viết bằng AI 
                                    </Button>
                                </div>
                                <Form.Item name="description">
                                    <TextArea rows={12} placeholder="Nhập bài viết giới thiệu hoặc sử dụng AI để tự động tạo nội dung..." />
                                </Form.Item>
                            </Card>

                            {/* Card 2: Thông số kỹ thuật (Spec) */}
                            <Card title="Thông số kỹ thuật (Không bắt buộc)" bordered={false} style={{ marginBottom: 24 }}>
                                <div style={{ background: '#f0f5ff', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px dashed #adc6ff' }}>
                                    <Text strong><RobotOutlined /> AI Trích xuất thông số:</Text>
                                    <Space.Compact style={{ width: '100%', marginTop: '10px' }}>
                                        <TextArea 
                                            placeholder="Dán thông số từ web hãng vào đây (Ví dụ: Cổng ra USB-C, Công suất 20W...)" 
                                            rows={2} 
                                            value={rawSpecText}
                                            onChange={e => setRawSpecText(e.target.value)}
                                        />
                                        <Button type="primary" onClick={handleAiExtractSpecs} loading={extractingAI} style={{ height: 'auto' }}>
                                            Bóc tách
                                        </Button>
                                    </Space.Compact>
                                </div>

                                <Form.List name="specificationsJson">
                                    {(groupFields, { add: addGroup, remove: removeGroup }) => (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            {groupFields.map((groupField) => (
                                                <Card 
                                                    size="small" key={groupField.key} style={{ border: '1px solid #f0f0f0' }}
                                                    title={
                                                        <Form.Item {...groupField} name={[groupField.name, 'title']} style={{ margin: 0 }}>
                                                            <Input placeholder="Tên nhóm (VD: Kích thước & Trọng lượng)" style={{ width: 300 }} />
                                                        </Form.Item>
                                                    }
                                                    extra={<Button danger type="text" icon={<MinusCircleOutlined />} onClick={() => removeGroup(groupField.name)}>Xóa nhóm</Button>}
                                                >
                                                    <Form.List name={[groupField.name, 'items']}>
                                                        {(itemFields, { add: addItem, remove: removeItem }) => (
                                                            <>
                                                                {itemFields.map((itemField) => (
                                                                    <Space key={itemField.key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                                                        <Form.Item {...itemField} name={[itemField.name, 'label']}>
                                                                            <Input placeholder="Tên thông số (VD: Chiều dài)" style={{ width: 220 }} />
                                                                        </Form.Item>
                                                                        <Form.Item {...itemField} name={[itemField.name, 'value']}>
                                                                            <Input placeholder="Giá trị (VD: 1.2m)" style={{ width: 320 }} />
                                                                        </Form.Item>
                                                                        <MinusCircleOutlined onClick={() => removeItem(itemField.name)} style={{ color: '#ff4d4f', fontSize: '18px', cursor: 'pointer' }} />
                                                                    </Space>
                                                                ))}
                                                                <Button type="dashed" onClick={() => addItem()} block icon={<PlusOutlined />}>Thêm dòng thông số</Button>
                                                            </>
                                                        )}
                                                    </Form.List>
                                                </Card>
                                            ))}
                                            <Button type="primary" ghost onClick={() => addGroup()} block icon={<PlusOutlined />} size="large">
                                                + THÊM NHÓM THÔNG SỐ MỚI
                                            </Button>
                                        </div>
                                    )}
                                </Form.List>
                            </Card>
                        </Col>

                        {/* CỘT PHẢI (8 phần) */}
                        <Col span={8}>
                            {/* Card Giá & Kho */}
                            <Card title="Giá & Kho hàng" bordered={false} style={{ marginBottom: 24 }}>
                                <Form.Item name="originalPrice" label="Giá gốc (VNĐ)" rules={[{ required: true, message: 'Bắt buộc!' }]}>
                                    <InputNumber min={0} style={{ width: '100%' }} size="large" formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                                </Form.Item>

                                <Form.Item name="displayPrice" label="Giá bán khuyến mãi (VNĐ)" rules={[{ required: true, message: 'Bắt buộc!' }]}>
                                    <InputNumber min={0} style={{ width: '100%' }} size="large" formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                                </Form.Item>

                                <Form.Item name="stockQuantity" label="Số lượng tồn kho" rules={[{ required: true, message: 'Bắt buộc!' }]}>
                                    <InputNumber min={0} style={{ width: '100%' }} size="large" placeholder="0" />
                                </Form.Item>

                                <Form.Item name="sku" label={isEdit ? "Mã SKU (Không được sửa)" : "Mã SKU"}>
                                    <Input disabled={isEdit} placeholder="Để trống hệ thống tự tạo mã" style={isEdit ? { backgroundColor: '#f5f5f5', color: '#555' } : {}} />
                                </Form.Item>
                            </Card>

                            {/* Card Phân loại */}
                            <Card title="Phân loại" bordered={false} style={{ marginBottom: 24 }}>
                                <Form.Item name="categoryId" label="Danh mục phụ kiện" rules={[{ required: true, message: 'Bắt buộc chọn danh mục!' }]}>
                                    <Select placeholder="-- Chọn danh mục --" size="large">
                                        {categories.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
                                    </Select>
                                </Form.Item>

                                <Form.Item name="brandId" label="Thương hiệu" rules={[{ required: true, message: 'Bắt buộc chọn thương hiệu!' }]}>
                                    <Select placeholder="-- Chọn hãng --" size="large">
                                        {brands.map(b => <Option key={b.id} value={b.id}>{b.name}</Option>)}
                                    </Select>
                                </Form.Item>
                            </Card>

                            {/* Card SEO */}
                            <Card title="Cấu hình SEO" bordered={false}>
                                <Form.Item name="metaTitle" label="Meta Title">
                                    <Input placeholder="Tiêu đề SEO..." />
                                </Form.Item>
                                
                                <Form.Item name="metaDescription" label="Meta Description">
                                    <TextArea rows={3} placeholder="Mô tả SEO..." />
                                </Form.Item>
                            </Card>
                        </Col>
                    </Row>
                </Form>
            </Spin>
        </div>
    );
};

export default AccessoryForm;
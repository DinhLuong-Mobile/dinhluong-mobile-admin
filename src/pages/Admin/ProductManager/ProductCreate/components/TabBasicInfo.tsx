// src/pages/Admin/ProductManager/ProductCreate/Tabs/TabBasicInfo.tsx
import React from 'react';
import { Form, Input, InputNumber, Select, Switch, Row, Col, Typography, Divider, Space, Button } from 'antd';
import { RobotOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

interface TabBasicInfoProps {
    categories: any[];
    brands: any[];
    handleGenerateAIContent: () => void;
    generatingAI: boolean;
}

const TabBasicInfo: React.FC<TabBasicInfoProps> = ({ categories, brands, handleGenerateAIContent, generatingAI }) => {
    return (
        <Space direction="vertical" size="middle" style={{ display: 'flex', width: '100%' }}>
            <Divider orientation="left" style={{ marginTop: 0 }}>Thông tin cơ bản</Divider>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item 
                        name="name" label="Tên sản phẩm" validateTrigger={['onChange', 'onBlur']}
                        rules={[ 
                            { required: true, message: 'Vui lòng nhập tên sản phẩm!' }, 
                            { whitespace: true, message: 'Tên sản phẩm không được chỉ chứa khoảng trắng!' } 
                        ]}
                    >
                        <Input />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="slug" label="Đường dẫn (Slug)" extra="Để trống hệ thống sẽ tự tạo">
                        <Input />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={8}>
                    <Form.Item name="productType" label="Loại sản phẩm" initialValue="MAIN">
                        <Select>
                            <Option value="MAIN">Sản phẩm chính</Option>
                            <Option value="ACCESSORY">Phụ kiện</Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item name="categoryId" label="Danh mục" rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}>
                        <Select allowClear>
                            {categories.map(cat => <Option key={cat.id} value={cat.id}>{cat.name}</Option>)}
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item name="brandId" label="Thương hiệu" rules={[{ required: true, message: 'Vui lòng chọn thương hiệu' }]}>
                        <Select allowClear>
                            {brands.map(brand => <Option key={brand.id} value={brand.id}>{brand.name}</Option>)}
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={8}>
                    <Form.Item 
                        name="displayPrice" label="Giá bán (VNĐ)" validateTrigger={['onChange', 'onBlur']} 
                        rules={[
                            { required: true, message: 'Vui lòng nhập giá bán!' },
                            () => ({
                                validator(_, value) {
                                    if (value === undefined || value === null) return Promise.resolve();
                                    if (value < 0) return Promise.reject(new Error('Giá bán không được nhỏ hơn 0!'));
                                    return Promise.resolve();
                                }
                            })
                        ]}
                    >
                        <InputNumber style={{ width: '100%' }} min={0} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item 
                        name="originalPrice" label="Giá niêm yết (VNĐ)" dependencies={['displayPrice']} validateTrigger={['onChange', 'onBlur']}
                        rules={[
                            { required: true, message: 'Vui lòng nhập giá niêm yết!' }, 
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (value === undefined || value === null) return Promise.resolve();
                                    const displayPrice = getFieldValue('displayPrice');
                                    if (displayPrice !== undefined && displayPrice !== null && value < displayPrice) {
                                        return Promise.reject(new Error('Giá niêm yết không được nhỏ hơn giá bán!'));
                                    }
                                    return Promise.resolve();
                                },
                            }),
                        ]}
                    >
                        <InputNumber style={{ width: '100%' }} min={0} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                    </Form.Item>
               </Col>
                <Col span={8}>
                    <Form.Item name="status" label="Trạng thái" initialValue="ACTIVE">
                        <Select>
                            <Option value="ACTIVE">Đang bán</Option>
                            <Option value="INACTIVE">Ẩn</Option>
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            <Divider orientation="left">Thông số vật lý (Phục vụ bộ lọc & Tự động Build JSON)</Divider>
            <Row gutter={16}>
                <Col span={6}>
                    <Form.Item name="osType" label="Hệ điều hành">
                        <Select placeholder="Chọn HĐH" allowClear>
                            <Option value="IOS">iOS</Option>
                            <Option value="ANDROID">Android</Option>
                            <Option value="WINDOWS">Windows</Option>
                            <Option value="OTHER">Khác</Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={6}><Form.Item name="screenSize" label="Cỡ màn (inch)"><InputNumber step={0.1} style={{ width: '100%' }} placeholder="6.7" /></Form.Item></Col>
                <Col span={6}><Form.Item name="refreshRate" label="Tần số quét (Hz)"><InputNumber style={{ width: '100%' }} placeholder="120" /></Form.Item></Col>
                <Col span={6}><Form.Item name="batteryCapacity" label="Pin (mAh)"><InputNumber style={{ width: '100%' }} placeholder="5000" /></Form.Item></Col>
            </Row>
            <Row gutter={16}>
                <Col span={12}><Form.Item name="screenResolutionType" label="Loại độ phân giải"><Input placeholder="VD: Full HD+, 2K+" /></Form.Item></Col>
                <Col span={12}><Form.Item name="support5g" label="Hỗ trợ mạng 5G" valuePropName="checked" initialValue={false}><Switch checkedChildren="Có" unCheckedChildren="Không" /></Form.Item></Col>
            </Row>

            <Divider orientation="left">Ghi chú & Tính năng nổi bật</Divider>
            <Row gutter={16}>
                <Col span={12}><Form.Item name="installmentText" label="Ghi chú trả góp"><Input placeholder="VD: Trả góp 0% qua thẻ tín dụng" /></Form.Item></Col>
                <Col span={12}><Form.Item name="specialFeatures" label="Tính năng đặc biệt"><Input placeholder="VD: Kháng nước IP68, Sạc nhanh 67W" /></Form.Item></Col>
            </Row>
            <Form.Item name="highlightFeatures" label="Đặc điểm nổi bật (Văn bản ngắn)"><TextArea rows={2} /></Form.Item>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', marginTop: '16px' }}>
                <Text strong>Mô tả sản phẩm (Bài viết chi tiết chuẩn HTML)</Text>
                <Button 
                    type="primary" icon={<RobotOutlined />} onClick={handleGenerateAIContent} loading={generatingAI}
                    style={{ background: '#722ed1', borderColor: '#722ed1', borderRadius: '6px' }}
                >
                    ✨ Viết bài & Bồi ảnh bằng AI
                </Button>
            </div>
            <Form.Item name="description" style={{ marginTop: 0 }}>
                <TextArea rows={12} placeholder="Nội dung HTML mô tả sản phẩm sẽ hiển thị ở đây..." />
            </Form.Item>
        </Space>
    );
};

export default TabBasicInfo;
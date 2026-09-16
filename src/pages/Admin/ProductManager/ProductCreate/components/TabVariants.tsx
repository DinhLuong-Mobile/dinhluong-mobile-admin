// src/pages/Admin/ProductManager/ProductCreate/Tabs/TabVariants.tsx
import React from 'react';
import { Form, Input, InputNumber, Switch, Row, Col, Card, Button, Image, Upload, FormInstance, Typography } from 'antd';
import { PlusOutlined, MinusCircleOutlined, UploadOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface TabVariantsProps {
    form: FormInstance;
    handleInlineUpload: (file: File, onSuccess: any, onError: any, fieldPath: (string | number)[]) => void;
}

const TabVariants: React.FC<TabVariantsProps> = ({ form, handleInlineUpload }) => {
    return (
        <Form.List name="variants">
            {(fields, { add, remove }) => (
                <>
                    {fields.map(({ key, name, ...restField }) => (
                        <Card 
                            size="small" key={key} 
                            style={{ marginBottom: 16, background: '#fafafa' }} 
                            extra={<MinusCircleOutlined onClick={() => remove(name)} style={{ color: 'red', fontSize: '18px', cursor: 'pointer' }} />} 
                            title={`Phiên bản #${name + 1}`}
                        >
                            {/* --- QUAN TRỌNG: TRƯỜNG ID ẨN GIÚP BACKEND NHẬN DIỆN UPDATE --- */}
                            <Form.Item {...restField} name={[name, 'id']} style={{ display: 'none' }}>
                                <Input />
                            </Form.Item>
                            
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item {...restField} name={[name, 'sku']} label="Mã SKU" rules={[{ required: true, message: 'Vui lòng nhập SKU' }]}>
                                        <Input />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="Ảnh phiên bản">
                                        <Form.Item {...restField} name={[name, 'imageUrl']} hidden><Input /></Form.Item>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <Form.Item shouldUpdate={(prev, curr) => prev.variants?.[name]?.imageUrl !== curr.variants?.[name]?.imageUrl} noStyle>
                                                {({ getFieldValue }) => {
                                                    const url = getFieldValue(['variants', name, 'imageUrl']);
                                                    return url ? (
                                                        <Image src={url} width={60} height={60} style={{ objectFit: 'cover', borderRadius: 6, border: '1px solid #d9d9d9' }} />
                                                    ) : (
                                                        <div style={{ width: 60, height: 60, borderRadius: 6, border: '1px dashed #d9d9d9', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa' }}>
                                                            <Text type="secondary" style={{ fontSize: 12 }}>Trống</Text>
                                                        </div>
                                                    );
                                                }}
                                            </Form.Item>
                                            <Upload 
                                                showUploadList={false} accept="image/*" 
                                                customRequest={({ file, onSuccess, onError }) => handleInlineUpload(file as File, onSuccess, onError, ['variants', name, 'imageUrl'])}
                                            >
                                                <Button icon={<UploadOutlined />}>Tải ảnh lên</Button>
                                            </Upload>
                                        </div>
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={16}>
                                <Col span={8}><Form.Item {...restField} name={[name, 'colorName']} label="Tên màu"><Input placeholder="VD: Titan Sa Mạc" /></Form.Item></Col>
                                <Col span={8}><Form.Item {...restField} name={[name, 'colorHex']} label="Mã màu (Hex)"><Input type="color" style={{ padding: 0, width: '100%', height: 32 }} /></Form.Item></Col>
                                <Col span={8}><Form.Item {...restField} name={[name, 'price']} label="Giá bán (VNĐ)"><InputNumber style={{ width: '100%' }} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} /></Form.Item></Col>
                            </Row>
                            <Row gutter={16}>
                                <Col span={6}><Form.Item {...restField} name={[name, 'ram']} label="RAM"><Input placeholder="VD: 8GB" /></Form.Item></Col>
                                <Col span={6}><Form.Item {...restField} name={[name, 'rom']} label="ROM"><Input placeholder="VD: 256GB" /></Form.Item></Col>
                                <Col span={6}><Form.Item {...restField} name={[name, 'stockQuantity']} label="Tồn kho"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
                                <Col span={6}><Form.Item {...restField} name={[name, 'isActive']} label="Kích hoạt" valuePropName="checked" initialValue={true}><Switch /></Form.Item></Col>
                            </Row>
                        </Card>
                    ))}
                    <Form.Item><Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>Thêm phiên bản (Variant)</Button></Form.Item>
                </>
            )}
        </Form.List>
    );
};

export default TabVariants;
// src/pages/Admin/ProductManager/ProductCreate/Tabs/TabImages.tsx
import React from 'react';
import { Form, Input, Upload, Divider, Space, Typography, Row, Col, Button, Image, InputNumber, FormInstance } from 'antd';
import { PlusOutlined, MinusCircleOutlined, UploadOutlined } from '@ant-design/icons';

const { Text } = Typography;

const normFile = (e: any) => {
    if (Array.isArray(e)) return e;
    return e?.fileList;
};

interface TabImagesProps {
    form: FormInstance; // Truyền instance form từ cha xuống
    handleInlineUpload: (file: File, onSuccess: any, onError: any, fieldPath: (string | number)[]) => void;
}

const TabImages: React.FC<TabImagesProps> = ({ form, handleInlineUpload }) => {
    return (
        <Space direction="vertical" style={{ display: 'flex', width: '100%' }}>
            <Form.Item name="thumbnailUrl" hidden><Input /></Form.Item>
            <Form.Item name="thumbnail" label="Ảnh đại diện (Thumbnail)" valuePropName="fileList" getValueFromEvent={normFile}>
                <Upload name="file" listType="picture-card" maxCount={1} beforeUpload={() => false} accept="image/*">
                    <div><PlusOutlined /><div style={{ marginTop: 8 }}>Chọn ảnh</div></div>
                </Upload>
            </Form.Item>

            <Divider orientation="left">Bộ sưu tập ảnh (Slideshow)</Divider>
            <Form.Item name="gallery" label="Tải lên ảnh mới" valuePropName="fileList" getValueFromEvent={normFile}>
                <Upload name="files" listType="picture-card" multiple beforeUpload={() => false} accept="image/*">
                    <div><PlusOutlined /><div style={{ marginTop: 8 }}>Thêm ảnh</div></div>
                </Upload>
            </Form.Item>

            <Text type="secondary" italic>Danh sách Ảnh thêm (Bấm tải ảnh lên để thêm):</Text>
            <Form.List name="images">
                {(fields, { add, remove }) => (
                    <>
                        {fields.map(({ key, name, ...restField }) => (
                            <Row key={key} style={{ display: 'flex', marginBottom: 16 }} align="middle" gutter={16}>
                                <Col flex="auto">
                                    <Form.Item label="Hình ảnh" style={{ margin: 0 }}>
                                        <Form.Item {...restField} name={[name, 'imageUrl']} hidden><Input /></Form.Item>
                                        
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <Form.Item shouldUpdate={(prev, curr) => prev.images?.[name]?.imageUrl !== curr.images?.[name]?.imageUrl} noStyle>
                                                {({ getFieldValue }) => {
                                                    const url = getFieldValue(['images', name, 'imageUrl']);
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
                                                customRequest={({ file, onSuccess, onError }) => handleInlineUpload(file as File, onSuccess, onError, ['images', name, 'imageUrl'])}
                                            >
                                                <Button icon={<UploadOutlined />}>Tải ảnh lên</Button>
                                            </Upload>
                                        </div>
                                    </Form.Item>
                                </Col>
                                <Col flex="120px">
                                    <Form.Item {...restField} name={[name, 'sortOrder']} label="Thứ tự" style={{ margin: 0 }}>
                                        <InputNumber min={1} style={{ width: '100%' }} />
                                    </Form.Item>
                                </Col>
                                <Col flex="32px">
                                    <MinusCircleOutlined onClick={() => remove(name)} style={{ color: 'red', marginTop: '30px', fontSize: '18px', cursor: 'pointer' }} />
                                </Col>
                            </Row>
                        ))}
                        <Form.Item><Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>Thêm hàng ảnh</Button></Form.Item>
                    </>
                )}
            </Form.List>
        </Space>
    );
};

export default TabImages;
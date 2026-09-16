// src/pages/Admin/ProductManager/ProductCreate/Tabs/TabSpecs.tsx
import React from 'react';
import { Form, Input, Row, Col, Card, Button, Image, Upload, Divider, Space, Typography, FormInstance } from 'antd';
import { PlusOutlined, MinusCircleOutlined, UploadOutlined, RobotOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Text } = Typography;

interface TabSpecsProps {
    form: FormInstance;
    specGroups: any[];
    rawSpecText: string;
    setRawSpecText: (val: string) => void;
    handleExtractSpecs: () => void;
    extractingAI: boolean;
    handleInlineUpload: (file: File, onSuccess: any, onError: any, fieldPath: (string | number)[]) => void;
}

const TabSpecs: React.FC<TabSpecsProps> = ({ 
    form, specGroups, rawSpecText, setRawSpecText, 
    handleExtractSpecs, extractingAI, handleInlineUpload 
}) => {
    return (
        <Space direction="vertical" style={{ display: 'flex', width: '100%' }}>
            
            <Divider orientation="left">Điểm nổi bật (Highlight Specs)</Divider>
            <Form.List name="highlightSpecs">
                {(fields, { add, remove }) => (
                    <>
                        {fields.map(({ key, name, ...restField }) => (
                            <Row key={key} style={{ display: 'flex', marginBottom: 8 }} align="middle" gutter={8}>
                                <Form.Item {...restField} name={[name, 'id']} style={{ display: 'none' }}><Input /></Form.Item>
                                <Col span={6}>
                                    <Form.Item {...restField} name={[name, 'label']} label="Nhãn" style={{ margin: 0 }}><Input placeholder="VD: Camera" /></Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item {...restField} name={[name, 'value']} label="Giá trị" style={{ margin: 0 }}><Input placeholder="VD: 48MP" /></Form.Item>
                                </Col>
                                <Col span={11}>
                                    <Form.Item label="Ảnh Icon" style={{ margin: 0 }}>
                                        <Form.Item {...restField} name={[name, 'iconUrl']} hidden><Input /></Form.Item>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <Form.Item shouldUpdate={(prev, curr) => prev.highlightSpecs?.[name]?.iconUrl !== curr.highlightSpecs?.[name]?.iconUrl} noStyle>
                                                {({ getFieldValue }) => {
                                                    const url = getFieldValue(['highlightSpecs', name, 'iconUrl']);
                                                    return url ? (
                                                        <Image src={url} width={40} height={40} style={{ objectFit: 'contain', borderRadius: 4, border: '1px solid #d9d9d9', padding: 2 }} />
                                                    ) : (
                                                        <div style={{ width: 40, height: 40, borderRadius: 4, border: '1px dashed #d9d9d9', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa' }}>
                                                            <Text type="secondary" style={{ fontSize: 10 }}>Trống</Text>
                                                        </div>
                                                    );
                                                }}
                                            </Form.Item>
                                            <Upload 
                                                showUploadList={false} accept="image/*" 
                                                customRequest={({ file, onSuccess, onError }) => handleInlineUpload(file as File, onSuccess, onError, ['highlightSpecs', name, 'iconUrl'])}
                                            >
                                                <Button size="small" icon={<UploadOutlined />}>Tải Icon</Button>
                                            </Upload>
                                        </div>
                                    </Form.Item>
                                </Col>
                                <Col span={1}>
                                    <MinusCircleOutlined onClick={() => remove(name)} style={{ color: 'red', marginTop: '30px', fontSize: '16px', cursor: 'pointer' }} />
                                </Col>
                            </Row>
                        ))}
                        <Form.Item><Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>Thêm điểm nổi bật</Button></Form.Item>
                    </>
                )}
            </Form.List>

            {/* --- KHU VỰC AI TRÍCH XUẤT THÔNG SỐ TỰ ĐỘNG --- */}
            <Card size="small" style={{ background: '#f6ffed', borderColor: '#b7eb8f', marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span>
                        <strong>✨ AI Tự động điền thông số:</strong> Copy văn bản mô tả cấu hình từ web khác dán vào đây để AI tự điền xuống các ô bên dưới.
                    </span>
                    <Button 
                        type="primary" 
                        style={{ background: '#52c41a', borderColor: '#52c41a' }} 
                        onClick={handleExtractSpecs} 
                        loading={extractingAI} 
                        icon={<RobotOutlined />}
                    >
                        Tự động điền
                    </Button>
                </div>
                
                <TextArea 
                    autoSize={{ minRows: 5, maxRows: 15 }} 
                    placeholder="Dán toàn bộ cấu hình vào đây...&#10;VD:&#10;- Màn hình: 6.7 inch&#10;- Pin: 5000mAh&#10;- Camera: 50MP&#10;- Chip: Snapdragon 8 Gen 3..." 
                    value={rawSpecText} 
                    onChange={(e) => setRawSpecText(e.target.value)}
                />
            </Card>

            <Divider orientation="left">Thông số cơ sở (EAV - Chọn theo Database)</Divider>
            {specGroups.map(group => (
                <Card key={group.id} title={group.name} size="small" style={{ marginBottom: 16, background: '#fafafa' }}>
                    <Row gutter={16}>
                        {group.attributes?.map((attr: any) => (
                            <Col span={8} key={attr.id}>
                                <Form.Item name={['specValuesMap', attr.id]} label={attr.name}>
                                    <Input placeholder={`Nhập ${attr.name.toLowerCase()}`} />
                                </Form.Item>
                            </Col>
                        ))}
                    </Row>
                </Card>
            ))}

            <Divider orientation="left">Thông số tùy chỉnh (JSON Ngoài EAV)</Divider>
            <Form.List name="specificationsJson">
                {(groupFields, { add: addGroup, remove: removeGroup }) => (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {groupFields.map((groupField) => (
                            <Card 
                                size="small" key={groupField.key}
                                title={
                                    <Form.Item {...groupField} name={[groupField.name, 'title']} style={{ margin: 0 }}>
                                        <Input placeholder="Tên nhóm (VD: Phụ kiện khác)" style={{ width: 300 }} />
                                    </Form.Item>
                                }
                                extra={<Button danger type="text" icon={<MinusCircleOutlined />} onClick={() => removeGroup(groupField.name)}>Xóa nhóm</Button>}
                                style={{ border: '1px solid #d9d9d9' }}
                            >
                                <Form.List name={[groupField.name, 'items']}>
                                    {(itemFields, { add: addItem, remove: removeItem }) => (
                                        <>
                                            {itemFields.map((itemField) => (
                                                <Space key={itemField.key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                                    <Form.Item {...itemField} name={[itemField.name, 'label']}>
                                                        <Input placeholder="Tên (VD: Tặng kèm)" style={{ width: 220 }} />
                                                    </Form.Item>
                                                    <Form.Item {...itemField} name={[itemField.name, 'value']}>
                                                        <Input placeholder="Giá trị (VD: Ốp lưng)" style={{ width: 300 }} />
                                                    </Form.Item>
                                                    <MinusCircleOutlined onClick={() => removeItem(itemField.name)} style={{ color: 'red' }} />
                                                </Space>
                                            ))}
                                            <Button type="dashed" onClick={() => addItem()} block icon={<PlusOutlined />}>Thêm thuộc tính</Button>
                                        </>
                                    )}
                                </Form.List>
                            </Card>
                        ))}
                        <Button type="primary" ghost onClick={() => addGroup()} block icon={<PlusOutlined />}>+ THÊM NHÓM THÔNG SỐ TÙY CHỈNH</Button>
                    </div>
                )}
            </Form.List>
        </Space>
    );
};

export default TabSpecs;
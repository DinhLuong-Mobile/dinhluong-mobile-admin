import React, { useState, useEffect } from 'react';
import { 
    Form, Input, InputNumber, Select, Button, Card, 
    Space, Divider, message, Row, Col, Typography, Spin, Upload 
} from 'antd';
import { 
    PlusOutlined, 
    MinusCircleOutlined, 
    SaveOutlined, 
    ArrowLeftOutlined, 
    RobotOutlined 
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

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

const normFile = (e: any) => {
    if (Array.isArray(e)) return e;
    return e?.fileList;
};

const AccessoryEdit: React.FC = () => {
    const { id } = useParams<{ id: string }>(); 
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true); 
    
    const [generatingAI, setGeneratingAI] = useState(false);
    const [extractingAI, setExtractingAI] = useState(false);
    const [rawSpecText, setRawSpecText] = useState("");

    const [brands, setBrands] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [defaultVariantId, setDefaultVariantId] = useState<number | null>(null);

    const getAuthToken = () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr).token : '';
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            setFetching(true);
            try {
                const token = getAuthToken();
                const headers = { 'Authorization': `Bearer ${token}` };

                const [brandRes, catRes, productRes] = await Promise.all([
                    fetch('http://localhost:8080/api/admin/brands', { headers }),
                    fetch('http://localhost:8080/api/admin/categories', { headers }),
                    fetch(`http://localhost:8080/api/admin/products/${id}`, { headers }) 
                ]);

                if (brandRes.ok) setBrands(await brandRes.json());
                if (catRes.ok) setCategories(await catRes.json());

                if (productRes.ok) {
                    const json = await productRes.json();
                    if (json.status === 'success') {
                        const product = json.data;
                        const defaultVariant = product.variants?.[0] || null;
                        if (defaultVariant?.id) setDefaultVariantId(defaultVariant.id);

                        const initialThumbnail = product.thumbnailUrl ? [{
                            uid: '-1',
                            name: 'current_image.png',
                            status: 'done',
                            url: product.thumbnailUrl,
                        }] : [];

                        form.setFieldsValue({
                            name: product.name,
                            thumbnailUrl: product.thumbnailUrl,
                            thumbnail: initialThumbnail,
                            brandId: product.brandId, 
                            categoryId: product.categoryId,
                            description: product.description || '', 
                            metaTitle: product.metaTitle,
                            metaDescription: product.metaDescription,
                            sku: defaultVariant?.sku || `PK-${product.id}`,
                            originalPrice: defaultVariant?.price || product.originalPrice || 0,
                            displayPrice: defaultVariant?.price || product.displayPrice || 0,
                            stockQuantity: defaultVariant?.stockQuantity || product.totalStock || 0,
                            specificationsJson: product.specificationsJson || []
                        });
                    }
                }
            } catch (error) {
                message.error("Lỗi tải dữ liệu");
            } finally {
                setFetching(false);
            }
        };
        fetchData();
    }, [id, form]);

    const handleAiGenerateDescription = async () => {
        const values = form.getFieldsValue();
        if (!values.name) return message.warning("Cần có tên phụ kiện!");

        setGeneratingAI(true);
        try {
            const response = await fetch('http://localhost:8080/api/admin/ai/accessory/generate-description', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}` 
                },
                body: JSON.stringify({
                    productName: values.name,
                    specificationsJson: JSON.stringify(values.specificationsJson || []),
                    imageUrls: values.thumbnailUrl ? [values.thumbnailUrl] : []
                })
            });
            const html = await response.text();
            form.setFieldsValue({ description: html });
            message.success("✨ AI đã viết lại bài mô tả mới!");
        } catch (error) {
            message.error("AI không phản hồi");
        } finally {
            setGeneratingAI(false);
        }
    };

    const handleAiExtractSpecs = async () => {
        if (!rawSpecText.trim()) return message.warning("Hãy dán thông số thô vào ô!");

        setExtractingAI(true);
        try {
            const response = await fetch('http://localhost:8080/api/admin/ai/accessory/extract-specs', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}` 
                },
                body: JSON.stringify({ rawText: rawSpecText })
            });
            const jsonStr = await response.text();
            const parsedJson = JSON.parse(jsonStr);
            
            form.setFieldsValue({ specificationsJson: parsedJson });
            message.success("✨ AI đã cập nhật lại bảng thông số!");
            setRawSpecText("");
        } catch (error) {
            message.error("Lỗi trích xuất thông số");
        } finally {
            setExtractingAI(false);
        }
    };

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const token = getAuthToken();
            const formattedSpecsJson = values.specificationsJson?.map((group: any, index: number) => ({
                id: index + 1, 
                title: group.title,
                items: group.items || []
            })) || [];

            let finalThumbnailUrl = values.thumbnailUrl;
            let newImageFile = null;

            if (values.thumbnail && values.thumbnail.length > 0) {
                if (values.thumbnail[0].originFileObj) {
                    newImageFile = values.thumbnail[0].originFileObj;
                    finalThumbnailUrl = null; 
                }
            } else {
                finalThumbnailUrl = null; 
            }

            const payload = {
                name: values.name,
                slug: generateSlug(values.name),
                thumbnailUrl: finalThumbnailUrl,
                brandId: values.brandId,
                categoryId: values.categoryId,
                description: values.description,
                productType: 'ACCESSORY',
                metaTitle: values.metaTitle,
                metaDescription: values.metaDescription,
                originalPrice: values.originalPrice,
                displayPrice: values.displayPrice,
                variants: [
                    {
                        id: defaultVariantId, 
                        sku: values.sku,
                        colorName: 'Mặc định',
                        price: values.displayPrice, 
                        stockQuantity: values.stockQuantity,
                        isActive: true
                    }
                ],
                specificationsJson: formattedSpecsJson
            };

            const formData = new FormData();
            formData.append("data", JSON.stringify(payload));
            if (newImageFile) formData.append("thumbnail", newImageFile);

            const response = await fetch(`http://localhost:8080/api/admin/products/${id}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData 
            });

            if (response.ok) {
                message.success('Cập nhật thành công!');
                navigate('/admin/accessories');
            }
        } catch (error) {
            message.error('Lỗi kết nối máy chủ');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" tip="Đang tải dữ liệu..." /></div>;

    return (
        <div style={{ padding: '0 24px 24px' }}>
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item name="thumbnailUrl" hidden><Input /></Form.Item>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '16px 0' }}>
                    <Space>
                        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/accessories')}>Trở về</Button>
                        <Title level={4} style={{ margin: 0 }}>Chỉnh sửa Phụ Kiện #{id}</Title>
                    </Space>
                    <Button type="primary" size="large" icon={<SaveOutlined />} loading={loading} onClick={() => form.submit()}>
                        Lưu Thay Đổi
                    </Button>
                </div>

                <Row gutter={24}>
                    <Col span={16}>
                        <Card title="Thông tin cơ bản" bordered={false} style={{ marginBottom: 24 }}>
                            <Form.Item name="name" label="Tên phụ kiện" rules={[{ required: true, message: 'Bắt buộc!' }]}>
                                <Input size="large" />
                            </Form.Item>

                            <Form.Item 
                                name="thumbnail" 
                                label="Ảnh đại diện" 
                                valuePropName="fileList" 
                                getValueFromEvent={normFile}
                                rules={[{ required: true, message: 'Bắt buộc!' }]}
                            >
                                <Upload listType="picture-card" maxCount={1} beforeUpload={() => false} accept="image/*">
                                    <div><PlusOutlined /><div style={{ marginTop: 8 }}>Đổi ảnh</div></div>
                                </Upload>
                            </Form.Item>

                            <Divider />

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                <Text strong>Bài viết giới thiệu</Text>
                                <Button 
                                    type="primary" ghost icon={<RobotOutlined />} 
                                    loading={generatingAI} onClick={handleAiGenerateDescription}
                                > ✨ Viết lại bằng AI </Button>
                            </div>
                            <Form.Item name="description">
                                {/* Đã thay thế ReactQuill bằng TextArea */}
                                <TextArea rows={12} placeholder="Nhập bài viết giới thiệu..." />
                            </Form.Item>
                        </Card>

                        <Card title="Thông số kỹ thuật (Không bắt buộc)" bordered={false} style={{ marginBottom: 24 }}>
                            <div style={{ background: '#f0f5ff', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px dashed #adc6ff' }}>
                                <Text strong><RobotOutlined /> AI Bổ sung thông số:</Text>
                                <Space.Compact style={{ width: '100%', marginTop: '10px' }}>
                                    <TextArea 
                                        placeholder="Dán thêm thông số mới để AI cập nhật lại bảng..." 
                                        rows={2} value={rawSpecText}
                                        onChange={e => setRawSpecText(e.target.value)}
                                    />
                                    <Button type="primary" onClick={handleAiExtractSpecs} loading={extractingAI}>Bóc tách</Button>
                                </Space.Compact>
                            </div>

                            <Form.List name="specificationsJson">
                                {(groupFields, { add: addGroup, remove: removeGroup }) => (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        {groupFields.map((groupField) => (
                                            <Card 
                                                size="small" key={groupField.key}
                                                title={<Form.Item {...groupField} name={[groupField.name, 'title']} style={{ margin: 0 }}><Input placeholder="Nhóm (VD: Kích thước)" style={{ width: 300 }} /></Form.Item>}
                                                extra={<Button danger type="text" icon={<MinusCircleOutlined />} onClick={() => removeGroup(groupField.name)}>Xóa nhóm</Button>}
                                            >
                                                <Form.List name={[groupField.name, 'items']}>
                                                    {(itemFields, { add: addItem, remove: removeItem }) => (
                                                        <>
                                                            {itemFields.map((itemField) => (
                                                                <Space key={itemField.key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                                                    <Form.Item {...itemField} name={[itemField.name, 'label']}><Input placeholder="Tên" style={{ width: 220 }} /></Form.Item>
                                                                    <Form.Item {...itemField} name={[itemField.name, 'value']}><Input placeholder="Giá trị" style={{ width: 300 }} /></Form.Item>
                                                                    <MinusCircleOutlined onClick={() => removeItem(itemField.name)} style={{ color: 'red' }} />
                                                                </Space>
                                                            ))}
                                                            <Button type="dashed" onClick={() => addItem()} block icon={<PlusOutlined />}>Thêm thuộc tính</Button>
                                                        </>
                                                    )}
                                                </Form.List>
                                            </Card>
                                        ))}
                                        <Button type="primary" ghost onClick={() => addGroup()} block icon={<PlusOutlined />}>+ THÊM NHÓM MỚI</Button>
                                    </div>
                                )}
                            </Form.List>
                        </Card>
                    </Col>

                    <Col span={8}>
                        <Card title="Giá & Kho" bordered={false} style={{ marginBottom: 24 }}>
                            <Form.Item name="originalPrice" label="Giá gốc (VNĐ)" rules={[{ required: true, message: 'Bắt buộc!' }]}>
                                <InputNumber min={0} style={{ width: '100%' }} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                            </Form.Item>
                            <Form.Item name="displayPrice" label="Giá khuyến mãi" rules={[{ required: true, message: 'Bắt buộc!' }]}>
                                <InputNumber min={0} style={{ width: '100%' }} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                            </Form.Item>
                            <Form.Item name="stockQuantity" label="Tồn kho" rules={[{ required: true, message: 'Bắt buộc!' }]}>
                                <InputNumber min={0} style={{ width: '100%' }} />
                            </Form.Item>
                        </Card>

                        <Form.Item name="sku" label="Mã SKU (Không cho phép sửa)">
                                <Input disabled style={{ backgroundColor: '#f5f5f5', color: '#555', cursor: 'not-allowed' }} />
                            </Form.Item>

                        <Card title="Tổ chức" bordered={false}>
                            <Form.Item name="categoryId" label="Danh mục" rules={[{ required: true, message: 'Bắt buộc!' }]}>
                                <Select>{categories.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}</Select>
                            </Form.Item>
                            <Form.Item name="brandId" label="Hãng" rules={[{ required: true, message: 'Bắt buộc!' }]}>
                                <Select>{brands.map(b => <Option key={b.id} value={b.id}>{b.name}</Option>)}</Select>
                            </Form.Item>
                        </Card>

                        <Card title="SEO" bordered={false} style={{ marginTop: 24 }}>
                            <Form.Item name="metaTitle" label="Meta Title"><Input /></Form.Item>
                            <Form.Item name="metaDescription" label="Meta Description"><TextArea rows={3} /></Form.Item>
                        </Card>
                    </Col>
                </Row>
            </Form>
        </div>
    );
};

export default AccessoryEdit;
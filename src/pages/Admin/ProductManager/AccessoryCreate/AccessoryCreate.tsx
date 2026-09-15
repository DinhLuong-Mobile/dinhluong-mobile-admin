import React, { useState, useEffect } from 'react';
import { 
    Form, Input, InputNumber, Select, Button, Card, 
    Space, Divider, message, Row, Col, Typography, Upload 
} from 'antd';
import { 
    PlusOutlined, 
    MinusCircleOutlined, 
    SaveOutlined, 
    ArrowLeftOutlined, 
    RobotOutlined 
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

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

const AccessoryCreate: React.FC = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const location = useLocation(); 
    const cloneFromId = location.state?.cloneFromId; 
    
    const [loading, setLoading] = useState(false);
    const [generatingAI, setGeneratingAI] = useState(false);
    const [extractingAI, setExtractingAI] = useState(false);
    const [rawSpecText, setRawSpecText] = useState("");

    const [brands, setBrands] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);

    const getAuthToken = () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr).token : '';
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            const token = getAuthToken();
            const headers = { 'Authorization': `Bearer ${token}` };
            try {
                const [brandRes, catRes] = await Promise.all([
                    fetch('http://localhost:8080/api/admin/brands', { headers }),
                    fetch('http://localhost:8080/api/admin/categories', { headers })
                ]);
                if (brandRes.ok) setBrands(await brandRes.json());
                if (catRes.ok) setCategories(await catRes.json());

                if (cloneFromId) {
                    const productRes = await fetch(`http://localhost:8080/api/admin/products/${cloneFromId}`, { headers });
                    if (productRes.ok) {
                        const json = await productRes.json();
                        if (json.status === 'success') {
                            const product = json.data;
                            const defaultVariant = product.variants?.[0] || null;

                            // Bọc ảnh cũ vào Upload Component
                            const initialThumbnail = product.thumbnailUrl ? [{
                                uid: '-1',
                                name: 'copied_image.png',
                                status: 'done',
                                url: product.thumbnailUrl,
                            }] : [];

                            // Ảnh Variant cũ
                            const initialVariantImage = defaultVariant?.imageUrl ? [{
                                uid: '-2',
                                name: 'copied_variant_image.png',
                                status: 'done',
                                url: defaultVariant.imageUrl,
                            }] : [];

                            form.setFieldsValue({
                                name: product.name + " (Copy)", 
                                thumbnailUrl: product.thumbnailUrl, 
                                thumbnail: initialThumbnail,
                                variantImageUrl: defaultVariant?.imageUrl || null, // Lưu url ảnh variant cũ
                                variantImage: initialVariantImage, // Bọc vào Upload component
                                brandId: product.brandId,
                                categoryId: product.categoryId,
                                description: product.description || '',
                                originalPrice: defaultVariant?.price || product.originalPrice || 0,
                                displayPrice: defaultVariant?.price || product.displayPrice || 0,
                                stockQuantity: defaultVariant?.stockQuantity || product.totalStock || 0,
                                specificationsJson: product.specificationsJson || []
                            });
                            message.success("Đã tải dữ liệu sản phẩm sao chép!");
                        }
                    }
                }
            } catch (error) {
                message.error("Lỗi tải dữ liệu khởi tạo");
            }
        };
        fetchInitialData();
    }, [cloneFromId, form]);

    const handleAiGenerateDescription = async () => {
        const values = form.getFieldsValue();
        if (!values.name) return message.warning("Vui lòng nhập tên phụ kiện trước!");

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
                    imageUrls: [] 
                })
            });
            const html = await response.text();
            form.setFieldsValue({ description: html });
            message.success("✨ AI đã hoàn thành bài viết giới thiệu!");
        } catch (error) {
            message.error("Lỗi khi AI đang viết bài");
        } finally {
            setGeneratingAI(false);
        }
    };

    const handleAiExtractSpecs = async () => {
        if (!rawSpecText.trim()) return message.warning("Hãy dán nội dung thông số vào ô xanh!");

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
            message.success("✨ Đã bóc tách thông số! Bạn có thể chỉnh sửa lại bên dưới.");
            setRawSpecText(""); 
        } catch (error) {
            message.error("AI không thể bóc tách dữ liệu này");
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
                title: group.title || "Nhóm thông số",
                items: group.items || []
            })) || [];

            // 1. Xử lý file Ảnh Đại Diện (Thumbnail)
            let finalThumbnailUrl = values.thumbnailUrl || null;
            let newImageFile = null;
            if (values.thumbnail && values.thumbnail.length > 0) {
                if (values.thumbnail[0].originFileObj) {
                    newImageFile = values.thumbnail[0].originFileObj; 
                    finalThumbnailUrl = null;
                }
            } else {
                finalThumbnailUrl = null;
            }

            // 2. Xử lý file Ảnh Phân Loại (Variant Image)
            let finalVariantImageUrl = values.variantImageUrl || null;
            let newVariantImageFile = null;
            if (values.variantImage && values.variantImage.length > 0) {
                if (values.variantImage[0].originFileObj) {
                    newVariantImageFile = values.variantImage[0].originFileObj;
                    finalVariantImageUrl = null;
                }
            } else {
                finalVariantImageUrl = null;
            }

            const payload = {
                name: values.name,
                slug: generateSlug(values.name),
                thumbnailUrl: finalThumbnailUrl, 
                brandId: values.brandId,
                categoryId: values.categoryId,
                description: values.description,
                productType: 'ACCESSORY',
                status: 'ACTIVE',
                originalPrice: values.originalPrice,
                displayPrice: values.displayPrice,
                variants: [
                    {
                        sku: values.sku || `PK-${Date.now()}`,
                        colorName: 'Mặc định',
                        price: values.displayPrice,
                        stockQuantity: values.stockQuantity,
                        imageUrl: finalVariantImageUrl, // Gửi url ảnh cũ nếu clone
                        isActive: true
                    }
                ],
                specificationsJson: formattedSpecsJson
            };

            const formData = new FormData();
            formData.append("data", JSON.stringify(payload));

            // Đóng gói ảnh đại diện
            if (newImageFile) {
                formData.append("thumbnail", newImageFile);
            }
            // Đóng gói ảnh Variant
            // LƯU Ý: Đổi tên "variantImage" dưới đây thành key mà Backend của bạn đang dùng để nhận ảnh variant!
            if (newVariantImageFile) {
                formData.append("variantImage", newVariantImageFile); 
            }

            const response = await fetch('http://localhost:8080/api/admin/products', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData 
            });

            if (response.ok) {
                message.success('Thêm phụ kiện mới thành công!');
                navigate('/admin/accessories');
            } else {
                message.error('Lỗi khi lưu sản phẩm');
            }
        } catch (error) {
            message.error('Lỗi kết nối máy chủ');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '0 24px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '16px 0' }}>
                <Space>
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/accessories')}>Trở về</Button>
                    <Title level={4} style={{ margin: 0 }}>
                        {cloneFromId ? 'Sao chép Phụ Kiện' : 'Thêm Phụ Kiện Mới'}
                    </Title>
                </Space>
                <Button type="primary" size="large" icon={<SaveOutlined />} loading={loading} onClick={() => form.submit()}>
                    Lưu Phụ Kiện
                </Button>
            </div>

            <Form form={form} layout="vertical" onFinish={onFinish}>
                {/* Ẩn trường này để lưu lại link ảnh cũ khi copy */}
                <Form.Item name="thumbnailUrl" hidden><Input /></Form.Item>
                <Form.Item name="variantImageUrl" hidden><Input /></Form.Item>

                <Row gutter={24}>
                    <Col span={16}>
                        <Card title="Thông tin cơ bản" bordered={false} style={{ marginBottom: 24 }}>
                            <Form.Item name="name" label="Tên phụ kiện" rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}>
                                <Input placeholder="VD: Sạc nhanh Anker Nano 20W" size="large" />
                            </Form.Item>

                            {/* Gom 2 ô Upload ảnh lên cùng 1 hàng cho gọn */}
                            <Row gutter={24}>
                                <Col span={12}>
                                    <Form.Item 
                                        name="thumbnail" 
                                        label="Ảnh đại diện" 
                                        valuePropName="fileList" 
                                        getValueFromEvent={normFile}
                                        rules={[{ required: true, message: 'Phải có ảnh sản phẩm!' }]}
                                    >
                                        <Upload listType="picture-card" maxCount={1} beforeUpload={() => false} accept="image/*">
                                            <div><PlusOutlined /><div style={{ marginTop: 8 }}>Ảnh chính</div></div>
                                        </Upload>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item 
                                        name="variantImage" 
                                        label="Ảnh phân loại (Phiên bản 'Mặc định')" 
                                        valuePropName="fileList" 
                                        getValueFromEvent={normFile}
                                        rules={[{ required: true, message: 'Vui lòng thêm ảnh phân loại!' }]}
                                    >
                                        <Upload listType="picture-card" maxCount={1} beforeUpload={() => false} accept="image/*">
                                            <div><PlusOutlined /><div style={{ marginTop: 8 }}>Ảnh phân loại</div></div>
                                        </Upload>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Divider />

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                <Text strong>Bài viết giới thiệu sản phẩm</Text>
                                <Button 
                                    type="primary" 
                                    ghost 
                                    icon={<RobotOutlined />} 
                                    loading={generatingAI}
                                    onClick={handleAiGenerateDescription}
                                    style={{ borderRadius: '20px' }}
                                > ✨ Viết bằng AI </Button>
                            </div>
                            <Form.Item name="description">
                                <TextArea rows={12} placeholder="Nhập bài viết giới thiệu..." />
                            </Form.Item>
                        </Card>

                        <Card title="Thông số kỹ thuật chi tiết (Không bắt buộc)" bordered={false}>
                            <div style={{ background: '#f0f5ff', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px dashed #adc6ff' }}>
                                <Text strong><RobotOutlined /> AI Trích xuất nhanh:</Text>
                                <Space.Compact style={{ width: '100%', marginTop: '10px' }}>
                                    <TextArea 
                                        placeholder="Dán thông số từ web hãng vào đây (Ví dụ: Cổng ra USB-C, Công suất 20W, Màu trắng...)" 
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
                                                size="small" 
                                                key={groupField.key}
                                                title={
                                                    <Form.Item {...groupField} name={[groupField.name, 'title']} style={{ margin: 0 }}>
                                                        <Input placeholder="Tên nhóm (VD: Công suất & Kết nối)" style={{ width: 300 }} />
                                                    </Form.Item>
                                                }
                                                extra={<Button danger type="text" icon={<MinusCircleOutlined />} onClick={() => removeGroup(groupField.name)}>Xóa nhóm</Button>}
                                                style={{ border: '1px solid #f0f0f0' }}
                                            >
                                                <Form.List name={[groupField.name, 'items']}>
                                                    {(itemFields, { add: addItem, remove: removeItem }) => (
                                                        <>
                                                            {itemFields.map((itemField) => (
                                                                <Space key={itemField.key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                                                    <Form.Item {...itemField} name={[itemField.name, 'label']}>
                                                                        <Input placeholder="Tên thông số" style={{ width: 220 }} />
                                                                    </Form.Item>
                                                                    <Form.Item {...itemField} name={[itemField.name, 'value']}>
                                                                        <Input placeholder="Giá trị" style={{ width: 320 }} />
                                                                    </Form.Item>
                                                                    <MinusCircleOutlined onClick={() => removeItem(itemField.name)} style={{ color: '#ff4d4f' }} />
                                                                </Space>
                                                            ))}
                                                            <Button type="dashed" onClick={() => addItem()} block icon={<PlusOutlined />}>Thêm dòng</Button>
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

                    <Col span={8}>
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

                            <Form.Item name="sku" label="Mã SKU (Tùy chọn)">
                                <Input placeholder="Để trống hệ thống tự gen mã mới" />
                            </Form.Item>
                        </Card>

                        <Card title="Phân loại" bordered={false}>
                            <Form.Item name="categoryId" label="Danh mục phụ kiện" rules={[{ required: true, message: 'Bắt buộc!' }]}>
                                <Select placeholder="-- Chọn danh mục --" size="large">
                                    {categories.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
                                </Select>
                            </Form.Item>

                            <Form.Item name="brandId" label="Thương hiệu" rules={[{ required: true, message: 'Bắt buộc!' }]}>
                                <Select placeholder="-- Chọn hãng --" size="large">
                                    {brands.map(b => <Option key={b.id} value={b.id}>{b.name}</Option>)}
                                </Select>
                            </Form.Item>
                        </Card>
                    </Col>
                </Row>
            </Form>
        </div>
    );
};

export default AccessoryCreate;
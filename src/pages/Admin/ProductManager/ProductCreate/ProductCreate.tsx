import React, { useState, useEffect, useRef } from 'react';
import {
    Form, Input, InputNumber, Select, Switch, Button,
    Card, Tabs, Space, Row, Col, Typography, message, Divider, Upload, Spin,Image
} from 'antd';
import {
    PlusOutlined, MinusCircleOutlined, SaveOutlined, ArrowLeftOutlined, UploadOutlined, RobotOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { productAdminService } from '../../../../services/productAdminService'; 

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const normFile = (e: any) => {
    if (Array.isArray(e)) return e;
    return e?.fileList;
};

const ProductCreate: React.FC = () => {
    const { id } = useParams();
    const isEdit = !!id;
    
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const location = useLocation();
    const hasFetched = useRef(false);

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [categories, setCategories] = useState<any[]>([]);
    const [brands, setBrands] = useState<any[]>([]);
    const [specGroups, setSpecGroups] = useState<any[]>([]);

    // =========================================================
    // STATE CHO CÁC TÍNH NĂNG AI
    // =========================================================
    const [generatingAI, setGeneratingAI] = useState(false);
    const [extractingAI, setExtractingAI] = useState(false);
    const [rawSpecText, setRawSpecText] = useState("");

    const getAuthToken = () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr).token : '';
    };

    // =========================================================
    // HÀM UPLOAD ẢNH NHANH CHO CÁC FIELD ĐỘNG (INLINE UPLOAD)
    // =========================================================
    const handleInlineUpload = async (file: File, onSuccess: any, onError: any, fieldPath: (string | number)[]) => {
        const fd = new FormData(); 
        fd.append('file', file);
        try {
            const res = await fetch('http://localhost:8080/api/admin/products/upload', {
                method: 'POST', 
                headers: { 'Authorization': `Bearer ${getAuthToken()}` }, 
                body: fd
            });
            const data = await res.json();
            if (res.ok) {
                form.setFieldValue(fieldPath, data.data); // Điền trực tiếp URL trả về vào field tương ứng
                onSuccess?.("ok");
                message.success("Tải ảnh lên thành công!");
            } else {
                onError?.(new Error("Lỗi"));
                message.error("Tải ảnh thất bại!");
            }
        } catch (err) { 
            onError?.(new Error("Lỗi mạng"));
            message.error("Lỗi kết nối máy chủ!");
        }
    };

    // =========================================================
    // 1. TẢI DỮ LIỆU KHỞI TẠO
    // =========================================================
    useEffect(() => {
        const fetchInitialData = async () => {
            if (hasFetched.current) return;
            hasFetched.current = true;
            setLoading(true);

            try {
                const [catRes, brandRes, specRes] = await Promise.all([
                    productAdminService.getCategories(),
                    productAdminService.getBrands(),
                    productAdminService.getSpecGroups()
                ]);

                if (catRes) setCategories(catRes.data || catRes);
                if (brandRes) setBrands(brandRes.data || brandRes);
                
                let fetchedSpecGroups: any[] = [];
                if (specRes) {
                    fetchedSpecGroups = specRes.data || specRes;
                    setSpecGroups(fetchedSpecGroups);
                }

                const cloneId = location.state?.cloneFromId;
                const targetId = isEdit ? id : cloneId;

                if (targetId) {
                    const productRes = await fetch(`http://localhost:8080/api/admin/products/${targetId}`, { 
                        headers: { 'Authorization': `Bearer ${getAuthToken()}` } 
                    });
                    
                    if (productRes.ok) {
                        const json = await productRes.json();
                        const formData = { ...(json.data || json) }; 
                        
                        if (cloneId) {
                            formData.id = null;
                            formData.name = (formData.name || 'Sản phẩm') + " (Copy)";
                            formData.slug = (formData.slug || 'san-pham') + "-copy-" + Date.now();
                        }

                        if (formData.thumbnailUrl) {
                            formData.thumbnail = [{
                                uid: '-1', name: 'image.png', status: 'done', url: formData.thumbnailUrl,
                            }];
                        }

                        if (formData.specValues && Array.isArray(formData.specValues)) {
                            formData.specValuesMap = {};
                            formData.specValues.forEach((item: any) => {
                                formData.specValuesMap[item.attributeId] = item.value;
                            });
                        }

                        if (formData.specificationsJson && fetchedSpecGroups.length > 0) {
                            const autoGroupNames = ["Màn hình", "Hệ điều hành & CPU", "Pin & Sạc", ...fetchedSpecGroups.map((g: any) => g.name)];
                            formData.specificationsJson = formData.specificationsJson.filter(
                                (group: any) => !autoGroupNames.includes(group.title)
                            );
                        }

                        form.setFieldsValue(formData);
                        message.success(isEdit ? "Đã tải dữ liệu sản phẩm" : "Đã sao chép dữ liệu thành công!");
                    }
                }
            } catch (error) {
                message.error("Lỗi khi tải dữ liệu!");
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [id, location.state, form, isEdit]);

    // =========================================================
    // 2. HÀM GỌI AI VIẾT BÀI VÀ BỒI ẢNH
    // =========================================================
    const handleGenerateAIContent = async () => {
        const values = form.getFieldsValue();
    
        if (!values.name) {
            message.warning("Vui lòng nhập Tên sản phẩm trước khi dùng AI!");
            return;
        }
    
        setGeneratingAI(true);
        try {
            const currentImageUrls: string[] = [];
            
            if (values.thumbnailUrl) currentImageUrls.push(values.thumbnailUrl);
            else if (values.thumbnail && values.thumbnail[0]?.url) currentImageUrls.push(values.thumbnail[0].url);
    
            if (values.images && Array.isArray(values.images)) {
                values.images.forEach((img: any) => {
                    if (img.imageUrl) currentImageUrls.push(img.imageUrl);
                });
            }
    
            const res = await fetch('http://localhost:8080/api/admin/ai/generate-description', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: JSON.stringify({
                    productName: values.name,
                    specificationsJson: JSON.stringify(values.specValuesMap || {}),
                    imageUrls: currentImageUrls
                })
            });
    
            if (res.ok) {
                const htmlContent = await res.text();
                form.setFieldsValue({ description: htmlContent });
                message.success("✨ AI đã viết bài và bồi ảnh thành công!");
            } else {
                message.error("Lỗi khi gọi AI");
            }
        } catch (error) {
            message.error("Lỗi kết nối đến server AI!");
        } finally {
            setGeneratingAI(false);
        }
    };

    // =========================================================
    // 3. HÀM GỌI AI BÓC TÁCH THÔNG SỐ
    // =========================================================
    const handleExtractSpecs = async () => {
        if (!rawSpecText.trim()) {
            message.warning("Vui lòng dán đoạn văn bản cấu hình vào ô trước!");
            return;
        }

        setExtractingAI(true);
        try {
            let attributesInfo = "";
            specGroups.forEach(group => {
                group.attributes?.forEach((attr: any) => {
                    attributesInfo += `${attr.id} - ${attr.name}\n`;
                });
            });

            const res = await fetch('http://localhost:8080/api/admin/ai/extract-specs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAuthToken()}` },
                body: JSON.stringify({ rawText: rawSpecText, attributesInfo: attributesInfo })
            });

            if (res.ok) {
                const aiData = await res.json();
                const currentSpecValuesMap = form.getFieldValue('specValuesMap') || {};
                form.setFieldsValue({ specValuesMap: { ...currentSpecValuesMap, ...aiData } });
                message.success("✨ AI đã trích xuất và điền thông số thành công!");
                setRawSpecText(""); 
            } else {
                message.error("Có lỗi xảy ra khi AI bóc tách dữ liệu.");
            }
        } catch (error) {
            message.error("Lỗi kết nối đến máy chủ AI!");
        } finally {
            setExtractingAI(false);
        }
    };

    const onFinishFailed = (errorInfo: any) => {
        const errorMessages = errorInfo.errorFields.map((field: any) => {
            const fieldPath = field.name;
            let fieldNameVN = fieldPath.join(' > '); 

            if (fieldPath[0] === 'name') fieldNameVN = 'Tên sản phẩm (Tab Thông tin chung)';
            if (fieldPath[0] === 'categoryId') fieldNameVN = 'Danh mục (Tab Thông tin chung)';
            if (fieldPath[0] === 'brandId') fieldNameVN = 'Thương hiệu (Tab Thông tin chung)';
            if (fieldPath[0] === 'displayPrice') fieldNameVN = 'Giá bán (Tab Thông tin chung)';
            if (fieldPath[0] === 'thumbnail') fieldNameVN = 'Ảnh đại diện (Tab Hình ảnh)';
            
            if (fieldPath[0] === 'variants') {
                const index = fieldPath[1] + 1; 
                if (fieldPath[2] === 'sku') fieldNameVN = `Mã SKU - Phiên bản #${index} (Tab Phiên bản)`;
            }

            if (fieldPath[0] === 'specificationsJson') {
                if (fieldPath[2] === 'title') fieldNameVN = `Tên nhóm thông số thứ ${fieldPath[1] + 1} (Tab Thông số)`;
                if (fieldPath[4] === 'label') fieldNameVN = `Tên thuộc tính trong nhóm ${fieldPath[1] + 1} (Tab Thông số)`;
                if (fieldPath[4] === 'value') fieldNameVN = `Giá trị thuộc tính trong nhóm ${fieldPath[1] + 1} (Tab Thông số)`;
            }

            return `- ${fieldNameVN}`;
        });

        message.error({
            content: (
                <div>
                    <strong>Lưu thất bại! Vui lòng điền các ô bắt buộc sau:</strong>
                    <div style={{ whiteSpace: 'pre-line', marginTop: 4, marginLeft: 8 }}>
                        {errorMessages.join('\n')}
                    </div>
                </div>
            ),
            duration: 5, 
        });
    };

    // =========================================================
    // 4. SUBMIT FORM (GỬI LÊN BACKEND)
    // =========================================================
    const onFinish = async (values: any) => {
        setSubmitting(true);
        try {
            const token = getAuthToken();
            const payload = { ...values };

            if (payload.specValuesMap) {
                payload.specValues = Object.entries(payload.specValuesMap)
                    .filter(([_, val]) => val !== undefined && val !== null && val !== '')
                    .map(([attrId, val]) => ({ attributeId: Number(attrId), value: val }));
            }
            delete payload.specValuesMap;

            if (payload.specificationsJson && Array.isArray(payload.specificationsJson)) {
                payload.specificationsJson = payload.specificationsJson
                    .filter((group: any) => group.title && group.items && group.items.length > 0)
                    .map((group: any) => ({
                        title: group.title,
                        items: group.items.map((i: any) => ({ label: i.label, value: i.value }))
                    }));
            } else {
                payload.specificationsJson = [];
            }

            let finalThumbnailUrl = values.thumbnailUrl;
            let newThumbnailFile = null;

            if (values.thumbnail && values.thumbnail.length > 0 && values.thumbnail[0].originFileObj) {
                newThumbnailFile = values.thumbnail[0].originFileObj;
                finalThumbnailUrl = null;
            }
            payload.thumbnailUrl = finalThumbnailUrl;
            delete payload.thumbnail; 

            const galleryFilesToUpload: File[] = [];
            if (values.gallery && values.gallery.length > 0) {
                values.gallery.forEach((fileItem: any) => {
                    if (fileItem.originFileObj) galleryFilesToUpload.push(fileItem.originFileObj);
                });
            }
            delete payload.gallery;

            const formData = new FormData();
            formData.append('data', JSON.stringify(payload)); 
            if (newThumbnailFile) formData.append('thumbnail', newThumbnailFile);
            galleryFilesToUpload.forEach(file => formData.append('gallery', file));

            const apiUrl = isEdit ? `http://localhost:8080/api/admin/products/${id}` : 'http://localhost:8080/api/admin/products';
            const res = await fetch(apiUrl, {
                method: isEdit ? 'PUT' : 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            const json = await res.json();
            if (res.ok && (json.status === 'success' || !json.status)) { 
                message.success(isEdit ? "Cập nhật sản phẩm thành công!" : "Thêm mới sản phẩm thành công!");
                navigate('/admin/products'); 
            } else {
                message.error(json.message || "Lỗi lưu sản phẩm");
            }
        } catch (error) {
            message.error("Lỗi kết nối đến máy chủ!");
        } finally {
            setSubmitting(false);
        }
    };

    // =========================================================
    // RENDERS
    // =========================================================

    const tabBasicInfo = (
        <Space direction="vertical" size="middle" style={{ display: 'flex', width: '100%' }}>
            <Divider orientation="left" style={{ marginTop: 0 }}>Thông tin cơ bản</Divider>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item 
                        name="name" label="Tên sản phẩm" validateTrigger={['onChange', 'onBlur']}
                        rules={[ { required: true, message: 'Vui lòng nhập tên sản phẩm!' }, { whitespace: true, message: 'Tên sản phẩm không được chỉ chứa khoảng trắng!' } ]}
                    >
                        <Input />
                    </Form.Item>
                </Col>
                <Col span={12}><Form.Item name="slug" label="Đường dẫn (Slug)" extra="Để trống hệ thống sẽ tự tạo"><Input /></Form.Item></Col>
            </Row>

            <Row gutter={16}>
                <Col span={8}>
                    <Form.Item name="productType" label="Loại sản phẩm" initialValue="MAIN">
                        <Select><Option value="MAIN">Sản phẩm chính</Option><Option value="ACCESSORY">Phụ kiện</Option></Select>
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item name="categoryId" label="Danh mục" rules={[{ required: true }]}>
                        <Select allowClear>{categories.map(cat => <Option key={cat.id} value={cat.id}>{cat.name}</Option>)}</Select>
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item name="brandId" label="Thương hiệu" rules={[{ required: true }]}>
                        <Select allowClear>{brands.map(brand => <Option key={brand.id} value={brand.id}>{brand.name}</Option>)}</Select>
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
                <Col span={8}><Form.Item name="status" label="Trạng thái" initialValue="ACTIVE"><Select><Option value="ACTIVE">Đang bán</Option><Option value="INACTIVE">Ẩn</Option></Select></Form.Item></Col>
            </Row>

            <Divider orientation="left">Thông số vật lý (Phục vụ bộ lọc & Tự động Build JSON)</Divider>
            <Row gutter={16}>
                <Col span={6}>
                    <Form.Item name="osType" label="Hệ điều hành">
                        <Select placeholder="Chọn HĐH" allowClear>
                            <Option value="IOS">iOS</Option><Option value="ANDROID">Android</Option><Option value="WINDOWS">Windows</Option><Option value="OTHER">Khác</Option>
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

    const tabImages = (
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
                                        {/* Ẩn ô Input đi, chỉ giữ để lưu form */}
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

    const tabVariants = (
        <Form.List name="variants">
            {(fields, { add, remove }) => (
                <>
                    {fields.map(({ key, name, ...restField }) => (
                        <Card size="small" key={key} style={{ marginBottom: 16, background: '#fafafa' }} extra={<MinusCircleOutlined onClick={() => remove(name)} style={{ color: 'red', fontSize: '18px', cursor: 'pointer' }} />} title={`Phiên bản #${name + 1}`}>
                            <Row gutter={16}>
                                <Col span={12}><Form.Item {...restField} name={[name, 'sku']} label="Mã SKU" rules={[{ required: true }]}><Input /></Form.Item></Col>
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
                                <Col span={8}><Form.Item {...restField} name={[name, 'colorName']} label="Tên màu"><Input /></Form.Item></Col>
                                <Col span={8}><Form.Item {...restField} name={[name, 'colorHex']} label="Mã màu (Hex)"><Input type="color" style={{ padding: 0, width: '100%', height: 32 }} /></Form.Item></Col>
                                <Col span={8}><Form.Item {...restField} name={[name, 'price']} label="Giá bán (VNĐ)"><InputNumber style={{ width: '100%' }} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} /></Form.Item></Col>
                            </Row>
                            <Row gutter={16}>
                                <Col span={6}><Form.Item {...restField} name={[name, 'ram']} label="RAM"><Input placeholder="8GB" /></Form.Item></Col>
                                <Col span={6}><Form.Item {...restField} name={[name, 'rom']} label="ROM"><Input placeholder="256GB" /></Form.Item></Col>
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

    const tabSpecs = (
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
                    autoSize={{ minRows: 5, maxRows: 15 }} // Bắt đầu bằng 5 dòng, tối đa 15 dòng sẽ xuất hiện scroll
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
                            <Card size="small" key={groupField.key}
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
                                                    <Form.Item {...itemField} name={[itemField.name, 'label']}><Input placeholder="Tên (VD: Tặng kèm)" style={{ width: 220 }} /></Form.Item>
                                                    <Form.Item {...itemField} name={[itemField.name, 'value']}><Input placeholder="Giá trị (VD: Ốp lưng)" style={{ width: 300 }} /></Form.Item>
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

    const tabItems = [
        { key: '1', label: 'Thông tin chung', children: tabBasicInfo,forceRender: true },
        { key: '2', label: 'Hình ảnh', children: tabImages,forceRender: true },
        { key: '3', label: 'Phiên bản (Variants)', children: tabVariants,forceRender: true },
        { key: '4', label: 'Thông số kỹ thuật', children: tabSpecs,forceRender: true },
    ];

    return (
        <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
            <Card title={<Title level={4} style={{ margin: 0 }}>{isEdit ? "Cập nhật Sản phẩm" : "Thêm mới Sản phẩm"}</Title>} extra={<Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>Quay lại</Button>}>
                <Spin spinning={loading} tip="Đang tải dữ liệu...">
                    <Form form={form} layout="vertical" onFinish={onFinish} onFinishFailed={onFinishFailed} initialValues={{ images: [{}], variants: [{}] }}>
                        <Tabs defaultActiveKey="1" items={tabItems} />
                        <Divider />
                        <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
                            <Space>
                                <Button onClick={() => form.resetFields()}>Nhập lại</Button>
                                <Button type="primary" htmlType="submit" loading={submitting} icon={<SaveOutlined />} size="large">Lưu sản phẩm</Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Spin>
            </Card>
        </div>
    );
};

export default ProductCreate;
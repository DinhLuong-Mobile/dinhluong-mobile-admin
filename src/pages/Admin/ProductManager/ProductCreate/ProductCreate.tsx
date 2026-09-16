import React from 'react';
import { Form, Button, Card, Tabs, Space, Typography, message, Divider, Spin } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useProductCreate } from './useProductCreate';

// Import các Tab đã tách (Bạn cần tạo các file này và ném JSX tương ứng vào)
import TabBasicInfo from './components/TabBasicInfo';
import TabImages from './components/TabImages';
import TabVariants from './components/TabVariants';
import TabSpecs from './components/TabSpecs';

const { Title } = Typography;

const ProductCreate: React.FC = () => {
    // Sử dụng custom hook để lấy toàn bộ state và hàm xử lý
    const {
        form, isEdit, loading, submitting, navigate,
        categories, brands, specGroups,
        generatingAI, extractingAI, rawSpecText,
        setRawSpecText, handleInlineUpload, handleGenerateAIContent, handleExtractSpecs, onFinish
    } = useProductCreate();

    const onFinishFailed = (errorInfo: any) => {
        // Hàm này thuần túy xử lý UI báo lỗi, nên có thể giữ lại ở đây
        const errorMessages = errorInfo.errorFields.map((field: any) => {
            const fieldPath = field.name;
            let fieldNameVN = fieldPath.join(' > '); 
            // ... (Copy logic map lỗi của bạn vào đây) ...
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

    // Định nghĩa các tab, truyền các props cần thiết xuống component con
    const tabItems = [
        { 
            key: '1', 
            label: 'Thông tin chung', 
            children: <TabBasicInfo categories={categories} brands={brands} handleGenerateAIContent={handleGenerateAIContent} generatingAI={generatingAI} />,
            forceRender: true 
        },
        { 
            key: '2', 
            label: 'Hình ảnh', 
            children: <TabImages form={form} handleInlineUpload={handleInlineUpload} />,
            forceRender: true 
        },
        { 
            key: '3', 
            label: 'Phiên bản (Variants)', 
            children: <TabVariants form={form} handleInlineUpload={handleInlineUpload} />,
            forceRender: true 
        },
        { 
            key: '4', 
            label: 'Thông số kỹ thuật', 
            children: <TabSpecs 
                form={form} 
                handleInlineUpload={handleInlineUpload} 
                specGroups={specGroups}
                rawSpecText={rawSpecText}
                setRawSpecText={setRawSpecText}
                handleExtractSpecs={handleExtractSpecs}
                extractingAI={extractingAI}
            />,
            forceRender: true 
        },
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
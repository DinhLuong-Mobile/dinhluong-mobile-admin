import { useState, useEffect, useRef } from 'react';
import { Form, message } from 'antd';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { adminMasterDataService, adminProductService, adminAiService } from '../../../../services';
import { generateSlug } from '../../../../utils/helpers';

export const useAccessoryForm = () => {
    const { id } = useParams<{ id: string }>();
    const isEdit = !!id; 
    
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const location = useLocation();
    const hasFetched = useRef(false);

    const [categories, setCategories] = useState<any[]>([]);
    const [brands, setBrands] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [generatingAI, setGeneratingAI] = useState(false);
    const [extractingAI, setExtractingAI] = useState(false);
    const [rawSpecText, setRawSpecText] = useState("");
    const [defaultVariantId, setDefaultVariantId] = useState<number | null>(null);


    useEffect(() => {
        const fetchInitialData = async () => {
            if (hasFetched.current) return;
            hasFetched.current = true;
            setLoading(true);

            try {
                // Tải Categories và Brands
                const [catRes, brandRes] = await Promise.all([
                    adminMasterDataService.getCategories(),
                    adminMasterDataService.getBrands()
                ]);
                if (catRes?.data) setCategories(catRes.data);
                if (brandRes?.data) setBrands(brandRes.data);

                // Xử lý Edit hoặc Clone
                const cloneId = location.state?.cloneFromId;
                const targetId = isEdit ? id : cloneId;

                if (targetId) {
                    const productRes = await adminProductService.getProductById(targetId);
                    const product = productRes?.data;
                    
                    if (product) {
                        const defaultVariant = product.variants?.[0] || null;
                        if (isEdit && defaultVariant?.id) setDefaultVariantId(defaultVariant.id);

                        // Parse ảnh đại diện để hiển thị trên component Upload của Antd
                        const initialThumbnail = product.thumbnailUrl ? [{
                            uid: '-1',
                            name: 'current_image.png',
                            status: 'done',
                            url: product.thumbnailUrl,
                        }] : [];

                        const formData = {
                            name: cloneId ? `${product.name} (Copy)` : product.name,
                            thumbnailUrl: product.thumbnailUrl,
                            thumbnail: initialThumbnail,
                            brandId: product.brandId,
                            categoryId: product.categoryId,
                            description: product.description || '',
                            metaTitle: product.metaTitle,
                            metaDescription: product.metaDescription,
                            sku: cloneId ? '' : (defaultVariant?.sku || `PK-${product.id}`), 
                            originalPrice: defaultVariant?.price || product.originalPrice || 0,
                            displayPrice: defaultVariant?.price || product.displayPrice || 0,
                            stockQuantity: defaultVariant?.stockQuantity || product.totalStock || 0,
                            specificationsJson: product.specificationsJson || []
                        };

                        form.setFieldsValue(formData);
                        message.success(isEdit ? "Đã tải dữ liệu phụ kiện!" : "Sao chép dữ liệu thành công!");
                    }
                }
            } catch (error) {
                console.error("Lỗi fetch data:", error);
                message.error("Lỗi tải dữ liệu khởi tạo!");
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [id, location.state, form, isEdit]);

    // HÀM AI VIẾT BÀI
    const handleAiGenerateDescription = async () => {
        const values = form.getFieldsValue();
        if (!values.name) return message.warning("Vui lòng nhập tên phụ kiện trước!");

        setGeneratingAI(true);
        try {
            const response = await adminAiService.generateAccessoryDescription({
                productName: values.name,
                specificationsJson: JSON.stringify(values.specificationsJson || []),
                imageUrls: values.thumbnailUrl ? [values.thumbnailUrl] : []
            });
            const rawDescription = response?.data || response;
            let finalDescription = "";
            if (typeof rawDescription === 'string') {
                finalDescription = rawDescription;
            } else if (typeof rawDescription === 'object' && rawDescription !== null) {
                finalDescription = rawDescription.content || rawDescription.description || JSON.stringify(rawDescription);
            }
            form.setFieldsValue({ description: finalDescription });
            message.success("✨ AI đã viết lại bài mô tả mới!");
        } catch (error) {
            console.error("Lỗi AI Generate:", error);
            message.error("AI không phản hồi hoặc xảy ra lỗi.");
        } finally {
            setGeneratingAI(false);
        }
    };

    // HÀM AI BÓC TÁCH THÔNG SỐ
    const handleAiExtractSpecs = async () => {
        if (!rawSpecText.trim()) return message.warning("Hãy dán thông số thô vào ô bên cạnh!");

        setExtractingAI(true);
        try {
            const response = await adminAiService.extractAccessorySpecs({ rawText: rawSpecText });
            const responseData = response?.data || response;
            
            let parsedJson = [];
            if (typeof responseData === 'string') {
                parsedJson = JSON.parse(responseData); 
            } else {
                parsedJson = responseData;
            }
            form.setFieldsValue({ specificationsJson: parsedJson });
            message.success("✨ AI đã cập nhật lại bảng thông số!");
            setRawSpecText("");
        } catch (error) {
            console.error("Lỗi AI Extract:", error);
            message.error("Lỗi trích xuất thông số từ AI hoặc dữ liệu trả về không đúng định dạng.");
        } finally {
            setExtractingAI(false);
        }
    };

    // HÀM LƯU DỮ LIỆU
    const onFinish = async (values: any) => {
        setSubmitting(true);
        try {
            const formattedSpecsJson = values.specificationsJson?.map((group: any, index: number) => ({
                id: index + 1,
                title: group.title || "Nhóm thông số",
                items: group.items || []
            })) || [];

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
                variants: [{
                    id: defaultVariantId, 
                    sku: values.sku && values.sku.trim() !== '' 
                        ? values.sku 
                        : `PK-${Date.now()}`,
                    colorName: 'Mặc định',
                    price: values.displayPrice,
                    stockQuantity: values.stockQuantity,
                    isActive: true
                }],
                specificationsJson: formattedSpecsJson
            };

            const formData = new FormData();
            formData.append("data", JSON.stringify(payload));
            if (newImageFile) formData.append("thumbnail", newImageFile);

            if (isEdit) {
                await adminProductService.updateProduct(id as string, formData);
            } else {
                await adminProductService.createProduct(formData);
            }
            
            message.success(isEdit ? 'Cập nhật phụ kiện thành công!' : 'Thêm mới phụ kiện thành công!');
            navigate('/admin/accessories');
        } catch (error) {
            console.error("Lỗi lưu sản phẩm:", error);
            message.error('Lỗi kết nối máy chủ khi lưu.');
        } finally {
            setSubmitting(false);
        }
    };

    return {
        form, isEdit, loading, submitting, navigate,
        brands, categories, generatingAI, extractingAI,
        rawSpecText, setRawSpecText,
        handleAiGenerateDescription, handleAiExtractSpecs, onFinish
    };
};
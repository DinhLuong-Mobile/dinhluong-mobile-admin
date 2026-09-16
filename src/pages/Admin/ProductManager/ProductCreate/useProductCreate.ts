import { useState, useEffect, useRef } from 'react';
import { Form, message } from 'antd';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { adminMasterDataService, adminProductService, adminAiService } from '../../../../services';

export const useProductCreate = () => {
    const { id } = useParams();
    const isEdit = !!id;
    
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const location = useLocation();
    const hasFetched = useRef(false);

    // --- States Dữ Liệu ---
    const [categories, setCategories] = useState<any[]>([]);
    const [brands, setBrands] = useState<any[]>([]);
    const [specGroups, setSpecGroups] = useState<any[]>([]);

    // --- States Loading ---
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    
    // --- States AI ---
    const [generatingAI, setGeneratingAI] = useState(false);
    const [extractingAI, setExtractingAI] = useState(false);
    const [rawSpecText, setRawSpecText] = useState("");

    // 1. TẢI DỮ LIỆU KHỞI TẠO (MASTER DATA & PRODUCT DETAILS)
    useEffect(() => {
        const fetchInitialData = async () => {
            if (hasFetched.current) return;
            hasFetched.current = true;
            setLoading(true);

            try {
                const [catRes, brandRes, specRes] = await Promise.all([
                    adminMasterDataService.getCategories(),
                    adminMasterDataService.getBrands(),
                    adminMasterDataService.getSpecGroups()
                ]);

                if (catRes) setCategories(catRes.data || catRes);
                if (brandRes) setBrands(brandRes.data || brandRes);
                
                let fetchedSpecGroups: any[] = [];
                if (specRes) {
                    fetchedSpecGroups = specRes.data || specRes;
                    setSpecGroups(fetchedSpecGroups);
                }

                // Xử lý logic Edit hoặc Clone
                const cloneId = location.state?.cloneFromId;
                const targetId = isEdit ? id : cloneId;

                if (targetId) {
                    const productRes = await adminProductService.getProductById(targetId);
                    
                    if (productRes.code === 200 || productRes.status === 'success') {
                        const formData = { ...(productRes.data || productRes) }; 
                        
                        // Nếu là Clone, reset ID và đổi tên
                        if (cloneId) {
                            formData.id = null;
                            formData.name = (formData.name || 'Sản phẩm') + " (Copy)";
                            formData.slug = (formData.slug || 'san-pham') + "-copy-" + Date.now();
                        }

                        // Parse Thumbnail
                        if (formData.thumbnailUrl) {
                            formData.thumbnail = [{
                                uid: '-1', name: 'image.png', status: 'done', url: formData.thumbnailUrl,
                            }];
                        }

                        // Parse SpecValuesMap (EAV)
                        if (formData.specValues && Array.isArray(formData.specValues)) {
                            formData.specValuesMap = {};
                            formData.specValues.forEach((item: any) => {
                                formData.specValuesMap[item.attributeId] = item.value;
                            });
                        }

                        // Parse Specifications JSON
                        if (formData.specificationsJson && fetchedSpecGroups.length > 0) {
                            const autoGroupNames = ["Màn hình", "Hệ điều hành & CPU", "Pin & Sạc", ...fetchedSpecGroups.map((g: any) => g.name)];
                            formData.specificationsJson = formData.specificationsJson.filter(
                                (group: any) => !autoGroupNames.includes(group.title)
                            );
                        }

                        form.setFieldsValue(formData);
                        message.success(isEdit ? "Đã tải dữ liệu sản phẩm" : "Đã sao chép dữ liệu thành công!");
                    } else {
                        message.error(productRes.message || "Lấy thông tin sản phẩm thất bại");
                    }
                }
            } catch (error: unknown) {
                const err = error as Error;
                message.error(err.message || "Lỗi khi tải dữ liệu!");
            } finally {
                setLoading(false);
            }
        };
        
        fetchInitialData();
    }, [id, location.state, form, isEdit]);

    // 2. HÀM UPLOAD ẢNH NHANH (INLINE UPLOAD)
    const handleInlineUpload = async (file: File, onSuccess: any, onError: any, fieldPath: (string | number)[]) => {
        const formData = new FormData(); 
        formData.append('file', file); 
        
        try {
            const res = await adminProductService.uploadImage(formData);
            if (res.code === 200 || res.status === 'success') {
                const imageUrl = res.data;
                form.setFieldValue(fieldPath, imageUrl); 
                onSuccess?.("ok");
                message.success("Tải ảnh lên thành công!");
            } else {
                throw new Error(res.message || "Upload lỗi");
            }
        } catch (err: unknown) { 
            const error = err as Error;
            onError?.(error);
            message.error(error.message || "Tải ảnh thất bại!");
        }
    };

    // 3. HÀM GỌI AI VIẾT BÀI VÀ BỒI ẢNH
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
            const htmlContent = await adminAiService.generateDescription({
                productName: values.name,
                specificationsJson: JSON.stringify(values.specValuesMap || {}),
                imageUrls: currentImageUrls
            });
    
            if (htmlContent) {
                const finalHtml = typeof htmlContent === 'string' ? htmlContent : (htmlContent as any).data;
                form.setFieldsValue({ description: finalHtml });
                message.success("✨ AI đã viết bài và bồi ảnh thành công!");
            } else {
                message.error("Không nhận được dữ liệu từ AI.");
            }
        } catch (error: unknown) {
            message.error("Lỗi kết nối đến server AI!");
        } finally {
            setGeneratingAI(false);
        }
    };

    // 4. HÀM GỌI AI BÓC TÁCH THÔNG SỐ
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

            const res = await adminAiService.extractSpecs({ 
                rawText: rawSpecText, 
                attributesInfo: attributesInfo 
            });

            if (res && (res.code === 200 || res.status === 'success' || res.data)) {
                let aiData = res.data || res; 
                if (typeof aiData === 'string') {
                    try {
                        aiData = JSON.parse(aiData);
                    } catch (e) {
                        console.error("Lỗi parse JSON từ AI:", e);
                        message.error("Dữ liệu trả về từ AI không đúng định dạng!");
                        setExtractingAI(false);
                        return;
                    }
                }
                const currentSpecValuesMap = form.getFieldValue('specValuesMap') || {};
                form.setFieldsValue({ specValuesMap: { ...currentSpecValuesMap, ...aiData } });
                
                message.success("✨ AI đã trích xuất và điền thông số thành công!");
                setRawSpecText(""); 
            } else {
                message.error(res?.message || "Có lỗi xảy ra khi AI bóc tách dữ liệu.");
            }
        } catch (error: unknown) {
            message.error("Lỗi kết nối đến máy chủ AI!");
        } finally {
            setExtractingAI(false);
        }
    };

    // 5. HÀM SUBMIT FORM (CREATE / UPDATE)
    const onFinish = async (values: any) => {
        setSubmitting(true);
        try {
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

            const res = isEdit 
                ? await adminProductService.updateProduct(id as string, formData)
                : await adminProductService.createProduct(formData);

            if (res.code === 200 || res.status === 'success' || !res.status) { 
                message.success(isEdit ? "Cập nhật sản phẩm thành công!" : "Thêm mới sản phẩm thành công!");
                navigate('/admin/products'); 
            } else {
                throw new Error(res.message || "Lỗi lưu sản phẩm");
            }
        } catch (error: unknown) {
            const err = error as Error;
            message.error(err.message || "Lỗi kết nối đến máy chủ!");
        } finally {
            setSubmitting(false);
        }
    };

    return {
        form,
        isEdit,
        loading,
        submitting,
        navigate,
        categories,
        brands,
        specGroups,
        generatingAI,
        extractingAI,
        rawSpecText,
        setRawSpecText,
        handleInlineUpload,
        handleGenerateAIContent,
        handleExtractSpecs,
        onFinish
    };
};
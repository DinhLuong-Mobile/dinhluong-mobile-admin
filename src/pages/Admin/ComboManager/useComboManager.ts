import { useState, useEffect } from 'react';
import { Form, message } from 'antd';
import { adminProductService } from '../../../services'; 

export const useComboManager = () => {
    const [mainProducts, setMainProducts] = useState<any[]>([]);
    const [accessories, setAccessories] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    // States cho Modal Quản lý Combo
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedMainProduct, setSelectedMainProduct] = useState<any>(null);
    const [combos, setCombos] = useState<any[]>([]);
    const [comboLoading, setComboLoading] = useState<boolean>(false);
    
    const [form] = Form.useForm();


    useEffect(() => {
        const fetchProductsData = async () => {
            setLoading(true);
            try {
                const [mainRes, accRes] = await Promise.all([
                    adminProductService.getProducts({ productType: 'MAIN', size: 100 }),
                    adminProductService.getProducts({ productType: 'ACCESSORY', size: 500 })
                ]);

                const mainData = mainRes.data;
                setMainProducts(mainData?.content || mainData || []);

                const accData = accRes.data;
                setAccessories(accData?.content || accData || []);
            } catch (error) {
                message.error("Lỗi tải dữ liệu sản phẩm");
            } finally {
                setLoading(false);
            }
        };

        fetchProductsData();
    }, []);
//Lấy danh sách combo theo sản phẩm chính
    const fetchCombosForProduct = async (mainProductId: number | string) => {
        setComboLoading(true);
        try {
            const res = await adminProductService.getCombosByMainProduct(mainProductId);
            setCombos(res.data || []);
        } catch (error) {
            message.error("Lỗi tải danh sách combo");
        } finally {
            setComboLoading(false);
        }
    };


    const openComboModal = (product: any) => {
        setSelectedMainProduct(product);
        setIsModalOpen(true);
        form.resetFields();
        fetchCombosForProduct(product.id);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedMainProduct(null);
        setCombos([]);
    };

    const handleAddCombo = async (values: any) => {
        if (!selectedMainProduct) return;
        try {
            const payload = {
                mainProductId: selectedMainProduct.id,
                relatedProductId: values.relatedProductId,
                discountAmount: values.discountAmount,
                note: values.note
            };

            await adminProductService.createCombo(payload);
            message.success("Thêm combo thành công!");
            form.resetFields();
            fetchCombosForProduct(selectedMainProduct.id);
        } catch (error: any) {
            message.error(error.message || "Lỗi khi thêm combo");
        }
    };

    const handleDeleteCombo = async (comboId: number | string) => {
        try {
            await adminProductService.deleteCombo(comboId);
            message.success("Đã xóa combo");
            if (selectedMainProduct) {
                fetchCombosForProduct(selectedMainProduct.id);
            }
        } catch (error: any) {
            message.error(error.message || "Lỗi khi xóa combo");
        }
    };

    return {
        mainProducts,
        accessories,
        loading,
        isModalOpen,
        selectedMainProduct,
        combos,
        comboLoading,
        form,
        openComboModal,
        closeModal,
        handleAddCombo,
        handleDeleteCombo
    };
};
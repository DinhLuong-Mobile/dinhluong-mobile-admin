import { useState, useCallback } from 'react';
import { message, Form } from 'antd';
import { adminMasterDataService } from '../../../services'; 
import type { Brand, BrandRequest } from '../../../types/brand.types';

// Hàm tạo slug tự động
export const generateSlug = (str: string): string => {
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
        .replace(/[^\w-]+/g, '') 
        .replace(/--+/g, '-')    
        .replace(/^-+/, '')
        .replace(/-+$/, '');
};

export const useBrandManager = () => {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Modal state
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form] = Form.useForm();

    const fetchBrands = useCallback(async () => {
        setLoading(true);
        try {
            const res = await adminMasterDataService.getBrands();
            if (res && res.code === 200 && res.data) {
                setBrands(res.data);
            } else {
                message.error(res?.message || "Không thể tải danh sách thương hiệu");
            }
        } catch (error) {
            message.error("Lỗi tải danh sách thương hiệu");
        } finally {
            setLoading(false);
        }
    }, []);

    const showAddModal = () => {
        setEditingId(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const showEditModal = (record: Brand) => {
        setEditingId(record.id);
        form.setFieldsValue({
            name: record.name,
            slug: record.slug,
            description: record.description,
            thumbnailUrl: record.thumbnailUrl
        });
        setIsModalVisible(true);
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        form.setFieldValue('slug', generateSlug(e.target.value));
    };

    const handleModalOk = async () => {
        try {
            const values: BrandRequest = await form.validateFields();

            const res = editingId 
                ? await adminMasterDataService.updateBrand(editingId, values)
                : await adminMasterDataService.createBrand(values);

            if (res && res.code === 200) {
                message.success(editingId ? "Cập nhật thành công!" : "Thêm mới thành công!");
                setIsModalVisible(false);
                fetchBrands();
            } else {
                message.error(res?.message || "Lỗi khi lưu thương hiệu");
            }
        } catch (error) {
            // Lỗi validate form từ Ant Design
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const res = await adminMasterDataService.deleteBrand(id);
            if (res && res.code === 200) {
                message.success("Xóa thương hiệu thành công!");
                fetchBrands();
            } else {
                message.error(res?.message || "Không thể xóa (Thương hiệu có thể đang được sử dụng trong Sản phẩm)");
            }
        } catch (error) {
            message.error("Lỗi kết nối mạng");
        }
    };

    return {
        brands,
        loading,
        isModalVisible,
        setIsModalVisible,
        editingId,
        form,
        fetchBrands,
        showAddModal,
        showEditModal,
        handleNameChange,
        handleModalOk,
        handleDelete
    };
};
import { useState, useCallback } from 'react';
import { message } from 'antd';
import { adminVoucherService } from '../../../services'; 
import type { Voucher } from '../../../types/voucher.types';

export const useVoucherManager = () => {
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [saving, setSaving] = useState<boolean>(false);

    const fetchVouchers = useCallback(async (keyword: string = '') => {
        setLoading(true);
        try {
            const response = await adminVoucherService.getAllVouchers({ keyword });
            if (response && response.code === 200 && response.data) {
                setVouchers(response.data);
            } else {
                message.error(response?.message || "Không thể tải danh sách Voucher");
            }
        } catch (error) {
            console.error(error);
            message.error("Lỗi kết nối đến máy chủ");
        } finally {
            setLoading(false);
        }
    }, []);

    const saveVoucher = async (id: number | null, payload: Partial<Voucher>) => {
        setSaving(true);
        try {
            const response = id 
                ? await adminVoucherService.updateVoucher(id, payload) 
                : await adminVoucherService.createVoucher(payload);

            if (response && response.code === 200) {
                message.success(id ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
                return true; // Trả về true nếu thành công để UI biết đường đóng Modal
            } else {
                message.error(response?.message || "Lỗi khi lưu Voucher");
                return false;
            }
        } catch (error) {
            console.error(error);
            message.error("Lỗi kết nối máy chủ");
            return false;
        } finally {
            setSaving(false);
        }
    };

    const deleteVoucher = async (id: number) => {
        try {
            const response = await adminVoucherService.deleteVoucher(id);
            if (response && response.code === 200) {
                message.success("Xóa thành công!");
                return true;
            } else {
                message.error(response?.message || "Lỗi khi xóa Voucher");
                return false;
            }
        } catch (error) {
            console.error(error);
            message.error("Lỗi kết nối");
            return false;
        }
    };

    return {
        vouchers,
        loading,
        saving,
        fetchVouchers,
        saveVoucher,
        deleteVoucher
    };
};
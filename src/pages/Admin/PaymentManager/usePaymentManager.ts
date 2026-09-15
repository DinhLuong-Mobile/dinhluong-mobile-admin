import { useState, useEffect } from 'react';
import { message, Modal } from 'antd';
import { adminPaymentService } from '../../../services'; 
import type { PaymentResponse } from '../../../types/payment.types';

export const usePaymentManager = () => {
    const [payments, setPayments] = useState<PaymentResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    
    const [filterMethod, setFilterMethod] = useState<string>('ALL');
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [searchText, setSearchText] = useState<string>('');
    
    const [reloadTrigger, setReloadTrigger] = useState<number>(0);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await adminPaymentService.getAllPayments({
                    method: filterMethod,
                    status: filterStatus,
                    keyword: searchText
                });

                if (isMounted) {
                    if (response && response.code === 200 && response.data) {
                        setPayments(response.data);
                    } else {
                        message.error(response?.message || "Không thể tải danh sách giao dịch");
                    }
                }
            } catch (error) {
                if (isMounted) message.error("Lỗi kết nối đến máy chủ");
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [filterMethod, filterStatus, searchText, reloadTrigger]);

    const fetchPayments = () => {
        setReloadTrigger(prev => prev + 1);
    };

    const handleConfirmRefund = (paymentId: number) => {
        Modal.confirm({
            title: 'Xác nhận Đã hoàn tiền?',
            content: 'Bạn có chắc chắn là tiền đã được chuyển trả lại cho khách hàng không? Hành động này không thể hoàn tác.',
            okText: 'Xác nhận',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    const response = await adminPaymentService.confirmRefund(paymentId);
                    
                    if (response && response.code === 200) {
                        message.success("Cập nhật trạng thái hoàn tiền thành công!");
                        fetchPayments(); 
                    } else {
                        message.error(response?.message || "Lỗi khi cập nhật trạng thái");
                    }
                } catch (error) {
                    message.error("Lỗi kết nối máy chủ");
                }
            }
        });
    };

    return {
        payments,
        loading,
        filterMethod, setFilterMethod,
        filterStatus, setFilterStatus,
        searchText, setSearchText,
        fetchPayments,
        handleConfirmRefund
    };
};
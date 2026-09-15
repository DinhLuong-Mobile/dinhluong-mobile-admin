import { useState, useCallback } from 'react';
import { message } from 'antd';
import { adminReviewService } from '../../../services'; 
import type { AdminCommentResponse } from '../../../types/review.types';

export const useReviewManager = () => {
    const [reviews, setReviews] = useState<AdminCommentResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [total, setTotal] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);

    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [searchText, setSearchText] = useState<string>('');

    // Modal Trả lời
    const [isReplyModalVisible, setIsReplyModalVisible] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);
    const [replyLoading, setReplyLoading] = useState(false);

    const fetchReviews = useCallback(async (page = 1, size = 10, keyword = searchText, status = filterStatus) => {
        setLoading(true);
        try {
            const params: any = {
                page: page - 1, // Spring Data JPA page bắt đầu từ 0
                size: size
            };
            if (keyword) params.keyword = keyword;
            if (status !== 'ALL') params.status = status;

            const response = await adminReviewService.getReviews(params);
            
            if (response && response.code === 200 && response.data) {
                setReviews(response.data.content);
                setTotal(response.data.totalElements);
                setCurrentPage(page);
                setPageSize(size);
            } else {
                message.error(response?.message || "Lỗi khi lấy danh sách đánh giá");
            }
        } catch (error) {
            message.error("Lỗi kết nối đến máy chủ");
        } finally {
            setLoading(false);
        }
    }, [searchText, filterStatus]);

    const updateStatus = async (id: number, newStatus: string) => {
        try {
            const response = await adminReviewService.updateStatus(id, newStatus);
            if (response && response.code === 200) {
                message.success("Cập nhật trạng thái thành công!");
                fetchReviews(currentPage, pageSize);
            } else {
                message.error(response?.message || "Lỗi khi cập nhật");
            }
        } catch (error) {
            message.error("Lỗi kết nối khi cập nhật");
        }
    };

    const openReplyModal = (id: number) => {
        setSelectedReviewId(id);
        setReplyContent('');
        setIsReplyModalVisible(true);
    };

    const submitReply = async () => {
        if (!replyContent.trim()) {
            message.warning("Vui lòng nhập nội dung trả lời");
            return;
        }
        if (selectedReviewId === null) return;

        setReplyLoading(true);
        try {
            const response = await adminReviewService.replyToReview(selectedReviewId, { content: replyContent });
            if (response && response.code === 200) {
                message.success("Đã gửi phản hồi thành công!");
                setIsReplyModalVisible(false);
                fetchReviews(currentPage, pageSize);
            } else {
                message.error(response?.message || "Lỗi khi gửi phản hồi");
            }
        } catch (error) {
            message.error("Lỗi kết nối");
        } finally {
            setReplyLoading(false);
        }
    };

    const deleteReview = async (id: number) => {
        try {
            const response = await adminReviewService.deleteReview(id);
            if (response && response.code === 200) {
                message.success("Đã xóa bình luận!");
                fetchReviews(currentPage, pageSize);
            } else {
                message.error(response?.message || "Lỗi khi xóa");
            }
        } catch (error) {
            message.error("Lỗi khi xóa bình luận");
        }
    };

    return {
        reviews, loading, total, currentPage, pageSize,
        filterStatus, setFilterStatus,
        searchText, setSearchText,
        isReplyModalVisible, setIsReplyModalVisible,
        replyContent, setReplyContent, replyLoading,
        fetchReviews, updateStatus, openReplyModal, submitReply, deleteReview
    };
};
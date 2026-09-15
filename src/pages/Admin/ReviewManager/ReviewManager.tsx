import React, { useState, useEffect } from 'react';
import { 
    Table, Tag, Space, Typography, Input, 
    Select, Button, message, Avatar, Card, 
    Tooltip, Rate, Image, Modal, Popconfirm 
} from 'antd';
import { 
    SearchOutlined, CheckCircleOutlined, CloseCircleOutlined, 
    MessageOutlined, DeleteOutlined, UserOutlined,
    EyeOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// --- INTERFACES ---
interface AdminCommentResponse {
    id: number;
    productId: number;
    userId: number;
    authorName: string;
    authorPhone: string;
    authorAvatar: string;
    rating: number;
    content: string;
    isPurchased: boolean;
    isAdminReply: boolean;
    status: string;
    createdAt: string;
    imageUrls: string[];
    replies: AdminCommentResponse[];
}

const ReviewManager: React.FC = () => {
    // States
    const [reviews, setReviews] = useState<AdminCommentResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [total, setTotal] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);
    
    // Filters
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [searchText, setSearchText] = useState<string>('');

    // Modal Trả lời
    const [isReplyModalVisible, setIsReplyModalVisible] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);
    const [replyLoading, setReplyLoading] = useState(false);

    const getAuthToken = () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr).token : '';
    };

    // --- FETCH DỮ LIỆU ---
    const fetchReviews = async (page = 1, size = 10) => {
        setLoading(true);
        try {
            const token = getAuthToken();
            const queryParams = new URLSearchParams({
                page: (page - 1).toString(), // Spring Data JPA page bắt đầu từ 0
                size: size.toString()
            });
            
            if (searchText) queryParams.append('keyword', searchText);
            if (filterStatus !== 'ALL') queryParams.append('status', filterStatus);

            const response = await fetch(`http://localhost:8080/api/admin/reviews?${queryParams.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await response.json();
            
            if (response.ok && json.status === 'success') {
                setReviews(json.data.content);
                setTotal(json.data.totalElements);
                setCurrentPage(page);
                setPageSize(size);
            } else {
                message.error(json.message || "Lỗi khi lấy danh sách đánh giá");
            }
        } catch (error) {
            message.error("Lỗi kết nối đến máy chủ");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews(1, pageSize);
    }, [filterStatus, searchText]);

    // --- CẬP NHẬT TRẠNG THÁI (DUYỆT / TỪ CHỐI) ---
    const handleUpdateStatus = async (id: number, newStatus: string) => {
        try {
            const token = getAuthToken();
            const response = await fetch(`http://localhost:8080/api/admin/reviews/${id}/status?status=${newStatus}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const json = await response.json();
            if (response.ok) {
                message.success("Cập nhật trạng thái thành công!");
                fetchReviews(currentPage, pageSize); // Gọi lại để lấy dữ liệu mới
            } else {
                message.error(json.message);
            }
        } catch (error) {
            message.error("Lỗi kết nối khi cập nhật");
        }
    };

    // --- TRẢ LỜI BÌNH LUẬN ---
    const handleOpenReplyModal = (id: number) => {
        setSelectedReviewId(id);
        setReplyContent('');
        setIsReplyModalVisible(true);
    };

    const submitReply = async () => {
        if (!replyContent.trim()) {
            message.warning("Vui lòng nhập nội dung trả lời");
            return;
        }

        setReplyLoading(true);
        try {
            const token = getAuthToken();
            const response = await fetch(`http://localhost:8080/api/admin/reviews/${selectedReviewId}/reply`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: replyContent })
            });
            
            if (response.ok) {
                message.success("Đã gửi phản hồi thành công!");
                setIsReplyModalVisible(false);
                fetchReviews(currentPage, pageSize);
            } else {
                const json = await response.json();
                message.error(json.message || "Lỗi khi gửi phản hồi");
            }
        } catch (error) {
            message.error("Lỗi kết nối");
        } finally {
            setReplyLoading(false);
        }
    };

    // --- XÓA BÌNH LUẬN ---
    const handleDelete = async (id: number) => {
        try {
            const token = getAuthToken();
            const response = await fetch(`http://localhost:8080/api/admin/reviews/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                message.success("Đã xóa bình luận!");
                fetchReviews(currentPage, pageSize);
            } else {
                const json = await response.json();
                message.error(json.message);
            }
        } catch (error) {
            message.error("Lỗi khi xóa bình luận");
        }
    };

    // --- CẤU HÌNH CỘT CHO BẢNG ---
    const columns = [
        { 
            title: 'Khách hàng', 
            key: 'user', 
            width: 250,
            render: (_: any, record: AdminCommentResponse) => (
                <Space>
                    <Avatar src={record.authorAvatar} icon={<UserOutlined />} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Text strong>{record.authorName || 'Ẩn danh'}</Text>
                        <Text type="secondary" style={{ fontSize: '12px' }}>{record.authorPhone || `User ID: ${record.userId}`}</Text>
                        {record.isPurchased && <Tag color="green" style={{ marginTop: 4, width: 'fit-content' }}>Đã mua hàng</Tag>}
                    </div>
                </Space>
            )
        },
       { 
        title: 'Sản phẩm', 
        key: 'product', 
        width: 250,
        render: (_: any, record: AdminCommentResponse) => (
            <Space>
                <Image
                    src={record.productThumbnail}
                    width={45}
                    height={45}
                    style={{ objectFit: 'contain', borderRadius: 4, border: '1px solid #f0f0f0' }}
                    fallback="https://via.placeholder.com/45?text=No+Image"
                />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <Tooltip title={record.productName}>
                        <Text strong style={{ width: 150 }} ellipsis>
                            {record.productName}
                        </Text>
                    </Tooltip>
                    <Space size={0}>
                        <Tag color="blue" style={{ fontSize: '10px' }}>#{record.productId}</Tag>
                        <a 
                            href={`https://localhost:5173/Product/${record.productSlug}`} 
                            target="_blank" 
                            rel="noreferrer"
                            style={{ fontSize: '12px' }}
                        >
                            Xem web <EyeOutlined />
                        </a>
                    </Space>
                </div>
            </Space>
        )
    },
        { 
            title: 'Nội dung đánh giá', 
            key: 'content', 
            render: (_: any, record: AdminCommentResponse) => (
                <div style={{ maxWidth: 400 }}>
                    <Rate disabled defaultValue={record.rating} style={{ fontSize: 14, marginBottom: 8 }} />
                    <p style={{ margin: 0 }}>{record.content}</p>
                    
                    {/* Hiển thị ảnh đính kèm nếu có */}
                    {record.imageUrls && record.imageUrls.length > 0 && (
                        <div style={{ marginTop: 8 }}>
                            <Image.PreviewGroup>
                                <Space size={4} wrap>
                                    {record.imageUrls.map((url, index) => (
                                        <Image key={index} src={url} width={50} height={50} style={{ objectFit: 'cover', borderRadius: 4 }} />
                                    ))}
                                </Space>
                            </Image.PreviewGroup>
                        </div>
                    )}
                </div>
            )
        },
        { 
            title: 'Ngày tạo', 
            dataIndex: 'createdAt', 
            key: 'createdAt',
            width: 150,
            render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm') 
        },
        { 
            title: 'Trạng thái', 
            dataIndex: 'status', 
            key: 'status',
            width: 120,
            render: (status: string) => {
                let color = 'gold';
                let text = 'Chờ duyệt';
                if (status === 'APPROVED') { color = 'green'; text = 'Đã duyệt'; }
                if (status === 'REJECTED') { color = 'red'; text = 'Từ chối'; }
                return <Tag color={color}>{text}</Tag>;
            }
        },
        {
            title: 'Hành động',
            key: 'action',
            align: 'center' as const,
            width: 200,
            render: (_: any, record: AdminCommentResponse) => (
                <Space size="small">
                    {/* Nút Duyệt / Từ chối (Chỉ hiện khi đang ở trạng thái khác) */}
                    {record.status !== 'APPROVED' && (
                        <Tooltip title="Duyệt hiển thị">
                            <Button size="small" type="primary" style={{ background: '#52c41a' }} icon={<CheckCircleOutlined />} onClick={() => handleUpdateStatus(record.id, 'APPROVED')} />
                        </Tooltip>
                    )}
                    {record.status !== 'REJECTED' && (
                        <Tooltip title="Từ chối/Ẩn">
                            <Button size="small" danger icon={<CloseCircleOutlined />} onClick={() => handleUpdateStatus(record.id, 'REJECTED')} />
                        </Tooltip>
                    )}
                    
                    {/* Nút Trả lời */}
                    <Tooltip title="Phản hồi khách hàng">
                        <Button size="small" icon={<MessageOutlined />} onClick={() => handleOpenReplyModal(record.id)} />
                    </Tooltip>

                    {/* Nút Xóa */}
                    <Popconfirm title="Bạn có chắc chắn muốn xóa đánh giá này?" onConfirm={() => handleDelete(record.id)}>
                        <Tooltip title="Xóa">
                            <Button size="small" type="text" danger icon={<DeleteOutlined />} />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    // --- RENDER REPLIES BÊN DƯỚI BÌNH LUẬN GỐC ---
    const expandedRowRender = (record: AdminCommentResponse) => {
        if (!record.replies || record.replies.length === 0) return null;
        return (
            <div style={{ padding: '10px 20px', backgroundColor: '#f9f9f9', borderLeft: '3px solid #1890ff' }}>
                <Text strong style={{ color: '#1890ff', marginBottom: 8, display: 'block' }}>Phản hồi của Admin:</Text>
                {record.replies.map(reply => (
                    <div key={reply.id} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: '1px dashed #e8e8e8' }}>
                        <Text style={{ display: 'block' }}>{reply.content}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            Đã trả lời lúc: {dayjs(reply.createdAt).format('DD/MM/YYYY HH:mm')} 
                        </Text>
                        <Popconfirm title="Xóa câu trả lời này?" onConfirm={() => handleDelete(reply.id)}>
                            <Button type="link" danger size="small" style={{ padding: '0 8px' }}>Xóa phản hồi</Button>
                        </Popconfirm>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div style={{ padding: 24, background: '#fff', borderRadius: 8 }}>
            <Title level={4} style={{ margin: '0 0 20px 0' }}>Quản lý Đánh giá & Bình luận</Title>

            {/* BỘ LỌC */}
            <Card size="small" style={{ marginBottom: 20, background: '#fafafa' }}>
                <Space wrap size="large">
                    <div>
                        <Text strong style={{ marginRight: 8 }}>Tìm kiếm:</Text>
                        <Input.Search 
                            placeholder="Tên khách hàng, nội dung..." 
                            allowClear 
                            onSearch={(value) => setSearchText(value)} 
                            style={{ width: 280 }} 
                        />
                    </div>
                    <div>
                        <Text strong style={{ marginRight: 8 }}>Trạng thái:</Text>
                        <Select value={filterStatus} onChange={setFilterStatus} style={{ width: 150 }}>
                            <Option value="ALL">Tất cả</Option>
                            <Option value="PENDING">Chờ duyệt</Option>
                            <Option value="APPROVED">Đã duyệt (Hiển thị)</Option>
                            <Option value="REJECTED">Bị từ chối (Ẩn)</Option>
                        </Select>
                    </div>
                </Space>
            </Card>

            {/* BẢNG DỮ LIỆU */}
            <Table 
                columns={columns} 
                dataSource={reviews} 
                rowKey="id" 
                loading={loading} 
                expandable={{ 
                    expandedRowRender,
                    rowExpandable: record => record.replies && record.replies.length > 0
                }}
                pagination={{ 
                    current: currentPage,
                    pageSize: pageSize,
                    total: total,
                    showSizeChanger: true,
                    onChange: (page, size) => fetchReviews(page, size)
                }} 
            />

            {/* MODAL TRẢ LỜI */}
            <Modal
                title="Phản hồi đánh giá của khách hàng"
                open={isReplyModalVisible}
                onOk={submitReply}
                onCancel={() => setIsReplyModalVisible(false)}
                confirmLoading={replyLoading}
                okText="Gửi phản hồi"
                cancelText="Hủy"
            >
                <TextArea 
                    rows={4} 
                    placeholder="Nhập nội dung phản hồi của cửa hàng..." 
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                />
            </Modal>
        </div>
    );
};

export default ReviewManager;
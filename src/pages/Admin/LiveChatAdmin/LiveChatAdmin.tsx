import React, { useState, useEffect, useRef } from 'react';
import { Layout, List, Avatar, Typography, Input, Button, Badge, Space, message, Spin } from 'antd';
import { UserOutlined, SendOutlined, MessageOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Client } from '@stomp/stompjs';

const { Sider, Content } = Layout;
const { Text, Title } = Typography;

interface Conversation {
    userId: number;
    userName: string;
    userAvatar: string;
    lastMessage: string;
    sentAt: string;
    unreadCount: number;
    isRead: boolean;
}

interface ChatMessage {
    id: number;
    senderId: number;
    receiverId: number;
    message: string;
    isRead: boolean;
    sentAt: string;
}

const LiveChatAdmin: React.FC = () => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeUserId, setActiveUserId] = useState<number | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [loadingChats, setLoadingChats] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const stompClientRef = useRef<Client | null>(null);
    
    // 🌟 KHẮC PHỤC LỖI WEBSOCKET KHÔNG NHẬN DIỆN ĐƯỢC STATE MỚI NHẤT
    const activeUserIdRef = useRef<number | null>(null);
    useEffect(() => {
        activeUserIdRef.current = activeUserId;
    }, [activeUserId]);

    // Lấy thông tin Admin đang đăng nhập
    const userStr = localStorage.getItem('user');
    const adminUser = userStr ? JSON.parse(userStr) : null;
    const ADMIN_ID = adminUser?.id || 2; 

    const getAuthToken = () => adminUser?.token || '';

    // --- 1. FETCH DANH SÁCH CONVERSATION BAN ĐẦU ---
    const fetchConversations = async () => {
        if (!adminUser) return;
        try {
            const res = await fetch(`http://localhost:8080/api/admin/chat/conversations`, {
                headers: { 'Authorization': `Bearer ${getAuthToken()}` }
            });
            const json = await res.json();
            if (res.ok) setConversations(json.data);
        } catch (error) {
            console.error("Lỗi lấy danh sách chat");
        }
    };

    // --- 2. KẾT NỐI WEBSOCKET ---
    useEffect(() => {
        if (!adminUser) return;

        fetchConversations();

        const wsUrl = `ws://localhost:8080/ws?token=${getAuthToken()}`;
        
        const client = new Client({
            brokerURL: wsUrl,
            onConnect: () => {
                setIsConnected(true);
                
                client.subscribe('/user/queue/messages', (message) => {
                    const newMsg: ChatMessage = JSON.parse(message.body);
                    handleIncomingMessage(newMsg);
                });
            },
            onDisconnect: () => setIsConnected(false),
            onStompError: (frame) => console.error('Broker error:', frame.headers['message'])
        });

        client.activate();
        stompClientRef.current = client;

        return () => {
            if (stompClientRef.current) stompClientRef.current.deactivate();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // --- 3. XỬ LÝ KHI CÓ TIN NHẮN TỚI ---
    const handleIncomingMessage = (newMsg: ChatMessage) => {
        const otherUserId = newMsg.senderId === ADMIN_ID ? newMsg.receiverId : newMsg.senderId;
        const currentActiveId = activeUserIdRef.current; // Lấy ID đang mở từ Ref (luôn chính xác)

        // A. Cập nhật khung chat bên phải (Nếu đang mở đúng box chat này)
        if (currentActiveId === otherUserId) {
            setMessages(prev => {
                // 🌟 FIX DUPLICATE: Nếu tin nhắn đã có trên màn hình thì bỏ qua
                if (prev.some(m => m.id === newMsg.id)) return prev;
                return [...prev, newMsg];
            });
            scrollToBottom();
            
            // Bắn API báo đã đọc ngầm cho Backend
            fetch(`http://localhost:8080/api/admin/chat/history/${otherUserId}`, {
                headers: { 'Authorization': `Bearer ${getAuthToken()}` }
            });
        }

        // B. Cập nhật danh sách bên trái
        setConversations(prev => {
            let exists = false;
            const updatedList = prev.map(conv => {
                if (conv.userId === otherUserId) {
                    exists = true;
                    
                    // 🌟 FIX LỖI "ĐANG Ở BOX CHAT MÀ VẪN BÁO CHƯA ĐỌC"
                    // Nếu Admin đang ở đúng box chat này -> số chưa đọc ép bằng 0 luôn. 
                    // Nếu không ở box chat này -> mới cộng thêm 1.
                    const isCurrentlyReading = (currentActiveId === otherUserId);
                    const newUnreadCount = isCurrentlyReading ? 0 : (newMsg.senderId !== ADMIN_ID ? conv.unreadCount + 1 : 0);

                    return {
                        ...conv,
                        lastMessage: newMsg.message,
                        sentAt: newMsg.sentAt || new Date().toISOString(),
                        unreadCount: newUnreadCount 
                    };
                }
                return conv;
            });

            // Nếu khách mới tinh nhắn tới, gọi API load lại danh sách
            if (!exists) {
                fetchConversations();
                return prev; 
            }

            // Sắp xếp đưa tin nhắn mới nhất lên đầu
            return updatedList.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
        });
    };

    // --- 4. CLICK CHỌN 1 KHÁCH HÀNG ---
    const handleSelectUser = async (userId: number) => {
        setActiveUserId(userId);
        setLoadingChats(true);
        
        try {
            const res = await fetch(`http://localhost:8080/api/admin/chat/history/${userId}`, {
                headers: { 'Authorization': `Bearer ${getAuthToken()}` }
            });
            const json = await res.json();
            if (res.ok) {
                setMessages(json.data);
                scrollToBottom();
            }
            
            // Ép UI số chưa đọc về 0 khi click vào
            setConversations(prev => prev.map(c => c.userId === userId ? { ...c, unreadCount: 0 } : c));
        } catch (error) {
            message.error("Lỗi lấy lịch sử chat");
        } finally {
            setLoadingChats(false);
        }
    };

    // --- 5. GỬI TIN NHẮN ---
    const handleSendMessage = () => {
        if (!inputText.trim() || !activeUserId || !stompClientRef.current || !isConnected) return;
        
        const chatPayload = {
            senderId: ADMIN_ID,
            receiverId: activeUserId,
            message: inputText
        };

        // Bắn qua WebSocket
        stompClientRef.current.publish({
            destination: "/app/chat.sendMessage",
            body: JSON.stringify(chatPayload)
        });

        // 🌟 Add hiển thị ngay lập tức lên màn hình Admin
        const optimisticMsg: ChatMessage = {
            id: Date.now(), // Fake ID tạm thời để render không bị lỗi key
            senderId: ADMIN_ID,
            receiverId: activeUserId,
            message: inputText,
            isRead: false,
            sentAt: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, optimisticMsg]);
        setInputText('');
        scrollToBottom();

        // Cập nhật text ở danh sách bên trái
        setConversations(prev => prev.map(c => 
            c.userId === activeUserId ? { ...c, lastMessage: inputText, sentAt: new Date().toISOString() } : c
        ).sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()));
    };

    const scrollToBottom = () => {
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    return (
        <Layout style={{ height: 'calc(100vh - 120px)', background: '#fff', borderRadius: 8, overflow: 'hidden', border: '1px solid #f0f0f0' }}>
            <Sider width={320} theme="light" style={{ borderRight: '1px solid #f0f0f0' }}>
                <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0', background: '#fafafa' }}>
                    <Title level={5} style={{ margin: 0 }}>Hội thoại trực tuyến</Title>
                    <small style={{ color: isConnected ? '#52c41a' : '#f5222d' }}>
                        {isConnected ? '● Đã kết nối' : '○ Đang kết nối...'}
                    </small>
                </div>
                <List
                    itemLayout="horizontal"
                    dataSource={conversations}
                    style={{ height: 'calc(100% - 70px)', overflowY: 'auto' }}
                    renderItem={item => (
                        <List.Item 
                            onClick={() => handleSelectUser(item.userId)}
                            style={{ 
                                padding: '12px 16px', cursor: 'pointer', transition: 'background 0.3s',
                                background: activeUserId === item.userId ? '#e6f7ff' : '#fff',
                            }}
                        >
                            <List.Item.Meta
                                avatar={
                                    <Badge count={item.unreadCount} size="small" offset={[-2, 2]}>
                                        <Avatar src={item.userAvatar} icon={<UserOutlined />} size="large" />
                                    </Badge>
                                }
                                title={
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text strong>{item.userName}</Text>
                                        <Text type="secondary" style={{ fontSize: 11 }}>
                                            {dayjs(item.sentAt).format('HH:mm')}
                                        </Text>
                                    </div>
                                }
                                description={
                                    <Text type="secondary" ellipsis style={{ maxWidth: 200, fontWeight: item.unreadCount > 0 ? 600 : 400, color: item.unreadCount > 0 ? '#1890ff' : 'inherit' }}>
                                        {item.lastMessage}
                                    </Text>
                                }
                            />
                        </List.Item>
                    )}
                />
            </Sider>

            <Content style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {activeUserId ? (
                    <>
                        {/* Header Box Chat */}
                        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f0f0', background: '#fafafa' }}>
                            <Space>
                                <Avatar icon={<UserOutlined />} />
                                <Text strong style={{ fontSize: 16 }}>{conversations.find(c => c.userId === activeUserId)?.userName}</Text>
                            </Space>
                        </div>

                        {/* Vùng chat */}
                        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', background: '#f5f5f5' }}>
                            {loadingChats ? <div style={{ textAlign: 'center', marginTop: 50 }}><Spin /></div> : (
                                messages.map(msg => {
                                    const isAdmin = msg.senderId === ADMIN_ID;
                                    return (
                                        <div key={msg.id} style={{ display: 'flex', justifyContent: isAdmin ? 'flex-end' : 'flex-start', marginBottom: 16 }}>
                                            <div style={{
                                                maxWidth: '65%', padding: '10px 16px', borderRadius: '18px',
                                                background: isAdmin ? '#1890ff' : '#fff', color: isAdmin ? '#fff' : '#000',
                                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)', wordBreak: 'break-word'
                                            }}>
                                                <div>{msg.message}</div>
                                                <div style={{ fontSize: 10, marginTop: 4, textAlign: 'right', color: isAdmin ? '#e6f7ff' : '#8c8c8c' }}>
                                                    {dayjs(msg.sentAt).format('HH:mm')}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input nhập liệu */}
                        <div style={{ padding: '16px', background: '#fff' }}>
                            <Input
                                size="large"
                                placeholder="Nhập tin nhắn hỗ trợ khách hàng..."
                                value={inputText}
                                onChange={e => setInputText(e.target.value)}
                                onPressEnter={handleSendMessage}
                                disabled={!isConnected}
                                suffix={
                                    <Button type="primary" shape="circle" icon={<SendOutlined />} disabled={!isConnected} onClick={handleSendMessage} />
                                }
                            />
                        </div>
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', color: '#8c8c8c' }}>
                        <MessageOutlined style={{ fontSize: 64, opacity: 0.2, marginBottom: 16 }} />
                        <Title level={4} type="secondary">Chọn một khách hàng để bắt đầu trò chuyện</Title>
                    </div>
                )}
            </Content>
        </Layout>
    );
};

export default LiveChatAdmin;
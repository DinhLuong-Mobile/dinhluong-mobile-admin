import React, { useState, useEffect, useRef } from 'react';
import { Layout, List, Avatar, Typography, Input, Button, Badge, Space, Spin } from 'antd';
import { UserOutlined, SendOutlined, MessageOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';


import { useLiveChat } from './useLiveChat';

const { Sider, Content } = Layout;
const { Text, Title } = Typography;

const LiveChatAdmin: React.FC = () => {
    const {
        conversations,
        activeUserId,
        messages,
        loadingChats,
        isConnected,
        ADMIN_ID,
        selectUser,
        sendMessage
    } = useLiveChat();

    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    // Tự động scroll xuống cuối khi messages thay đổi
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!inputText.trim()) return;
        sendMessage(inputText);
        setInputText('');
    };

    return (
        <Layout style={{ height: 'calc(100vh - 120px)', background: '#fff', borderRadius: 8, overflow: 'hidden', border: '1px solid #f0f0f0' }}>
            {/* Cột danh sách hội thoại bên trái */}
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
                            onClick={() => selectUser(item.userId)}
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

            {/* Khung chat chi tiết bên phải */}
            <Content style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {activeUserId ? (
                    <>
                        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f0f0', background: '#fafafa' }}>
                            <Space>
                                <Avatar icon={<UserOutlined />} />
                                <Text strong style={{ fontSize: 16 }}>{conversations.find(c => c.userId === activeUserId)?.userName}</Text>
                            </Space>
                        </div>

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

                        <div style={{ padding: '16px', background: '#fff' }}>
                            <Input
                                size="large"
                                placeholder="Nhập tin nhắn hỗ trợ khách hàng..."
                                value={inputText}
                                onChange={e => setInputText(e.target.value)}
                                onPressEnter={handleSend}
                                disabled={!isConnected}
                                suffix={
                                    <Button type="primary" shape="circle" icon={<SendOutlined />} disabled={!isConnected} onClick={handleSend} />
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
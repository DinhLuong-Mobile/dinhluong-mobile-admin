
import { useState, useEffect, useRef, useCallback } from 'react';
import { message } from 'antd';
import { Client } from '@stomp/stompjs';
import { adminChatService } from '../../../services'; 
import { useAuth } from '../../../contexts/AuthContext';
import type { ConversationDTO, ChatMessage } from '../../../types/chat.types';

export const useLiveChat = () => {
    const [conversations, setConversations] = useState<ConversationDTO[]>([]);
    const [activeUserId, setActiveUserId] = useState<number | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loadingChats, setLoadingChats] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    const stompClientRef = useRef<Client | null>(null);
    const activeUserIdRef = useRef<number | null>(null);

    const { user, isLogin } = useAuth();
    const ADMIN_ID = user?.id || 2;
    const token = user?.token || '';

    useEffect(() => {
        activeUserIdRef.current = activeUserId;
    }, [activeUserId]);


    const fetchConversations = useCallback(async () => {
        if (!isLogin) return;
        try {
            const res = await adminChatService.getConversations();
            if (res && res.code === 200 && res.data) {
                setConversations(res.data);
            }
        } catch (error) {
            console.error("Lỗi lấy danh sách chat", error);
        }
    }, [isLogin]);

    const handleIncomingMessage = useCallback((newMsg: ChatMessage) => {
        const otherUserId = newMsg.senderId === ADMIN_ID ? newMsg.receiverId : newMsg.senderId;
        const currentActiveId = activeUserIdRef.current;

        if (currentActiveId === otherUserId) {
            setMessages(prev => {
                if (prev.some(m => m.id === newMsg.id)) return prev;
                return [...prev, newMsg];
            });

            adminChatService.getHistory(otherUserId).catch(() => {});
        }

        setConversations(prev => {
            let exists = false;
            const updatedList = prev.map(conv => {
                if (conv.userId === otherUserId) {
                    exists = true;
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

            if (!exists) {
                fetchConversations();
                return prev;
            }

            return updatedList.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
        });
    }, [ADMIN_ID, fetchConversations]);

    useEffect(() => {
        if (!isLogin || !token) return;

        let isMounted = true;

        const initChatData = async () => {
            if (!isMounted) return;
            try {
                const res = await adminChatService.getConversations();
                if (isMounted && res && res.code === 200 && res.data) {
                    setConversations(res.data);
                }
            } catch (error) {
                console.error("Lỗi khởi tạo danh sách chat", error);
            }
        };

        initChatData();

        const wsBaseUrl = import.meta.env.VITE_WS_URL;
        const wsUrl = `${wsBaseUrl}/ws?token=${token}`;

        const client = new Client({
            brokerURL: wsUrl,
            onConnect: () => {
                if (isMounted) setIsConnected(true);
                client.subscribe('/user/queue/messages', (frameMessage) => {
                    const newMsg: ChatMessage = JSON.parse(frameMessage.body);
                    handleIncomingMessage(newMsg);
                });
            },
            onDisconnect: () => {
                if (isMounted) setIsConnected(false);
            },
            onStompError: (frame) => console.error('Broker error:', frame.headers['message'])
        });

        client.activate();
        stompClientRef.current = client;

        return () => {
            isMounted = false;
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
            }
        };
    }, [isLogin, token, handleIncomingMessage]);

    const selectUser = async (userId: number) => {
        setActiveUserId(userId);
        setLoadingChats(true);
        
        try {
            const res = await adminChatService.getHistory(userId);
            if (res && res.code === 200 && res.data) {
                setMessages(res.data);
            }
            setConversations(prev => prev.map(c => c.userId === userId ? { ...c, unreadCount: 0 } : c));
        } catch (error) {
            message.error("Lỗi lấy lịch sử chat");
        } finally {
            setLoadingChats(false);
        }
    };

    const sendMessage = (text: string) => {
        if (!text.trim() || !activeUserId || !stompClientRef.current || !isConnected) return;

        const chatPayload = {
            senderId: ADMIN_ID,
            receiverId: activeUserId,
            message: text
        };

        stompClientRef.current.publish({
            destination: "/app/chat.sendMessage",
            body: JSON.stringify(chatPayload)
        });

        const optimisticMsg: ChatMessage = {
            id: Date.now(),
            senderId: ADMIN_ID,
            receiverId: activeUserId,
            message: text,
            isRead: false,
            sentAt: new Date().toISOString()
        };

        setMessages(prev => [...prev, optimisticMsg]);

        setConversations(prev => prev.map(c => 
            c.userId === activeUserId ? { ...c, lastMessage: text, sentAt: new Date().toISOString() } : c
        ).sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()));
    };

    return {
        conversations,
        activeUserId,
        messages,
        loadingChats,
        isConnected,
        ADMIN_ID,
        selectUser,
        sendMessage
    };
};
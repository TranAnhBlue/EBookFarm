import React, { useState, useRef, useEffect } from 'react';
import { Button, Input, Avatar, Badge, Tooltip, Alert, Progress, QRCode } from 'antd';
import {
    MessageOutlined,
    SendOutlined,
    CloseOutlined,
    RobotOutlined,
    UserOutlined,
    CrownOutlined,
    LoginOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { API_URL } from 'src/lib/utils';
import './index.css';

const { TextArea } = Input;

const AIChatWidget = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'bot',
            text: 'Xin chÃ o! ðŸ‘‹ TÃ´i lÃ  trá»£ lÃ½ áº£o cá»§a EBookFarm. TÃ´i cÃ³ thá»ƒ giÃºp gÃ¬ cho báº¡n?',
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [hasNewMessage, setHasNewMessage] = useState(false);
    const [showWelcome, setShowWelcome] = useState(true);
    const [chatInfo, setChatInfo] = useState(null);
    const [showUpgradeAlert, setShowUpgradeAlert] = useState(false);
    const messagesEndRef = useRef(null);

    // Láº¥y thÃ´ng tin user tá»« localStorage
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    // Láº¥y thÃ´ng tin chat khi má»Ÿ widget
    useEffect(() => {
        if (isOpen && !chatInfo) {
            fetchChatInfo();
        }
    }, [isOpen]);

    const fetchChatInfo = async () => {
        try {
            const headers = {
                'Content-Type': 'application/json'
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_URL}/chat/my-info`, {
                headers
            });

            const data = await response.json();
            if (data.success) {
                setChatInfo(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch chat info:', error);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const quickReplies = [
        'ðŸ“‹ TÃ­nh nÄƒng cá»§a há»‡ thá»‘ng',
        'ðŸ’° Báº£ng giÃ¡ dá»‹ch vá»¥',
        'ðŸ“ž LiÃªn há»‡ tÆ° váº¥n',
        'ðŸŽ“ HÆ°á»›ng dáº«n sá»­ dá»¥ng'
    ];

    const botResponses = {
        'greeting': 'Xin chÃ o! ðŸ˜Š Ráº¥t vui Ä‘Æ°á»£c há»— trá»£ báº¡n. TÃ´i cÃ³ thá»ƒ giÃºp báº¡n tÃ¬m hiá»ƒu vá»:\n\nâœ… TÃ­nh nÄƒng há»‡ thá»‘ng\nðŸ’° Báº£ng giÃ¡ dá»‹ch vá»¥\nðŸ“ž ThÃ´ng tin liÃªn há»‡\nðŸŽ“ HÆ°á»›ng dáº«n sá»­ dá»¥ng\n\nBáº¡n quan tÃ¢m Ä‘áº¿n váº¥n Ä‘á» nÃ o?',
        'tÃ­nh nÄƒng': 'EBookFarm cung cáº¥p giáº£i phÃ¡p toÃ n diá»‡n:\n\nðŸ“ **Nháº­t kÃ½ sáº£n xuáº¥t Ä‘iá»‡n tá»­**\nâ€¢ Ghi chÃ©p trÃªn mobile/web\nâ€¢ LÆ°u trá»¯ Ä‘Ã¡m mÃ¢y an toÃ n\nâ€¢ BÃ¡o cÃ¡o tá»± Ä‘á»™ng\n\nðŸ” **Truy xuáº¥t nguá»“n gá»‘c QR**\nâ€¢ Táº¡o mÃ£ QR cho tá»«ng lÃ´ hÃ ng\nâ€¢ NgÆ°á»i tiÃªu dÃ¹ng quÃ©t Ä‘á»ƒ xem thÃ´ng tin\nâ€¢ TuÃ¢n thá»§ TCVN 35+ tiÃªu chuáº©n\n\nâ›“ï¸ **Quáº£n lÃ½ chuá»—i cung á»©ng**\nâ€¢ Káº¿t ná»‘i nhÃ  cung cáº¥p - nÃ´ng tráº¡i - HTX\nâ€¢ Kiá»ƒm soÃ¡t cháº¥t lÆ°á»£ng toÃ n chuá»—i\nâ€¢ BÃ¡o cÃ¡o & phÃ¢n tÃ­ch\n\nBáº¡n muá»‘n demo thá»­ khÃ´ng?',
        'giÃ¡': 'ðŸ’° **Báº£ng giÃ¡ linh hoáº¡t theo nhu cáº§u:**\n\nðŸŒ± **GÃ³i CÆ¡ báº£n** - Tá»« 500k/thÃ¡ng\nâ€¢ PhÃ¹ há»£p nÃ´ng há»™ nhá» (< 5ha)\nâ€¢ Nháº­t kÃ½ Ä‘iá»‡n tá»­ cÆ¡ báº£n\nâ€¢ 100 mÃ£ QR/thÃ¡ng\n\nðŸŒ¿ **GÃ³i ChuyÃªn nghiá»‡p** - Tá»« 2tr/thÃ¡ng\nâ€¢ Cho HTX vÃ  trang tráº¡i (5-50ha)\nâ€¢ Äáº§y Ä‘á»§ tÃ­nh nÄƒng\nâ€¢ 1000 mÃ£ QR/thÃ¡ng\nâ€¢ Há»— trá»£ Æ°u tiÃªn\n\nðŸŒ³ **GÃ³i Doanh nghiá»‡p** - BÃ¡o giÃ¡ riÃªng\nâ€¢ Giáº£i phÃ¡p toÃ n diá»‡n\nâ€¢ TÃ¹y chá»‰nh theo yÃªu cáº§u\nâ€¢ KhÃ´ng giá»›i háº¡n\nâ€¢ ÄÃ o táº¡o & há»— trá»£ 24/7\n\nðŸ“ž Gá»i 1900 xxxx Ä‘á»ƒ nháº­n Æ°u Ä‘Ã£i!',
        'liÃªn há»‡': 'ðŸ“ž **LiÃªn há»‡ vá»›i chÃºng tÃ´i:**\n\nâ˜Žï¸ **Hotline:** 1900 xxxx\nðŸ“§ **Email:** contact@ebookfarm.vn\nðŸŒ **Website:** ebookfarm.vn\nðŸ¢ **VÄƒn phÃ²ng:** [Äá»‹a chá»‰]\n\nâ° **Giá» lÃ m viá»‡c:**\nT2-T6: 8:00 - 17:30\nT7: 8:00 - 12:00\n\nðŸ’¬ Hoáº·c Ä‘á»ƒ láº¡i thÃ´ng tin, chÃºng tÃ´i sáº½ gá»i láº¡i trong 30 phÃºt!',
        'hÆ°á»›ng dáº«n': 'ðŸ“š **TÃ i liá»‡u & Há»— trá»£:**\n\nðŸŽ¥ **Video hÆ°á»›ng dáº«n**\nâ€¢ CÃ i Ä‘áº·t & thiáº¿t láº­p ban Ä‘áº§u\nâ€¢ Ghi nháº­t kÃ½ sáº£n xuáº¥t\nâ€¢ Táº¡o mÃ£ QR truy xuáº¥t\nâ€¢ Quáº£n lÃ½ chuá»—i cung á»©ng\n\nðŸ“– **TÃ i liá»‡u PDF**\nâ€¢ HÆ°á»›ng dáº«n chi tiáº¿t tá»«ng tÃ­nh nÄƒng\nâ€¢ FAQ - CÃ¢u há»i thÆ°á»ng gáº·p\nâ€¢ Best practices\n\nðŸ‘¨â€ðŸ« **ÄÃ o táº¡o trá»±c tiáº¿p**\nâ€¢ ÄÃ o táº¡o táº¡i vÄƒn phÃ²ng\nâ€¢ ÄÃ o táº¡o táº¡i nÃ´ng tráº¡i\nâ€¢ Webinar online\n\nðŸ†˜ **Há»— trá»£ 24/7**\nâ€¢ Hotline: 1900 xxxx\nâ€¢ Live chat\nâ€¢ Email support\n\nBáº¡n muá»‘n nháº­n tÃ i liá»‡u nÃ o?',
        'tcvn': 'ðŸ“‹ **TiÃªu chuáº©n TCVN:**\n\nHá»‡ thá»‘ng tuÃ¢n thá»§ 35+ tiÃªu chuáº©n TCVN vá» truy xuáº¥t nguá»“n gá»‘c:\n\nðŸ¥¬ Rau quáº£: TCVN 12827:2023\nðŸ· Thá»‹t lá»£n: TCVN 13166-4:2020\nâ˜• CÃ  phÃª: TCVN 13840:2023\nðŸŸ Thá»§y sáº£n: TCVN 13841:2023\nðŸŒ¾ Gáº¡o: TCVN 13842:2023\n\nVÃ  nhiá»u tiÃªu chuáº©n khÃ¡c...\n\nâœ… Äáº£m báº£o xuáº¥t kháº©u quá»‘c táº¿\nâœ… Minh báº¡ch 100%\nâœ… TÃ­ch há»£p Cá»•ng TXNG Quá»‘c gia',
        'demo': 'ðŸŽ¯ **ÄÄƒng kÃ½ Demo miá»…n phÃ­:**\n\nChÃºng tÃ´i sáº½:\nâœ… Giá»›i thiá»‡u chi tiáº¿t há»‡ thá»‘ng\nâœ… Demo trá»±c tiáº¿p cÃ¡c tÃ­nh nÄƒng\nâœ… TÆ° váº¥n giáº£i phÃ¡p phÃ¹ há»£p\nâœ… BÃ¡o giÃ¡ chi tiáº¿t\n\nâ±ï¸ Thá»i gian: 30-45 phÃºt\nðŸ“ HÃ¬nh thá»©c: Online hoáº·c táº¡i vÄƒn phÃ²ng\n\nðŸ“ž Gá»i ngay 1900 xxxx hoáº·c Ä‘á»ƒ láº¡i SÄT, chÃºng tÃ´i sáº½ liÃªn há»‡!',
        'thanks': 'Cáº£m Æ¡n báº¡n Ä‘Ã£ quan tÃ¢m Ä‘áº¿n EBookFarm! ðŸ™\n\nNáº¿u cáº§n há»— trá»£ thÃªm, Ä‘á»«ng ngáº¡i liÃªn há»‡:\nðŸ“ž Hotline: 1900 xxxx\nðŸ“§ Email: contact@ebookfarm.vn\n\nChÃºc báº¡n má»™t ngÃ y tá»‘t lÃ nh! ðŸŒŸ',
        'default': 'Cáº£m Æ¡n báº¡n Ä‘Ã£ liÃªn há»‡! ðŸ˜Š\n\nTÃ´i chÆ°a hiá»ƒu rÃµ cÃ¢u há»i cá»§a báº¡n. Báº¡n cÃ³ thá»ƒ:\n\n1ï¸âƒ£ Chá»n cÃ¢u há»i gá»£i Ã½ bÃªn dÆ°á»›i\n2ï¸âƒ£ Gá»i hotline: 1900 xxxx\n3ï¸âƒ£ Email: contact@ebookfarm.vn\n\nHoáº·c há»i tÃ´i vá»:\nâ€¢ TÃ­nh nÄƒng há»‡ thá»‘ng\nâ€¢ Báº£ng giÃ¡\nâ€¢ HÆ°á»›ng dáº«n sá»­ dá»¥ng\nâ€¢ TiÃªu chuáº©n TCVN\nâ€¢ ÄÄƒng kÃ½ demo'
    };

    const getBotResponse = (userMessage) => {
        const message = userMessage.toLowerCase();

        // Greetings
        if (message.match(/^(xin chÃ o|chÃ o|hello|hi|hey)/)) {
            return botResponses['greeting'];
        }
        // Features
        else if (message.includes('tÃ­nh nÄƒng') || message.includes('chá»©c nÄƒng') || message.includes('lÃ m Ä‘Æ°á»£c gÃ¬') || message.includes('cÃ³ gÃ¬')) {
            return botResponses['tÃ­nh nÄƒng'];
        }
        // Pricing
        else if (message.includes('giÃ¡') || message.includes('chi phÃ­') || message.includes('bao nhiÃªu') || message.includes('phÃ­')) {
            return botResponses['giÃ¡'];
        }
        // Contact
        else if (message.includes('liÃªn há»‡') || message.includes('gá»i') || message.includes('sá»‘ Ä‘iá»‡n thoáº¡i') || message.includes('email')) {
            return botResponses['liÃªn há»‡'];
        }
        // Guide
        else if (message.includes('hÆ°á»›ng dáº«n') || message.includes('cÃ¡ch dÃ¹ng') || message.includes('sá»­ dá»¥ng') || message.includes('tÃ i liá»‡u')) {
            return botResponses['hÆ°á»›ng dáº«n'];
        }
        // TCVN
        else if (message.includes('tcvn') || message.includes('tiÃªu chuáº©n') || message.includes('chá»©ng nháº­n')) {
            return botResponses['tcvn'];
        }
        // Demo
        else if (message.includes('demo') || message.includes('dÃ¹ng thá»­') || message.includes('tráº£i nghiá»‡m')) {
            return botResponses['demo'];
        }
        // Thanks
        else if (message.includes('cáº£m Æ¡n') || message.includes('thanks') || message.includes('thank')) {
            return botResponses['thanks'];
        }
        // Default
        else {
            return null;
        }
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userMessage = {
            id: messages.length + 1,
            type: 'user',
            text: inputValue,
            timestamp: new Date()
        };

        setMessages([...messages, userMessage]);
        setInputValue('');
        setIsTyping(true);
        setShowUpgradeAlert(false);

        // 1. Check local predefined responses first for instant reply
        const localResponse = getBotResponse(inputValue);
        if (localResponse) {
            setTimeout(() => {
                const botMessage = {
                    id: messages.length + 2,
                    type: 'bot',
                    text: localResponse,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, botMessage]);
                setIsTyping(false);
            }, 500); // Short realistic typing delay
            return;
        }

        // 2. Call AI API for complex queries
        try {
            const headers = {
                'Content-Type': 'application/json'
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            // Call RAG API (Real Data + AI!)
            const response = await fetch(`${API_URL}/rag/chat`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    message: inputValue,
                    conversationHistory: messages.slice(-10) // Send last 10 messages for context
                })
            });

            const data = await response.json();

            let botResponseText;
            if (data.success && data.data && data.data.response) {
                botResponseText = data.data.response;

                // Cáº­p nháº­t thÃ´ng tin chat
                if (data.data.chatLevel && data.data.remainingChats !== undefined) {
                    setChatInfo(prev => ({
                        ...prev,
                        chatLevel: data.data.chatLevel,
                        remainingChats: data.data.remainingChats,
                        dailyUsed: prev ? prev.dailyUsed + 1 : 1
                    }));
                }
            } else if (data.requireUpgrade) {
                // Háº¿t lÆ°á»£t chat
                botResponseText = data.message;
                setShowUpgradeAlert(true);
                setChatInfo(prev => ({
                    ...prev,
                    upgradeInfo: data.upgradeInfo
                }));
            } else if (data.fallbackResponse) {
                botResponseText = data.fallbackResponse;
            } else {
                botResponseText = 'Xin lá»—i, tÃ´i Ä‘ang gáº·p sá»± cá»‘. Vui lÃ²ng thá»­ láº¡i sau hoáº·c liÃªn há»‡ hotline: 1900 xxxx';
            }

            const botMessage = {
                id: messages.length + 2,
                type: 'bot',
                text: botResponseText,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMessage]);
            setIsTyping(false);

        } catch (error) {
            console.error('Chat error:', error);

            // Fallback to local response if API fails
            const botMessage = {
                id: messages.length + 2,
                type: 'bot',
                text: getBotResponse(inputValue) || botResponses['default'],
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMessage]);
            setIsTyping(false);
        }
    };

    const handleQuickReply = (reply) => {
        setInputValue(reply);
        setTimeout(() => handleSendMessage(), 100);
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setHasNewMessage(false);
            fetchChatInfo();
        }
    };

    const getChatLevelIcon = (level) => {
        switch (level) {
            case 'admin':
            case 'vip':
                return <CrownOutlined className="text-yellow-400" />;
            case 'user':
                return <UserOutlined className="text-blue-400" />;
            default:
                return <UserOutlined className="text-gray-400" />;
        }
    };

    const getChatLevelColor = (level) => {
        switch (level) {
            case 'admin':
            case 'vip':
                return 'gold';
            case 'user':
                return 'blue';
            default:
                return 'default';
        }
    };

    const getChatLevelText = (level) => {
        switch (level) {
            case 'admin':
                return 'Admin';
            case 'vip':
                return 'VIP';
            case 'user':
                return 'User';
            default:
                return 'Guest';
        }
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <>
            {/* Welcome Tooltip */}
            {!isOpen && hasNewMessage && (
                <div className="ai-chat-welcome-tooltip">
                    <div className="ai-chat-welcome-content">
                        <div className="font-bold mb-1">ðŸ‘‹ Xin chÃ o!</div>
                        <div className="text-sm">TÃ´i cÃ³ thá»ƒ giÃºp gÃ¬ cho báº¡n?</div>
                    </div>
                    <Button
                        type="text"
                        size="small"
                        icon={<CloseOutlined />}
                        onClick={() => setHasNewMessage(false)}
                        className="ai-chat-welcome-close"
                    />
                </div>
            )}

            {/* Chat Widget Button */}
            <div className="ai-chat-widget-container">
                {!isOpen && (
                    <Tooltip title="Chat vá»›i AI Assistant" placement="left">
                        <Badge dot={hasNewMessage} offset={[-5, 5]}>
                            <Button
                                type="primary"
                                shape="circle"
                                size="large"
                                icon={<MessageOutlined />}
                                onClick={toggleChat}
                                className="ai-chat-toggle-btn"
                            />
                        </Badge>
                    </Tooltip>
                )}

                {/* Chat Window */}
                {isOpen && (
                    <div className="ai-chat-window">
                        {/* Header */}
                        <div className="ai-chat-header">
                            <div className="flex items-center gap-3">
                                <Avatar
                                    size={40}
                                    icon={<RobotOutlined />}
                                    className="bg-gradient-to-br from-green-400 to-blue-500"
                                />
                                <div>
                                    <div className="font-bold text-white flex items-center gap-2">
                                        AI Assistant
                                    </div>
                                    <div className="text-xs text-green-100 flex items-center gap-1">
                                        <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
                                        Äang hoáº¡t Ä‘á»™ng

                                    </div>
                                </div>
                            </div>
                            <Button
                                type="text"
                                icon={<CloseOutlined />}
                                onClick={toggleChat}
                                className="text-white hover:bg-white/20"
                            />
                        </div>

                        {/* Messages */}
                        <div className="ai-chat-messages">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`ai-chat-message ${message.type === 'user' ? 'user' : 'bot'}`}
                                >
                                    {message.type === 'bot' && (
                                        <Avatar
                                            size={32}
                                            icon={<RobotOutlined />}
                                            className="bg-gradient-to-br from-green-400 to-blue-500 shrink-0"
                                        />
                                    )}
                                    <div className="ai-chat-message-content">
                                        <div className="ai-chat-message-bubble">
                                            {message.type === 'bot' ? (
                                                <ReactMarkdown
                                                    className="markdown-body"
                                                    components={{
                                                        img: ({ node, alt, src, ...props }) => {
                                                            if (alt === 'QR') {
                                                                const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
                                                                const qrUrl = src ? src.replace('https://ebookfarm.vn', baseUrl) : `${baseUrl}/trace/demo-qr-123`;
                                                                
                                                                return (
                                                                    <div className="flex flex-col items-center justify-center bg-white p-4 my-4 rounded-xl border border-gray-200 shadow-sm">
                                                                        <QRCode value={qrUrl} size={150} />
                                                                        <div className="text-[11px] font-bold text-gray-400 mt-3 uppercase tracking-wider">QuÃ©t mÃ£ QR Demo</div>
                                                                    </div>
                                                                );
                                                            }
                                                            return <img src={src} alt={alt} {...props} className="max-w-full rounded-lg my-2" />;
                                                        }
                                                    }}
                                                >
                                                    {message.text}
                                                </ReactMarkdown>
                                            ) : (
                                                message.text
                                            )}
                                        </div>
                                        <div className="ai-chat-message-time">
                                            {formatTime(message.timestamp)}
                                        </div>
                                    </div>
                                    {message.type === 'user' && (
                                        <Avatar
                                            size={32}
                                            icon={<UserOutlined />}
                                            className="bg-blue-500 shrink-0"
                                        />
                                    )}
                                </div>
                            ))}

                            {isTyping && (
                                <div className="ai-chat-message bot">
                                    <Avatar
                                        size={32}
                                        icon={<RobotOutlined />}
                                        className="bg-gradient-to-br from-green-400 to-blue-500 shrink-0"
                                    />
                                    <div className="ai-chat-message-content">
                                        <div className="ai-chat-typing">
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Replies */}
                        {messages.length <= 2 && (
                            <div className="ai-chat-quick-replies">
                                {quickReplies.map((reply, index) => (
                                    <Button
                                        key={index}
                                        size="small"
                                        className="ai-chat-quick-reply-btn"
                                        onClick={() => handleQuickReply(reply)}
                                    >
                                        {reply}
                                    </Button>
                                ))}
                            </div>
                        )}

                        {/* Input */}
                        <div className="ai-chat-input">
                            <TextArea
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onPressEnter={(e) => {
                                    if (!e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                                placeholder="Nháº­p tin nháº¯n..."
                                autoSize={{ minRows: 1, maxRows: 3 }}
                                className="ai-chat-textarea"
                            />
                            <Button
                                type="primary"
                                icon={<SendOutlined />}
                                onClick={handleSendMessage}
                                disabled={!inputValue.trim()}
                                className="ai-chat-send-btn"
                            />
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default AIChatWidget;


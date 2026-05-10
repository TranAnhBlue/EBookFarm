import { Button, Space, Typography, Avatar, Dropdown, Divider as AntdDivider } from 'antd';
import { useNavigate } from 'react-router-dom';
import authSession from 'src/services/core/authSession';
import { UserOutlined, LogoutOutlined, DashboardOutlined, MenuOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { Drawer } from 'antd';
import { getAvatarUrl } from 'src/lib/utils';
import logo from 'src/assets/images/logo/logo-ebookfarm.jpg';

const { Title } = Typography;

const PublicNavbar = () => {
    const navigate = useNavigate();
    const user = authSession.getUser();
  const token = authSession.getAccessToken();
  const logout = () => { authSession.clearSession(); window.location.href = '/login'; };;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const userMenuItems = [
        {
            key: 'dashboard',
            label: 'Báº£ng Ä‘iá»u khiá»ƒn',
            icon: <DashboardOutlined />,
            onClick: () => navigate('/dashboard')
        },
        {
            key: 'profile',
            label: 'Trang cÃ¡ nhÃ¢n',
            icon: <UserOutlined />,
            onClick: () => navigate('/account-info')
        },
        {
            type: 'divider'
        },
        {
            key: 'logout',
            label: 'ÄÄƒng xuáº¥t',
            icon: <LogoutOutlined />,
            danger: true,
            onClick: handleLogout
        }
    ];

    return (
        <nav className="fixed top-0 w-full z-50 glass-card border-b border-gray-100 flex justify-center">
            <div className="w-full max-w-7xl px-6 md:px-12 py-4 flex items-center justify-between">
                
                {/* Left Side: Logo */}
                <div className="flex-1 flex justify-start">
                    <div className="flex items-center gap-3 cursor-pointer transition-opacity hover:opacity-80" onClick={() => navigate('/')}>
                        <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-white shadow-sm border border-gray-50">
                            <img src={logo} alt="EBookFarm Logo" className="w-[140%] h-[140%] object-contain mix-blend-multiply" />
                        </div>
                        <div className="flex flex-col justify-center">
                            <span className="text-green-600 font-extrabold text-[18px] leading-[1.1] uppercase tracking-tight">Nháº­t kÃ½ sáº£n xuáº¥t</span>
                            <span className="text-green-600 font-extrabold text-[18px] leading-[1.1] uppercase tracking-tight">Äiá»‡n tá»­</span>
                        </div>
                    </div>
                </div>

                {/* Center: Desktop Menu */}
                <div className="hidden lg:flex justify-center items-center">
                    <Space size="large">
                        <Button type="text" className="font-bold text-gray-600 hover:text-green-600 px-4 py-2 rounded-xl transition-all" onClick={() => navigate('/')}>Trang chá»§</Button>
                        <Button type="text" className="font-bold text-gray-600 hover:text-green-600 px-4 py-2 rounded-xl transition-all" onClick={() => navigate('/reference/tcvn')}>Tra cá»©u TCVN</Button>
                        <Button type="text" className="font-bold text-gray-600 hover:text-green-600 px-4 py-2 rounded-xl transition-all" onClick={() => navigate('/news')}>Tin tá»©c</Button>
                        <Button type="text" className="font-bold text-gray-600 hover:text-green-600 px-4 py-2 rounded-xl transition-all" onClick={() => {
                            if (window.location.pathname === '/') {
                                document.getElementById('about-us')?.scrollIntoView({ behavior: 'smooth' });
                            } else {
                                navigate('/');
                                setTimeout(() => document.getElementById('about-us')?.scrollIntoView({ behavior: 'smooth' }), 300);
                            }
                        }}>Vá» chÃºng tÃ´i</Button>
                    </Space>
                </div>

                {/* Right Side: Auth & Mobile Menu */}
                <div className="flex-1 flex justify-end items-center">
                    <Space size={0} className="flex items-center">
                        {token ? (
                            <div className="flex items-center">
                                <Button
                                    type="text"
                                    icon={<DashboardOutlined />}
                                    className="font-bold text-green-600 hover:bg-green-50 rounded-lg px-3 hidden sm:flex items-center transition-all"
                                    onClick={() => navigate('/dashboard')}
                                >
                                    Báº£ng Ä‘iá»u khiá»ƒn
                                </Button>

                                <AntdDivider type="vertical" className="h-8 border-gray-100 mx-4 hidden sm:block" />

                                <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
                                    <div className="flex items-center gap-3 cursor-pointer p-1.5 hover:bg-gray-50/80 rounded-2xl transition-all border border-transparent hover:border-gray-100">
                                        <Avatar
                                            size={40}
                                            src={getAvatarUrl(user?.avatar)}
                                            style={{ backgroundColor: '#16a34a' }}
                                            icon={!user?.avatar && <UserOutlined />}
                                            className="shadow-sm border-2 border-white"
                                        />
                                        <div className="hidden md:flex flex-col justify-center min-w-[80px]">
                                            <span className="text-[10px] text-gray-400 font-black uppercase leading-none tracking-widest mb-0.5">Xin chÃ o</span>
                                            <span className="text-[14px] text-gray-800 font-extrabold leading-none truncate">
                                                {user?.fullname || user?.username || user?.email?.split('@')[0] || 'NgÆ°á»i dÃ¹ng'}
                                            </span>
                                        </div>
                                    </div>
                                </Dropdown>
                            </div>
                        ) : (
                            <Space size="small">
                                <Button type="text" className="font-bold text-green-600 px-2 rounded-full" onClick={() => navigate('/login')}>ÄÄƒng nháº­p</Button>
                                <Button type="primary" size="large" className="bg-green-600 hover:bg-green-700 rounded-full font-bold px-4 md:px-6 border-0 shadow-lg shadow-green-100" onClick={() => navigate('/register')}>ÄÄƒng kÃ½</Button>
                            </Space>
                        )}

                        {/* Mobile Menu Toggle */}
                        <Button
                            type="text"
                            icon={<MenuOutlined />}
                            className="lg:hidden ml-2 text-xl text-gray-600"
                            onClick={() => setMobileMenuOpen(true)}
                        />
                    </Space>
                </div>

                {/* Mobile Drawer */}
                <Drawer
                    title={
                        <div className="flex items-center gap-2">
                            <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />
                            <span className="text-green-600 font-black text-sm uppercase">EBookFarm</span>
                        </div>
                    }
                    placement="right"
                    onClose={() => setMobileMenuOpen(false)}
                    open={mobileMenuOpen}
                    width={280}
                >
                    <div className="flex flex-col gap-4">
                        <Button type="text" className="text-left font-bold text-gray-600" onClick={() => { navigate('/'); setMobileMenuOpen(false); }}>Trang chá»§</Button>
                        <Button type="text" className="text-left font-bold text-gray-600" onClick={() => { navigate('/reference/tcvn'); setMobileMenuOpen(false); }}>Tra cá»©u TCVN</Button>
                        <Button type="text" className="text-left font-bold text-gray-600" onClick={() => { navigate('/news'); setMobileMenuOpen(false); }}>Tin tá»©c</Button>
                        <Button type="text" className="text-left font-bold text-gray-600" onClick={() => {
                            setMobileMenuOpen(false);
                            if (window.location.pathname === '/') {
                                document.getElementById('about-us')?.scrollIntoView({ behavior: 'smooth' });
                            } else {
                                navigate('/');
                                setTimeout(() => document.getElementById('about-us')?.scrollIntoView({ behavior: 'smooth' }), 300);
                            }
                        }}>Vá» chÃºng tÃ´i</Button>
                        
                        <AntdDivider className="my-2" />
                        
                        {!token && (
                            <Button type="primary" className="bg-green-600 border-0 h-12 rounded-xl font-bold" onClick={() => { navigate('/register'); setMobileMenuOpen(false); }}>
                                ÄÄƒng kÃ½
                            </Button>
                        )}
                    </div>
                </Drawer>
            </div>
        </nav>
    );
};

export default PublicNavbar;


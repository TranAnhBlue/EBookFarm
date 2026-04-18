import { Button, Space, Typography, Avatar, Dropdown, Divider as AntdDivider } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { UserOutlined, LogoutOutlined, DashboardOutlined } from '@ant-design/icons';
import logo from '../assets/logo-ebookfarm.jpg';

const { Title } = Typography;

const PublicNavbar = () => {
    const navigate = useNavigate();
    const { token, user, logout } = useAuthStore();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const userMenuItems = [
        {
            key: 'dashboard',
            label: 'Bảng điều khiển',
            icon: <DashboardOutlined />,
            onClick: () => navigate('/dashboard')
        },
        {
            key: 'profile',
            label: 'Trang cá nhân',
            icon: <UserOutlined />,
            onClick: () => navigate('/account-info')
        },
        {
            type: 'divider'
        },
        {
            key: 'logout',
            label: 'Đăng xuất',
            icon: <LogoutOutlined />,
            danger: true,
            onClick: handleLogout
        }
    ];

    return (
        <nav className="fixed top-0 w-full z-50 glass-card border-b border-gray-100 flex justify-center">
            <div className="w-full max-w-7xl px-6 md:px-12 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3 cursor-pointer transition-opacity hover:opacity-80" onClick={() => navigate('/')}>
                    <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-white shadow-sm border border-gray-50">
                        <img src={logo} alt="EBookFarm Logo" className="w-[140%] h-[140%] object-contain mix-blend-multiply" />
                    </div>
                    <div className="flex flex-col justify-center">
                        <span className="text-green-600 font-extrabold text-[18px] leading-[1.1] uppercase tracking-tight">Nhật ký sản xuất</span>
                        <span className="text-green-600 font-extrabold text-[18px] leading-[1.1] uppercase tracking-tight">Điện tử</span>
                    </div>
                </div>

                <Space size="large" className="hidden md:flex">
                    <Button type="text" className="font-bold text-gray-600 hover:text-green-600" onClick={() => navigate('/')}>Trang chủ</Button>
                    <Button type="text" className="font-bold text-gray-600 hover:text-green-600" onClick={() => navigate('/reference/tcvn')}>Tra cứu TCVN</Button>
                    <Button type="text" className="font-bold text-gray-600 hover:text-green-600">Về chúng tôi</Button>
                </Space>

                <Space size={0} className="flex items-center">
                    {token ? (
                        <div className="flex items-center">
                            <Button
                                type="text"
                                icon={<DashboardOutlined />}
                                className="font-bold text-green-600 hover:bg-green-50 rounded-lg px-3 hidden sm:flex items-center transition-all"
                                onClick={() => navigate('/dashboard')}
                            >
                                Dashboard
                            </Button>

                            <AntdDivider type="vertical" className="h-8 border-gray-100 mx-4 hidden sm:block" />

                            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
                                <div className="flex items-center gap-3 cursor-pointer p-1.5 hover:bg-gray-50/80 rounded-2xl transition-all border border-transparent hover:border-gray-100">
                                    <Avatar
                                        size={40}
                                        style={{ backgroundColor: '#16a34a' }}
                                        icon={<UserOutlined />}
                                        className="shadow-sm border-2 border-white"
                                    />
                                    <div className="hidden md:flex flex-col justify-center min-w-[80px]">
                                        <span className="text-[10px] text-gray-400 font-black uppercase leading-none tracking-widest mb-0.5">Xin chào</span>
                                        <span className="text-[14px] text-gray-800 font-extrabold leading-none truncate">
                                            {user?.username || user?.email?.split('@')[0] || 'Người dùng'}
                                        </span>
                                    </div>
                                </div>
                            </Dropdown>
                        </div>
                    ) : (
                        <Space size="middle">
                            <Button type="text" className="font-bold text-green-600" onClick={() => navigate('/login')}>Đăng nhập</Button>
                            <Button type="primary" size="large" className="bg-green-600 hover:bg-green-700 rounded-xl font-bold px-6 border-0 shadow-lg shadow-green-100" onClick={() => navigate('/register')}>Bắt đầu ngay</Button>
                        </Space>
                    )}
                </Space>
            </div>
        </nav>
    );
};

export default PublicNavbar;

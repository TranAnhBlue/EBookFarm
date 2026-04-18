import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicNavbar from './PublicNavbar';
import PublicFooter from './PublicFooter';

const PublicLayout = () => {
    return (
        <div className="min-h-screen bg-white">
            <PublicNavbar />
            <div className="pt-20"> {/* Offset for fixed navbar */}
                <Outlet />
            </div>
            <PublicFooter />
        </div>
    );
};

export default PublicLayout;

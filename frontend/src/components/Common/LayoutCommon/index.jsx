import React from 'react'
import { Outlet } from 'react-router-dom'
import PublicNavbar from '../../Layout/Header'
import PublicFooter from '../../Layout/Footer'

const LayoutCommon = () => {
  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />
      <div className="pt-20">
        {/* Offset for fixed navbar */}
        <Outlet />
      </div>
      <PublicFooter />
    </div>
  )
}

export default LayoutCommon

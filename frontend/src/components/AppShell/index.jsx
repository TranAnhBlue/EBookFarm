import React, { useState, useEffect } from 'react'
import authSession from 'src/services/core/authSession'
import ForceChangePasswordModal from '../Modal/ForceChangePassword'

/**
 * AppShell — global shell logic that runs once auth context is available.
 * Handles mustChangePassword check. Wraps all authenticated content.
 */
const AppShell = ({ children }) => {
  const user = authSession.getUser()
  const [showForceChangePassword, setShowForceChangePassword] = useState(false)

  useEffect(() => {
    if (user && user.mustChangePassword) {
      setShowForceChangePassword(true)
    } else {
      setShowForceChangePassword(false)
    }
  }, [user])

  return (
    <>
      <ForceChangePasswordModal
        visible={showForceChangePassword}
        onSuccess={() => setShowForceChangePassword(false)}
      />
      {children}
    </>
  )
}

export default AppShell

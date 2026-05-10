import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { GOOGLE_CLIENT_ID } from '../../constants/constants'
import ThemeConfigAntd from 'src/theme/ThemeConfigAntd'

const queryClient = new QueryClient()

const Providers = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <ThemeConfigAntd>{children}</ThemeConfigAntd>
      </GoogleOAuthProvider>
    </QueryClientProvider>
  )
}

export default Providers

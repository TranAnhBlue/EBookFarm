import React, { Suspense } from 'react'
import { Navigate, useRoutes } from 'react-router-dom'
import ROUTER from './ROUTER'
import { GuestRoute, ProtectedRoute } from './guards'

// ── Layouts ──────────────────────────────────────────────────────────────────
import LayoutCommon from 'src/components/Common/LayoutCommon'
import LayoutAdmin from 'src/components/Layout/LayoutAdmin'

// ── Lazy-loaded pages ─────────────────────────────────────────────────────────
// ANONYMOUS
const Home = React.lazy(() => import('../pages/ANONYMOUS/Home'))
const Login = React.lazy(() => import('../pages/ANONYMOUS/Login'))
const Register = React.lazy(() => import('../pages/ANONYMOUS/Register'))
const ForgotPassword = React.lazy(() => import('../pages/ANONYMOUS/ForgotPassword'))
const ResetPassword = React.lazy(() => import('../pages/ANONYMOUS/ResetPassword'))
const NotFound = React.lazy(() => import('../pages/ANONYMOUS/NotFound'))
const Forbidden = React.lazy(() => import('../pages/ANONYMOUS/Forbidden'))
const NewsListAll = React.lazy(() => import('../pages/ANONYMOUS/News/NewsListAll'))
const NewsDetail = React.lazy(() => import('../pages/ANONYMOUS/News/NewsDetail'))
const TCVNReference = React.lazy(() => import('../pages/ANONYMOUS/Reference/TCVNReference'))

// ADMIN
const Dashboard = React.lazy(() => import('../pages/ADMIN/Dashboard/index'))
const UserManagement = React.lazy(() => import('../pages/ADMIN/UserManagement/index'))
const JournalManagement = React.lazy(() => import('../pages/ADMIN/JournalManagement/index'))
const FormTemplate = React.lazy(() => import('../pages/ADMIN/FormTemplate/index'))
const Inventory = React.lazy(() => import('../pages/ADMIN/Inventory/index'))
const InventoryCategory = React.lazy(() => import('../pages/ADMIN/InventoryCategory/index'))
const GroupManagement = React.lazy(() => import('../pages/ADMIN/GroupManagement'))
const RolesManagement = React.lazy(() => import('../pages/ADMIN/RolesManagement'))
const NewsManagement = React.lazy(() => import('../pages/ADMIN/NewsManagement'))
const ConsultationManagement = React.lazy(() => import('../pages/ADMIN/ConsultationManagement'))
const Reports = React.lazy(() => import('../pages/ADMIN/Reports'))
const SystemLogs = React.lazy(() => import('../pages/ADMIN/SystemLogs'))
const BackupMgmt = React.lazy(() => import('../pages/ADMIN/BackupMgmt'))
const ChatStats = React.lazy(() => import('../pages/ADMIN/ChatStats'))
const AgricultureModels = React.lazy(() => import('../pages/ADMIN/AgricultureModels'))
const CustomerManagement = React.lazy(() => import('../pages/ADMIN/CustomerManagement'))
const AccountInfo = React.lazy(() => import('../pages/ADMIN/AccountInfo'))
const GeminiTest = React.lazy(() => import('../pages/ADMIN/GeminiTest'))
const OpenAITest = React.lazy(() => import('../pages/ADMIN/OpenAITest'))
const GroqTest = React.lazy(() => import('../pages/ADMIN/GroqTest'))
const RAGTest = React.lazy(() => import('../pages/ADMIN/RAGTest'))

// USER
const ChangePassword = React.lazy(() => import('../pages/USER/ChangePassword'))
const FarmerManagement = React.lazy(() => import('../pages/USER/FarmerManagement'))
const HtxInventory = React.lazy(() => import('../pages/USER/HtxInventory'))
const HtxJournal = React.lazy(() => import('../pages/USER/HtxJournal'))
const JournalList = React.lazy(() => import('../pages/USER/Journal/JournalList'))
const JournalEntry = React.lazy(() => import('../pages/USER/Journal/JournalEntry'))
const JournalTrace = React.lazy(() => import('../pages/USER/Journal/JournalTrace'))
const FarmerInventory = React.lazy(() => import('../pages/USER/FarmerInventory'))
const ProductionTech = React.lazy(() => import('../pages/USER/ProductionTech'))

// ── Spinner fallback ──────────────────────────────────────────────────────────
function LazyLoadingComponent({ children }) {
  return (
    <Suspense
      fallback={
        <div
          style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
        </div>
      }
    >
      {children}
    </Suspense>
  )
}

// ── Route definitions ─────────────────────────────────────────────────────────
const routes = [
  // Public layout (Landing, News, Reference)
  {
    element: <LayoutCommon />,
    children: [
      {
        path: ROUTER.HOME,
        element: (
          <LazyLoadingComponent>
            <Home />
          </LazyLoadingComponent>
        ),
      },
      {
        path: ROUTER.NEWS,
        element: (
          <LazyLoadingComponent>
            <NewsListAll />
          </LazyLoadingComponent>
        ),
      },
      {
        path: ROUTER.NEWS_DETAIL,
        element: (
          <LazyLoadingComponent>
            <NewsDetail />
          </LazyLoadingComponent>
        ),
      },
      {
        path: ROUTER.TCVN,
        element: (
          <LazyLoadingComponent>
            <TCVNReference />
          </LazyLoadingComponent>
        ),
      },
    ],
  },

  // Standalone public auth pages (no layout wrapper)
  {
    path: ROUTER.LOGIN,
    element: (
      <GuestRoute>
        <LazyLoadingComponent>
          <Login />
        </LazyLoadingComponent>
      </GuestRoute>
    ),
  },
  {
    path: ROUTER.REGISTER,
    element: (
      <GuestRoute>
        <LazyLoadingComponent>
          <Register />
        </LazyLoadingComponent>
      </GuestRoute>
    ),
  },
  {
    path: ROUTER.FORGOT_PASSWORD,
    element: (
      <GuestRoute>
        <LazyLoadingComponent>
          <ForgotPassword />
        </LazyLoadingComponent>
      </GuestRoute>
    ),
  },
  {
    path: ROUTER.RESET_PASSWORD,
    element: (
      <GuestRoute>
        <LazyLoadingComponent>
          <ResetPassword />
        </LazyLoadingComponent>
      </GuestRoute>
    ),
  },

  // Standalone (no layout) — trace QR
  {
    path: ROUTER.TRACE,
    element: (
      <LazyLoadingComponent>
        <JournalTrace />
      </LazyLoadingComponent>
    ),
  },

  // Authenticated app layout
  {
    element: (
      <ProtectedRoute>
        <LayoutAdmin />
      </ProtectedRoute>
    ),
    children: [
      // Role-based redirect
      { path: ROUTER.APP_REDIRECT, element: <Navigate to={ROUTER.ADMIN_DASHBOARD} replace /> },

      // Shared authenticated
      {
        path: ROUTER.ADMIN_DASHBOARD,
        element: (
          <LazyLoadingComponent>
            <Dashboard />
          </LazyLoadingComponent>
        ),
      },
      {
        path: ROUTER.ADMIN_DASHBOARD_ALIAS,
        element: (
          <LazyLoadingComponent>
            <Dashboard />
          </LazyLoadingComponent>
        ),
      },
      {
        path: ROUTER.ADMIN_REPORTS,
        element: (
          <LazyLoadingComponent>
            <Reports />
          </LazyLoadingComponent>
        ),
      },
      {
        path: ROUTER.ACCOUNT_INFO,
        element: (
          <LazyLoadingComponent>
            <AccountInfo />
          </LazyLoadingComponent>
        ),
      },
      {
        path: ROUTER.CHANGE_PASSWORD,
        element: (
          <LazyLoadingComponent>
            <ChangePassword />
          </LazyLoadingComponent>
        ),
      },
      {
        path: ROUTER.ADMIN_AG_MODELS,
        element: (
          <LazyLoadingComponent>
            <AgricultureModels />
          </LazyLoadingComponent>
        ),
      },
      {
        path: ROUTER.ADMIN_INVENTORY,
        element: (
          <LazyLoadingComponent>
            <Inventory />
          </LazyLoadingComponent>
        ),
      },
      {
        path: ROUTER.ADMIN_INVENTORY_CATEGORY,
        element: (
          <LazyLoadingComponent>
            <InventoryCategory />
          </LazyLoadingComponent>
        ),
      },
      {
        path: ROUTER.ADMIN_INVENTORY_MODELS,
        element: (
          <LazyLoadingComponent>
            <Inventory />
          </LazyLoadingComponent>
        ),
      },

      // Admin-only routes
      {
        path: ROUTER.ADMIN_FORM_BUILDER,
        element: (
          <ProtectedRoute requireAdmin>
            <LazyLoadingComponent>
              <FormTemplate />
            </LazyLoadingComponent>
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTER.ADMIN_USERS,
        element: (
          <ProtectedRoute requireAdmin>
            <LazyLoadingComponent>
              <UserManagement />
            </LazyLoadingComponent>
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTER.ADMIN_JOURNALS,
        element: (
          <ProtectedRoute requireAdmin>
            <LazyLoadingComponent>
              <JournalManagement />
            </LazyLoadingComponent>
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTER.ADMIN_ACCOUNTS_MGMT,
        element: (
          <ProtectedRoute requireAdmin>
            <LazyLoadingComponent>
              <AccountInfo />
            </LazyLoadingComponent>
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTER.ADMIN_GROUPS,
        element: (
          <ProtectedRoute requireAdmin>
            <LazyLoadingComponent>
              <GroupManagement />
            </LazyLoadingComponent>
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTER.ADMIN_ROLES,
        element: (
          <ProtectedRoute requireAdmin>
            <LazyLoadingComponent>
              <RolesManagement />
            </LazyLoadingComponent>
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTER.ADMIN_NEWS,
        element: (
          <ProtectedRoute requireAdmin>
            <LazyLoadingComponent>
              <NewsManagement />
            </LazyLoadingComponent>
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTER.ADMIN_CONSULTATIONS,
        element: (
          <ProtectedRoute requireAdmin>
            <LazyLoadingComponent>
              <ConsultationManagement />
            </LazyLoadingComponent>
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTER.ADMIN_GEMINI,
        element: (
          <ProtectedRoute requireAdmin>
            <LazyLoadingComponent>
              <GeminiTest />
            </LazyLoadingComponent>
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTER.ADMIN_OPENAI,
        element: (
          <ProtectedRoute requireAdmin>
            <LazyLoadingComponent>
              <OpenAITest />
            </LazyLoadingComponent>
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTER.ADMIN_GROQ,
        element: (
          <ProtectedRoute requireAdmin>
            <LazyLoadingComponent>
              <GroqTest />
            </LazyLoadingComponent>
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTER.ADMIN_RAG,
        element: (
          <ProtectedRoute requireAdmin>
            <LazyLoadingComponent>
              <RAGTest />
            </LazyLoadingComponent>
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTER.ADMIN_CHAT_STATS,
        element: (
          <ProtectedRoute requireAdmin>
            <LazyLoadingComponent>
              <ChatStats />
            </LazyLoadingComponent>
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTER.ADMIN_LOGS,
        element: (
          <ProtectedRoute requireAdmin>
            <LazyLoadingComponent>
              <SystemLogs />
            </LazyLoadingComponent>
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTER.ADMIN_BACKUP,
        element: (
          <ProtectedRoute requireAdmin>
            <LazyLoadingComponent>
              <BackupMgmt />
            </LazyLoadingComponent>
          </ProtectedRoute>
        ),
      },

      // HTX routes
      {
        path: ROUTER.HTX_JOURNALS,
        element: (
          <ProtectedRoute>
            <LazyLoadingComponent>
              <HtxJournal />
            </LazyLoadingComponent>
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTER.HTX_FARMERS,
        element: (
          <ProtectedRoute>
            <LazyLoadingComponent>
              <FarmerManagement />
            </LazyLoadingComponent>
          </ProtectedRoute>
        ),
      },
      // Legacy /farmers alias
      {
        path: ROUTER.FARMERS,
        element: (
          <ProtectedRoute>
            <LazyLoadingComponent>
              <FarmerManagement />
            </LazyLoadingComponent>
          </ProtectedRoute>
        ),
      },

      {
        path: ROUTER.JOURNAL_VIEW,
        element: (
          <ProtectedRoute>
            <LazyLoadingComponent>
              <JournalEntry />
            </LazyLoadingComponent>
          </ProtectedRoute>
        ),
      },

      // HTX Inventory
      {
        path: ROUTER.HTX_INVENTORY,
        element: (
          <ProtectedRoute>
            <LazyLoadingComponent>
              <HtxInventory />
            </LazyLoadingComponent>
          </ProtectedRoute>
        ),
      },

      // Farmer-only (category-based) routes — VietGAP
      {
        path: 'vietgap/:subCategory',
        children: [
          {
            index: true,
            element: (
              <ProtectedRoute farmerOnly>
                <LazyLoadingComponent>
                  <JournalList />
                </LazyLoadingComponent>
              </ProtectedRoute>
            ),
          },
          {
            path: 'new/:schemaId',
            element: (
              <ProtectedRoute farmerOnly>
                <LazyLoadingComponent>
                  <JournalEntry />
                </LazyLoadingComponent>
              </ProtectedRoute>
            ),
          },
          {
            path: 'edit/:id',
            element: (
              <ProtectedRoute farmerOnly>
                <LazyLoadingComponent>
                  <JournalEntry />
                </LazyLoadingComponent>
              </ProtectedRoute>
            ),
          },
        ],
      },

      // Farmer-only — Hữu Cơ
      {
        path: 'huuco/:subCategory',
        children: [
          {
            index: true,
            element: (
              <ProtectedRoute farmerOnly>
                <LazyLoadingComponent>
                  <JournalList />
                </LazyLoadingComponent>
              </ProtectedRoute>
            ),
          },
          {
            path: 'new/:schemaId',
            element: (
              <ProtectedRoute farmerOnly>
                <LazyLoadingComponent>
                  <JournalEntry />
                </LazyLoadingComponent>
              </ProtectedRoute>
            ),
          },
          {
            path: 'edit/:id',
            element: (
              <ProtectedRoute farmerOnly>
                <LazyLoadingComponent>
                  <JournalEntry />
                </LazyLoadingComponent>
              </ProtectedRoute>
            ),
          },
        ],
      },

      // Farmer-only — Thông Minh
      {
        path: 'thongminh/:subCategory',
        children: [
          {
            index: true,
            element: (
              <ProtectedRoute farmerOnly>
                <LazyLoadingComponent>
                  <JournalList />
                </LazyLoadingComponent>
              </ProtectedRoute>
            ),
          },
          {
            path: 'new/:schemaId',
            element: (
              <ProtectedRoute farmerOnly>
                <LazyLoadingComponent>
                  <JournalEntry />
                </LazyLoadingComponent>
              </ProtectedRoute>
            ),
          },
          {
            path: 'edit/:id',
            element: (
              <ProtectedRoute farmerOnly>
                <LazyLoadingComponent>
                  <JournalEntry />
                </LazyLoadingComponent>
              </ProtectedRoute>
            ),
          },
        ],
      },

      {
        path: ROUTER.PRODUCTION_TECH,
        element: (
          <ProtectedRoute farmerOnly>
            <LazyLoadingComponent>
              <ProductionTech />
            </LazyLoadingComponent>
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTER.FARMER_INVENTORY,
        element: (
          <ProtectedRoute farmerOnly>
            <LazyLoadingComponent>
              <FarmerInventory />
            </LazyLoadingComponent>
          </ProtectedRoute>
        ),
      },

      // TCVN inside auth layout (sidebar link)
      {
        path: ROUTER.TCVN_AUTH,
        element: (
          <LazyLoadingComponent>
            <TCVNReference />
          </LazyLoadingComponent>
        ),
      },
    ],
  },

  // Error pages (standalone)
  {
    path: ROUTER.FORBIDDEN,
    element: (
      <LazyLoadingComponent>
        <Forbidden />
      </LazyLoadingComponent>
    ),
  },
  {
    path: ROUTER.NOT_FOUND,
    element: (
      <LazyLoadingComponent>
        <NotFound />
      </LazyLoadingComponent>
    ),
  },
  {
    path: '*',
    element: (
      <LazyLoadingComponent>
        <NotFound />
      </LazyLoadingComponent>
    ),
  },
]

const AppRouter = () => useRoutes(routes)

export default AppRouter

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Layout } from '@/components/layout/Layout'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { Login } from '@/pages/Login'
import { Dashboard } from '@/pages/Dashboard'
import { Users } from '@/pages/Users'
import { UserDetail } from '@/pages/UserDetail'
import { Agencies } from '@/pages/Agencies'
import { AgencyDetail } from '@/pages/AgencyDetail'
import { Transfers } from '@/pages/Transfers'
import { LiveBets } from '@/pages/LiveBets'
import { Commissions } from '@/pages/Commissions'
import { Transactions } from '@/pages/Transactions'
import { ChangePassword } from '@/pages/ChangePassword'
import { GameSessionsHub } from '@/pages/GameSessionsHub'
import { GameSessionsTaiXiu } from '@/pages/GameSessionsTaiXiu'
import { GameSessionsChickenFight } from '@/pages/GameSessionsChickenFight'
import { GameSessionDetailPage } from '@/pages/GameSessionDetailPage'
import { GameSessionsEvolution } from '@/pages/GameSessionsEvolution'
import { GameSessionsSbo } from '@/pages/GameSessionsSbo'
import { ROLES, SHOW_COMMISSIONS_UI } from '@/lib/constants'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Navigate to="/dashboard" replace />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <Layout>
                  <Users />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/users/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <UserDetail />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/agencies"
            element={
              <ProtectedRoute allowedRoles={[ROLES.MASTER_AGENT]}>
                <Layout>
                  <Agencies />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/agencies/:id"
            element={
              <ProtectedRoute allowedRoles={[ROLES.MASTER_AGENT]}>
                <Layout>
                  <AgencyDetail />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/transfers"
            element={
              <ProtectedRoute allowedRoles={[ROLES.AGENCY, ROLES.MASTER_AGENT]}>
                <Layout>
                  <Transfers />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/live-bets"
            element={
              <ProtectedRoute>
                <Layout>
                  <LiveBets />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/game-sessions"
            element={
              <ProtectedRoute allowedRoles={[ROLES.AGENCY, ROLES.MASTER_AGENT]}>
                <Layout>
                  <GameSessionsHub />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/game-sessions/taixiu"
            element={
              <ProtectedRoute allowedRoles={[ROLES.AGENCY]}>
                <Layout>
                  <GameSessionsTaiXiu />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/game-sessions/chicken-fight"
            element={
              <ProtectedRoute allowedRoles={[ROLES.AGENCY]}>
                <Layout>
                  <GameSessionsChickenFight />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/game-sessions/taixiu/:id"
            element={
              <ProtectedRoute allowedRoles={[ROLES.AGENCY]}>
                <Layout>
                  <GameSessionDetailPage game="taixiu" listPath="/game-sessions/taixiu" />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/game-sessions/chicken-fight/:id"
            element={
              <ProtectedRoute allowedRoles={[ROLES.AGENCY]}>
                <Layout>
                  <GameSessionDetailPage game="chicken_fight" listPath="/game-sessions/chicken-fight" />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/game-sessions/evolution"
            element={
              <ProtectedRoute allowedRoles={[ROLES.AGENCY, ROLES.MASTER_AGENT]}>
                <Layout>
                  <GameSessionsEvolution />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/game-sessions/sbo"
            element={
              <ProtectedRoute allowedRoles={[ROLES.AGENCY, ROLES.MASTER_AGENT]}>
                <Layout>
                  <GameSessionsSbo />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/commissions"
            element={
              SHOW_COMMISSIONS_UI ? (
                <ProtectedRoute allowedRoles={[ROLES.AGENCY, ROLES.MASTER_AGENT]}>
                  <Layout>
                    <Commissions />
                  </Layout>
                </ProtectedRoute>
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <Layout>
                  <Transactions />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <Layout>
                  <ChangePassword />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App

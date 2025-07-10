import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "@/context/authProvider"
import ProtectedRoute from "./components/ProtectedRoute"
import HomePage from "@/pages/Home"
import SignInPage from "@/pages/Auth/SignIn"
import SignUpPage from "@/pages/Auth/SignUp"
import ChatsPage from "@/pages/Dashboard/ChatDash"
import DashboardPage from "@/pages/Dashboard/Home";
import "./styles/index.css"
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import AppChat from "./pages/Dashboard/ChatDash"

import { ToastContainer } from 'react-toastify';
import { AppLayout } from "./pages/Dashboard/AppLayout"
import { ConversationsProvider } from "./context/conversationProvider"


const queryClient = new QueryClient()


function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ConversationsProvider>
          <Router>
            <Routes>
              <Route path="/" element={<HomePage />} />

              <Route path="/signin" element={<SignInPage />} />
              <Route path="/signup" element={<SignUpPage />} />

              {/* Protected Dashboard Layout */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="chat" element={<AppChat />} />
                <Route path="chat/:id" element={<ChatsPage />} />
              </Route>
            </Routes>
          </Router>
          <ToastContainer />
        </ConversationsProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}




export default App;

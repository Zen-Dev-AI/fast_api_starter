import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom"
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
import AIChatPlayground from "./pages/Dashboard/ChatDash/PageSections/Playground"
import { v4 as uuidv4 } from "uuid";
import { useEffect } from "react"


const queryClient = new QueryClient()

function NewChatRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    const id = uuidv4();
    navigate(`${id}?isNew=true`, { replace: true });
  }, [navigate]);
  return null;
}



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

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                {/* /dashboard */}
                <Route index element={<DashboardPage />} />

                {/* /dashboard/chat */}
                <Route path="chat">
                  {/* on `/dashboard/chat` itself, immediately redirect to a new UUID */}
                  <Route
                    index
                    element={
                      <NewChatRedirect />
                    }
                  />
                  {/* /dashboard/chat/:id */}
                  <Route path=":id" element={<AIChatPlayground />} />
                </Route>
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

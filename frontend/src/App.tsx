import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "@/context/authProvider"
import ProtectedRoute from "./components/ProtectedRoute"
import HomePage from "@/pages/Home"
import SignInPage from "@/pages/Auth/SignIn"
import SignUpPage from "@/pages/Auth/SignUp"
import DashboardPage from "@/pages/Dashboard/Dashboard"
import "./styles/index.css"
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'


import { ToastContainer } from 'react-toastify';

const queryClient = new QueryClient()


function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
        <ToastContainer />
      </AuthProvider>
    </QueryClientProvider>
  )
}




export default App;

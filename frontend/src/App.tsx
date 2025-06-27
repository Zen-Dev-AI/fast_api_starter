import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "@/context/authProvider"
import ProtectedRoute from "./components/ProtectedRoute"
import HomePage from "@/pages/Home"
import SignInPage from "@/pages/SignIn"
import SignUpPage from "@/pages/SignUp"
import DashboardPage from "@/pages/Dashboard"
import "./styles/index.css"

function App() {
  return (
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
    </AuthProvider>
  )
}




export default App;

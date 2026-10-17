import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/layout/Layout';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { Dashboard } from './components/quiz/Dashboard';
import { QuizSetup } from './components/quiz/QuizSetup';
import { QuizInterface } from './components/quiz/QuizInterface';
import { QuizResults } from './components/quiz/QuizResults';
import { PDFUpload } from './components/quiz/PDFUpload';
import { QuizLibrary } from './components/quiz/QuizLibrary';
import { CertificatePage } from './components/quiz/CertificatePage';
import { UserDashboard } from './components/quiz/UserDashboard';
import { ProtectedRoute } from './components/common/ProtectedRoute';

function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quiz-setup"
              element={
                <ProtectedRoute>
                  <QuizSetup />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quiz"
              element={
                <ProtectedRoute>
                  <QuizInterface />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quiz-results"
              element={
                <ProtectedRoute>
                  <QuizResults />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pdf-upload"
              element={
                <ProtectedRoute>
                  <PDFUpload />
                </ProtectedRoute>
              }
            />
            <Route
              path="/library"
              element={
                <ProtectedRoute>
                  <QuizLibrary />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user-dashboard"
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/certificates/:certificateId"
              element={
                <ProtectedRoute>
                  <CertificatePage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
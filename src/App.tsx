import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import VideoRecording from './pages/VideoRecording';
import Error from './pages/Error';
import EntrevistaFinalizada from './pages/EntrevistaFinalizada';
import Login from './pages/Login';
import Instructions from './pages/Instructions';
import MicrophoneTest from './pages/MicrophoneTest';
import CameraTest from './pages/CameraTest';
import ProtectedVideoRoute from './components/auth/ProtectedVideoRoute';
import SignUp from './pages/Signup';
import Privacy from './pages/Privacy';

function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#00F9F4',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ff4b4b',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        {/* Redirect root to signup */}
        <Route path="/" element={<Navigate to="/signup" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/entrevista/:entrevistaId" element={<Instructions />} />
        <Route path="/teste-microfone/:entrevistaId" element={<MicrophoneTest />} />
        <Route
          path="/video/:entrevistaId"
          element={
            <ProtectedVideoRoute>
              <VideoRecording />
            </ProtectedVideoRoute>
          }
        />
        <Route path="/erro" element={<Error />} />
        <Route path="/entrevista-finalizada" element={<EntrevistaFinalizada />} />
        <Route path="/teste-camera/:entrevistaId" element={<CameraTest />} />
        <Route path="/instructions" element={<Instructions />} />
      </Routes>
    </Router>
  );
}

export default App;
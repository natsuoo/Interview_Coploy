import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import VideoRecording from './pages/VideoRecording';
import Error from './pages/Error';
import EntrevistaFinalizada from './pages/EntrevistaFinalizada';
import Login from './components/auth/Login';
import Instructions from './pages/Instructions';
import MicrophoneTest from './pages/MicrophoneTest';
import CameraTest from './pages/CameraTest';
import ProtectedVideoRoute from './components/auth/ProtectedVideoRoute';

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
        <Route path="/" element={<VideoRecording />} />
        <Route path="/login" element={<Login />} />
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
      </Routes>
    </Router>
  );
}

export default App;
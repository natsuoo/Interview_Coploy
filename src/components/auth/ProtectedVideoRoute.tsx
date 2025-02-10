import { Navigate, useLocation, useParams } from 'react-router-dom';

interface ProtectedVideoRouteProps {
  children: React.ReactNode;
}

const ProtectedVideoRoute: React.FC<ProtectedVideoRouteProps> = ({ children }) => {
  const location = useLocation();
  const { entrevistaId } = useParams<{ entrevistaId: string }>();
  const hasCameraTestPassed = sessionStorage.getItem('cameraTestPassed');

  if (!hasCameraTestPassed) {
    return <Navigate to={`/entrevista/${entrevistaId}`} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedVideoRoute; 
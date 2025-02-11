import { Link } from 'react-router-dom';
import './css/Privacy.css';
import { ChevronLeft } from 'lucide-react';
import pdf from '../public/assets/COPLOY_-_POLÍTICA_DE_PRIVACIDADE_(fullEdit)_(1).pdf';

const PdfViewer = () => {
  return (
    <>
      <div className="back-button-container">
        <Link to="/signup"> 
          <ChevronLeft style={{ color: 'white', fontSize: '32px', height: '32px', width: '32px' }} />
        </Link>
      </div>
      <div className="privacy-container">
        <div className="container">
          <iframe
            src={pdf}
            className="iframe"
            title="Visualizador de PDF"
          />
        </div>
      </div>
    </>
  );
};

export default PdfViewer;
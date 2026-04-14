import { Link } from 'react-router-dom';
import '../donghua-pages.css';

const DracinMaintenance = () => {
  return (
    <div className="main-container">
      <div className="maintenance-container">
        <div className="maintenance-icon">⚠️</div>
        <h1 className="maintenance-title">Dracin Sedang Maintenance</h1>
        <p className="maintenance-message">
          Provider Dracin sedang dalam tahap perbaikan dan pemeliharaan.
          <br />
          Mohon maaf atas ketidaknyamanannya.
        </p>
        <div className="maintenance-info">
          <p>Sementara waktu, Anda dapat menikmati konten dari provider lain:</p>
          <div className="maintenance-links">
            <Link to="/ongoing" className="btn btn-primary">
              Anime Ongoing
            </Link>
            <Link to="/donghua-ongoing" className="btn btn-secondary">
              Donghua Ongoing
            </Link>
            <Link to="/" className="btn btn-secondary">
              Kembali ke Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DracinMaintenance;

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DracinDetail = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to maintenance page
    navigate('/dracin-maintenance', { replace: true });
  }, [navigate]);

  return null;
};

export default DracinDetail;

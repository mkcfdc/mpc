import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import StreamModal from './streamModal';

function hashCheck() {
  const [showStreamModal, setShowStreamModal] = useState(false);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const hash = searchParams.get('hash');

  const handleCloseModal = () => {
    setShowStreamModal(false);
    setStreamLink('');
  };

  useEffect(() => {
    if (hash) {
      fetch(process.env.REACT_BACKEND_API + `/getStreamLink/${hash}`)
        .then(response => response.json())
        .then(data => {
          if (data.streamLink) {
            setStreamLink(data.streamLink);
            setShowStreamModal(true);
          }
        })
        .catch(error => {
          console.error('Error fetching streamUrl:', error);
        });
    }
  }, [hash]);

  return (
    <div>
      {showStreamModal && (
        <StreamModal
        streamLink={streamLink} onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

export default hashCheck;
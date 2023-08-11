import React, { useState, useCallback } from 'react';
import ReactPlayer from 'react-player';
import LazyLoad from 'react-lazyload';

function StreamModal({ streamLink, onClose }) {
  const [isFullScreen, setIsFullScreen] = useState(false);

  const handleFullScreenChange = () => {
    setIsFullScreen(document.fullscreenElement !== null);
  };

  const handleVideoClick = () => {
    if (isFullScreen) {
      document.exitFullscreen();
    } else {
      document.getElementById('modal-container').requestFullscreen().catch((error) => {
        console.error('Error entering full-screen mode:', error);
      });
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(streamLink);
      alert('Stream link copied to clipboard for VLC!');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const handleCloseModal = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <div
      id="modal-container"
      className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-75 modal-overlay"
    >
      <div className="bg-white p-4 rounded-md shadow-lg">
        <div className="relative" onClick={handleVideoClick}>
          <LazyLoad height={500} offset={100}>
            <ReactPlayer
              url={streamLink}
              controls
              playing
              width="700px"
              height="500px"
              onFullScreenChange={handleFullScreenChange}
              className="rounded-md"
            />
          </LazyLoad>
        </div>
        <div className="mt-4 text-center">
          <button
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            onClick={handleCopyToClipboard}
          >
            Copy for VLC
          </button>
          <button
            className="mt-2 ml-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            onClick={handleCloseModal}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default StreamModal;

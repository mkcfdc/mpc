import React, { useState, useEffect, useCallback } from 'react';
import ProgressBar from './progressBar'; // Create a ProgressBar component

const DownloadModal = ({ transferId }) => {
  const [transferStatus, setTransferStatus] = useState(null);

  useEffect(() => {
    const fetchTransferStatus = async () => {
      try {
        const response = await fetch(process.env.REACT_APP_BACKEND_API +`/transfer/status/${transferId}`);
        const data = await response.json();
        setTransferStatus(data);
      } catch (error) {
        console.error('Error fetching transfer status:', error);
      }
    };

    const intervalId = setInterval(fetchTransferStatus, 3000); // Poll every 3 seconds
    return () => clearInterval(intervalId); // Clean up the interval

  }, [transferId]);

  const handleCloseModal = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-2">Transfer Status</h2>
      {transferStatus ? (
        <>
          <p><strong>Name:</strong> {transferStatus.name}</p>
          <p><strong>Message:</strong> {transferStatus.message}</p>
          <p><strong>Status:</strong> {transferStatus.status}</p>
          <p><strong>Progress:</strong> {Math.round(transferStatus.progress * 100)}%</p>
          <ProgressBar progress={transferStatus.progress * 100} />
        </>
      ) : (
        <p>Loading transfer status...</p>
      )}<div>
      <button
            className="mt-2 ml-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            onClick={handleCloseModal}
          >
            Close
          </button>
          </div>
    </div>
  );
};

export default DownloadModal;

import React, { useState, useEffect } from 'react';
import DownloadModal from './downloadModal'; // Import your DownloadModal component

const TransferStatusBar = () => {
  const [transfers, setTransfers] = useState([]);
  const [selectedTransferId, setSelectedTransferId] = useState(null); // State to track the selected transfer

  const fetchTransferStatus = async () => {
    try {
      const response = await fetch(process.env.REACT_APP_BACKEND_API + '/transfer/status/all');
      const data = await response.json();
      if (data.status === 'success') {
        setTransfers(data.transfers);
      }
    } catch (error) {
      console.error('Error fetching transfer status:', error);
    }
  };

  useEffect(() => {
    fetchTransferStatus();
    const intervalId = setInterval(fetchTransferStatus, 30000); // Poll every 60 seconds
    return () => clearInterval(intervalId); // Clean up the interval
  }, []);

  const handleTransferClick = (transferId) => {
    setSelectedTransferId(transferId); // Set the selected transfer ID
  };

  const truncateName = (name, maxLength) => {
    if (name.length > maxLength) {
      return name.substring(0, maxLength - 3) + '...';
    }
    return name;
  };

  return (
    <div className="bg-white bg-opacity-0 p-2 rounded shadow fixed bottom-0 left-0 right-0">
      <ul className="flex space-x-2 overflow-x-auto">
        {transfers.slice(0, 5).map((transfer) => (
          <li
            key={transfer.id}
            className={`flex-shrink-0 w-48 flex flex-col items-center justify-center p-2 ${
              transfer.status === 'finished' ? 'bg-green-200' : 'bg-gray-200'
            } rounded-md cursor-pointer`}
            onClick={() => handleTransferClick(transfer.id)} // Handle transfer click
          >
            <p className="text-center truncate">{truncateName(transfer.name, 20)}</p>
          </li>
        ))}
      </ul>
      {/* Open DownloadModal for the selected transfer */}
      {selectedTransferId && (
        <DownloadModal transferId={selectedTransferId} onClose={() => setSelectedTransferId(null)} />
      )}
    </div>
  );
};

export default TransferStatusBar;

import React, { useState, useEffect } from 'react';

const AccountInfo = () => {
  const [accountInfo, setAccountInfo] = useState(null);

  useEffect(() => {
    async function fetchAccountInfo() {
      try {
        const response = await fetch(process.env.REACT_APP_BACKEND_API + '/account/info');
        const data = await response.json();
        setAccountInfo(data);
      } catch (error) {
        console.error('Error fetching account info:', error);
      }
    }

    fetchAccountInfo();
  }, []);

  // Function to convert bytes to gigabytes
  const bytesToGigabytes = (bytes) => {
    const gigabytes = bytes / (1024 * 1024 * 1024);
    return gigabytes.toFixed(2); 
  };

  // Function to convert UNIX timestamp to human-readable date
  const unixTimestampToDateString = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString();
  };

  // Calculate the percentage of space used
  const calculateSpaceUsagePercentage = () => {
    if (accountInfo) {
      const totalSpaceGB = 1000; // 1 TB in GB
      const spaceUsedGB = accountInfo.space_used / (1024 * 1024 * 1024);
      return (spaceUsedGB / totalSpaceGB) * 100;
    }
    return 0;
  };

  // Determine the color of the progress bar based on space usage
  const getProgressBarColor = () => {
    const usagePercentage = calculateSpaceUsagePercentage();
    if (usagePercentage <= 50) {
      return 'bg-green-500';
    } else if (usagePercentage <= 80) {
      return 'bg-yellow-500';
    } else {
      return 'bg-red-500';
    }
  };

  return (
    <div className="bg-gray-100 p-4 rounded-md shadow-md">
      <h2 className="text-xl font-semibold mb-4">Account Information</h2>
      {accountInfo ? (
        <div>
          <p><strong>Premium Status:</strong> {unixTimestampToDateString(accountInfo.premium_until)}</p>
          <p><strong>Usage Limits:</strong> {accountInfo.limit_used}</p>
          <p><strong>Space Used:</strong> {bytesToGigabytes(accountInfo.space_used)} GB</p>
          <div className="mt-4">
            <p><strong>Space Usage:</strong></p>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                    {calculateSpaceUsagePercentage()}% Full
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-blue-600">
                    {bytesToGigabytes(accountInfo.space_used)} GB
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded">
                <div
                  style={{ width: `${calculateSpaceUsagePercentage()}%` }}
                  className={`shadow-none flex flex-col text-center whitespace-nowrap justify-center text-white ${getProgressBarColor()}`}
                ></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p>Loading account information...</p>
      )}
    </div>
  );
}

export default AccountInfo;

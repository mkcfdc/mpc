import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center bg-black bg-opacity-75 z-50">
      <div className="animate-spin rounded-full border-t-4 border-blue-500 border-opacity-50 h-12 w-12"></div>
    </div>
  );
};

export default LoadingScreen;

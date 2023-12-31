import React, { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import MainContent from './components/MainContent'; // Import the updated MainContent component
import MovieDetails from './components/movieDetails';
import HashCheck from './components/hashCheck';

import AuthBar from './auth/AuthBar';

function App() {
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = (results) => {
    setSearchResults(results);
  };

  return (
    <div className="container mx-auto p-6">
      <AuthBar />
      <Routes>
        <Route path="/" element={<MainContent searchResults={searchResults} onSearch={handleSearch} />} /> {/* Use the updated MainContent component */}
        <Route path="/movie/:imdbId" element={<MovieDetails />} />
      </Routes>
      <HashCheck />
    </div>
  );
}

export default App;

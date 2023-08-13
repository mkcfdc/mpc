import React, { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import MainContent from './components/MainContent'; // Import the updated MainContent component
import MovieDetails from './components/movieDetails';
import HashCheck from './components/hashCheck';

function App() {
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = (results) => {
    setSearchResults(results);
  };

  return (
    <div className="container mx-auto p-6">
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/" element={<MainContent searchResults={searchResults} onSearch={handleSearch} />} /> {/* Use the updated MainContent component */}
        <HashCheck />
        <Route path="/movie/:imdbId" element={<MovieDetails />} />
      </Routes>
    </div>
  );
}

export default App;

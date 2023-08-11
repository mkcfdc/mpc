import React, { useState } from 'react';

function SearchForm({ onSearch, initialQuery }) {
  const [query, setQuery] = useState(initialQuery || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://api.moviepoopchute.lol/search/${query}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      onSearch(data);
    } catch (error) {
      setError(error.message || 'An error occurred while fetching data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center mb-6">
      <form onSubmit={handleSubmit} className="w-full max-w-lg bg-white rounded-lg shadow-md p-6 flex">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter movie name or IMDBid"
          className="flex-grow border border-gray-300 rounded-l-md px-4 py-2 focus:outline-none focus:ring focus:border-blue-300"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white rounded-r-md px-4 py-2 hover:bg-blue-600 transition duration-300"
          disabled={isLoading}
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </form>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}

export default SearchForm;

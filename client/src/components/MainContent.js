import React from 'react';
import SearchForm from './searchForm';
import AccountInfo from './accountInfo';
import LogoArea from './logoArea';
import MovieList from './movieList';
import MovieCarousel from './MovieCarousel'; // Import the MovieCarousel component

function MainContent({ searchResults, onSearch }) {
  return (
    <div>
      <LogoArea />
      <MovieCarousel />
      <div className="grid gap-6">
        <div>
          <SearchForm onSearch={onSearch} />
          {(searchResults ?? []).length > 0 ? (
            <MovieList movies={searchResults} />
          ) : (
            <AccountInfo />
          )}
        </div>
      </div>
    </div>
  );
}

export default MainContent;

import React, { useState } from "react";
import axios from "axios";
import Spinner from "./Spinner";
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

function MovieSearch() {
  const [query, setQuery] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    // Retrieve the JWT from localStorage
    const token = localStorage.getItem("token");

    // Configure headers with the JWT
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };

    try {
      // Include the JWT in the header of the request
      const response = await axios.get(
        `${apiBaseUrl}/movies-api/movie-recommendations?searchText=${btoa(
          query
        )}`,
        config
      );
      setRecommendations(response.data);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      // Handle errors (e.g., token expiration, unauthorized access) appropriately
    }
    setIsLoading(false);
  };

  return (
    <div className="movies-search-container">
      <div className="search-container">
        <h1 className="search-heading">Discover Films</h1>
        <h2 className="search-subheading">Uncover Your Next Favorite Film</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Search films..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="search-button-container">
            <button type="submit">Search</button>
            {isLoading && <Spinner />}
          </div>
        </form>
      </div>
      <ul>
        {recommendations?.map((movie, index) => (
          <li key={index}>
            <div className="title">{movie.original_title}</div>
            <div className="overview">{movie.overview}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MovieSearch;

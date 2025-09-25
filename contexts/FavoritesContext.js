import React, { createContext, useContext, useState, useEffect } from 'react';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]); // array of restaurant objects

  // Helper to check if a restaurant is favorited by ID
  const isFavorited = (id) => favorites.some(r => r.id === id);

  // Optionally, load from storage or API here
  useEffect(() => {
    // TODO: Load favorites from persistent storage or backend if needed
  }, []);

  const addFavorite = async (restaurant) => {
    setFavorites((prev) => prev.some(r => r.id === restaurant.id) ? prev : [...prev, restaurant]);
    try {
      await fetch(`/api/social/favorite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurant_id: restaurant.id })
      });
    } catch (e) {}
  };

  const removeFavorite = async (id) => {
    setFavorites((prev) => prev.filter((r) => r.id !== id));
    try {
      await fetch(`/api/social/unfavorite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurant_id: id })
      });
    } catch (e) {}
  };

  const toggleFavorite = async (restaurant) => {
    if (isFavorited(restaurant.id)) {
      await removeFavorite(restaurant.id);
    } else {
      await addFavorite(restaurant);
    }
  };


  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, toggleFavorite, isFavorited }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);

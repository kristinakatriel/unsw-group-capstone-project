import React, { useEffect, useState } from 'react';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';
import { invoke } from '@forge/bridge';
import CreateFlashcard from './CreateFlashcard';

function GlobalPageApp() {
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);

  const recentFlashcards = [
    { id: 1, title: 'Flashcard 1', count: 10, owner: 'User A' },
    { id: 2, title: 'Flashcard 2', count: 15, owner: 'User B' },
    { id: 3, title: 'Flashcard 3', count: 5, owner: 'User C' },
    { id: 4, title: 'Flashcard 4', count: 5, owner: 'User D' },
  ];

  const decks = [
    { id: 1, title: 'Deck 1', count: 20, owner: 'User A' },
    { id: 2, title: 'Deck 2', count: 30, owner: 'User B' },
  ];

  const groups = [
    { id: 1, title: 'Group 1', count: 3, owner: 'User A' },
  ];

  const getFlashcards = async () => {
    try {
      const response = await invoke('getAllFlashcards', {});
      
      if (response.success) {
        setFlashcards(response.cards);
      } else {
        console.error('Error getting flashcards:', response.error);
      }
    } catch (error) {
      console.error('Error getting flashcards:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getFlashcards();
  }, []);

  const createFlashcard = () => {
    // need to invoke CreateFlashcard over here!
    console.log("Here to create a flashcard!");
  };

  const createDecks = () => {
    console.log("Here to create a deck!");
  };

  const createGroups = () => {
    console.log("Here to create a group!");
  };

  const renderSplide = (items) => {
    const itemsCount = items.length;
  
    return (
      <Splide
        options={{
          type: 'loop',
          perMove: 1,
          gap: '1rem',
          perPage: Math.min(itemsCount, 4),
          breakpoints: {
            1200: { perPage: Math.min(itemsCount, 4) },
            900: { perPage: Math.min(itemsCount, 3) },
            600: { perPage: Math.min(itemsCount, 2) },
            300: { perPage: Math.min(itemsCount, 1) },
          },
        }}
        aria-label="Slider"
      >
        {items.map((item) => (
          <SplideSlide key={item.id}>
            <p>Title: {item.title}</p>
            <p>Number of Flashcards: {item.count}</p>
            <p>Owner: {item.owner}</p>
            <button>Open {item.title}</button>
          </SplideSlide>
        ))}
      </Splide>
    );
  };

  const renderFlashcardsList = (flashcards) => (
    <Splide
      options={{
        type: 'loop',
        perMove: 1,
        gap: '1rem',
      }}
      aria-label="Flashcards Slider"
    >
      {flashcards.map((flashcard) => (
        <SplideSlide key={flashcard.id}>
          <strong>Question:</strong> {flashcard.question_text || 'No question available'} <br />
          <strong>Answer:</strong> {flashcard.answer_text || 'No answer available'} <br />
          <strong>Owner:</strong> {flashcard.owner || 'No owner available'}
          <button>Open Flashcard</button>
        </SplideSlide>
      ))}
    </Splide>
  );

  return (
    <div>
      <h1>The Global Page is to show user's flashcards!</h1>
      <h2>NavBar/Jump To: Recent Flashcards Decks Groups</h2>
      <h3>Flashcards</h3>
      {loading ? (
        <p>Loading...</p>
      ) : flashcards.length === 0 ? (
        <h4>No flashcards to view. Create a flashcard to view it here.</h4>
      ) : (
        renderFlashcardsList(flashcards)
      )}
      <div className="button-group">
        <button className="create-flashcards" onClick={createFlashcard}>Create New Flashcard</button>
        <button className="create-decks" onClick={createDecks}>Create New Deck</button> 
        <button className="create-groups" onClick={createGroups}>Create New Group </button>
      </div>
      <h2 style={{ marginTop: '10px' }}>EXAMPLE OUTPUT BELOW (DELETE THIS LATER)</h2>
      <h3 style={{ marginTop: '0px' }}>Recent</h3>
      {renderSplide(recentFlashcards)}
      <h3>Flashcards</h3>
      {renderSplide(recentFlashcards)}
      <h3>Decks</h3>
      {renderSplide(decks)}
      <h3>Groups</h3>
      {renderSplide(groups)}
    </div>
  );
}

export default GlobalPageApp;

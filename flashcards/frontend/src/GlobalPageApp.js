import React, { useEffect, useState } from 'react';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';
import { invoke } from '@forge/bridge';

function GlobalPageApp() {
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);

  const recentFlashcards = [
    { id: 1, title: 'Flashcard 1', count: 10, owner: 'User A' },
    { id: 2, title: 'Flashcard 2', count: 15, owner: 'User B' },
    { id: 3, title: 'Flashcard 3', count: 5, owner: 'User C' },
  ];

  const decks = [
    { id: 1, title: 'Deck 1', count: 20, owner: 'User A' },
    { id: 2, title: 'Deck 2', count: 30, owner: 'User B' },
    { id: 3, title: 'Deck 3', count: 25, owner: 'User C' },
  ];

  const groups = [
    { id: 1, title: 'Group 1', count: 3, owner: 'User A' },
    { id: 2, title: 'Group 2', count: 5, owner: 'User B' },
    { id: 3, title: 'Group 3', count: 7, owner: 'User C' },
  ];

  const fetchFlashcards = async () => {
    try {
      // Assuming you have an endpoint or resolver to fetch all flashcards
      const response = await invoke('getAllFlashcards', {});
      
      if (response.success) {
        setFlashcards(response.cards);
      } else {
        console.error('Error fetching flashcards:', response.error);
      }
    } catch (error) {
      console.error('Error fetching flashcards:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlashcards(); // Fetch flashcards when the component mounts
  }, []);

  const renderSplide = (items) => (
    <Splide
        options={{
            type: 'loop',
            perPage: 3,
            perMove: 1,
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

  const renderFlashcardsList = () => (
    <ul>
      {flashcards.map((flashcard) => (
        <li key={flashcard.id}>
          <strong>Question:</strong> {flashcard.question_text || 'No question available'} <br />
          <strong>Answer:</strong> {flashcard.answer_text || 'No answer available' } <br />
          <strong>Owner:</strong> {flashcard.owner || 'No owner available'}
        </li>
      ))}
    </ul>
  );

  return (
    <div>
        <h1>The Global Page is to show user's flashcards!</h1>
        <h2>NavBar/Jump To: Recent Flashcards Decks Groups</h2>
        {renderFlashcardsList()}
        <h3>Recent</h3>
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

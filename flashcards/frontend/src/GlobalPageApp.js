import React, { useEffect, useState } from 'react';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';
import { invoke } from '@forge/bridge';
// flashcard creation
import CreateFlashcard from './CreateFlashcard';
import ModalDialog from '@atlaskit/modal-dialog';
// import { Modal, Button } from '@atlaskit/modal-dialog';

function GlobalPageApp() {
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  // for creating new flashcard, deck and group: modals 
  const [isFlashcardModalOpen, setIsCreateFlashcardOpen] = useState(false);
  const [isDeckModalOpen, setDeckModalOpen] = useState(false); // Track modal state for Deck
  const [isGroupModalOpen, setGroupModalOpen] = useState(false); // Track modal state for Group

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

  // const createFlashcard = () => {
  //   // need to invoke CreateFlashcard over here!
  //   console.log("Here to create a flashcard!");
  // };
  const createFlashcard = () => {
    setIsCreateFlashcardOpen(true); // Open modal to create flashcard
  };

  const createDecks = () => {
    setDeckModalOpen(true);  // Open deck modal
  };

  const closeDeckModal = () => {
    setIsDeckModalOpen(false);
  };

  const createGroups = () => {
    setGroupModalOpen(true);  // Open group modal
  };

  const closeGroupModal = () => {
    setIsGroupModalOpen(false);
  };

  // const closeModals = () => {
  //   setIsCreateFlashcardOpen(false);  // Close flashcard modal
  //   setDeckModalOpen(false);  // Close deck modal
  //   setGroupModalOpen(false);  // Close group modal
  // };

  const closeFlashcardModal = () => {
    setIsCreateFlashcardOpen(false); // Close modal
    view.close();
  };

  // const createDecks = () => {
  //   console.log("Here to create a deck!");
  // };

  // const createGroups = () => {
  //   console.log("Here to create a group!");
  // };

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
        <><h4>No flashcards to view. Create a flashcard to view it here.</h4><button className="create-flashcards" onClick={createFlashcard}>Create New Flashcard</button></>
      ) : (
        renderFlashcardsList(flashcards)
      )}
      <h3>Decks</h3>
      <><h4>Create a new deck: </h4><button className="create-decks" onClick={createDecks}>Create New Deck</button></>
      <h3>Groups</h3>
      <><h4>Create a new group: </h4><button className="create-groups" onClick={createGroups}>Create New Group </button></>
      <h2 style={{ marginTop: '10px' }}>EXAMPLE OUTPUT BELOW (DELETE THIS LATER)</h2>
      <h3 style={{ marginTop: '0px' }}>Recent</h3>
      {renderSplide(recentFlashcards)}
      <h3>Flashcards</h3>
      {renderSplide(recentFlashcards)}
      <h3>Decks</h3>
      {renderSplide(decks)}
      <h3>Groups</h3>
      {renderSplide(groups)}
      // modal for flashcard creation
       {/* Flashcard Modal */}
      {isFlashcardModalOpen && (
        <ModalDialog heading="Create Flashcard" onClose={closeFlashcardModal}>
          <CreateFlashcard onClose={closeFlashcardModal}/>
        </ModalDialog>
      )}

      {/* Deck Modal: TODO */}
      {isDeckModalOpen && (
        <ModalDialog heading="Create Deck" onClose={closeDeckModal}>
          <p onClose={closeDeckModal}>Example modal for deck...</p>
        </ModalDialog>
      )}

      {/* Group Modal: TODO */}
      {isGroupModalOpen && (
        <ModalDialog heading="Create Group" onClose={closeGroupModal}>
          <p onClose={closeGroupModal}>Example modal for group...</p>
        </ModalDialog>
      )}

    </div>
  );
}

export default GlobalPageApp;

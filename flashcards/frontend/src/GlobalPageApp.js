import React, { useEffect, useState } from 'react';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';
import { invoke } from '@forge/bridge';
import CreateFlashcard from './CreateFlashcard';
import ModalDialog from '@atlaskit/modal-dialog';
import CreateDeck from './CreateDeck';
import CreateGroups from './CreateGroups';
import './styles.css';

function GlobalPageApp() {
  const [flashcards, setFlashcards] = useState([]);
  const [flashdecks, setDecks] = useState([]);
  const [flashgroups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isFlashcardModalOpen, setIsCreateFlashcardOpen] = useState(false);
  const [isDeckModalOpen, setIsDeckModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

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

  const getDecks = async () => {
    try {
      const response = await invoke('getAllDecks', {});
      if (response.success) {
        setDecks(response.decks);
      } else {
        console.error('Error getting decks:', response.error);
      }
    } catch (error) {
      console.error('Error getting decks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGroups = async () => {
    try {
      const response = await invoke('getAllGroups', {});
      if (response.success) {
        setGroups(response.groups);
      } else {
        console.error('Error getting groups:', response.error);
      }
    } catch (error) {
      console.error('Error getting groups:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getFlashcards();
    getDecks();
    getGroups();
  }, []);

  const createFlashcard = () => {
    setIsCreateFlashcardOpen(true); // Open modal to create flashcard
  };

  const createDecks = () => {
    setIsDeckModalOpen(true); // Open modal to create deck
  };

  const createGroups = () => {
    setIsGroupModalOpen(true); // Open modal to create group
  };

  const closeFlashcardModal = (shouldRefresh = false) => {
    setIsCreateFlashcardOpen(false);
    if (shouldRefresh) {
      getFlashcards();  // Re-fetch flashcards to update the UI
    }
  };

  const closeDeckModal = (shouldRefresh = false) => {
    setIsDeckModalOpen(false);
    if (shouldRefresh) {
      getDecks();  // Re-fetch decks to update the UI
    }
  };

  const closeGroupModal = (shouldRefresh = false) => {
    setIsGroupModalOpen(false);
    if (shouldRefresh) {
      getGroups();  // Re-fetch groups to update the UI
    }
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
          <strong>Owner:</strong> {flashcard.owner || 'No owner available'} <br />
          <button>Open Flashcard</button>
        </SplideSlide>
      ))}
    </Splide>
  );

  const renderDecksList = (flashdecks) => (
    <Splide
      options={{
        type: 'loop',
        perMove: 1,
        gap: '1rem',
      }}
      aria-label="Decks Slider"
    >
      {flashdecks.map((deck) => (
        <SplideSlide key={deck.id}>
          <strong>Title:</strong> {deck.title || 'No title available'} <br />
          <strong>Description:</strong> {deck.description || 'No description available'} <br />
          <strong>Owner:</strong> {deck.owner || 'No owner available'} <br />
          <strong>Flashcards:</strong> {deck.flashcards || 'No flashcards available'} <br />
          <button>Open Deck</button>
        </SplideSlide>
      ))}
    </Splide>
  );

  const renderGroupsList = (flashgroups) => (
    <Splide
      options={{
        type: 'loop',
        perMove: 1,
        gap: '1rem',
      }}
      aria-label="Groups Slider"
    >
      {flashgroups.map((group) => (
        <SplideSlide key={group.id}>
          <strong>Group Name:</strong> {group.title || 'No name available'} <br />
          <strong>Description:</strong> {group.description || 'No description available'} <br />
          <strong>Owner:</strong> {group.owner || 'No owner available'} <br />
          <strong>Decks: </strong> {group.decks || 'No decks available'} <br />
          <button>Open Group</button>
        </SplideSlide>
      ))}
    </Splide>
  );

  return (
    // importing from modal class just to make sure the modals are shown properly 
    <div className="full-page-container"> 
      <h1>The Global Page to show user's flashcards!</h1>

      <h2>NavBar/Jump To: Recent Flashcards Decks Groups</h2>
      
      <h3>Flashcards</h3>
      {loading ? (
        <p>Loading...</p>
      ) : flashcards.length === 0 ? (
        <>
          <h4>No flashcards to view. Create a flashcard to view it here.</h4>
          <button className="create-flashcards" onClick={createFlashcard}>
            Create New Flashcard
          </button>
        </>
      ) : (
        <>
          {renderFlashcardsList(flashcards)}
          <br />
          <h4>Create more flashcards here: </h4>
          <button className="create-flashcards" onClick={createFlashcard}>
            Create New Flashcard
          </button>
        </>
      )}

      <h3>Decks</h3>
      {loading ? (
        <p>Loading...</p>
      ) : flashdecks.length === 0 ? (
        <>
          <h4>No decks to view. Create a deck to view it here.</h4>
          <button className="create-decks" onClick={createDecks}>
            Create New Deck
          </button>
        </>
      ) : (
        <>
          {renderDecksList(flashdecks)}
          <br />
          <h4>Create more decks here: </h4>
          <button className="create-decks" onClick={createDecks}>
            Create New Deck
          </button>
        </>
      )}

      <h3>Groups</h3>
      {loading ? (
        <p>Loading...</p>
      ) : flashgroups.length === 0 ? (
        <>
          <h4>No groups to view. Create a group to view it here.</h4>
          <button className="create-groups" onClick={createGroups}>
            Create New Group
          </button>
        </>
      ) : (
        <>
          {renderGroupsList(flashgroups)}
          <br />
          <h4>Create more groups here: </h4>
          <button className="create-groups" onClick={createGroups}>
            Create New Group
          </button>
        </>
      )}

      {/* <h2 style={{ marginTop: '10px' }}>EXAMPLE OUTPUT BELOW (DELETE THIS LATER)</h2>
      <h3 style={{ marginTop: '0px' }}>Recent</h3>
      {renderSplide(recentFlashcards)}
      <h3>Flashcards</h3>
      {renderSplide(recentFlashcards)}
      <h3>Decks</h3>
      {renderSplide(decks)}
      <h3>Groups</h3>
      {renderSplide(groups)} */}

      {/* Flashcard Modal */}
      {isFlashcardModalOpen && (
        <ModalDialog heading="Create Flashcard" onClose={() => closeFlashcardModal(true)}>
          <CreateFlashcard onClose={() => closeFlashcardModal(true)} />
        </ModalDialog>
      )}

      {/* Deck Modal */}
      {isDeckModalOpen && (
        <ModalDialog heading="Create Deck" onClose={() => closeDeckModal(true)}>
          <CreateDeck onClose={() => closeDeckModal(true)} />
        </ModalDialog>
      )}

      {/* Group Modal */}
      {isGroupModalOpen && (
        <ModalDialog heading="Create Group" onClose={() => closeGroupModal(true)}>
          <CreateGroups onClose={() => closeGroupModal(true)} />
        </ModalDialog>
      )}
    </div>
  );
}

export default GlobalPageApp;
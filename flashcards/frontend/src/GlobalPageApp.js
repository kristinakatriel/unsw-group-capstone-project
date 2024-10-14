import React, { useEffect, useState } from 'react';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';
import { invoke } from '@forge/bridge';
import CreateFlashcardGlobal from './CreateFlashcardGlobal';
import ModalDialog from '@atlaskit/modal-dialog';
import CreateDeck from './CreateDeck';
import CardSlider from './components/CardSlider';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import './GlobalPageApp.css';

function GlobalPageApp() {
  const [flashcards, setFlashcards] = useState([]);
  const [flashdecks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isFlashcardModalOpen, setIsCreateFlashcardOpen] = useState(false);
  const [isDeckModalOpen, setIsDeckModalOpen] = useState(false);

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

  useEffect(() => {
    getFlashcards();
    getDecks();
  }, []);

  const createFlashcardGlobal = () => {
    setIsCreateFlashcardOpen(true); // Open modal to create flashcard
  };

  const createDeck = () => {
    setIsDeckModalOpen(true); // Open modal to create deck
  };

  const closeFlashcardModal = (shouldRefresh = false) => {
    console.log('Closing flashcard modal. shouldRefresh:', shouldRefresh);  // Debugging print statement
    setIsCreateFlashcardOpen(false);

    getFlashcards();  // Re-fetch flashcards to update the UI

  };

  const closeDeckModal = (shouldRefresh = false) => {
    setIsDeckModalOpen(false);
    getDecks();  // Re-fetch decks to update the UI

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

  return (
    <div className='global-page-container'>
      <div className='global-page-headline'><FlashOnIcon className='global-page-flash-icon'/> FLASH</div>
      <div className='global-page-subheadline'>The Forge App that allows you to create flashcards in a flash</div>
      <div className='global-page-recents'>Recents
        <button className='global-page-create-flashcard-button' onClick={createFlashcardGlobal}>+ Create Flashcard</button>
        <button className='global-page-create-deck-button' onClick={createDeck}>+ Create Deck</button>
      </div>
      <div className='global-page-recents-description'>No flashcards or decks created. Create a flashcard or deck to display here.</div>
      <CardSlider />
      <div className='global-page-flashcards'>Flashcards<button className='global-page-create-flashcard-button' onClick={createFlashcardGlobal}>+ Create Flashcard</button></div>
      <div className='global-page-flashcards-description'>No flashcards created. Create a flashcard to display here.</div>
      <CardSlider />
      <div className='global-page-decks'>Decks<button className='global-page-create-deck-button' onClick={createDeck}>+ Create Deck</button></div>
      <div className='global-page-decks-description'>No decks created. Create a deck to display here.</div>
      <CardSlider />

      <h3>Flashcards</h3>
      {loading ? (
        <p>Loading...</p>
      ) : flashcards.length === 0 ? (
        <>
          <h4>No flashcards to view. Create a flashcard to view it here.</h4>
          <button className="create-flashcards" onClick={createFlashcardGlobal}>
            Create New Flashcard
          </button>
        </>
      ) : (
        <>
          {renderFlashcardsList(flashcards)}
          <br />
          <h4>Create more flashcards here: </h4>
          <button className="create-flashcards" onClick={createFlashcardGlobal}>
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
          <button className="create-decks" onClick={createDeck}>
            Create New Deck
          </button>
        </>
      ) : (
        <>
          {renderDecksList(flashdecks)}
          <br />
          <h4>Create more decks here: </h4>
          <button className="create-decks" onClick={createDeck}>
            Create New Deck
          </button>
        </>
      )}

      {/* Flashcard Modal */}
      {isFlashcardModalOpen && (
        <ModalDialog heading="Create Flashcard" onClose={() => closeFlashcardModal()}>
          <CreateFlashcardGlobal closeFlashcardModal={closeFlashcardModal} />
        </ModalDialog>
      )}

      {/* Deck Modal */}
      {isDeckModalOpen && (
        <ModalDialog heading="Create Deck" onClose={() => closeDeckModal(true)}>
          <CreateDeck onClose={() => closeDeckModal(true)} />
        </ModalDialog>
      )}
    </div>
  );
}

export default GlobalPageApp;
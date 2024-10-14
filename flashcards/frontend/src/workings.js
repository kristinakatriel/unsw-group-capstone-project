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
    setIsCreateFlashcardOpen(false);
    if (shouldRefresh) getFlashcards(); // Re-fetch flashcards to update the UI
  };

  const closeDeckModal = (shouldRefresh = false) => {
    setIsDeckModalOpen(false);
    if (shouldRefresh) getDecks(); // Re-fetch decks to update the UI
  };

  const renderFlashcardsList = (flashcards) => (
    <CardSlider cards={flashcards} type="flashcard" />
  );

  const renderDecksList = (flashdecks) => (
    <CardSlider cards={flashdecks} type="deck" />
  );

  return (
    <div className='global-page-container'>
      <div className='global-page-headline'><FlashOnIcon className='global-page-flash-icon'/> FLASH</div>
      <div className='global-page-subheadline'>The Forge App that allows you to create flashcards in a flash</div>
      <div className='global-page-recents'>
        Recents
        <button className='global-page-create-flashcard-button' onClick={createFlashcardGlobal}>+ Create Flashcard</button>
        <button className='global-page-create-deck-button' onClick={createDeck}>+ Create Deck</button>
      </div>
      <div className='global-page-recents-description'>
        {flashcards.length === 0 && flashdecks.length === 0 ? 'No flashcards or decks created. Create a flashcard or deck to display here.' : null}
      </div>

      <div className='global-page-flashcards'>Flashcards<button className='global-page-create-flashcard-button' onClick={createFlashcardGlobal}>+ Create Flashcard</button></div>
      {loading ? (
        <p>Loading...</p>
      ) : flashcards.length === 0 ? (
        <p>No flashcards created. Create a flashcard to display here.</p>
      ) : (
        renderFlashcardsList(flashcards)
      )}

      <div className='global-page-decks'>Decks<button className='global-page-create-deck-button' onClick={createDeck}>+ Create Deck</button></div>
      {loading ? (
        <p>Loading...</p>
      ) : flashdecks.length === 0 ? (
        <p>No decks created. Create a deck to display here.</p>
      ) : (
        renderDecksList(flashdecks)
      )}

      {/* Flashcard Modal */}
      {isFlashcardModalOpen && (
        <ModalDialog heading="Create Flashcard" onClose={() => closeFlashcardModal(true)}>
          <CreateFlashcardGlobal closeFlashcardModal={closeFlashcardModal} />
        </ModalDialog>
      )}

      {/* Deck Modal */}
      {isDeckModalOpen && (
        <ModalDialog heading="Create Deck" onClose={() => closeDeckModal(true)}>
          <CreateDeck closeDeckModal={closeDeckModal} />
        </ModalDialog>
      )}
    </div>
  );
}

export default GlobalPageApp;

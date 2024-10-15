import React, { useEffect, useState } from 'react';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';
import { invoke } from '@forge/bridge';
import CreateFlashcardGlobal from './flashcardGlobalModuleCreate';
import ModalDialog from '@atlaskit/modal-dialog';
import CardSlider from './components/CardSlider';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import './globalPageModule.css';
import CreateDeckGlobal from './deckGlobalModuleCreate';

function globalPageModule() {

  //State Management:
  const [flashcards, setFlashcards] = useState([]);
  const [flashdecks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isFlashcardModalOpen, setIsCreateFlashcardOpen] = useState(false);
  const [isDeckModalOpen, setIsDeckModalOpen] = useState(false);


  //Fetching Flashcards & Decks:
  //what is this actually doing, consult kristina / nira
  const getFlashcards = async () => {
    try {
      const response = await invoke('getAllFlashcards', {});
      if (response.success) {
        //what is this actually doing, consult kristina / nira
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

  //Fetching Data on Component Mount (useEffect):
  useEffect(() => {
    getFlashcards();
    getDecks();
  }, []);

  //Modal Functions:
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

  /////*****************************additions */
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


      </div>

      {loading ? (
        <p>Loading...</p>
      ) : flashcards.length === 0 ? (
        <p>Nothing recently accessed. Create some flashcards!.</p>
      ) : (
        renderFlashcardsList(flashcards)
      )}

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
          <CreateDeckGlobal closeDeckModal = {closeDeckModal}/>
        </ModalDialog>
      )}
    </div>
  );
}

export default globalPageModule;
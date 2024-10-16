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
import DeckSlider from './components/DeckSlider'; // Import the new DeckSlider component


// ********************************** GLOBAL PAGE MODULE **********************************

function globalPageModule() {

  // ********************************** STATE MANAGEMENT **********************************

  const [flashcards, setFlashcards] = useState([]);
  const [flashdecks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states for flashcards and decks
  const [isFlashcardModalOpen, setIsCreateFlashcardOpen] = useState(false);
  const [isDeckModalOpen, setIsDeckModalOpen] = useState(false);

  // State for FLASHCARD deletion and confirmation
  const [flashcardToDelete, setFlashcardToDelete] = useState(null);
  const [isDeleteFlashcardConfirmOpen, setIsDeleteFlashcardConfirmOpen] = useState(false);

  // State for DECK deletion and confirmation
  const [deckToDelete, setDeckToDelete] = useState(null);
  const [isDeleteDeckConfirmOpen, setIsDeleteDeckConfirmOpen] = useState(false);

  //************************** DELETION LOGIC *****************************/
  const confirmDeleteFlashcard = (flashcard) => {
    setFlashcardToDelete(flashcard);
    setIsDeleteFlashcardConfirmOpen(true);
  };

  const confirmDeleteDeck = (deck) => {
    setDeckToDelete(deck);
    setIsDeleteDeckConfirmOpen(true);
  };

  const closeDeleteFlashcardConfirm = () => {
    setIsDeleteFlashcardConfirmOpen(false);
    setFlashcardToDelete(null);
  };

  const closeDeleteDeckConfirm = () => {
    setIsDeleteDeckConfirmOpen(false);
    setDeckToDelete(null);
  };

  const deleteFlashcard = async () => {
    try {
      const response = await invoke('deleteFlashcard', { cardId: flashcardToDelete.id });
      if (response.success) {
        setFlashcards((prevFlashcards) => prevFlashcards.filter((card) => card.id !== flashcardToDelete.id));
        closeDeleteFlashcardConfirm();
        refreshFlashcardFrontend();  // Refresh UI after deletion
      } else {
        console.error('Error deleting flashcard:', response.error);
      }
    } catch (error) {
      console.error('Error deleting flashcard:', error);
    }
  };

  const deleteDeck = async () => {
    try {
      const response = await invoke('deleteDeck', { deckId: deckToDelete.id });
      if (response.success) {
        setDecks((prevDecks) => prevDecks.filter((deck) => deck.id !== deckToDelete.id));
        closeDeleteDeckConfirm();
        refreshDeckFrontend();  // Refresh UI after deletion
      } else {
        console.error('Error deleting deck:', response.error);
      }
    } catch (error) {
      console.error('Error deleting deck:', error);
    }
  };

  //************************** FETCHING DATA (REUSABLE) *****************************/
  const loadFlashcards = async () => {
    try {
      const response = await invoke('getAllFlashcards', {});
      if (response.success) {
        setFlashcards(response.cards);
      }
    } catch (error) {
      console.error('Error fetching flashcards:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDecks = async () => {
    try {
      const response = await invoke('getAllDecks', {});
      if (response.success) {
        setDecks(response.decks);
      }
    } catch (error) {
      console.error('Error fetching decks:', error);
    } finally {
      setLoading(false);
    }
  };

  //************************** REFRESH LOGIC *****************************/ *************************************************************************************
  const refreshFlashcardFrontend = () => {
    //setLoading(true);
    loadFlashcards();  // This function will reload flashcards and refresh the UI
  };

  const refreshDeckFrontend = () => {
    //setLoading(true);
    loadDecks();  // This function will reload decks and refresh the UI
  };

  //************************** MODAL HANDLERS *****************************/
  const createFlashcardGlobal = () => {
    setIsCreateFlashcardOpen(true); // Open modal to create flashcard
  };

  const createDeck = () => {
    setIsDeckModalOpen(true); // Open modal to create deck
  };

  const closeFlashcardModal = (shouldRefresh = false) => {
    setIsCreateFlashcardOpen(false);

    //loadFlashcards();
    refreshFlashcardFrontend();  // Refresh after closing modal if new flashcard was created****************************************************************************************************

  };

  const closeDeckModal = (shouldRefresh = false) => {
    setIsDeckModalOpen(false);
    //loadDecks();
    refreshDeckFrontend();  // Refresh after closing modal if new deck was created ****************************************************************************************************

  };

  //************************** INITIAL FETCH ON COMPONENT MOUNT *****************************/
  useEffect(() => {

    loadFlashcards();
    loadDecks();

    //refreshFlashcardFrontend();  // Load flashcards when the component mounts****************************************************************************************************
    //refreshDeckFrontend();  // Load decks when the component mounts ****************************************************************************************************8
  }, []);

  //************************** RENDER FUNCTIONS *****************************/
  const renderFlashcardsList = (flashcards) => (
    <CardSlider cards={flashcards} onDelete={confirmDeleteFlashcard} />
  );

  const renderDecksList = (flashdecks) => (
    <DeckSlider decks={flashdecks} onDelete={confirmDeleteDeck} />
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



      {/* Flashcard Delete Confirmation Modal */}
      {isDeleteFlashcardConfirmOpen && (
        <ModalDialog heading="Delete Flashcard?" onClose={closeDeleteFlashcardConfirm}>

          <p>Are you sure you want to delete this flashcard?</p>
          <button onClick={deleteFlashcard}>Yes, Delete</button>
          <button onClick={closeDeleteFlashcardConfirm}>Cancel</button>

        </ModalDialog>
      )}

      {/* Deck Delete Confirmation Modal */}
      {isDeleteDeckConfirmOpen && (
        <ModalDialog heading="Delete Deck?" onClose={closeDeleteDeckConfirm}>

          <p>Are you sure you want to delete this deck?</p>
          <button onClick={deleteDeck}>Yes, Delete</button>
          <button onClick={closeDeleteDeckConfirm}>Cancel</button>

        </ModalDialog>
      )}


    </div>
  );
}

export default globalPageModule;
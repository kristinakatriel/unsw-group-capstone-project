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




function globalPageModule() {

  //State Management:
  const [flashcards, setFlashcards] = useState([]);
  const [flashdecks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isFlashcardModalOpen, setIsCreateFlashcardOpen] = useState(false);
  const [isDeckModalOpen, setIsDeckModalOpen] = useState(false);



  // State for flashcard deletion
  const [flashcardToDelete, setFlashcardToDelete] = useState(null);
  const [isDeleteFlashcardConfirmOpen, setIsDeleteFlashcardConfirmOpen] = useState(false);

  // State for deck deletion
  const [deckToDelete, setDeckToDelete] = useState(null);
  const [isDeleteDeckConfirmOpen, setIsDeleteDeckConfirmOpen] = useState(false);

  // Open delete confirmation modal for flashcard
  const confirmDeleteFlashcard = (flashcard) => {
    setFlashcardToDelete(flashcard);
    setIsDeleteFlashcardConfirmOpen(true);
  };


  const confirmDeleteDeck = (deck) => {
    console.log('Deck to delete:', deck);  // Log the deck to be deleted
    setDeckToDelete(deck);
    setIsDeleteDeckConfirmOpen(true);
};

  // Close delete confirmation modal for flashcard
  const closeDeleteFlashcardConfirm = () => {
    setIsDeleteFlashcardConfirmOpen(false);
    setFlashcardToDelete(null);
  };

  const closeDeleteDeckConfirm = () => {
    console.log('Closing delete deck confirmation modal');  // Log when closing the modal
    setIsDeleteDeckConfirmOpen(false);
    setDeckToDelete(null);
};


  const deleteFlashcard = async () => {
    try {
      console.log('Deleting flashcard with id:', flashcardToDelete?.id);  // Check id before invoking API
      const response = await invoke('deleteFlashcard', { cardId: flashcardToDelete.id });
      console.log('Delete response:', response); // Check the response structure
      if (response.success) {
        setFlashcards((prevFlashcards) => {
          console.log('Current flashcards before delete:', prevFlashcards);
          return prevFlashcards.filter((card) => card.id !== flashcardToDelete.id);
        });
        setFlashcardToDelete(null);
        closeDeleteFlashcardConfirm();
      } else {
        console.error('Error deleting flashcard:', response.error);
      }
    } catch (error) {
      console.error('Error deleting flashcard:', error);
    }
  };




  const deleteDeck = async () => {
    try {
        console.log('Attempting to delete deck with id:', deckToDelete?.id);  // Log the deck ID
        const response = await invoke('deleteDeck', { deckId: deckToDelete.id });
        console.log('Delete response for deck:', response);  // Log the response from the delete action
        if (response.success) {
            setDecks((prevDecks) =>
                prevDecks.filter((deck) => deck.id !== deckToDelete.id)
            );

            closeDeleteDeckConfirm();
        } else {
            console.error('Error deleting deck:', response.error);
        }
    } catch (error) {
        console.error('Error deleting deck:', error);
    }
};


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

  // /////*****************************additions */
  // const renderFlashcardsList = (flashcards) => (
  //   <CardSlider cards={flashcards} type="flashcard" />
  // );

  // const renderDecksList = (flashdecks) => (
  //   <CardSlider cards={flashdecks} type="deck" />
  // );

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
        console.log('Displaying delete deck confirmation modal for deck:', deckToDelete),  // Log the deck being confirmed
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
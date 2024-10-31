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
import DeckSlider from './components/DeckSlider';
import DeckDisplay from './components/DeckDisplay';
import Breadcrumbs, { BreadcrumbsItem } from '@atlaskit/breadcrumbs';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle, ModalTransition } from '@atlaskit/modal-dialog';
import Button, { IconButton } from '@atlaskit/button/new';
import CrossIcon from '@atlaskit/icon/glyph/cross';
import { Alert, Collapse } from '@mui/material';
import { Flex, Grid, xcss } from '@atlaskit/primitives';
import QuizMode from './components/QuizMode';
import StudyMode from './components/StudyMode';
import EditFlashcardModal from './flashcardGlobalModuleEdit';
import EditDeckModal from './deckModuleEdit';
const gridStyles = xcss({
    width: '100%',
});

const closeContainerStyles = xcss({
    gridArea: 'close',
});

const titleContainerStyles = xcss({
    gridArea: 'title',
});

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

  // State for FLASHCARD editing and confirmation
  const [editingFlashcard, setEditingFlashcard] = useState(null); // Store the flashcard being edited
  const [isEditFlashcardModalOpen, setIsEditFlashcardModalOpen] = useState(false);

  // State for DECK editing and confirmation
  const [editingDeck, setEditingDeck] = useState(null); // Store the deck being edited
  const [isEditDeckModalOpen, setIsEditDeckModalOpen] = useState(false);

  // State for DECK deletion and confirmation
  const [deckToDelete, setDeckToDelete] = useState(null);
  const [isDeleteDeckConfirmOpen, setIsDeleteDeckConfirmOpen] = useState(false);

  // State for DECK display
  const [selectedDeck, setSelectedDeck] = useState(null);

  // State for breadcrumbs
  const [breadcrumbItems, setBreadcrumbItems] = useState([{ href: '#', text: 'FLASH (Home)' }]);

  // State for study mode
  const [isStudyMode, setIsStudyMode] = useState(false);

  // State for quizmode
  const [isQuizMode, setIsQuizMode] = useState(false);

  // State for saving success and error messages
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [deleteDeckFromDisplaySuccess, setDeleteDeckFromDisplaySuccess] = useState(false);
  const [showDeleteSuccessAlert, setShowDeleteSuccessAlert] = useState(false);

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
    setErrorMessage('');
    setDeleteSuccess(false);
  };

  const closeDeleteDeckConfirm = () => {
    setIsDeleteDeckConfirmOpen(false);
    setDeckToDelete(null);
    setErrorMessage('');
    setDeleteSuccess(false);
  };

  const deleteFlashcard = async () => {
    setErrorMessage('');
    try {
      const response = await invoke('deleteFlashcard', { cardId: flashcardToDelete.id });
      console.log("FLASHCARDTODELETE");
      if (response.success) {
        setDeleteSuccess(true);
        // setFlashcards((prevFlashcards) => prevFlashcards.filter((card) => card.id !== flashcardToDelete.id));
        loadFlashcards();
        setTimeout(() => {
          closeDeleteFlashcardConfirm(); // Delay closing modal
        }, 400); // Show message for 2 seconds before closing
        refreshFlashcardFrontend();  // Refresh UI after deletion
      } else {
        setErrorMessage(response.error);
        console.error('Error deleting flashcard:', response.error);
      }
    } catch (error) {
      console.error('Error deleting flashcard:', error);
    }
  };

  const deleteDeck = async () => {
    setErrorMessage('');
    try {
      const response = await invoke('deleteDeck', { deckId: deckToDelete.id });
      if (response.success) {
        setDeleteSuccess(true);
        // setDecks((prevDecks) => prevDecks.filter((deck) => deck.id !== deckToDelete.id));
        loadDecks();
        setTimeout(() => {
          closeDeleteDeckConfirm();
        }, 2000); // Show message for 2 seconds before closing
        refreshDeckFrontend();  // Refresh UI after deletion
      } else {
        setErrorMessage(response.error);
        console.error('Error deleting deck:', response.error);
      }
    } catch (error) {
      console.error('Error deleting deck:', error);
    }

  };

  useEffect(() => {
    if (deleteDeckFromDisplaySuccess) {
      setShowDeleteSuccessAlert(true);

      const timer = setTimeout(() => {
        setShowDeleteSuccessAlert(false);
      }, 2000); // Adjust the duration as needed

      return () => clearTimeout(timer);
    }
  }, [deleteDeckFromDisplaySuccess]);


  //************************** FETCHING DATA (REUSABLE) *****************************/
  const loadFlashcards = async () => {

    console.log('Current flashcards state before fetch:', flashcards); // Log the current state of flashcards
    try {
      const response = await invoke('getAllFlashcards', {});
      console.log('Response received from getAllFlashcards:', response); // Log the entire response

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
      console.log(response);
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

  // Modal logic for editing flashcards
  // Open the edit modal
  const openFlashcardEditModal = (flashcard) => {
    setEditingFlashcard(flashcard);
    setIsEditFlashcardModalOpen(true);
  };

  // Close the edit modal and refresh flashcards
  // updatedFlashcard is not really needed at the moment
  const closeFlashcardEditModal = (updatedFlashcard) => {
    setIsEditFlashcardModalOpen(false);

    // Refresh the flashcard list by fetching flashcards
    refreshFlashcardFrontend();
    refreshDeckFrontend();
  };


  //DECK EDIT LOGIC

  // Modal logic for editing flashcards
  // Open the edit modal
  const openDeckEditModal = (deck) => {
    setEditingDeck(deck);
    setIsEditDeckModalOpen(true);
  };

  // Close the edit modal and refresh flashcards
  // updatedFlashcard is not really needed at the moment
  const closeDeckEditModal = (updatedDeck) => {
    setIsEditDeckModalOpen(false);
    // Refresh the deck list by refetching decks
    refreshDeckFrontend();
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
    <CardSlider cards={flashcards} onDelete={confirmDeleteFlashcard} onEdit={openFlashcardEditModal}/>
  );

  const renderDecksList = (flashdecks) => (
    <DeckSlider decks={flashdecks} onDelete={confirmDeleteDeck} onDeckClick={onDeckClick} onEdit ={openDeckEditModal} />
  );

  //************************** DECK DISPLAY FUNCTIONS *****************************/
  const onDeckClick = (deck) => {
    console.log(`Deck clicked: ${deck.title}`); // Log when a deck is clicked
    setSelectedDeck(deck);
    setIsStudyMode(false);
    setIsQuizMode(false);
    setBreadcrumbItems([{ href: '#', text: 'FLASH (Home)' }, { href: '#', text: deck.title }]);
    console.log('Selected Deck:', deck); // Log the currently selected deck
    console.log('Current Breadcrumb Items:', [{ href: '#', text: 'FLASH (Home)' }, { href: '#', text: deck.title }]); // Log breadcrumb items
  };

  const goBackIntermediate = (deleted = false) => {
    if (deleted) {
      setDeleteDeckFromDisplaySuccess(true);
    } else {
      setDeleteDeckFromDisplaySuccess(false);
    }
  }

  const goBackToHome = () => {
    console.log('Going back to FLASH (Home)'); // Log when going back to Home
    setSelectedDeck(null);
    setIsStudyMode(false);
    setIsQuizMode(false);
    setBreadcrumbItems([{ href: '#', text: 'FLASH (Home)' }]);
    refreshDeckFrontend();
    refreshFlashcardFrontend();
    console.log('Current Breadcrumb Items:', [{ href: '#', text: 'FLASH (Home)' }]); // Log breadcrumb items
  };

  const goBackToDeck = () => {
    console.log('Going back to Deck'); // Log when going back to the deck
    setIsStudyMode(false);
    setIsQuizMode(false);
    setBreadcrumbItems(prevItems => prevItems.slice(0, -1));
    console.log('Current Breadcrumb Items:', prevItems.slice(0, -1)); // Log breadcrumb items
  };

  //************************** STUDY MODE FUNCTIONS *****************************/
  const studyMode = async () => {
    //loadDecks();

    console.log("selected deck going into quiz mode", selectedDeck);
    const id = selectedDeck.id;
    console.log("id", id);

    try {
      const response = await invoke('getDeck', { deckId: id });

      if (response.success) {
        console.log("Deck retrieved successfully:", response.deck);
        setSelectedDeck(response.deck)
      } else {
        console.error("Error retrieving deck:", response.error);
        return null;
      }
    } catch (error) {
      console.error("Exception in fetchDeck:", error);
      return null;
    }
    console.log("selected deck", selectedDeck);
    console.log('Entering Study Mode'); // Log when entering study mode
    setIsStudyMode(true);
    setBreadcrumbItems(prevItems => [
        ...prevItems,
        { href: '#', text: 'Study Mode' }
    ]);
  };

  if (isStudyMode) {
    return (
      <div>
        <Breadcrumbs>
          {breadcrumbItems.map((item, index) => (
            <BreadcrumbsItem
              key={index}
              href={item.href}
              text={item.text}
              onClick={() => {
                if (item.text === 'FLASH (Home)') {
                  goBackToHome();
                } else if (item.text === selectedDeck.title) {
                  goBackToDeck();
                }
              }}
            />
          ))}
        </Breadcrumbs>
        <StudyMode deck={selectedDeck} onBack={goBackToDeck} />
      </div>
    );
  }

  //************************** QUIZ MODE FUNCTIONS *****************************/
  const quizMode = async () => {
    console.log("selected deck going into quiz mode", selectedDeck);
    const id = selectedDeck.id;
    console.log("id", id);

    try {
      const response = await invoke('getDeck', { deckId: id });

      if (response.success) {
        console.log("Deck retrieved successfully:", response.deck);
        setSelectedDeck(response.deck)
      } else {
        console.error("Error retrieving deck:", response.error);
        return null;
      }
    } catch (error) {
      console.error("Exception in fetchDeck:", error);
      return null;
    }
    console.log("selected deck", selectedDeck);
    console.log('Entering Quiz Mode'); // Log when entering quiz mode
    setIsQuizMode(true);

    setBreadcrumbItems(prevItems => [
        ...prevItems,
        { href: '#', text: 'Quiz Mode' }
    ]);
  };

  if (isQuizMode) {
    //loadDecks();
    return (
      <div>
        <Breadcrumbs>
          {breadcrumbItems.map((item, index) => (
            <BreadcrumbsItem
              key={index}
              href={item.href}
              text={item.text}
              onClick={() => {
                if (item.text === 'FLASH (Home)') {
                  goBackToHome();
                } else if (item.text === selectedDeck.title) {
                  goBackToDeck();
                }
              }}
              // className="breadcrumb-item"
            />
          ))}
        </Breadcrumbs>
        <QuizMode deck={selectedDeck} onBack={goBackToDeck} />
      </div>
    );
  }

  if (selectedDeck) {
    //loadDecks();
    return (
      <div >
        <Breadcrumbs>
          {breadcrumbItems.map((item, index) => (
            <BreadcrumbsItem
              key={index}
              href={item.href}
              text={item.text}
              onClick={item.text === 'FLASH (Home)' ? goBackToHome : undefined}
              // className="breadcrumb-item"
              />

          ))}
        </Breadcrumbs>
        <DeckDisplay deck={selectedDeck} startStudyMode={studyMode} startQuizMode={quizMode} goBackToHome={goBackToHome} goBackIntermediate={goBackIntermediate}/>
      </div>
    );
  }

  return (
    <div className='global-page-container'>

      <div className='global-page-headline'><FlashOnIcon className='global-page-flash-icon'/> FLASH</div>
      <div className='global-page-subheadline'>The Forge App that allows you to create flashcards in a flash</div>
      <Collapse in={showDeleteSuccessAlert} timeout={500}>
        <Alert severity="success">
          Deck deleted successfully!
        </Alert>
      </Collapse>
      <div className='global-page-decks'>Decks<button className='global-page-create-deck-button' onClick={createDeck}>+ Create Deck</button></div>
      {loading ? (
        <p>Loading...</p>
      ) : flashdecks.length === 0 ? (
        <p>No decks created. Create a deck to display here.</p>
      ) : (
        renderDecksList(flashdecks)
      )}

      <div className='global-page-flashcards'>Flashcards<button className='global-page-create-flashcard-button' onClick={createFlashcardGlobal}>+ Create Flashcard</button></div>
      {loading ? (
        <p>Loading...</p>
      ) : flashcards.length === 0 ? (
        <p>No flashcards created. Create a flashcard to display here.</p>
      ) : (
        renderFlashcardsList(flashcards)
      )}

      <div className='global-page-recents'>Suggested</div>
      {loading ? (
        <p>Loading...</p>
      ) : flashcards.length === 0 ? (
        <p>Nothing recently accessed. Create some flashcards!.</p>
      ) : (
        renderFlashcardsList(flashcards)
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
      <ModalTransition>
          {isDeleteFlashcardConfirmOpen && (
              <Modal onClose={closeDeleteFlashcardConfirm}>
                  <ModalHeader>
                      <Grid gap="space.200" templateAreas={['title close']} xcss={gridStyles}>
                          <Flex xcss={closeContainerStyles} justifyContent="end">
                              <IconButton
                                  appearance="subtle"
                                  icon={CrossIcon}
                                  label="Close Modal"
                                  onClick={closeDeleteFlashcardConfirm}
                              />
                          </Flex>
                          <Flex xcss={titleContainerStyles} justifyContent="start">
                              <ModalTitle appearance="danger">Delete Flashcard?</ModalTitle>
                          </Flex>
                      </Grid>
                  </ModalHeader>
                  <ModalBody>
                      <p>Are you sure you want to delete all instances of the flashcard? This action cannot be undone.</p>
                      {deleteSuccess &&
                        <Alert severity="success"> Flashcard deleted successfully! </Alert>
                      }
                      {errorMessage &&
                        <Alert severity="error">{errorMessage} </Alert>
                      }
                  </ModalBody>
                  <ModalFooter>
                      <Button appearance="subtle" onClick={closeDeleteFlashcardConfirm}>Cancel</Button>
                      <Button appearance="danger" onClick={deleteFlashcard}>Yes, Delete</Button>
                  </ModalFooter>
              </Modal>
          )}
      </ModalTransition>

      {/* Deck Delete Confirmation Modal */}
      <ModalTransition>
          {isDeleteDeckConfirmOpen && (
              <Modal onClose={closeDeleteDeckConfirm}>
                  <ModalHeader>
                      <Grid gap="space.200" templateAreas={['title close']} xcss={gridStyles}>
                          <Flex xcss={closeContainerStyles} justifyContent="end">
                              <IconButton
                                  appearance="subtle"
                                  icon={CrossIcon}
                                  label="Close Modal"
                                  onClick={closeDeleteDeckConfirm}
                              />
                          </Flex>
                          <Flex xcss={titleContainerStyles} justifyContent="start">
                              <ModalTitle appearance="danger">Delete Deck?</ModalTitle>
                          </Flex>
                      </Grid>
                  </ModalHeader>
                  <ModalBody>
                      <p>Are you sure you want to delete all instances of the deck? This action cannot be undone.</p>
                      {deleteSuccess &&
                        <Alert severity="success">Deck deleted successfully!</Alert>
                      }
                      {errorMessage &&
                        <Alert severity="error"> {errorMessage} </Alert>
                      }
                  </ModalBody>
                  <ModalFooter>
                      <Button appearance="subtle" onClick={closeDeleteDeckConfirm}>Cancel</Button>
                      <Button appearance="danger" onClick={deleteDeck}>Yes, Delete</Button>
                  </ModalFooter>
              </Modal>
          )}
      </ModalTransition>

      {/* FLASHCARD EDIT FUNCTIONALITY: Flashcard Edit Modal */}
      {isEditFlashcardModalOpen && (
        <ModalDialog heading="Edit Flashcard" onClose={closeFlashcardEditModal}>
          <EditFlashcardModal
            flashcard={editingFlashcard} // Pass the flashcard to the modal
            closeFlashcardEditModal={closeFlashcardEditModal}
          />
        </ModalDialog>
      )}

      {/* DECK EDIT FUNCTIONALITY: DECK Edit Modal */}
      {isEditDeckModalOpen && (
        <ModalDialog heading="Edit Deck" onClose={closeDeckEditModal}>
          <EditDeckModal
            deck={editingDeck} // Pass the flashcard to the modal
            closeDeckEditModal={closeDeckEditModal}
          />
        </ModalDialog>
      )}

    </div>
  );
}

export default globalPageModule;
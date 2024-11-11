import React, { useState, useEffect } from 'react';
import { invoke } from '@forge/bridge';
import Button, { IconButton } from '@atlaskit/button/new';
import { Field } from '@atlaskit/form';
import CrossIcon from '@atlaskit/icon/glyph/cross';
import { Flex, Grid, xcss } from '@atlaskit/primitives';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle, ModalTransition } from '@atlaskit/modal-dialog';
import { Alert, Collapse } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import './deckGlobalModuleCreate.css';
import SearchIcon from '@mui/icons-material/Search';

const gridStyles = xcss({
  width: '100%',
});

const closeContainerStyles = xcss({
  gridArea: 'close',
});

const titleContainerStyles = xcss({
  gridArea: 'title',
});

function AddFlashcardsToDeck({ deck, closeAddDeckModal }) {
  console.log("deck passed in", deck);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedFlashcards, setSelectedFlashcards] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [closeError, setCloseError] = useState(false);

  const [deckDisplaySearchTerm, setDeckDisplaySearchTerm] = useState(''); // For search functionality

  const handleClose = () => {
    console.log('Function called: handleClose');
    if (typeof closeAddDeckModal === 'function') {
      closeAddDeckModal(); // Call the function passed as a prop
    } else {
      console.error('closeFlashcardModal is not a function:', closeAddDeckModal);
    }
  };

  // Fetch flashcards when the component mounts
  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        console.log('Fetching flashcards...');
        const response = await invoke('getAllFlashcards', {});
        console.log("responce cards", response.cards);
        if (response.success) {
          // Filter out flashcards already in the deck
          const flashcardsNotInDeck = response.cards.filter((flashcard) => !deck.cards.some(deckFlashcard => deckFlashcard.id === flashcard.id));

          console.log("flashcardsNotInDeck", flashcardsNotInDeck);

          //console.log('Flashcards fetched successfully:', response.cards);
          setFlashcards(flashcardsNotInDeck);
        } else {
          console.error('Error getting flashcards:', response.error);
        }
      } catch (error) {
        console.error('Error fetching flashcards:', error);
      }
    };

    fetchFlashcards();
  }, []);

  const handleSave = async () => {
    console.log('handleSave invoked. Adding flashcards to deck...');
    console.log('Selected Flashcards:', selectedFlashcards);
    console.log('Current Deck:', deck);

    setErrorMessage('');

    if (selectedFlashcards.length === 0) {
      setErrorMessage('No flashcards are selected');
      return;
    }

    try {
      console.log('Clearing selected flashcards after successful addition.');
      setSelectedFlashcards([]); // Clear selected flashcards after saving
      console.log('Selected flashcards cleared. Now closing the modal.');
      setSaveSuccess(true)
      setTimeout(() => {
        closeAddDeckModal(selectedFlashcards),
        handleClose();
      }, 1000);
    } catch (error) {
      console.error('Error adding flashcards to deck:', error);
    }
  };

  const handleCheckboxChange = (flashcardId) => {
      console.log('Checkbox change detected for flashcard:', flashcardId);
      if (selectedFlashcards.includes(flashcardId)) {
          console.log('Flashcard removed from selected list:', flashcardId);
          setSelectedFlashcards(selectedFlashcards.filter((id) => id !== flashcardId));
      } else {
          console.log('Flashcard added to selected list:', flashcardId);
          setSelectedFlashcards([...selectedFlashcards, flashcardId]);
      }
      console.log('Updated selected flashcards:', selectedFlashcards);
  };

  // Search functionality: Update the search term
  const searchDeckDisplay = (event) => {
    setDeckDisplaySearchTerm(event.target.value);
    console.log('Searching:', deckDisplaySearchTerm);
  };

  // Filter flashcards based on the search term
  const filteredFlashcards = flashcards.filter((card) => {
    const searchTerm = deckDisplaySearchTerm.toLowerCase();
    return (
      (typeof card.front === 'string' && card.front.toLowerCase().includes(searchTerm)) ||
      (typeof card.back === 'string' && card.back.toLowerCase().includes(searchTerm)) ||
      (card.name && typeof card.name === 'string' && card.name.toLowerCase().includes(searchTerm))
    );
  });


  return (
    <ModalTransition>
      <Modal onClose={closeAddDeckModal}>
        <ModalHeader>
          <Grid templateAreas={['title close']} xcss={gridStyles}>
            <Flex xcss={closeContainerStyles} justifyContent="end" alignItems="center">
              <IconButton
                appearance="subtle"
                icon={CrossIcon}
                label="Close Modal"
                onClick={closeAddDeckModal}
              />
            </Flex>
            <Flex xcss={titleContainerStyles} justifyContent="start" alignItems="center">
              <ModalTitle>Add Flashcard/s</ModalTitle>
            </Flex>
          </Grid>
        </ModalHeader>

        <ModalBody>
          { errorMessage &&
          <Collapse in={closeError}>
            <Alert
              severity="error"
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => {
                    setCloseError(false);
                  }}
                >
                <CloseIcon fontSize="inherit" />
                </IconButton>
              }
              sx={{ mb: 2 }}
            >
              {errorMessage}
            </Alert>
          </Collapse>
        }
          <div className="global-page-search">
            <div className="global-page-search-box">
              <SearchIcon className="global-page-search-icon" />
              <input
                type="text"
                id="search-input"
                value={deckDisplaySearchTerm}
                onChange={searchDeckDisplay} // Update search term
                placeholder="Search flashcards..."
              />
            </div>
          </div>

          {/************************************* ADD FLASHCARDS FIELD ***************************************/}
          <Field id="add-flashcards" name="add-flashcards" label="Add existing flashcards to deck">
            {() => (
              <div className='flashcards-select-scroll'>
                {filteredFlashcards.length > 0 ? (
                  filteredFlashcards.map((flashcard) => (
                    <div key={flashcard.id} className="flashcards-select-scroll-item">
                      <input
                        type="checkbox"
                        id={`flashcard-${flashcard.id}`}
                        checked={selectedFlashcards.includes(flashcard.id)}
                        onChange={() => handleCheckboxChange(flashcard.id)}
                      />
                      <label htmlFor={`flashcard-${flashcard.id}`}>
                        {flashcard.front || 'No front available'}
                      </label>
                    </div>
                  ))
                ) : (
                  <p>No flashcards available to select.</p>
                )}
              </div>
            )}
          </Field>

          {saveSuccess && <Alert severity="success"> Flashcard/s added to deck successfully! </Alert>}

        </ModalBody>

        <ModalFooter>
          <Button appearance="subtle" onClick={handleClose}>Cancel</Button>
          <Button appearance="primary" onClick={handleSave}>Add Flashcard/s</Button>
        </ModalFooter>
      </Modal>
    </ModalTransition>
  );
}

export default AddFlashcardsToDeck;
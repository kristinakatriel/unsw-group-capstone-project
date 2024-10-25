import React, { useState, useEffect } from 'react';
import { invoke } from '@forge/bridge';
import { Alert, Collapse, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import './globalPageModule.js';
import './deckGlobalModuleCreate.css';

function CreateDeckGlobal({ closeDeckModal }) {
  const [deckTitle, setDeckTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFlashcards, setSelectedFlashcards] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [closeError, setCloseError] = useState(true);

  const handleCloseGlobal = () => {
    console.log('Function called: handleCloseGlobal');
    if (typeof closeDeckModal === 'function') {
      closeDeckModal(); // Call the function passed as a prop
    } else {
      console.error('closeDeckModal is not a function:', closeDeckModal);
    }
  };

  // Fetch flashcards when the component mounts
  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        console.log('Fetching flashcards...');
        const response = await invoke('getAllFlashcards', {});
        if (response.success) {
          console.log('Flashcards fetched successfully:', response.cards);
          setFlashcards(response.cards);
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
    setErrorMessage('');
    setCloseError(true);
    console.log('Saving deck...');
    console.log('Selected Flashcards:', selectedFlashcards);

    // if (!deckTitle.trim()) { // unnecessary as backend deals with this
    //   console.error('Deck title cannot be empty.');
    //   return; // Prevents further execution
    // }

    try {
      const response = await invoke('createDeck', {
        title: deckTitle,
        description: description,
        flashcards: [],
      });

      if (response.success) {
        setSaveSuccess(true); // Show success message
        console.log('Deck created successfully:', response.deck);

        const deckId = response.id;

        // Adding each selected flashcard to the deck
        for (const cardId of selectedFlashcards) {
          console.log(`Invoking addCardToDeck for cardId: ${cardId} and deckId: ${deckId}`);
          const addCardResponse = await invoke('addCardToDeck', {
            deckId: deckId,
            cardId: cardId
          });

          if (addCardResponse.success) {
            console.log(`Flashcard ${cardId} added to deck ${deckId}`);
          } else {
            console.error(`Failed to add flashcard ${cardId} to deck:`, addCardResponse.error);
          }
        }

        setDeckTitle('');
        setDescription('');
        setSelectedFlashcards([]);
        setTimeout(() => {
          closeDeckModal(); // Delay closing modal
        }, 2000); // Show success message for 2 seconds before closing
      } else {
        setErrorMessage(response.error);
        console.error('Failed to create deck:', response.error);
      }
    } catch (error) {
      console.error('Error invoking createDeck:', error);
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

  return (
    <div className="deck-creation">
      <h2 className="deck-title">Create New Deck</h2>
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
      <div className="form-group">
        <label htmlFor="deckTitle">Deck Title</label>
        <input
          type="text"
          id="deckTitle"
          value={deckTitle}
          onChange={(e) => setDeckTitle(e.target.value)}
          placeholder="Type the deck title here..."
          className="input-field"
        />
      </div>

      <div className="form-group">
        <label htmlFor="description"> Description (Optional) </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Type a description for the deck..."
          className="input-area"
        />
      </div>

      <div className="form-group">
        <label>Select Flashcards</label>
        {flashcards.length > 0 ? (
          flashcards.map((flashcard) => (
            <div key={flashcard.id}>
              <input
                type="checkbox"
                id={`flashcard-${flashcard.id}`}
                checked={selectedFlashcards.includes(flashcard.id)}
                onChange={() => handleCheckboxChange(flashcard.id)}
              />
              <label htmlFor={`flashcard-${flashcard.id}`}>
                {flashcard.question_text || 'No question available'}
              </label>
            </div>
          ))
        ) : (
          <p>No flashcards available to select.</p>
        )}
      </div>

      {saveSuccess && 
        <Alert severity="success"> New deck created successfully! </Alert>
      }

      <div className="button-group">
        <button className="save-button" onClick={handleSave}>Save</button>
        <button className="close-button" onClick={handleCloseGlobal}>Close</button>
      </div>
    </div>
  );
}

export default CreateDeckGlobal;

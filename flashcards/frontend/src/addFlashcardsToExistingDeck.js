import React, { useState, useEffect } from 'react';
import { invoke } from '@forge/bridge';
import './globalPageModule.js';
import './deckGlobalModuleCreate.css';

function AddFlashcardsToDeck({ deck, closeAddDeckModal }) {
  // Log the deck prop to see its contents
  //console.log('Deck prop received:', deck);
  const [selectedFlashcards, setSelectedFlashcards] = useState([]);
  const [flashcards, setFlashcards] = useState([]);

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
        if (response.success) {
          // Filter out flashcards already in the deck
          const flashcardsNotInDeck = response.cards.filter((flashcard) => !deck.cards.some(deckFlashcard => deckFlashcard.id === flashcard.id));
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

    if (selectedFlashcards.length === 0) {
        console.error('No flashcards selected.');
        return; // Prevents further execution if no flashcards are selected
    }


    try {
      for (const cardId of selectedFlashcards) {
        console.log(`Processing flashcard with ID: ${cardId} for deck ID: ${deck.id}`);
        const addCardResponse = await invoke('addCardToDeck', {
          deckId: deck.id,
          cardId: cardId
        });

        console.log('Response from addCardToDeck:', addCardResponse);

        if (addCardResponse.success) {
          console.log(`Success: Flashcard ${cardId} added to deck ${deck.id}`);
        } else {
          console.error(`Failed to add flashcard ${cardId} to deck:`, addCardResponse.error);
        }
      }


      closeAddDeckModal(selectedFlashcards);


      console.log('Clearing selected flashcards after successful addition.');
      setSelectedFlashcards([]); // Clear selected flashcards after saving




      console.log('Selected flashcards cleared. Now closing the modal.');
      handleClose(); // Close the modal after saving

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

  return (
    <div className="deck-addition">
      <h2 className="deck-title">Add Flashcards to Deck: {deck.title}</h2>

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

      <div className="button-group">
        <button className="save-button" onClick={handleSave}>Add Flashcards</button>
        <button className="close-button" onClick={handleClose}>Close</button>
      </div>
    </div>
  );
}

export default AddFlashcardsToDeck;

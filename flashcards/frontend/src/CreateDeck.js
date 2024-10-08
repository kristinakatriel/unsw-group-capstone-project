import React, { useState, useEffect } from 'react';
import { invoke, view } from '@forge/bridge';
import './CreateDeck.css';

function CreateDeck() {
  const [deckTitle, setDeckTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFlashcards, setSelectedFlashcards] = useState([]);
  const [flashcards, setFlashcards] = useState([]);

  // Fetch flashcards when the component mounts
  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        const response = await invoke('getAllFlashcards', {});
        if (response.success) {
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
    try {
      const response = await invoke('createDeck', {
        title: deckTitle,
        description: description,
        owner: '@aaa',
        flashcards: selectedFlashcards
      });

      console.log('Deck saved successfully:', response);
      
      // Reset fields after saving
      setDeckTitle('');
      setDescription('');
      setSelectedFlashcards([]);
    } catch (error) {
      console.error('Error invoking createDeck:', error);
    }
  };

  const handleClose = () => {
    view.close(); // Close the modal
  };

  const handleCheckboxChange = (flashcardId) => {
    if (selectedFlashcards.includes(flashcardId)) {
      setSelectedFlashcards(selectedFlashcards.filter(id => id !== flashcardId));
    } else {
      setSelectedFlashcards([...selectedFlashcards, flashcardId]);
    }
  };

  return (
    <div className="deck-creation">
      <h2 className="deck-title">Create New Deck</h2>

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
        <label htmlFor="description">Description</label>
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
          flashcards.map(flashcard => (
            <div key={flashcard.id}>
              <input
                type="checkbox"
                id={`flashcard-${flashcard.id}`}
                checked={selectedFlashcards.includes(flashcard.id)}
                onChange={() => handleCheckboxChange(flashcard.id)}
              />
              <label htmlFor={`flashcard-${flashcard.id}`}>{flashcard.question_text || 'No question available'}</label>
            </div>
          ))
        ) : (
          <p>No flashcards available to select.</p>
        )}
      </div>

      <div className="button-group">
        <button className="save-button" onClick={handleSave}>Save</button>
        <button className="close-button" onClick={handleClose}>Close</button>
      </div>
    </div>
  );
}

export default CreateDeck;
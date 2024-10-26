import React, { useState, useEffect } from 'react';
import { invoke } from '@forge/bridge';
import './deckGlobalModuleCreate.css'; // made the css file common
import './globalPageModule.js';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import DragNDrop from './components/DragNDrop.jsx';

function EditFlashcardGlobal({ flashcard, closeFlashcardEditModal }) {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [hint, setHint] = useState('');

  // Pre-fill the form with the current flashcard details
  useEffect(() => {
    if (flashcard) {
      setFront(flashcard.front || '');
      setBack(flashcard.back || '');
      setHint(flashcard.hint || '');
    }
  }, [flashcard]);

  // handle this!
  const handleCloseGlobal = () => {
    if (typeof closeFlashcardEditModal === 'function') {
      closeFlashcardEditModal(); // Call the function passed as a prop
    } else {
      console.error('closeFlashcardModal is not a function:', closeFlashcardEditModal);
    }
  };

  const handleSaveGlobal = async () => {
    try {
      console.log(flashcard.id);
      const response = await invoke('updateFlashcard', {
        id: flashcard.id,
        front: front,
        back: back,
        hint: hint
      });

      if (response && response.success) {
        // Close the modal and pass updated card back
        closeFlashcardEditModal(response.card);
      } else {
        console.error('Failed to update flashcard:', response.error);
      }
    } catch (error) {
      console.error('Error invoking updateFlashcard:', error);
    }
  };


  return (
    <div className="global-deck-edit">
      <h2 className="deck-title"><DriveFileRenameOutlineIcon class='global-flashcard-edit-icon'/>Edit Flashcard</h2>

      <div className="form-group">
        <label htmlFor="front">Front</label>
        <div className="input-drag-container">
          <textarea
            id="front"
            value={front}
            onChange={(e) => setFront(e.target.value)}
            placeholder="Edit the front of the flashcard..."
            className="input-area"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="back">Back</label>
        <div className="input-drag-container">
          <textarea
            id="back"
            value={back}
            onChange={(e) => setBack(e.target.value)}
            placeholder="Edit the back of the flashcard..."
            className="input-area"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="hint">Hint (Optional) </label>
        <textarea
          id="hint"
          value={hint ? hint : ''}
          onChange={(e) => setHint(e.target.value)}
          placeholder="Edit/Add hint here..."
          className="input-area"
        />
      </div>

      <div className="button-group">
        <button className="save-button" onClick={handleSaveGlobal}>Save</button>
        <button className="close-button" onClick={handleCloseGlobal}>Close</button>
      </div>
    </div>
  );
}

export default EditFlashcardGlobal;
import React, { useState, useEffect } from 'react';
import { invoke, view } from '@forge/bridge';
import './flashcardGlobalModule.css';
import './globalPageModule.js';
import DragNDrop from './components/DragNDrop.jsx';

function CreateFlashcardGlobal( { closeFlashcardModal }) {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [hint, setHint] = useState('');


  const handleCloseGlobal = () => {
    console.log('CLOSE BUTTON WAS JUST PRESSED (Function called: handleCloseGlobal)');
    if (typeof closeFlashcardModal === 'function') {
      closeFlashcardModal(); // Call the function passed as a prop
    } else {
      console.error('closeFlashcardModal is not a function:', closeFlashcardModal);
    }
  };


  const handleSaveGlobal = async () => {
    console.log('SAVE BUTTON WAS JUST PRESSED (Function called: handleSaveGlobal)');
    try {
      console.log('Function called: handleSaveGlobal');
      const response = await invoke('createFlashcard', {
        front: front,
        back: back,
        hint: hint,
      });

      // getUserEmail();
      //console.log(response.owner);
      console.log('Flashcard saved?:', response);

      setFront('');
      setBack('');
      setHint('');

      console.log('Flashcard saved?:', response.card);
      if (response && response.success) {
          // Pass the new flashcard back to the close function
          closeFlashcardModal(response.card);
      } else {
          console.error('Failed to create flashcard:', response.error);
      }
    } catch (error) {
      console.error('Error invoking createFlashcard:', error);
    }
  };


  return (
    <div className="global-flashcard-creation">
      <h2 className="flashcard-title">Create New Flashcard</h2>

      <div className="form-group">
        <label htmlFor="front">Front</label>
        <div className="input-drag-container">
          <textarea
            id="front"
            value={front}
            onChange={(e) => setFront(e.target.value)}
            placeholder="Enter text for the front of the flashcard..."
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
            placeholder="Enter text for the back of the flashcard..."
            className="input-area"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="hint">Hint (Optional)</label>
        <div className="input-drag-container">
          <textarea
            id="hint"
            value={hint}
            onChange={(e) => setHint(e.target.value)}
            placeholder="Enter a hint..."
            className="input-area"
          />
        </div>
      </div>

      {/* <div className="form-group">
        <label htmlFor="select">Add to... (Optional)</label>
      </div> */}

      <div className="button-group">
        <button className="save-button" onClick={handleSaveGlobal}>Save</button>
        <button className="close-button" onClick={handleCloseGlobal}>Close</button>
      </div>
    </div>
  );
}

export default CreateFlashcardGlobal;


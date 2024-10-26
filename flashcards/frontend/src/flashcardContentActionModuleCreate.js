import React, { useState, useEffect } from 'react';
import { invoke, view } from '@forge/bridge';
import './flashcardContentActionModuleCreate.css';
import DragNDrop from './components/DragNDrop';

function flashcardContentActionModuleCreate() {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [hint, setHint] = useState('');

  const handleSave = async () => {
    try {
      const response = await invoke('createFlashcard', {
        front: front,
        back: back,
        hint: 'A hint',
        owner: '@O0',
        name: user
      });

      console.log(response.owner);
      console.log('Flashcard saved successfully:', response);

      setFront('');
      setBack('');
      setHint('');

    } catch (error) {
      console.error('Error invoking createFlashcard:', error);
    }
  };

  const handleClose = () => {
    console.log('LOGGGGG');
    view.close();
  };

  return (
    <div className="flashcard-creation">
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
            placeholder="Enter a hint here..."
            className="input-area"
          />
          <DragNDrop onFilesSelected={(files) => console.log('Files selected:', files)} />
        </div>
      </div>

      {/* **TODO** */}
      {/* <div className="form-group">
        <label htmlFor="select">Add to... (Optional)</label>
      </div> */}

      <div className="button-group">
        <button className="save-button" onClick={handleSave}>Save</button>
        <button className="close-button" onClick={handleClose}>Close</button>
      </div>
    </div>
  );
}

export default flashcardContentActionModuleCreate;

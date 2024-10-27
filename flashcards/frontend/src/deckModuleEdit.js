import React, { useState, useEffect } from 'react';
import { invoke } from '@forge/bridge';
import './flashcardGlobalModule.css';
import './globalPageModule.js';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import { Alert } from '@mui/material';

function EditDeckGlobal({ deck, closeDeckEditModal }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [locked, setLocked] = useState(false);

  // Pre-fill the form with the deck details
  useEffect(() => {
    if (deck) {
      setTitle(deck.title || '');
      setDescription(deck.description || '');
      setLocked(deck.locked || '');
    }
  }, [deck]);

  const handleCloseGlobal = () => {
    if (typeof closeDeckEditModal === 'function') {
      console.log('deck: ', deck);
      closeDeckEditModal(deck);
    } else {
      console.error('closeDeckEditModal is not a function:', closeDeckEditModal);
    }
  };

  const handleSaveGlobal = async () => {
    setErrorMessage('');
    console.log('deck: ', deck);


    try {
      const response = await invoke('updateDeck', {
        id: deck.id,
        title: title,
        description: description,
        locked: locked
      });

      if (response && response.success) {
        setSaveSuccess(true);
        console.log('responce.deck: ', response.deck);

        setTimeout(() => {
          closeDeckEditModal(response.deck); // Delay closing modal
        }, 2000); // Show success message for 2 seconds before closing
      } else {
        console.error('Failed to update deck:', response.error);
        setErrorMessage(response.error);
        setTimeout(() => {
          closeDeckEditModal(deck); // Delay closing modal
        }, 2000); // Show success message for 2 seconds before closing
      }
    } catch (error) {
      console.error('Error invoking updateDeck:', error);
    }
  };

  return (
    <div className="global-deck-edit">
      <h2 className="deck-title"><DriveFileRenameOutlineIcon className="global-deck-edit-icon"/> Edit Deck</h2>
      {errorMessage && 
        <Alert severity="error">{errorMessage} </Alert>
      }
      <div className="form-group">
        <label htmlFor="title">Deck Name</label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Edit deck title here..."
          className="input-area"
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Deck Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Edit deck description here..."
          className="input-area"
        />
      </div>

      <div className="form-group">
        <label>
          <input 
            type="checkbox" 
            checked={locked} 
            onChange={(e) => setLocked(e.target.checked)} 
          />
          Check the box if you want no one else to edit and/or delete the deck
        </label>
      </div>

      {saveSuccess && 
        <Alert severity="success"> Deck updated successfully! </Alert>
      }
      <div className="button-group">
        <button className="save-button" onClick={handleSaveGlobal}>Save Deck</button>
        <button className="close-button" onClick={handleCloseGlobal}>Close</button>
      </div>
    </div>
  );
}

export default EditDeckGlobal;

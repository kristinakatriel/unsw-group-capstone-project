import React, { useState, useEffect } from 'react';
import { invoke } from '@forge/bridge';
import './flashcardGlobalModule.css';
import './globalPageModule.js';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';

function EditDeckGlobal({ deck, closeDeckEditModal }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Pre-fill the form with the deck details
  useEffect(() => {
    if (deck) {
      setTitle(deck.title || '');
      setDescription(deck.description || '');
    }
  }, [deck]);

  const handleCloseGlobal = () => {
    if (typeof closeDeckEditModal === 'function') {
      closeDeckEditModal();
    } else {
      console.error('closeDeckEditModal is not a function:', closeDeckEditModal);
    }
  };

  const handleSaveGlobal = async () => {

    console.log('deck: ', deck);


    try {
      const response = await invoke('updateDeck', {
        id: deck.id,
        title: title,
        description: description,

      });

      if (response && response.success) {
        closeDeckEditModal(response.updatedDeck);
      } else {
        console.error('Failed to update deck:', response.error);
      }
    } catch (error) {
      console.error('Error invoking updateDeck:', error);
    }
  };

  return (
    <div className="global-deck-edit">
      <h2 className="deck-title"><DriveFileRenameOutlineIcon className="global-deck-edit-icon"/> Edit Deck</h2>

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


      <div className="button-group">
        <button className="save-button" onClick={handleSaveGlobal}>Save Deck</button>
        <button className="close-button" onClick={handleCloseGlobal}>Close</button>
      </div>
    </div>
  );
}

export default EditDeckGlobal;

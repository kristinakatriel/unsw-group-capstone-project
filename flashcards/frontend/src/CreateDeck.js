import React, { useState } from 'react';
import { invoke, view } from '@forge/bridge';
import './CreateDeck.css';

function CreateDeck() {
  const [deckTitle, setDeckTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');

  const handleSave = async () => {
    try {
      const response = await invoke('createDeck', {
        title: deckTitle,
        description: description,
        owner: '@eee',
      });

      console.log('Deck saved successfully:', response);
      
      // Reset the fields after saving
      setDeckTitle('');
      setDescription('');
      setOwnerEmail('');
    } catch (error) {
      console.error('Error invoking createDeck:', error);
    }
  };

  const handleClose = () => {
    view.close(); // Close the modal
  };

  return (
    <div classTitle="deck-creation">
      <h2 classTitle="deck-title">Create New Deck</h2>

      <div classTitle="form-group">
        <label htmlFor="deckTitle">Deck Title</label>
        <input
          type="text"
          id="deckTitle"
          value={deckTitle}
          onChange={(e) => setDeckTitle(e.target.value)}
          placeholder="Type the deck Title here..."
          classTitle="input-field"
        />
      </div>

      <div classTitle="form-group">
        <label htmlFor="description">Description </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Type a description for the deck..."
          classTitle="input-area"
        />
      </div>

      <div classTitle="button-group">
        <button classTitle="save-button" onClick={handleSave}>Save</button>
        <button classTitle="close-button" onClick={handleClose}>Close</button>
      </div>
    </div>
  );
}

export default CreateDeck;
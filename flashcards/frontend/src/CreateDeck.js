import React, { useState } from 'react';
import { invoke, view } from '@forge/bridge';
import './CreateDeck.css';

function CreateDeck() {
  const [deckName, setDeckName] = useState('');
  const [description, setDescription] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');

  const handleSave = async () => {
    try {
      const response = await invoke('createDeck', {
        name: deckName,
        description: description,
        owner: ownerEmail,
      });

      console.log('Deck saved successfully:', response);
      
      // Reset the fields after saving
      setDeckName('');
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
    <div className="deck-creation">
      <h2 className="deck-title">Create New Deck</h2>

      <div className="form-group">
        <label htmlFor="deckName">Deck Name</label>
        <input
          type="text"
          id="deckName"
          value={deckName}
          onChange={(e) => setDeckName(e.target.value)}
          placeholder="Type the deck name here..."
          className="input-field"
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description (Optional)</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Type a description for the deck..."
          className="input-area"
        />
      </div>

      <div className="button-group">
        <button className="save-button" onClick={handleSave}>Save</button>
        <button className="close-button" onClick={handleClose}>Close</button>
      </div>
    </div>
  );
}

export default CreateDeck;
import React, { useState, useEffect } from 'react';
import { invoke, view } from '@forge/bridge';
import './CreateGroupGlobal.css';
import './GlobalPageApp.js';

function CreateGroupGlobal({ closeGroupModal }) {
  const [groupTitle, setGroupTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDecks, setSelectedDecks] = useState([]);
  const [decks, setDecks] = useState([]);

  const handleCloseGlobal = () => {
    console.log('Function called: handleCloseGlobal');
    if (typeof closeGroupModal === 'function') {
        closeGroupModal(); // Call the function passed as a prop
    } else {
      console.error('closeFlashcardModal is not a function:', closeGroupModal);
    }
  };

  // Fetch available decks when the component mounts
  useEffect(() => {
    const fetchDecks = async () => {
      try {
        const response = await invoke('getAllDecks', {});
        if (response.success) {
          setDecks(response.decks);
        } else {
          console.error('Error fetching decks:', response.error);
        }
      } catch (error) {
        console.error('Error fetching decks:', error);
      }
    };

    fetchDecks();
  }, []);

  const handleSave = async () => {
    try {
      const response = await invoke('createGroup', {
        title: groupTitle,
        description: description,
        owner: '@aaa',
        decks: selectedDecks, // Pass the selected decks
      });

      console.log('Group saved successfully:', response);

      // Reset the fields after saving
      setGroupTitle('');
      setDescription('');
      setSelectedDecks([]);
    } catch (error) {
      console.error('Error invoking createGroup:', error);
    }
  };

//   const handleClose = () => {
//     view.close(); // Close the modal
//   };

  const handleCheckboxChange = (deckId) => {
    setSelectedDecks((prevSelectedDecks) =>
      prevSelectedDecks.includes(deckId)
        ? prevSelectedDecks.filter(id => id !== deckId) // Deselect if already selected
        : [...prevSelectedDecks, deckId] // Select the deck
    );
  };

  return (
    <div className="group-creation">
      <h2 className="group-title">Create New Group</h2>

      <div className="form-group">
        <label htmlFor="groupTitle">Group Title</label>
        <input
          type="text"
          id="groupTitle"
          value={groupTitle}
          onChange={(e) => setGroupTitle(e.target.value)}
          placeholder="Type the group title here..."
          className="input-field"
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description (Optional) </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Type a description for the group..."
          className="input-area"
        />
      </div>

      <div className="form-group">
        <label>Select Decks:</label>
        {decks.map(deck => (
          <div key={deck.id}>
            <input
              type="checkbox"
              id={`deck-${deck.id}`}
              checked={selectedDecks.includes(deck.id)}
              onChange={() => handleCheckboxChange(deck.id)}
            />
            <label htmlFor={`deck-${deck.id}`}>{deck.title}</label>
          </div>
        ))}
      </div>

      <div className="button-group">
        <button className="save-button" onClick={handleSave}>Save</button>
        <button className="close-button" onClick={handleCloseGlobal}>Close</button>
      </div>
    </div>
  );
}

export default CreateGroupGlobal;
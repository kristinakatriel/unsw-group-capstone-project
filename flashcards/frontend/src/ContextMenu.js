import React, { useState, useEffect } from 'react';
import { invoke, view } from '@forge/bridge';
import './ContextMenu.css';

function ContextMenu() {
  const [text, setText] = useState(''); // For input text to generate flashcards
  const [generatedFlashcards, setGeneratedFlashcards] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [closeError, setCloseError] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch selected text context when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const context = await view.getContext();
        console.log(context);
        const selectedText = context.extension.selectedText; // Get selected text from context
        console.log("Selected Text:", selectedText); // Log the selected text for verification
        setText(selectedText); // Set the selected text to the state


      } catch (error) {
        console.error("Error fetching data:", error);
        setErrorMessage('Failed to fetch selected text');
      }
    };

    fetchData(); // Call the fetchData function
  }, []); // Empty dependency array to run on mount


  const handleGenerateFlashcards = async () => {
    console.log("Generating Flashcards...");
    setErrorMessage('');
    setLoading(true);

    try {
      const response = await invoke('generateQA', { text:text });
      console.log("Received response from 'generateQA':", response);

      if (response && response.success) {
        setGeneratedFlashcards(response.data);
        console.log("Flashcards Generated Successfully:", response.data);
      } else {
        setErrorMessage(response.error);
        console.log("Error Generating Flashcards:", response.error);
      }
    } catch (error) {
      setErrorMessage('Failed to generate Q&A from text');
      console.error("Exception in handleGenerateFlashcards:", error);
    } finally {
      setLoading(false);
      console.log("Finished Flashcard Generation. Loading State:", loading);
    }
  };

  const handleSaveFlashcard = async (flashcard) => {
    console.log("Saving Flashcard:", flashcard);
    setErrorMessage('');

    try {
      const response = await invoke('createFlashcard', {
        front: flashcard.question,
        back: flashcard.answer,
        hint: '',  // Optional hint, could be modified to allow user input
      });

      console.log("Received response from 'createFlashcard':", response);

      if (response && response.success) {
        setSaveSuccess(true);
        console.log("Flashcard Saved Successfully");
        setTimeout(() => setSaveSuccess(false), 2000); // Display success message briefly
      } else {
        setErrorMessage(response.error);
        console.log("Error Saving Flashcard:", response.error);
      }
    } catch (error) {
      setErrorMessage('Failed to save flashcard');
      console.error("Exception in handleSaveFlashcard:", error);
    }
  };

  const handleClose = () => {
    console.log('Context menu closed');
    view.close();
  };

  console.log('Current Context Menu Data:', generatedFlashcards);

  return (
    <div className='context-menu'>
      <h2>Context Menu</h2>
      <div className="button-group">
        <button className="generate-button" onClick={handleGenerateFlashcards} disabled={loading}>
          {loading ? 'Generating...' : 'Generate Flashcards'}
        </button>
        <button className="close-button" onClick={handleClose}>Close</button>
      </div>


      <h2>Generated Flashcards</h2>
      <h4 className='deck-flashcard-amount'>Flashcards: {generatedFlashcards.length || 0}</h4>
      {generatedFlashcards.length > 0 ? (
        <div className="card-wrapper">
          <ul className="card-list">
            {generatedFlashcards.map((flashcard, index) => (
              <li key={index} className="card-item">
                <div className="card-link">
                  <h4 className="card-front">{flashcard.question || 'No front available'}</h4>
                  <h4 className="card-back">{flashcard.answer || 'No back available'}</h4>
                  <div className="card-button">
                    <button onClick={() => handleSaveFlashcard(flashcard)}>Save Flashcard</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>No flashcards generated yet.</p>
      )}
    </div>
  );
}


export default ContextMenu;

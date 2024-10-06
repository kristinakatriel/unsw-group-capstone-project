import React, { useState, useEffect } from 'react';
import { invoke, view } from '@forge/bridge';
import './App.css';

function App() {
  console.log(window.location.pathname)
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [hint, setHint] = useState('');

  const uploadImageModal = () => {
    console.log("Uploading an image...")
  }

  const handleSave = () => {
    console.log('Flashcard saved:', { question, answer, hint });
    setQuestion('');
    setAnswer('');
    setHint('');
  };

  const handleClose = () => {
    view.close();
  };

  return (
    <div className="flashcard-creation">
      <h2>Manually Create Flashcard</h2>

      <div className="form-group">
        <label htmlFor="question">Question</label>
        <textarea
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Type the question here..."
          className="input-area"
        />
        <button onClick={uploadImageModal}>Upload Image</button>
        </div>

      <div className="form-group">
        <label htmlFor="answer">Answer</label>
        <textarea
          id="answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type the answer here..."
          className="input-area"
        />
        <button onClick={uploadImageModal}>Upload Image</button>
      </div>

      <div className="form-group">
        <label htmlFor="answer">Hint (Optional)</label>
        <textarea
          id="hint"
          value={hint}
          onChange={(e) => setHint(e.target.value)}
          placeholder="Type the answer here..."
          className="input-area"
        />
        <button onClick={uploadImageModal}>Upload Image</button>
      </div>

      <div className="form-group">
      <label htmlFor="select">Add to... (Optional)</label>
      <label htmlFor="select">Select Deck and/or Group</label>
      </div>

      <div className="button-group">
        <button className="save-button" onClick={handleSave}>Save</button>
        <button className="close-button" onClick={handleClose}>Close</button>
      </div>
    </div>
  );
}

export default App;

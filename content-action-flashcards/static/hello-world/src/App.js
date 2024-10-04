import React, { useState, useEffect } from 'react';
import { invoke, view } from '@forge/bridge';
import './App.css';

function App() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const handleSave = () => {
    console.log('Flashcard saved:', { question, answer });
    setQuestion('');
    setAnswer('');
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
      </div>

      <div className="button-group">
        <button className="save-button" onClick={handleSave}>Save</button>
        <button className="close-button" onClick={handleClose}>Close</button>
      </div>
    </div>
  );
}

export default App;

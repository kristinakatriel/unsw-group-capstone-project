import React, { useEffect, useState } from 'react';
import { invoke } from '@forge/bridge';
import './App.css'; // Make sure to import your CSS file

function App() {
  const [data, setData] = useState(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  useEffect(() => {
    invoke('getText', { example: 'my-invoke-variable' }).then(setData);
  }, []);

  const handleSave = () => {
    // Here you would add the logic to save the flashcard
    console.log('Flashcard saved:', { question, answer });
    setQuestion('');
    setAnswer('');
  };

  return (
    <div>
      <div className="flashcard-creation">
        <h2>Manually Create Flashcard</h2>
        <label htmlFor="question">Question</label>
        <textarea
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Type the question here..."
        />
        <label htmlFor="answer">Answer</label>
        <textarea
          id="answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type the answer here..."
        />
        <button className="save-button" onClick={handleSave}>Save</button>
      </div>

      {data ? data : 'Loading...'}
    </div>
  );
}

export default App;

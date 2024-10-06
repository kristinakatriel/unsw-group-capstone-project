import React, { useState } from 'react';
import { invoke, view } from '@forge/bridge';
import './CreateFlashcard.css';

function CreateFlashcard() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [hint, setHint] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');

  useEffect(() => {
    const getUserEmail = async () => {
      try {
        const response = await invoke('getUserEmail');
        setOwnerEmail(response.email);
        console.log(ownerEmail)
      } catch (error) {
        console.error('Error fetching user email:', error);
      }
    };

    getUserEmail();
  }, []);

  const uploadImageModal = () => {
    console.log("Uploading an image...");
  };

  const handleSave = async () => {
    try {
      const response = await invoke('createFlashcard', {
        question_text: question,
        answer_text: answer,
        hint: hint,
        owner: ownerEmail,
      });

      console.log('Flashcard saved successfully:', response);
      
      setQuestion('');
      setAnswer('');
      setHint('');
      setTags(['default-tag']);

    } catch (error) {
      console.error('Error saving flashcard:', error);
    }
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
        <label htmlFor="hint">Hint (Optional)</label>
        <textarea
          id="hint"
          value={hint}
          onChange={(e) => setHint(e.target.value)}
          placeholder="Type the hint here..."
          className="input-area"
        />
        <button onClick={uploadImageModal}>Upload Image</button>
      </div>

      <div className="form-group">
        <label htmlFor="select">Add to... (Optional) Implement Later</label>
        <label htmlFor="select">Select Deck and/or Group</label>
      </div>

      <div className="button-group">
        <button className="save-button" onClick={handleSave}>Save</button>
        <button className="close-button" onClick={handleClose}>Close</button>
      </div>
    </div>
  );
}

export default CreateFlashcard;

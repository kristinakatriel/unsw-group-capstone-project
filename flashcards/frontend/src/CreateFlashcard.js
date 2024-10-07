import React, { useState, useEffect } from 'react';
import { invoke, view } from '@forge/bridge';
import './CreateFlashcard.css';
import DragNDrop from './components/DragNDrop';

function CreateFlashcard() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [hint, setHint] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [questionImage, setQuestionImage] = useState(null); 
  const [answerImage, setAnswerImage] = useState(null);

  async function getUserEmail() {
    try {
      const response = await invoke('getUserEmail');
      console.log('User Email:', response.email);
    } catch (error) {
      console.error('Error fetching user email:', error);
    }
  }

  const handleSave = async () => {
    try {
      const response = await invoke('createFlashcard', {
        question_text: question,
        question_image: questionImage,
        answer_text: answer,
        answer_image: answerImage,
        hint: hint,
        owner: ownerEmail,
      });

      getUserEmail();
      console.log(response.owner);
      console.log('Flashcard saved successfully:', response);
      
      setQuestion('');
      setAnswer('');
      setHint('');
      setQuestionImage(null);  
      setAnswerImage(null);

    } catch (error) {
      console.error('Error saving flashcard:', error);
    }
  };

  const handleClose = () => {
    view.close();
  };

  const handleQuestionImageSelected = (files) => {
    if (files.length > 0) {
      setQuestionImage(files[0]); 
    }
  };

  const handleAnswerImageSelected = (files) => {
    if (files.length > 0) {
      setAnswerImage(files[0]); 
    }
  };

  return (
    <div className="flashcard-creation">
      <h2>Manually Create Flashcard</h2>

      <div className="form-group">
        <label htmlFor="question">Question</label>
        <div className="input-drag-container">
          <textarea
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type the question here..."
            className="input-area"
          />
          <DragNDrop
            onFilesSelected={handleQuestionImageSelected} 
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="answer">Answer</label>
        <div className="input-drag-container">
          <textarea
            id="answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type the answer here..."
            className="input-area"
          />
          <DragNDrop
            onFilesSelected={handleAnswerImageSelected} 
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="hint">Hint (Optional)</label>
        <div className="input-drag-container">
          <textarea
            id="hint"
            value={hint}
            onChange={(e) => setHint(e.target.value)}
            placeholder="Type the hint here..."
            className="input-area"
          />
          <DragNDrop
            onFilesSelected={(files) => console.log('Files selected:', files)} // Can handle hints if needed
          />
        </div>
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

export default CreateFlashcard;

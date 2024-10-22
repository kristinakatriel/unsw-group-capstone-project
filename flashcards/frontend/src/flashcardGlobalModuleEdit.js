import React, { useState, useEffect } from 'react';
import { invoke } from '@forge/bridge';
import './flashcardGlobalModuleCreate.css'; // using the same css file as the flashcardGlobalModuleCreate
import './globalPageModule.js';
import DragNDrop from './components/DragNDrop.jsx';

function EditFlashcardGlobal({ flashcard, closeFlashcardModal }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [hint, setHint] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [questionImage, setQuestionImage] = useState(null);
  const [answerImage, setAnswerImage] = useState(null);

  // Pre-fill the form with the current flashcard details
  useEffect(() => {
    if (flashcard) {
      setQuestion(flashcard.question_text || '');
      setAnswer(flashcard.answer_text || '');
      setHint(flashcard.hint || '');
      setOwnerEmail(flashcard.owner || '');
      setQuestionImage(flashcard.question_image || null);
      setAnswerImage(flashcard.answer_image || null);
    }
  }, [flashcard]);

  // handle this!
  const handleCloseGlobal = () => {
    if (typeof closeFlashcardModal === 'function') {
      closeFlashcardModal(); // Call the function passed as a prop
    } else {
      console.error('closeFlashcardModal is not a function:', closeFlashcardModal);
    }
  };

  const handleSaveGlobal = async () => {
    try {
      console.log(flashcard.id);
      const response = await invoke('updateFlashcard', {
        id: flashcard.id,
        question_text: question,
        question_image: questionImage,
        answer_text: answer,
        answer_image: answerImage,
        hint: hint,
      });

      if (response && response.success) {
        // Close the modal and pass updated card back
        closeFlashcardModal(response.card);
      } else {
        console.error('Failed to update flashcard:', response.error);
      }
    } catch (error) {
      console.error('Error invoking updateFlashcard:', error);
    }
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
    <div className="global-flashcard-edit">
      <h2 className="flashcard-title">Edit Flashcard</h2>

      <div className="form-group">
        <label htmlFor="question">Question</label>
        <div className="input-drag-container">
          <textarea
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Edit the question here..."
            className="input-area"
          />
          <DragNDrop onFilesSelected={handleQuestionImageSelected} />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="answer">Answer</label>
        <div className="input-drag-container">
          <textarea
            id="answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Edit the answer here..."
            className="input-area"
          />
          <DragNDrop onFilesSelected={handleAnswerImageSelected} />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="hint">Hint</label>
        <textarea
          id="hint"
          value={hint ? hint : ''}
          onChange={(e) => setHint(e.target.value)}
          placeholder="Edit/Add hint here..."
          className="input-area"
        />
      </div>

      <div className="button-group">
        <button className="save-button" onClick={handleSaveGlobal}>Save</button>
        <button className="close-button" onClick={handleCloseGlobal}>Close</button>
      </div>
    </div>
  );
}

export default EditFlashcardGlobal;
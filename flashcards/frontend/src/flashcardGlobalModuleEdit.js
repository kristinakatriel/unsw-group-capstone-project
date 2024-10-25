import React, { useState, useEffect } from 'react';
import { invoke } from '@forge/bridge';
import './deckGlobalModuleCreate.css'; // made the css file common
import './globalPageModule.js';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import { Alert } from '@mui/material';
import DragNDrop from './components/DragNDrop.jsx';

function EditFlashcardGlobal({ flashcard, closeFlashcardEditModal }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [hint, setHint] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  // const [questionImage, setQuestionImage] = useState(null);
  // const [answerImage, setAnswerImage] = useState(null);

  // Pre-fill the form with the current flashcard details
  useEffect(() => {
    if (flashcard) {
      setQuestion(flashcard.question_text || '');
      setAnswer(flashcard.answer_text || '');
      setHint(flashcard.hint || '');
      // setQuestionImage(flashcard.question_image || null);
      // setAnswerImage(flashcard.answer_image || null);
    }
  }, [flashcard]);

  // handle this!
  const handleCloseGlobal = () => {
    if (typeof closeFlashcardEditModal === 'function') {
      closeFlashcardEditModal(); // Call the function passed as a prop
    } else {
      console.error('closeFlashcardModal is not a function:', closeFlashcardEditModal);
    }
  };

  const handleSaveGlobal = async () => {
    try {
      console.log(flashcard.id);
      const response = await invoke('updateFlashcard', {
        id: flashcard.id,
        question_text: question,
        // question_image: questionImage,
        answer_text: answer,
        // answer_image: answerImage,
        hint: hint
      });

      if (response && response.success) {
        setSaveSuccess(true); // Show success message
        setTimeout(() => {
          closeFlashcardEditModal(response.card); // Delay closing modal
        }, 500); // Show success message for 0.5 before closing
      }  else {
        console.error('Failed to update flashcard:', response.error);
        setErrorMessage(response.error);
        setTimeout(() => {
          closeFlashcardEditModal(flashcard); // Delay closing modal
        }, 1000); // Show success message for 1 seconds before closing
        setSaveSuccess(false);
      }
    } catch (error) {
      console.error('Error invoking updateFlashcard:', error);
    } 
  };

  // const handleQuestionImageSelected = (files) => {
  //   if (files.length > 0) {
  //     setQuestionImage(files[0]);
  //   }
  // };

  // const handleAnswerImageSelected = (files) => {
  //   if (files.length > 0) {
  //     setAnswerImage(files[0]);
  //   }
  // };

  return (
    <div className="global-deck-edit">
      <h2 className="deck-title"><DriveFileRenameOutlineIcon class='global-flashcard-edit-icon'/>Edit Flashcard</h2>
      {errorMessage && 
        <Alert severity="error">{errorMessage}</Alert>
      }
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
          {/* <DragNDrop onFilesSelected={handleQuestionImageSelected} /> */}
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
          {/* <DragNDrop onFilesSelected={handleAnswerImageSelected} /> */}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="hint">Hint (Optional) </label>
        <textarea
          id="hint"
          value={hint ? hint : ''}
          onChange={(e) => setHint(e.target.value)}
          placeholder="Edit/Add hint here..."
          className="input-area"
        />
      </div>

      {saveSuccess && 
        <Alert severity="success">Flashcard updated successfully!</Alert>
      }

      <div className="button-group">
        <button className="save-button" onClick={handleSaveGlobal}>Save</button>
        <button className="close-button" onClick={handleCloseGlobal}>Close</button>
      </div>
    </div>
  );
}

export default EditFlashcardGlobal;
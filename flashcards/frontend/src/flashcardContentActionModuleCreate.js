import React, { useState, useEffect } from 'react';
import { invoke, view } from '@forge/bridge';
import './flashcardContentActionModuleCreate.css';
import { Alert, Collapse, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
// import DragNDrop from './components/DragNDrop';

function flashcardContentActionModuleCreate() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [hint, setHint] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [closeError, setCloseError] = useState(true);
  // const [questionImage, setQuestionImage] = useState(null);
  // const [answerImage, setAnswerImage] = useState(null);

  const handleSave = async () => {
    setErrorMessage('');
    setCloseError(true);
    try {
      const response = await invoke('createFlashcard', {
        question_text: question,
        question_image: null,
        answer_text: answer,
        answer_image: null,
        hint: hint,
        tags: ['no', 'yes']
      });

      // getUserEmail();
      console.log('Flashcard saved successfully:', response);

      setQuestion('');
      setAnswer('');
      setHint('');
      // setQuestionImage(null);
      // setAnswerImage(null);
      if (response && response.success) {
        setSaveSuccess(true); // Show success message
        setTimeout(() => {
          handleClose(); // Delay closing modal
        }, 2000); // Show success message for 2 seconds before closing
      } else {
          setErrorMessage(response.error);
          console.error('Failed to create flashcard:', response.error);
      }
    } catch (error) {
      setErrorMessage(error);
      console.error('Error invoking createFlashcard:', error);
    }
  };

  const handleClose = () => {
    console.log('LOGGGGG');
    view.close();

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
    <div className="flashcard-creation">
      <h2 className="flashcard-title">Create New Flashcard</h2>
      { errorMessage && 
        <Collapse in={closeError}>
          <Alert
            severity="error"
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => {
                  setCloseError(false);
                }}
              >
              <CloseIcon fontSize="inherit" />
              </IconButton>
            }
            sx={{ mb: 2 }}
          >
            {errorMessage}
          </Alert>
        </Collapse>
      }
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
            placeholder="Type the answer here..."
            className="input-area"
          />
          {/* <DragNDrop onFilesSelected={handleAnswerImageSelected} /> */}
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
          {/* <DragNDrop onFilesSelected={(files) => console.log('Files selected:', files)} /> */}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="select">Add to... (Optional)</label>

      </div>
      {saveSuccess && 
        <Alert severity="success"> New flashcard created successfully! </Alert>
      }
      <div className="button-group">
        <button className="save-button" onClick={handleSave}>Save</button>
        <button className="close-button" onClick={handleClose}>Close</button>
      </div>
    </div>
  );
}

export default flashcardContentActionModuleCreate;

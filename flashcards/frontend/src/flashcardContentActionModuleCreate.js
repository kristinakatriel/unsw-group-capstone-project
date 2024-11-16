import React, { useState } from 'react';
import { invoke, view } from '@forge/bridge';
import './flashcardContentActionModuleCreate.css';
import { Alert, Collapse } from '@mui/material';
import { Field } from '@atlaskit/form';
import Button, { IconButton } from '@atlaskit/button/new';
import { Flex, Grid, xcss } from '@atlaskit/primitives';
import CrossIcon from '@atlaskit/icon/glyph/cross';
import UnlockIcon from '@atlaskit/icon/glyph/unlock';
import LockIcon from '@atlaskit/icon/glyph/lock';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import Textfield from '@atlaskit/textfield';
import './deckGlobalModuleCreate.css';

const gridStyles = xcss({
  width: '100%',
});

const closeContainerStyles = xcss({
  gridArea: 'close',
});

const titleContainerStyles = xcss({
  gridArea: 'title',
});

function ContentActionModule() {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [hint, setHint] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [closeError, setCloseError] = useState(true);
  const [locked, setLocked] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handleSave = async () => {
    setErrorMessage('');
    setCloseError(true);
    try {
      const response = await invoke('createFlashcard', {
        front: front,
        back: back,
        hint: hint,
        locked: locked
      });

      console.log('Flashcard saved successfully:', response);

      setFront('');
      setBack('');
      setHint('');
      setLocked(false);

      if (response && response.success) {
        setSaveSuccess(true); // Show success message
        setTimeout(() => {
          handleClose(); // Delay closing modal
        }, 1000); // Show success message for 2 seconds before closing
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
    view.close();
  };

  return (
    <div className="flashcard-creation">
      <Grid templateAreas={['title close']} xcss={gridStyles}>
        <Flex xcss={closeContainerStyles} justifyContent="end" alignItems="center">
          <IconButton
            appearance="subtle"
            icon={CrossIcon}
            label="Close Modal"
            onClick={handleClose}
          />
        </Flex>
        <Flex xcss={titleContainerStyles} justifyContent="start" alignItems="center">
          <AutoAwesomeIcon className="content-action-flash-icon" />
          <h2>Cardify.ai - Create a flashcard</h2>
        </Flex>
      </Grid>
      {errorMessage &&
        <Collapse in={closeError}>
          <Alert
            severity="error"
            onClose={() => setCloseError(false)}
          >
            {errorMessage}
          </Alert>
        </Collapse>
      }
      {/************************************* FLASHCARD FRONT FIELD ***************************************/}
      <Field id="flashcard-front" name="flashcard-front" label="Flashcard Front">
        {({ fieldProps }) => (
          <Textfield {...fieldProps} value={front} onChange={(e) => setFront(e.target.value)} placeholder="Type the front of the flashcard here..." />
        )}
      </Field>

      {/************************************* FLASHCARD BACK FIELD ***************************************/}
      <Field id="flashcard-back" name="flashcard-back" label="Flashcard Back">
        {({ fieldProps }) => (
          <Textfield {...fieldProps} value={back} onChange={(e) => setBack(e.target.value)} placeholder="Type the back of the flashcard here..." />
        )}
      </Field>

      {/************************************* HINT FIELD ***************************************/}
      <Field id="flashcard-hint" name="flashcard-hint" label={
        <div onClick={() => setShowHint(!showHint)} className="label-clickable">
          <span>Hint (Optional)</span>
          <span className="toggle-icon">
            {showHint ? <ExpandLessIcon fontSize="small"/> : <ExpandMoreIcon fontSize="small" />}
          </span>
        </div>
      }>
        {({ fieldProps }) => (
          <>
            {showHint && (
              <Textfield
                {...fieldProps}
                value={hint}
                onChange={(e) => setHint(e.target.value)}
                placeholder="Type a hint for the flashcard..."
              />
            )}
          </>
        )}
      </Field>

      {/************************************* LOCK/UNLOCKED FIELD ***************************************/}
      <Field>
        {() => (
          <span onClick={() => setLocked(!locked)} style={{ cursor: 'pointer', justifyContent: 'flex-end', display: 'flex', alignItems: 'center' }}>
            {locked ? 'This flashcard will be locked, only the owner can edit and delete' : 'This flashcard will be unlocked, others can edit and delete'}
            <span>
              {locked ? (
                <LockIcon label="Locked" />
              ) : (
                <UnlockIcon label="Unlocked" />
              )}
            </span>
          </span>
        )}
      </Field>

      {/* Creating tag here: optional; suggest based on flashcard content ??? */}

      {saveSuccess && <Alert severity="success"> New flashcard created successfully! </Alert>}

      <div className="content-action-button-group">
        <Button appearance="subtle" onClick={handleClose}>Cancel</Button>
        <Button appearance="primary" onClick={handleSave}>Create Flashcard</Button>
      </div>
    </div>
  );
}

export default ContentActionModule;

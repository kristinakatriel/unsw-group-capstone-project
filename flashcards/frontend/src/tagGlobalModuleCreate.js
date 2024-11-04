import React, { useState, useEffect } from 'react';
import { invoke } from '@forge/bridge';
import Button, { IconButton } from '@atlaskit/button/new';
import { Field } from '@atlaskit/form';
import CrossIcon from '@atlaskit/icon/glyph/cross';
import { Flex, Grid, xcss } from '@atlaskit/primitives';
import Textfield from '@atlaskit/textfield';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle, ModalTransition } from '@atlaskit/modal-dialog';
import Alert from '@mui/material/Alert';
import Collapse from '@mui/material/Collapse';
import UnlockIcon from '@atlaskit/icon/glyph/unlock';
import LockIcon from '@atlaskit/icon/glyph/lock';
import './tagGlobalModuleCreate.css';

const gridStyles = xcss({
  width: '100%',
});

const closeContainerStyles = xcss({
  gridArea: 'close',
});

const titleContainerStyles = xcss({
  gridArea: 'title',
});

function CreateTagGlobal({ closeTagModal }) {
  const [tagTitle, setTagTitle] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [closeError, setCloseError] = useState(true);
  const [locked, setLocked] = useState(false);
  const [selectedColour, setSelectedColour] = useState("blue");

  const handleClose = () => {
    if (typeof closeTagModal === 'function') {
      closeTagModal(); // Call the function passed as a prop
    } else {
      console.error('closeTagModal is not a function:', closeTagModal);
    }
  };

  const handleSave = async () => {
    setErrorMessage('');
    setCloseError(true);

    if (tagTitle.length > 30) {
      setErrorMessage('Tag title must be 30 characters or fewer.');
      return;
    }

    try {
      const response = await invoke('createTag', {
        title: tagTitle,
        colour: selectedColour || 'blue', 
        locked: locked
      });

      if (response.success) {
        setSaveSuccess(true);
        console.log('Tag created successfully:', response.tag);
        setTagTitle('');
        setTimeout(() => {
          closeTagModal(); 
        }, 1000); 
      } else {
        setErrorMessage(response.error);
        console.error('Failed to create tag:', response.error);
      }
    } catch (error) {
      console.error('Error invoking createTag:', error);
    }
  };

  return (
    <ModalTransition>
      <Modal onClose={closeTagModal}>
        <ModalHeader>
          <Grid templateAreas={['title close']} xcss={gridStyles}>
            <Flex xcss={closeContainerStyles} justifyContent="end" alignItems="center">
              <IconButton
                appearance="subtle"
                icon={CrossIcon}
                label="Close Modal"
                onClick={closeTagModal}
              />
            </Flex>
            <Flex xcss={titleContainerStyles} justifyContent="start" alignItems="center">
              <ModalTitle>Create New Tag</ModalTitle>
            </Flex>
          </Grid>
        </ModalHeader>

        <ModalBody>
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

          {/************************************* TAG TITLE FIELD ***************************************/}
          <Field id="tagTitle" name="tagTitle" label="Tag Title">
            {({ fieldProps }) => (
              <Textfield {...fieldProps} value={tagTitle} onChange={(e) => setTagTitle(e.target.value)} placeholder="Type the tag title here..." />
            )}
          </Field>

          {/************************************* TAG COLOUR SELECTION ***************************************/}
          <Field id="tagColour" name="tagColour" label={`Tag Colour: ${selectedColour.charAt(0).toUpperCase() + selectedColour.slice(1)}`}>
            {() => (
              <div className="badge-container">
                {["blue", "red", "orange", "green", "yellow", "purple"].map((colour) => (
                  <div
                    key={colour}
                    className={`badge ${colour} ${selectedColour === colour ? "selected" : ""}`}
                    onClick={() => setSelectedColour(colour)}
                  >
                    {colour.charAt(0).toUpperCase() + colour.slice(1)}
                  </div>
                ))}
              </div>
            )}
          </Field>
          
          {/************************************* LOCK/UNLOCKED FIELD ***************************************/}
          <Field>
            {() => (
              <span onClick={() => setLocked(!locked)} style={{ cursor: 'pointer', justifyContent: 'flex-end', display: 'flex', alignItems: 'center' }}>
                {locked ? 'This tag will be locked, only the owner can edit and delete' : 'This tag will be unlocked, others can edit and delete'}
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

          {saveSuccess && <Alert severity="success"> New tag created successfully! </Alert>}

        </ModalBody>

        <ModalFooter>
          <Button appearance="subtle" onClick={handleClose}>Cancel</Button>
          <Button appearance="primary" onClick={handleSave}>Create Tag</Button>
        </ModalFooter>
      </Modal>
    </ModalTransition>
  );
}

export default CreateTagGlobal;

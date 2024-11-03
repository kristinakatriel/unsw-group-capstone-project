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

function EditDeckGlobal({ deck, closeDeckEditModal }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [locked, setLocked] = useState(false);

  // Pre-fill the form with the deck details
  useEffect(() => {
    if (deck) {
      setTitle(deck.title || '');
      setDescription(deck.description || '');
      setLocked(deck.locked || '');
    }
  }, [deck]);

  const handleCloseGlobal = () => {
    if (typeof closeDeckEditModal === 'function') {
      console.log('deck: ', deck);
      closeDeckEditModal(deck);
    } else {
      console.error('closeDeckEditModal is not a function:', closeDeckEditModal);
    }
  };

  const handleSaveGlobal = async () => {
    setErrorMessage('');
    console.log('deck: ', deck);


    try {
      const response = await invoke('updateDeck', {
        id: deck.id,
        title: title,
        description: description,
        locked: locked
      });

      if (response && response.success) {
        setSaveSuccess(true);
        console.log('responce.deck: ', response.deck);

        setTimeout(() => {
          closeDeckEditModal(response.deck); // Delay closing modal
        }, 2000); // Show success message for 2 seconds before closing
      } else {
        console.error('Failed to update deck:', response.error);
        setErrorMessage(response.error);
        setTimeout(() => {
          closeDeckEditModal(deck); // Delay closing modal
        }, 2000); // Show success message for 2 seconds before closing
      }
    } catch (error) {
      console.error('Error invoking updateDeck:', error);
    }
  };

  return (
    <ModalTransition>
      <Modal onClose={closeDeckEditModal}>
        <ModalHeader>
          <Grid templateAreas={['title close']} xcss={gridStyles}>
            <Flex xcss={closeContainerStyles} justifyContent="end" alignItems="center">
              <IconButton
                appearance="subtle"
                icon={CrossIcon}
                label="Close Modal"
                onClick={closeDeckEditModal}
              />
            </Flex>
            <Flex xcss={titleContainerStyles} justifyContent="start" alignItems="center">
              <ModalTitle>Edit Deck</ModalTitle>
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

          {/************************************* DECK DESCRIPTION ***************************************/}
          <Field id="deck-title" name="deck-title" label="Deck Title">
            {({ fieldProps }) => (
              <Textfield {...fieldProps} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Type the front of the flashcard here..." />
            )}
          </Field>

          {/************************************* DECK DESCRIPTION ***************************************/}
          <Field id="deck-description" name="deck-description" label="Deck Description">
            {({ fieldProps }) => (
              <Textfield {...fieldProps} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Type the back of the flashcard here..." />
            )}
          </Field>

          {/************************************* LOCK/UNLOCKED FIELD ***************************************/}
          <Field>
            {() => (
              <span onClick={() => setLocked(!locked)} style={{ cursor: 'pointer', justifyContent: 'flex-end', display: 'flex', alignItems: 'center' }}>
                {locked ? 'This deck will be locked, only the owner can edit and delete' : 'This deck will be unlocked, others can edit and delete'}
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

          {saveSuccess && <Alert severity="success"> Deck edited successfully! </Alert>}

        </ModalBody>

        <ModalFooter>
          <Button appearance="subtle" onClick={handleCloseGlobal}>Cancel</Button>
          <Button appearance="primary" onClick={handleSaveGlobal}>Save</Button>
        </ModalFooter>
      </Modal>
    </ModalTransition>
  );
}

export default EditDeckGlobal;

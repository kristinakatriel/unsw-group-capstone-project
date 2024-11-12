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
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
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

function EditTagGlobal({ tag, closeTagEditModal }) {
  const [tagTitle, setTagTitle] = useState('');
  const [selectedColour, setSelectedColour] = useState("blue");
  const [flashcards, setFlashcards] = useState([]);
  const [decks, setDecks] = useState([]);
  const [selectedFlashcards, setSelectedFlashcards] = useState([]);
  const [selectedDecks, setSelectedDecks] = useState([]);
  const [locked, setLocked] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [closeError, setCloseError] = useState(true);

  useEffect(() => {
    if (tag) {
      setTagTitle(tag.title || '');
      setSelectedColour(tag.colour || 'blue');
      setLocked(tag.locked || false);
      setSelectedFlashcards(tag.cardIds || []);
      setSelectedDecks(tag.deckIds || []);
    }
  }, [tag]);

  const handleSave = async () => {
    try {
      const response = await invoke('updateTag', {
        id: tag.id,
        title: tagTitle,
        colour: selectedColour,
        cardIds: selectedFlashcards,
        deckIds: selectedDecks,
        locked: locked
      });

      if (response.success) {
        setSaveSuccess(true);
        setTimeout(() => {
          closeTagEditModal();
        }, 1000);
      } else {
        setErrorMessage(response.error);
      }
    } catch (error) {
      console.error('Error updating tag:', error);
    }
  };

  return (
    <ModalTransition>
      <Modal onClose={closeTagEditModal}>
        <ModalHeader>
          <Grid templateAreas={['title close']} xcss={gridStyles}>
            <Flex xcss={closeContainerStyles} justifyContent="end" alignItems="center">
              <IconButton
                appearance="subtle"
                icon={CrossIcon}
                label="Close Modal"
                onClick={closeTagEditModal}
              />
            </Flex>
            <Flex xcss={titleContainerStyles} justifyContent="start" alignItems="center">
              <ModalTitle>Edit Tag</ModalTitle>
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

          <Field id="tagTitle" name="tagTitle" label="Tag Title">
            {({ fieldProps }) => (
              <Textfield {...fieldProps} value={tagTitle} onChange={(e) => setTagTitle(e.target.value)} placeholder="Type the tag title here..." />
            )}
          </Field>

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

          {saveSuccess && <Alert severity="success"> Tag edited successfully! </Alert>}
        </ModalBody>

        <ModalFooter>
          <Button appearance="subtle" onClick={closeTagEditModal}>Cancel</Button>
          <Button appearance="primary" onClick={handleSave}>Save</Button>
        </ModalFooter>
      </Modal>
    </ModalTransition>
  );
}

export default EditTagGlobal;

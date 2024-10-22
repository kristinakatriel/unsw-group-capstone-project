import React, { useCallback, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import QuizIcon from '@mui/icons-material/Quiz';
import { invoke } from '@forge/bridge';
import Button, { IconButton } from '@atlaskit/button/new';
import CrossIcon from '@atlaskit/icon/glyph/cross';
import { Flex, Grid, xcss } from '@atlaskit/primitives';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle, ModalTransition } from '@atlaskit/modal-dialog';
import './DeckDisplay.css';


/* ===========================================
 * STYLE DEFINITIONS
 * ===========================================
 */
const gridStyles = xcss({
    width: '100%',
});

const closeContainerStyles = xcss({
    gridArea: 'close',
});

const titleContainerStyles = xcss({
    gridArea: 'title',
});

const DeckDisplay = ({ deck, startQuizMode }) => {

    // ========================
    // STATE MANAGEMENT
    // ========================

    // State hooks to manage modal visibility, the selected flashcard for deletion, and the updated deck state
    const [isFlashcardDeleteModalOpen, setFlashcardDeleteModalOpen] = useState(false);
    const [isDeckDeleteModalOpen, setDeckDeleteModalOpen] = useState(false);
    const [flashcardToDelete, setFlashcardToDelete] = useState(null);
    const [updatedDeck, setUpdatedDeck] = useState(deck);


    // ========================
    // PLACEHOLDER HANDLERS
    // ========================
    // Placeholder function for adding the deck to a study session
    const handleAddToStudySession = () => {
      console.log('Add to study session button clicked');
    };

    // Placeholder function for adding a new flashcard
    const handleAddFlashcard = () => {
      console.log('Add Flashcard button clicked');
    };
    const handleCreateFlashcard = () => {
        console.log('Add Flashcard button clicked');
      };

    // Placeholder function for editing the deck
    const handleEditDeck = () => {
      console.log('Edit Deck button clicked');
    };

    // ========================
    // FLASHCARD DELETE FUNCTIONALITY
    // ========================


    // Opens the flashcard delete confirmation modal and sets the selected flashcard to delete
    const openFlashcardDeleteModal = (flashcard) => {
        setFlashcardToDelete(flashcard);
        setFlashcardDeleteModalOpen(true);
    };

    // Closes the flashcard delete confirmation modal and resets the selected flashcard
    const closeFlashcardDeleteModal = () => {
        setFlashcardDeleteModalOpen(false);
        setFlashcardToDelete(null);
    };

    // Handles the deletion of a flashcard from the deck
    const confirmFlashcardDelete = async () => {
      if (!flashcardToDelete) return;

      console.log(`Delete clicked for flashcard ID: ${flashcardToDelete.id} for deck ID: ${deck.id}`);
      try {
          const response = await invoke('removeCardFromDeck', { deckId: deck.id, cardId: flashcardToDelete.id });

          if (response.success) {
              console.log('Flashcard removed from deck successfully.');
              setUpdatedDeck((prevDeck) => ({
                  ...prevDeck,
                  cards: prevDeck.cards.filter(card => card.id !== flashcardToDelete.id),
              }));
          } else {
              console.error('Error removing flashcard from deck:', response.error);
          }
      } catch (error) {
          console.error('Error in deleting flashcard:', error);
      } finally {
          closeFlashcardDeleteModal();
      }
    };



    // ========================
    // DECK DELETE FUNCTIONALITY
    // ========================


    // Functions for deck deletion
    const closeDeckDeleteModal = () => {
      setDeckDeleteModalOpen(false);
    };

    const openDeckDeleteModal = () => {
        setDeckDeleteModalOpen(true);
    };

    const handleDeleteDeck = () => {
        console.log('Delete Deck button clicked');
        openDeckDeleteModal();
      };

    const confirmDeckDelete = async () => {
        console.log('Deleting deck permanently')
        // TODO
        closeDeckDeleteModal();
    };






    return (
      <div className='deck-display-container'>
        <div className='deck-title-and-buttons'>
          <div className='title-left-buttons'>
            <h1>{updatedDeck.title}</h1>
            <div className='left-buttons'>
              <button className='deck-display-add-study-session-icon' onClick={handleAddToStudySession}>
                <AddIcon fontSize='small' /> Add to study session
              </button>
              <button className='deck-display-quiz-icon' onClick={startQuizMode}>
                <QuizIcon fontSize='small' /> Quiz Mode
              </button>
            </div>
          </div>
          <div className='right-buttons'>
            <button className='deck-display-create-flashcard-icon' onClick={handleCreateFlashcard}>
              <AddIcon fontSize='small' /> Create Flashcard
            </button>
            <button className='deck-display-add-flashcard-icon' onClick={handleAddFlashcard}>
              <AddIcon fontSize='small' /> Add Flashcard
            </button>
            <button className='deck-display-edit-icon' onClick={handleEditDeck}>
              <EditIcon fontSize='small' /> Edit Deck
            </button>
            <button className='deck-display-delete-icon' onClick={handleDeleteDeck}>
              <DeleteIcon fontSize='small' /> Delete Deck
            </button>
          </div>
        </div>
        <h2>Flashcards</h2>
        <h4 className='deck-flashcard-amount'>Flashcards: {updatedDeck.cards?.length || 0}</h4>

        {updatedDeck.cards.length > 0 ? (
            <div className="card-wrapper">
                <ul className="card-list">
                    {updatedDeck.cards.map((flashcard) => (
                        <li key={flashcard.id} className="card-item">
                            <div className="card-link">
                                {flashcard.tags && flashcard.tags.length > 0 && (
                                    <p className="badge blue">{flashcard.tags.join(', ')}</p>
                                )}
                                <h4 className="card-question">{flashcard.question_text || 'No question available'}</h4>
                                <h4 className="card-answer">{flashcard.answer_text || 'No answer available'}</h4>
                                <h4 className="card-owner">By {flashcard.name || 'Unknown'}</h4>

                                {flashcard.question_image && (
                                    <img src={flashcard.question_image} alt="Question" className="question-image" />
                                )}
                                {flashcard.answer_image && (
                                    <img src={flashcard.answer_image} alt="Answer" className="answer-image" />
                                )}

                                <div className="card-button">
                                    <EditIcon
                                        className="card-edit-button"
                                        onClick={() => handleEdit(flashcard)}
                                    />
                                    <DeleteIcon
                                        className="card-delete-button"
                                        onClick={() => openFlashcardDeleteModal(flashcard)}
                                    />
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        ) : (
            <p>No flashcards in this deck.</p>
        )}

        {/* Flashcard Delete Modal */}
        <ModalTransition>
            {isFlashcardDeleteModalOpen && (
                <Modal onClose={closeFlashcardDeleteModal}>
                    <ModalHeader>
                        <Grid gap="space.200" templateAreas={['title close']} xcss={gridStyles}>
                            <Flex xcss={closeContainerStyles} justifyContent="end">
                                <IconButton
                                    appearance="subtle"
                                    icon={CrossIcon}
                                    label="Close Modal"
                                    onClick={closeFlashcardDeleteModal}
                                />
                            </Flex>
                            <Flex xcss={titleContainerStyles} justifyContent="start">
                                <ModalTitle appearance="danger">Are you sure you want to delete this flashcard?</ModalTitle>
                            </Flex>
                        </Grid>
                    </ModalHeader>
                    <ModalBody>
                        <p>This action cannot be undone.</p>
                    </ModalBody>
                    <ModalFooter>
                        <Button appearance="subtle" onClick={closeFlashcardDeleteModal}>No</Button>
                        <Button appearance="danger" onClick={confirmFlashcardDelete}>Yes</Button>
                    </ModalFooter>
                </Modal>
            )}
        </ModalTransition>

        {/* Deck Delete Modal */}
        <ModalTransition>
            {isDeckDeleteModalOpen && (
                <Modal onClose={closeDeckDeleteModal}>
                    <ModalHeader>
                        <Grid gap="space.200" templateAreas={['title close']} xcss={gridStyles}>
                            <Flex xcss={closeContainerStyles} justifyContent="end">
                                <IconButton
                                    appearance="subtle"
                                    icon={CrossIcon}
                                    label="Close Modal"
                                    onClick={closeDeckDeleteModal}
                                />
                            </Flex>
                            <Flex xcss={titleContainerStyles} justifyContent="start">
                                <ModalTitle appearance="danger">Are you sure you want to delete this deck?</ModalTitle>
                            </Flex>
                        </Grid>
                    </ModalHeader>
                    <ModalBody>
                        <p>This action cannot be undone.</p>
                    </ModalBody>
                    <ModalFooter>
                        <Button appearance="subtle" onClick={closeDeckDeleteModal}>No</Button>
                        <Button appearance="danger" onClick={confirmDeckDelete}>Yes</Button>
                    </ModalFooter>
                </Modal>
            )}
        </ModalTransition>
      </div>
    );
};

export default DeckDisplay;

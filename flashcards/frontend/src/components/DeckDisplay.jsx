import React, { useCallback, useState, useEffect} from 'react';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import QuizIcon from '@mui/icons-material/Quiz';
import StyleIcon from '@mui/icons-material/Style';
import { invoke } from '@forge/bridge';
import Button, { IconButton } from '@atlaskit/button/new';
import CrossIcon from '@atlaskit/icon/glyph/cross';
import { Flex, Grid, xcss } from '@atlaskit/primitives';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle, ModalTransition } from '@atlaskit/modal-dialog';
import './DeckDisplay.css';
import CreateFlashcardGlobal from '../flashcardGlobalModuleCreate';
import EditFlashcardGlobal from '../flashcardGlobalModuleEdit'; // for editing flashcards in deck!
import ModalDialog from '@atlaskit/modal-dialog';
import AddFlashcardsToDeck from '../addFlashcardsToExistingDeck';


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

const DeckDisplay = ({ deck, startStudyMode, startQuizMode }) => {



    // ========================
    // STATE MANAGEMENT
    // ========================

    // State hooks to manage modal visibility, the selected flashcard for deletion, and the updated deck state
    const [isFlashcardDeleteModalOpen, setFlashcardDeleteModalOpen] = useState(false);
    const [isDeckDeleteModalOpen, setDeckDeleteModalOpen] = useState(false);
    const [flashcardToDelete, setFlashcardToDelete] = useState(null);
    const [updatedDeck, setUpdatedDeck] = useState(deck);
    const [isFlashcardEditModalOpen, setIsEditFlashcardOpen] = useState(false); // New state for edit modal
    const [flashcardToEdit, setFlashcardToEdit] = useState(null); // State to hold the fl


    // =====   ===================
    // PLACEHOLDER HANDLERS
    // ========================
    // Placeholder function for adding the deck to a study session
    const handleAddToStudySession = () => {
      console.log('Add to study session button clicked');
    };



    // Placeholder function for editing the deck
    const openFlashcardEditModalDeck = () => {
      console.log('Edit Deck button clicked');
    };


    // ========================
    // FLASHCARD CREATE FUNCTIONALITY
    // ========================

    const [flashcards, setFlashcards] = useState([]);
    const [isFlashcardModalOpen, setIsCreateFlashcardOpen] = useState(false);

    const closeFlashcardModal = async (newFlashcard) => {
        // Log the initiation of the modal closing process
        console.log('Closing flashcard modal. New flashcard:', newFlashcard);

        setIsCreateFlashcardOpen(false);

        if (newFlashcard) {
            const deckId = deck.id; // Assuming `deck` is passed as a prop
            const cardId = newFlashcard.id; // Make sure the newFlashcard has an ID after creation

            // Log the deck and card IDs being used
            console.log(`Deck ID: ${deckId}, Card ID: ${cardId}`);

            console.log(`Invoking addCardToDeck for cardId: ${cardId} and deckId: ${deckId}`);
            try {
                const addCardResponse = await invoke('addCardToDeck', {
                    deckId: deckId,
                    cardId: cardId,
                });

                // Log the response from the invoke call
                console.log('Response from addCardToDeck:', addCardResponse);

                if (addCardResponse.success) {
                    // Update the deck state to include the new flashcard
                    setUpdatedDeck((prevDeck) => {
                        console.log('Previous deck state before update:', prevDeck);
                        const updatedCards = [...prevDeck.cards, newFlashcard]; // Add the new flashcard to the cards array
                        console.log('New deck state after adding flashcard:', {
                            ...prevDeck,
                            cards: updatedCards,
                        });
                        return {
                            ...prevDeck,
                            cards: updatedCards,
                        };
                    });

                    console.log(`Flashcard ${cardId} added to deck ${deckId}`);
                } else {
                    console.error(`Failed to add flashcard ${cardId} to deck:`, addCardResponse.error);
                }
            } catch (error) {
                console.error('Error invoking addCardToDeck:', error);
            }
        } else {
            console.warn('No new flashcard was provided.');
        }

        //loadDecks();
    };


    const handleCreateFlashcard = () => {
        setIsCreateFlashcardOpen(true); // Open modal to create flashcard
        console.log('Add Flashcard button clicked');
    };






    // ========================
    // FLASHCARD ADDITION FUNCTIONALITY
    // ========================

    const [isAddFlashcardModalOpen, setIsAddFlashcardModalOpen] = useState(false);

    const handleAddFlashcard = () => {
        setIsAddFlashcardModalOpen(true);
        console.log('Add Flashcard button clicked');
    };

    const closeAddDeckModal = async (selectedFlashcards = []) => {
        console.log('closeAddDeckModal invoked. Selected flashcards:', selectedFlashcards);

        setIsAddFlashcardModalOpen(false);
        console.log('Modal closed. isAddFlashcardModalOpen set to:', false);

        // Resetting the updated deck to the original deck
        setUpdatedDeck(deck);
        console.log('Updated deck reset to initial deck state:', deck);

        if (selectedFlashcards.length > 0) {
            const deckId = deck.id;
            console.log('Selected flashcards are non-empty. Deck ID:', deckId);

            for (const cardId of selectedFlashcards) {
                console.log(`Processing flashcard ID: ${cardId} for deck ID: ${deckId}`);

                try {
                    console.log('Invoking addCardToDeck...');
                    const addCardResponse = await invoke('addCardToDeck', {
                        deckId: deckId,
                        cardId: cardId,
                    });

                    console.log('Response from addCardToDeck:', addCardResponse);

                    if (addCardResponse.success) {
                        console.log(`Success: Flashcard ${cardId} added to deck ${deckId}`);

                        setUpdatedDeck((prevDeck) => {
                            console.log('Previous deck state:', prevDeck);
                            const cardToAdd = flashcards.find(card => card.id === cardId);
                            console.log('Card to add:', cardToAdd);

                            if (!cardToAdd) {
                                console.error(`Card with ID ${cardId} not found in flashcards.`);
                                return prevDeck; // Return without modifying state
                            }

                            const newDeckState = {
                                ...prevDeck,
                                cards: [...prevDeck.cards, cardToAdd],
                            };

                            console.log('New deck state after adding flashcard:', newDeckState);
                            return newDeckState;
                        });
                    } else {
                        console.error(`Failed to add flashcard ${cardId} to deck:`, addCardResponse.error);
                    }
                } catch (error) {
                    console.error('Error invoking addCardToDeck:', error);
                }
            }




        } else {
            console.warn('No flashcards selected to add.');
        }

        try {
            // Fetch the updated deck from the resolver
            const deckResponse = await invoke('getDeck', {
                deckId: updatedDeck.id,  // Use the current deck ID
            });

            if (deckResponse.success) {
                // Update the deck with the fetched deck data
                setUpdatedDeck(deckResponse.deck);
            } else {
                console.error('Failed to fetch the updated deck:', deckResponse.error);
            }
        } catch (error) {
            console.error('Error fetching the updated deck:', error);
        }


        //loadDecks();


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

    // ========================
    // FLASHCARD EDIT FUNCTIONALITY
    // ========================
    const openFlashcardEditModal = (flashcard) => {
        setFlashcardToEdit(flashcard); // Set the flashcard to be edited
        setIsEditFlashcardOpen(true);  // Open the edit modal
    };

    const closeFlashcardEditModal = async (updatedFlashcard) => {
        setIsEditFlashcardOpen(false); // Close the edit modal

        // just to update the flashcard deck display
        if (updatedFlashcard) {
            try {
                // Fetch the updated deck from the resolver
                const deckResponse = await invoke('getDeck', {
                    deckId: updatedDeck.id,  // Use the current deck ID
                });

                if (deckResponse.success) {
                    // Update the deck with the fetched deck data
                    setUpdatedDeck(deckResponse.deck);
                } else {
                    console.error('Failed to fetch the updated deck:', deckResponse.error);
                }
            } catch (error) {
                console.error('Error fetching the updated deck:', error);
            }
        }
    };




    // ========================
    // DECK EDIT FUNCTIONALITY
    // ========================



    return (
      <div className='deck-display-container'>
        <div className='deck-title-and-buttons'>
          <div className='title-left-buttons'>
            <h1>{updatedDeck.title}</h1>
            <div className='left-buttons'>
              <button className='deck-display-add-study-session-icon' onClick={startStudyMode}>
                <StyleIcon fontSize='small' /> Study Mode
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
            <button className='deck-display-edit-icon' onClick={openFlashcardEditModalDeck}>
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
                                        onClick={() => openFlashcardEditModal(flashcard)}
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



        {/* Flashcard Modal */}
        {isFlashcardModalOpen && (
            <ModalDialog heading="Create Flashcard" onClose={() => closeFlashcardModal(true)}>
              <CreateFlashcardGlobal closeFlashcardModal={closeFlashcardModal} />
            </ModalDialog>
        )}

        {/* Deck Modal */}
        {isAddFlashcardModalOpen && (
            <ModalDialog heading="Add Flashcards To Deck" onClose={() => closeAddDeckModal(true)}>

                <AddFlashcardsToDeck deck={deck} closeAddDeckModal = {closeAddDeckModal}/>
            </ModalDialog>
        )}
        {/* Flashcard Edit Modal */}
        {isFlashcardEditModalOpen && (
            <ModalDialog heading="Edit Flashcard" onClose={() => closeFlashcardEditModal(true)}>
              <EditFlashcardGlobal
                flashcard={flashcardToEdit} // editing the flashcard
                closeFlashcardEditModal={closeFlashcardEditModal} // handle closing etc
              />
            </ModalDialog>
        )}

      </div>
    );
};

export default DeckDisplay;

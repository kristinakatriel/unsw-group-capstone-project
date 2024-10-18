import React, { useCallback, useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { invoke } from '@forge/bridge'; 
import Button, { IconButton } from '@atlaskit/button/new';
import CrossIcon from '@atlaskit/icon/glyph/cross';
import { Flex, Grid, xcss } from '@atlaskit/primitives';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle, ModalTransition } from '@atlaskit/modal-dialog';

const gridStyles = xcss({
    width: '100%',
});

const closeContainerStyles = xcss({
    gridArea: 'close',
});

const titleContainerStyles = xcss({
    gridArea: 'title',
});

const DeckDisplay = ({ deck }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [flashcardToDelete, setFlashcardToDelete] = useState(null);
    const [updatedDeck, setUpdatedDeck] = useState(deck);

    const openModal = (flashcard) => {
        setFlashcardToDelete(flashcard);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFlashcardToDelete(null);
    };

    const handleDelete = async () => {
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
            closeModal();
        }
    };

    return (
        <div className="deck-display-container">
            <h1>{updatedDeck.title}</h1>
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
                                    <h4 className="card-owner">By {flashcard.owner || 'Unknown'}</h4>

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
                                            onClick={() => openModal(flashcard)} // Open modal with the flashcard
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

            <ModalTransition>
                {isModalOpen && (
                    <Modal onClose={closeModal}>
                        <ModalHeader>
                            <Grid gap="space.200" templateAreas={['title close']} xcss={gridStyles}>
                                <Flex xcss={closeContainerStyles} justifyContent="end">
                                    <IconButton
                                        appearance="subtle"
                                        icon={CrossIcon}
                                        label="Close Modal"
                                        onClick={closeModal}
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
                            <Button appearance="subtle" onClick={closeModal}>No</Button>
                            <Button appearance="danger" onClick={handleDelete}>Yes</Button>
                        </ModalFooter>
                    </Modal>
                )}
            </ModalTransition>
        </div>
    );
};

export default DeckDisplay;

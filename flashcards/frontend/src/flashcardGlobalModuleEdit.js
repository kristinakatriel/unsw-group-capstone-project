import { useState } from 'react';
import { ModalDialog, Button, TextField } from '@forge/bridge';

function EditFlashcardModal({ flashcardData, onSave }) {
    const [isEditing, setIsEditing] = useState(false); // Toggle edit mode
    const [showConfirm, setShowConfirm] = useState(false); // Show confirm modal
    const [editedData, setEditedData] = useState(flashcardData); // Local state for flashcard details

    const handleEditClick = () => {
    setIsEditing(true); // Enable editing mode
    };

    const handleInputChange = (e) => {
    setEditedData({
        ...editedData,
        [e.target.name]: e.target.value, // Update the field being edited
    });
    };

    const handleSaveClick = () => {
    setShowConfirm(true); // Show confirmation modal
    };

    const confirmSave = () => {
        onSave(editedData); // Save the edited data
        setIsEditing(false); // Disable edit mode
        setShowConfirm(false); // Close confirmation
    };

    return (
    <>
        <ModalDialog>
        <h2>Flashcard Details</h2>
        <TextField
            label="Question"
            value={editedData.question}
            name="question"
            onChange={handleInputChange}
            isDisabled={!isEditing} // Disable if not editing
        />
        <TextField
            label="Answer"
            value={editedData.answer}
            name="answer"
            onChange={handleInputChange}
            isDisabled={!isEditing} // Disable if not editing
        />
        <TextField
            label="Hint"
            value={editedData.hint}
            name="hint"
            onChange={handleInputChange}
            isDisabled={!isEditing} // Disable if not editing
        />
        
        {!isEditing ? (
            <Button text="Edit" onClick={handleEditClick} /> // Edit button
        ) : (
            <Button text="Save Changes" onClick={handleSaveClick} /> // Save button
        )}
        </ModalDialog>

        {showConfirm && (
        <ModalDialog>
            <h3>Confirm Changes</h3>
            <p>Are you sure you want to save the changes?</p>
            <Button text="Confirm" onClick={confirmSave} />
            <Button text="Cancel" onClick={() => setShowConfirm(false)} />
        </ModalDialog>
        )}
    </>
    );
}

export default EditFlashcardModal;
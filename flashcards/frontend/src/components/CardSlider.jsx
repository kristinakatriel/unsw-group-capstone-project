import React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/splide/dist/css/splide.min.css';
import './CardSlider.css';

const CardSlider = ({ cards = [], onDelete  }) => {

  // Log the cards received as props
  console.log('Cards received in CARDSLIDER:', cards);

  const handleDelete = async (cardId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this flashcard?");

    if (confirmDelete) {
      try {
        // Invoke the backend delete function
        const response = await invoke('deleteFlashcard', { cardId });

        if (response.success) {
          alert('Flashcard deleted successfully!');
          // Optionally refresh the flashcard list after deletion
          // You can call a function here to re-fetch flashcards if needed
        } else {
          alert('Error deleting flashcard: ' + response.error);
        }
      } catch (error) {
        console.error('Error invoking deleteFlashcard:', error);
        alert('An error occurred. Please try again.');
      }
    }
  };


  return (
    <div className='container'>
      <div className='card-wrapper'>
        <ul className='card-list'>
          <Splide
            options={{
              type: 'slide',
              perPage: 5,
              pagination: false,
              gap: '10px',
              breakpoints: {
                640: {
                  perPage: 2,
                },
                1024: {
                  perPage: 3,
                },
              },
            }}
          >
            {cards.map((card) => (
              <SplideSlide key={card.id} className='card-item'>
              <div className="card-link">
                <p className='badge blue'>Blue Tag</p>
                <h4 className='card-question'>{card.question_text || 'No question available'}</h4>
                <h4 className='card-answer'>{card.answer_text || 'No question available'}</h4>
                <h4 className='card-owner'>By {card.name || 'Unknown'}</h4>
                <div className='card-button'>
                  <EditIcon className='card-edit-button' />
                  <DeleteIcon className='card-delete-button' onClick={() => onDelete(card)} />
                </div>
              </div>
              </SplideSlide>
            ))}
          </Splide>
        </ul>
      </div>
    </div>
  );
};

export default CardSlider;

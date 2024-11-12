import React, { useEffect, useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { invoke } from '@forge/bridge';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/splide/dist/css/splide.min.css';
import './CardSlider.css';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

// added onEdit as well!
const CardSlider = ({ cards = [], tagMap = [], onDelete, onEdit, onTagEdit }) => {

  console.log('cards passed in to cardslider', cards);

  // const [cardTags, setCardTags] = useState({});

  // // Fetch tags for a given card
  // const fetchTagsForCard = async (passedIn) => {

  //   console.log('cardId passed in', passedIn);



  //   try {
  //     const response = await invoke('getTagsForItem', {itemId: passedIn, itemType: 'card'});
  //     //const response = await getTagsByCardId({ payload: { cardId } });

  //     if (response.success) {
  //       setCardTags((prevTags) => ({
  //         ...prevTags,
  //         [passedIn]: response.tags,
  //       }));
  //       // Log the cards received as props
  //       console.log('tags responce received for card:', passedIn);
  //       console.log('tags responce:', response);
  //     } else {
  //       //console.log('tags responce:', response);
  //       console.error('Error fetching tags:', response);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching tags:', error);
  //   }
  // };

  // useEffect(() => {
  //   // Fetch tags for each card when the component mounts or when cards are updated
  //   cards.forEach((card) => {
  //     fetchTagsForCard(card.id);
  //   });
  // }, [cards]);


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
                800: {
                  perPage: 2,
                },

                1000: {
                  perPage: 3,
                },
                1200: {
                  perPage: 4,
                },
              },
            }}
          >
            {cards.map((card) => (
              <SplideSlide key={card.id} className='card-item'>
              <div className="card-link">

                {/* Dynamically render the tags for each card */}
                <div className='card-tags'>
                  {tagMap[card.id]?.map((tag) => (
                    <span
                      key={tag.id}
                      className={`badge ${tag.colour}`}
                      // onClick={() => console.log(`${tag.title} has been clicked! Tag Information: ${JSON.stringify(tag, null, 2)}`)} // Convert the object to a string
                    >
                      {tag.title || "Tag"}
                    </span>
                    ))}
                </div>
                {card.front && <h4 className='card-front'>{card.front}</h4>}
                {card.back && <h4 className='card-back'>{card.back}</h4>}
                <h4 className='card-owner'>By {card.name || 'Unknown'}</h4>
                <div className='card-button'>
                  {/* <LocalOfferIcon className='card-edit-button'  onClick={() => onTagEdit(card)}/> */}
                  <EditIcon className='card-edit-button'  onClick={() => onEdit(card)}/>
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

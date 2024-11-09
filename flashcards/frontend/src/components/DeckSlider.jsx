import React, { useEffect, useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { invoke, router } from '@forge/bridge';
//import { router } from '@forge/bridge';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/splide/dist/css/splide.min.css';
import './DeckSlider.css';

const DeckSlider = ({ decks = [], tagMap = [], onDelete, onDeckClick, onEdit }) => {

  //const [deckTags, setDeckTags] = useState({});

  // // Fetch tags for a given deck
  // const fetchTagsForDecks = async (passedIn) => {

  //   console.log('deckId passed in', passedIn);



  //   try {
  //     const response = await invoke('getTagsForItem', {itemId: passedIn, itemType: 'deck'});
  //     //const response = await getTagsByCardId({ payload: { deckId } });

  //     if (response.success) {
  //       setDeckTags((prevTags) => ({
  //         ...prevTags,
  //         [passedIn]: response.tags,
  //       }));
  //       // Log the cards received as props
  //       console.log('tags responce received for deck:', passedIn);
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
  //   // Fetch tags for each deck when the component mounts or when cards are updated
  //   decks.forEach((deck) => {
  //     fetchTagsForDecks(deck.id);
  //   });
  // }, [decks]);









  const handleLinkClick = async (url) => {
    try {
      await router.open(url);
    } catch (error) {
      console.error('Navigation failed or user declined to proceed:', error);
    }
  };

  return (
    <div className='container'>
      <div className='deck-wrapper'>
        <ul className='deck-list'>
          <Splide
            options={{
              type: 'slide',
              perPage: 5,
              pagination: false,
              gap: '10px',
              breakpoints: {
                800: {
                  perPage:2,
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
            {decks.map((deck) => (
              deck.title && (
                <SplideSlide key={deck.id} className='deck-item'>
                  <div
                    className="deck-link"
                    onClick={() => {
                      console.log(`Deck ${deck.id} has been clicked by user`);
                      onDeckClick(deck);
                    }}
                  >
                    <div className="deck-right-border"></div>
                    <div className="deck-content"></div>



                    {/* Dynamically render the tags for each card */}
                    <div className='deck-tags'>
                      {tagMap[deck.id]?.map((tag) => (
                      //{deckTags[deck.id]?.map((tag) => (
                          <span
                            key={tag.id}
                            className={`badge ${tag.colour}`}
                            onClick={() => console.log(`${tag.title} has been clicked! Tag Information: ${JSON.stringify(tag, null, 2)}`)} // Convert the object to a string
                          >
                            {tag.title || "Tag"}
                          </span>
                        ))}
                    </div>


                    {/* ** TODO **
                    <p className='badge blue'>Blue Tag</p> */}




                    <h4 className='deck-name'>{deck.title || 'Unnamed Deck'}</h4>
                    <h4 className='deck-flashcard-amount'>Flashcards: {deck.cards?.length || 0}</h4>
                    {deck.description.includes("Fetched from https://") ? (
                      <div
                        onClick={(e) => {
                          e.stopPropagation(); // Prevents triggering parent onClick
                          handleLinkClick(deck.description.match(/https?:\/\/\S+/)[0]);
                        }}
                        className='ai-deck-description'
                      >
                        View source page
                      </div>
                    ) : (
                      <h4 className='deck-description'>{deck.description}</h4>
                    )}
                    <h4 className='deck-owner'>By {deck.name || 'Unknown'}</h4>
                    <div className='deck-button'>
                      <EditIcon
                        className='deck-edit-button'
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(deck);
                        }}
                      />
                      <DeleteIcon
                        className='deck-delete-button'
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Delete icon clicked for deck:', deck);
                          onDelete(deck);
                        }}
                      />
                    </div>
                  </div>
                </SplideSlide>
              )
            ))}
          </Splide>
        </ul>
      </div>
    </div>
  );
};

export default DeckSlider;
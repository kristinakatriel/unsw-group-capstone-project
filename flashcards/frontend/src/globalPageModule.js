import React, { useEffect, useState } from 'react';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';
import { invoke, view} from '@forge/bridge';
import CreateFlashcardGlobal from './flashcardGlobalModuleCreate';
import ModalDialog from '@atlaskit/modal-dialog';
import CardSlider from './components/CardSlider';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import './globalPageModule.css';
import CreateDeckGlobal from './deckGlobalModuleCreate';
import DeckSlider from './components/DeckSlider';
import DeckDisplay from './components/DeckDisplay';
import Breadcrumbs, { BreadcrumbsItem } from '@atlaskit/breadcrumbs';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle, ModalTransition } from '@atlaskit/modal-dialog';
import Button, { IconButton } from '@atlaskit/button/new';
import CrossIcon from '@atlaskit/icon/glyph/cross';
import { Alert, Collapse } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Flex, Grid, xcss } from '@atlaskit/primitives';
import QuizMode from './components/QuizMode';
import StudyMode from './components/StudyMode';
import EditFlashcardModal from './flashcardGlobalModuleEdit';
import EditDeckModal from './deckModuleEdit';
import CreateTagGlobal from './tagGlobalModuleCreate';
import './tagGlobalModuleCreate.css';
import Chip from '@mui/material/Chip';
import DeleteIcon from '@mui/icons-material/Delete';
import EditTagGlobal from './tagGlobalPageEdit';
// import './editTagGlobalModule.css';
import EditIcon from '@mui/icons-material/Edit';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import { IconButton as MuiIconButton } from '@mui/material';

const gridStyles = xcss({
    width: '100%',
});

const closeContainerStyles = xcss({
    gridArea: 'close',
});

const titleContainerStyles = xcss({
    gridArea: 'title',
});

// ********************************** GLOBAL PAGE MODULE **********************************

function globalPageModule() {

  // ********************************** STATE MANAGEMENT **********************************

  const [flashcards, setFlashcards] = useState([]);
  const [flashdecks, setDecks] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);


  //tag mapping
  const [cardTagMap, setCardTagMap] = useState([]);
  const [deckTagMap, setDeckTagMap] = useState([]);
  const [tagTagMap, setTagTagMap] = useState([]);


  //selected tag
  const [selectedTags, setSelectedTags] = useState(tags.map(tag => tag.id)); // All tags selected by default

  //owner tags

  const [isMyTagsSelected, setIsMyTagsSelected] = useState(false); // State to manage My Tags toggle

  //account id feild

  const [accountId, setAccountId] = useState(null); // State to store the account ID


  // const [selectedTags, setSelectedTags] = useState(null); // State to manage selected tag

  // Modal states for flashcards and decks
  const [isFlashcardModalOpen, setIsCreateFlashcardOpen] = useState(false);
  const [isDeckModalOpen, setIsDeckModalOpen] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);

  // State for FLASHCARD deletion and confirmation
  const [flashcardToDelete, setFlashcardToDelete] = useState(null);
  const [isDeleteFlashcardConfirmOpen, setIsDeleteFlashcardConfirmOpen] = useState(false);

  // State for FLASHCARD editing and confirmation
  const [editingFlashcard, setEditingFlashcard] = useState(null); // Store the flashcard being edited
  const [isEditFlashcardModalOpen, setIsEditFlashcardModalOpen] = useState(false);

  // State for DECK editing and confirmation
  const [editingDeck, setEditingDeck] = useState(null); // Store the deck being edited
  const [isEditDeckModalOpen, setIsEditDeckModalOpen] = useState(false);

  // State for DECK deletion and confirmation
  const [deckToDelete, setDeckToDelete] = useState(null);
  const [isDeleteDeckConfirmOpen, setIsDeleteDeckConfirmOpen] = useState(false);

  // State for TAG deletion and confirmation
  const [tagToDelete, setTagToDelete] = useState(null);
  const [isDeleteTagConfirmOpen, setIsDeleteTagConfirmOpen] = useState(false);

  // State for TAG editing and confirmation
  const [editingTag, setEditingTag] = useState(null); // Store the tag being edited
  const [isEditTagModalOpen, setIsEditTagModalOpen] = useState(false); // Modal logic for editing tags

  // State for DECK display
  const [selectedDeck, setSelectedDeck] = useState(null);

  // State for breadcrumbs
  const [breadcrumbItems, setBreadcrumbItems] = useState([{ href: '#', text: 'FLASH (Home)' }]);

  // State for study mode
  const [isStudyMode, setIsStudyMode] = useState(false);

  // State for quizmode
  const [isQuizMode, setIsQuizMode] = useState(false);

  // State for saving success and error messages
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [deleteDeckFromDisplaySuccess, setDeleteDeckFromDisplaySuccess] = useState(false);
  const [showDeleteSuccessAlert, setShowDeleteSuccessAlert] = useState(false);
  const [deleteTagFromDisplaySuccess, setDeleteTagFromDisplaySuccess] = useState(false);
  const [showTagSuccessAlert, setShowTagSuccessAlert] = useState(false);

  // State for search
  const [globalPageSearchTerm, setGlobalPageSearchTerm] = useState('');
  const [alignment, setAlignment] = useState('all');

  const [hoveredTag, setHoveredTag] = useState(null);

  //************************** DELETION LOGIC *****************************/
  const confirmDeleteFlashcard = (flashcard) => {
    setFlashcardToDelete(flashcard);
    setIsDeleteFlashcardConfirmOpen(true);
  };

  const confirmDeleteDeck = (deck) => {
    setDeckToDelete(deck);
    setIsDeleteDeckConfirmOpen(true);
  };

  const confirmDeleteTag = (tag) => {
    console.log(tag.id);
    setTagToDelete(tag);
    setIsDeleteTagConfirmOpen(true);
  };

  const closeDeleteFlashcardConfirm = () => {
    setIsDeleteFlashcardConfirmOpen(false);
    setFlashcardToDelete(null);
    setErrorMessage('');
    setDeleteSuccess(false);
  };

  const closeDeleteDeckConfirm = () => {
    setIsDeleteDeckConfirmOpen(false);
    setDeckToDelete(null);
    setErrorMessage('');
    setDeleteSuccess(false);
  };

  const closeDeleteTagConfirm = () => {
    setIsDeleteTagConfirmOpen(false);
    setTagToDelete(null);
    setErrorMessage('');
    setDeleteSuccess(false);
  };

  const deleteFlashcard = async () => {
    setErrorMessage('');
    try {
      const response = await invoke('deleteFlashcard', { cardId: flashcardToDelete.id });
      console.log("FLASHCARDTODELETE");
      if (response.success) {
        setDeleteSuccess(true);
        // setFlashcards((prevFlashcards) => prevFlashcards.filter((card) => card.id !== flashcardToDelete.id));
        //loadFlashcards();
        setTimeout(() => {
          closeDeleteFlashcardConfirm(); // Delay closing modal
        }, 400); // Show message for 2 seconds before closing
        refreshFlashcardFrontend();  // Refresh UI after deletion
      } else {
        setErrorMessage(response.error);
        console.error('Error deleting flashcard:', response.error);
      }
    } catch (error) {
      console.error('Error deleting flashcard:', error);
    }
  };

  const deleteDeck = async () => {
    setErrorMessage('');
    try {
      const response = await invoke('deleteDeck', { deckId: deckToDelete.id });
      if (response.success) {
        setDeleteSuccess(true);
        // setDecks((prevDecks) => prevDecks.filter((deck) => deck.id !== deckToDelete.id));
        loadDecks();
        setTimeout(() => {
          closeDeleteDeckConfirm();
        }, 2000); // Show message for 2 seconds before closing
        refreshDeckFrontend();  // Refresh UI after deletion
      } else {
        setErrorMessage(response.error);
        console.error('Error deleting deck:', response.error);
      }
    } catch (error) {
      console.error('Error deleting deck:', error);
    }

  };

  useEffect(() => {
    if (deleteDeckFromDisplaySuccess) {
      setShowDeleteSuccessAlert(true);
      const timer = setTimeout(() => {
        setShowDeleteSuccessAlert(false);
      }, 2000); // Adjust the duration as needed
      return () => clearTimeout(timer);
    }
  }, [deleteDeckFromDisplaySuccess]);

  const deleteTag = async () => {
    setErrorMessage('');
    console.log(tagToDelete.id);
    try {
      const response = await invoke('deleteTag', { tagId: tagToDelete.id });
      if (response.success) {
        setDeleteSuccess(true);
        loadTags();
        setTimeout(() => {
          closeDeleteTagConfirm();
        }, 2000);
        refreshTagFrontend();
      } else {
        setErrorMessage(response.error);
        console.error('Error deleting tag:', response.error);
      }
    } catch (error) {
      console.error('Error deleting tag:', error);
    }
  };

  useEffect(() => {
    console.log("Updated selected deck:", selectedDeck);
    // Additional logic here
  }, [selectedDeck]); // Runs whenever `selectedDeck` changes

  //************************** FETCHING DATA (REUSABLE) *****************************/
  const loadFlashcards = async () => {

    console.log('Current flashcards state before fetch:', flashcards); // Log the current state of flashcards
    try {
      const response = await invoke('getAllFlashcards', {});
      console.log('Response received from getAllFlashcards:', response); // Log the entire response

      if (response.success) {
        setFlashcards(response.cards);
        setCardTagMap(response.tags);
      }
    } catch (error) {
      console.error('Error fetching flashcards:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDecks = async () => {
    try {
      const response = await invoke('getAllDecks', {});
      console.log(response);
      if (response.success) {
        setDecks(response.decks);
        setDeckTagMap(response.tags);
      }
    } catch (error) {
      console.error('Error fetching decks:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTags = async () => {
    try {
      const response = await invoke('getAllTags', {});
      console.log(response);
      if (response.success) {
        setTags(response.tags);
        setTagTagMap(response.tags);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setLoading(false);
    }
  };

  //************************** REFRESH LOGIC *****************************/ *************************************************************************************
  const refreshFlashcardFrontend = () => {
    //setLoading(true);
    loadFlashcards();  // This function will reload flashcards and refresh the UI
  };

  const refreshDeckFrontend = () => {
    //setLoading(true);
    loadDecks();  // This function will reload decks and refresh the UI
  };

  const refreshTagFrontend = () => {
    //setLoading(true);
    loadTags();  // This function will reload decks and refresh the UI
  };

  //************************** MODAL HANDLERS *****************************/
  const createFlashcardGlobal = () => {
    setIsCreateFlashcardOpen(true); // Open modal to create flashcard
  };

  const createDeck = () => {
    setIsDeckModalOpen(true); // Open modal to create deck
  };

  const createTag = () => {
    setIsTagModalOpen(true); // Open modal to create deck
  };

  const closeFlashcardModal = (shouldRefresh = false) => {
    setIsCreateFlashcardOpen(false);

    //loadFlashcards();
    refreshFlashcardFrontend();  // Refresh after closing modal if new flashcard was created****************************************************************************************************

  };

  const closeDeckModal = (shouldRefresh = false) => {
    setIsDeckModalOpen(false);
    //loadDecks();
    refreshDeckFrontend();  // Refresh after closing modal if new deck was created ****************************************************************************************************

  };

  const closeTagModal = (shouldRefresh = false) => {
    setIsTagModalOpen(false);
    //loadDecks();
    refreshTagFrontend();  // Refresh after closing modal if new tag was created ****************************************************************************************************

  };

  // Modal logic for editing flashcards
  // Open the edit modal
  const openFlashcardEditModal = (flashcard) => {
    setEditingFlashcard(flashcard);
    setIsEditFlashcardModalOpen(true);
  };

  // Close the edit modal and refresh flashcards
  // updatedFlashcard is not really needed at the moment
  const closeFlashcardEditModal = (updatedFlashcard) => {
    setIsEditFlashcardModalOpen(false);

    // Refresh the flashcard list by fetching flashcards
    refreshFlashcardFrontend();
    refreshDeckFrontend();
  };


  //DECK EDIT LOGIC

  // Modal logic for editing flashcards
  // Open the edit modal
  const openDeckEditModal = (deck) => {
    setEditingDeck(deck);
    setIsEditDeckModalOpen(true);
  };

  // Close the edit modal and refresh flashcards
  // updatedFlashcard is not really needed at the moment
  const closeDeckEditModal = (updatedDeck) => {
    setIsEditDeckModalOpen(false);
    // Refresh the deck list by refetching decks
    refreshDeckFrontend();
  };


  //************************** INITIAL FETCH ON COMPONENT MOUNT *****************************/
  useEffect(() => {

    const fetchAccountId = async () => {
      try {
        const context = await view.getContext(); // Get context from Forge
        setAccountId(context.accountId); // Set the account ID from the context
      } catch (error) {
        console.error("Error fetching context:", error);
      }
    };

    fetchAccountId();

    loadFlashcards();
    loadDecks();
    loadTags();

    //refreshFlashcardFrontend();  // Load flashcards when the component mounts****************************************************************************************************
    //refreshDeckFrontend();  // Load decks when the component mounts ****************************************************************************************************8
  }, []);

  //************************** SEARCH FUNCTIONS *****************************/


  //tag filtering when a tag is selected

  // const handleTagClick = (tag) => {
  //   // Toggle the selected tag
  //   console.log(`${tag.title} has been clicked! Tag Information: ${JSON.stringify(tag, null, 2)}`); // Convert the object to a string
  //   setSelectedTags((prevTag) => (prevTag?.id === tag.id ? null : tag));
  // };

  // const handleTagToggle = (tagId) => {
  //   // Toggle the selected tag
  //   console.log(`${tag.title} has been clicked! Tag Information: ${JSON.stringify(tag, null, 2)}`); // Convert the object to a string
  //   // setSelectedTags((prevTag) => (prevTag?.id === tag.id ? null : tag));
  //   setSelectedTags((prevSelectedTag) =>
  //     prevSelectedTag.includes(tagId)
  //       ? prevSelectedTag.filter((id) => id !== tagId) // Deselect if already selected
  //       : [...prevSelectedTag, tagId] // Select if not yet selected
  //   );
  // };

  const handleTagToggle = (tagId) => {

    selectedTags.includes(tagId)


    setSelectedTags((prevSelectedTags) =>
      prevSelectedTags.includes(tagId)
        ? prevSelectedTags.filter((id) => id !== tagId) // Deselect if already selected
        : [...prevSelectedTags, tagId] // Select if not yet selected
    );


  };

  const handleAllTagsToggle = () => {
    if (selectedTags.length === tags.length) {
      setSelectedTags([]); // Deselect all if all tags are selected
    } else {
      setSelectedTags(tags.map(tag => tag.id)); // Select all tags if not all are selected
    }
  };


  const selectOwnTags = () => {

    console.log("testing");
    setIsMyTagsSelected((prevState) => !prevState); // Toggle the switch
  };


  // Open the edit modal for a tag
  const openTagEditModal = (tag) => {
    setEditingTag(tag); // Set the tag to be edited
    setIsEditTagModalOpen(true); // Open the modal
  };

  // Close the edit modal and refresh tags
  const closeTagEditModal = (updatedTag) => {
    setIsEditTagModalOpen(false); // Close the modal

    // Refresh the tag list by fetching tags
    refreshTagFrontend();
    refreshDeckFrontend();
  };


  // Handle search input change
  const searchGlobalPage = (event) => {
    setGlobalPageSearchTerm(event.target.value);
    console.log('Searching:', globalPageSearchTerm);
  };

  const filteredFlashcards = flashcards.filter((card) => {

    const searchTerm = globalPageSearchTerm.toLowerCase();
    const matchesSearch =
      (typeof card.front === 'string' && card.front.toLowerCase().includes(searchTerm)) ||
      (typeof card.back === 'string' && card.back.toLowerCase().includes(searchTerm)) ||
      (card.name && typeof card.name === 'string' && card.name.toLowerCase().includes(searchTerm));

    // If a tag is selected, filter cards by their IDs in the selected tag’s flashcards array

    const matchesTags =  selectedTags.length === 0 || // If "All Tags" is selected
      selectedTags.some(tagId => tags.find(tag => tag.id === tagId && tag.cardIds.includes(card.id)));




    // If "Own Tags" is selected, only show cards/decks owned by the current user (accountId)
    const matchesOwner = (isMyTagsSelected && card.owner === accountId) || !isMyTagsSelected;
    // console.log('matchesOwner:', matchesOwner);
    // console.log('matchesSearch:', matchesSearch);
    // console.log('matchesTags:', matchesTags);

    // // Log the individual conditions
    // console.log('Owner condition (!isMyTagsSelected || card.owner === accountId):', !isMyTagsSelected || card.owner === accountId);
    // console.log('Tags condition (selectedTags.length === tags.length):', selectedTags.length === tags.length);
    // console.log('selectedTags.length', selectedTags.length);
    // console.log(' tags.length)', tags.length);

    // console.log('Tags condition (selectedTags.some(tagId => tags.find(tag => tag.id === tagId && tag.cardIds.includes(card.id)))):',
    //   selectedTags.some(tagId => tags.find(tag => tag.id === tagId && tag.cardIds.includes(card.id))));
    // console.log(
    //   'INSIDE FILTERFLASHCARDS, matchesOwner:', matchesOwner,
    //   'matchesSearch:', matchesSearch,
    //   'matchesTags:', matchesTags,
    //   'Owner condition (!isMyTagsSelected || card.owner === accountId):', !isMyTagsSelected || card.owner === accountId,
    //   'Tags condition (selectedTags.length === tags.length):', selectedTags.length === tags.length,
    //   'selectedTags.length:', selectedTags.length,
    //   'tags.length:', tags.length,
    //   'Tags condition (selectedTags.some(tagId => tags.find(tag => tag.id === tagId && tag.cardIds.includes(card.id)))):',
    //   selectedTags.some(tagId => tags.find(tag => tag.id === tagId && tag.cardIds.includes(card.id)))
    // );


    return matchesSearch && matchesTags && matchesOwner;
    // const matchesTag = selectedTags
    //   ? selectedTags.cardIds.includes(card.id)
    //   : true;

    //return matchesSearch && matchesTags;
  });

  // const filteredFlashcards = flashcards.filter((card) => {
  //   const searchTerm = globalPageSearchTerm.toLowerCase();
  //   return (
  //     (typeof card.front === 'string' && card.front.toLowerCase().includes(searchTerm)) ||
  //     (typeof card.back === 'string' && card.back.toLowerCase().includes(searchTerm)) ||
  //     (card.name && typeof card.name === 'string' && card.name.toLowerCase().includes(searchTerm))
  //     // Add tags once implemented
  //   );
  // });

  const filteredDecks = flashdecks.filter((deck) => {
    const searchTerm = globalPageSearchTerm.toLowerCase();
    const matchesSearch =
      (typeof deck.title === 'string' && deck.title.toLowerCase().includes(searchTerm)) ||
      (deck.description && typeof deck.description === 'string' && deck.description.toLowerCase().includes(searchTerm)) ||
      (deck.name && typeof deck.name === 'string' && deck.name.toLowerCase().includes(searchTerm));

    const matchesTags =  selectedTags.length === 0 || // If "All Tags" is selected
    selectedTags.some(tagId => tags.find(tag => tag.id === tagId && tag.deckIds.includes(deck.id)));





       // If "Own Tags" is selected, only show cards/decks owned by the current user (accountId)
    const matchesOwner = !isMyTagsSelected || deck.owner === accountId;
    // console.log('matchesOwner:', matchesOwner);
    // console.log('matchesSearch:', matchesSearch);
    // console.log('matchesTags:', matchesTags);

    // console.log('Owner condition (!isMyTagsSelected || deck.owner === accountId):', !isMyTagsSelected || deck.owner === accountId);
    // console.log('Tags condition (selectedTags.length === tags.length):', selectedTags.length === tags.length);
    // console.log('selectedTags.length', selectedTags.length);
    // console.log(' tags.length)', tags.length);


    // console.log('Tags condition (selectedTags.some(tagId => tags.find(tag => tag.id === tagId && tag.deckIds.includes(deck.id)))):',
    //   selectedTags.some(tagId => tags.find(tag => tag.id === tagId && tag.deckIds.includes(deck.id))));

    return matchesSearch && matchesTags && matchesOwner;
      //return matchesSearch && matchesTags;
        // Add tags once implemented
  });

  const filteredTags = tags.filter((tag) => {
    const searchTerm = globalPageSearchTerm.toLowerCase();
    return (
      (typeof tag.title === 'string' && tag.title.toLowerCase().includes(searchTerm))
    );
  });

  //************************** RENDER FUNCTIONS *****************************/
  const renderFlashcardsList = (filteredFlashcards) => {
    //console.log('cards right before passed into card slider' , flashcards);
    return (
    <CardSlider cards={filteredFlashcards} tagMap={cardTagMap} onDelete={confirmDeleteFlashcard} onEdit={openFlashcardEditModal} onTagEdit={openTagEditModal}/>
    );

  };

  const renderDecksList = (filteredDecks) => (
    <DeckSlider decks={filteredDecks} tagMap={deckTagMap} onDelete={confirmDeleteDeck} onDeckClick={onDeckClick} onEdit ={openDeckEditModal} />
  );

  const renderTagsList = (filteredTags) => (
    <div className="global-page-badge-container">

      {/* Toggle All Tags Chip */}
      <Chip
        label="Toggle All Tags"
        className={`global-page-badge-container badge my-stuff ${selectedTags.length === tags.length ? "all-selected" : "all-tags"}`} // Added custom class `my-stuff`
        //className={`badge ${selectedTags.length === tags.length ? "all-selected" : "all-tags"}`} // Dynamic class for selected state
        onClick={handleAllTagsToggle} // Toggle all tags on click
        color={selectedTags.length === tags.length ? "primary" : "default"} // Optional: use different color if all tags selected
        sx={{ margin: 1 }} // Add spacing between chips

      />

      {filteredTags.map((tag, index) => (
        <Box
          key={index}
          onMouseEnter={() => setHoveredTag(tag.id)}
          onMouseLeave={() => setHoveredTag(null)}
          sx={{ position: 'relative', display: 'inline-block', margin: 1 }}
        >
          <Chip
            label={tag.title || "Tag"}
            className={`badge ${tag.colour}`}
            onClick={() => handleTagToggle(tag.id)}
            onDelete={selectedTags.includes(tag.id) ? () => handleTagToggle(tag.id) : undefined}
            deleteIcon={selectedTags.includes(tag.id) ? <DeleteIcon /> : null}
            sx={{ display: 'flex', alignItems: 'center' }}
          />
          {hoveredTag === tag.id && (
            <Box sx={{
              position: 'absolute',
              bottom: '70%',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1,
              display: 'flex',
              flexDirection: 'row',
              pointerEvents: 'auto',
            }}>
              <MuiIconButton className='tag-edit-button'size="small" onClick={() => openTagEditModal(tag)}>
                <EditIcon />
              </MuiIconButton>
              <MuiIconButton className='tag-delete-button' size="small" onClick={() => confirmDeleteTag(tag)}>
                <DeleteIcon />
              </MuiIconButton>
            </Box>
          )}
        </Box>
      ))}
    </div>
  );

  //************************** DECK DISPLAY FUNCTIONS *****************************/
  const onDeckClick = (deck) => {
    console.log(`Deck clicked: ${deck.title}`); // Log when a deck is clicked
    setSelectedDeck(deck);
    setIsStudyMode(false);
    setIsQuizMode(false);
    console.log("issuse here?");
    console.log(`deck : ${deck.title}`); // Log when a deck is clicked
    //console.log(`updaated deck : ${updatedDeck.title}`);
    setBreadcrumbItems([{ href: '#', text: 'FLASH (Home)' }, { href: '#', text: deck.title }]);
    //setBreadcrumbItems([{ href: '#', text: 'FLASH (Home)' }, { href: '#', text: deck.title }]);
    console.log('Selected Deck:', deck); // Log the currently selected deck
    console.log('Current Breadcrumb Items:', [{ href: '#', text: 'FLASH (Home)' }, { href: '#', text: deck.title }]); // Log breadcrumb items
  };

  const goBackIntermediate = (deleted = false) => {
    console.log('consol log');
    if (deleted) {
      console.log('consol log');
      setDeleteDeckFromDisplaySuccess(true);
      console.log('consol log');
    } else {
      console.log('consol log');
      setDeleteDeckFromDisplaySuccess(false);
      console.log('consol log');
    }
  }

  const goBackToHome = () => {
    console.log('consol log');
    console.log('Going back to FLASH (Home)'); // Log when going back to Home
    setSelectedDeck(null);
    console.log('consol log');
    setIsStudyMode(false);
    setIsQuizMode(false);
    console.log('consol log');
    setBreadcrumbItems([{ href: '#', text: 'FLASH (Home)' }]);
    refreshDeckFrontend();
    refreshFlashcardFrontend();
    console.log('Current Breadcrumb Items:', [{ href: '#', text: 'FLASH (Home)' }]); // Log breadcrumb items
  };

  const goBackToDeck = () => {
    console.log('Going back to Deck'); // Log when going back to the deck
    setIsStudyMode(false);
    setIsQuizMode(false);
    console.log('consol log');

    setBreadcrumbItems(prevItems => {
      const updatedItems = prevItems.slice(0, -1);
      console.log('Current Breadcrumb Items:', updatedItems); // Log breadcrumb items Going back to Deck
      return updatedItems;
    });

    // setBreadcrumbItems(prevItems => prevItems.slice(0, -1));
    // console.log('Current Breadcrumb Items:', prevItems.slice(0, -1)); // Log breadcrumb items

    // setBreadcrumbItems(prevItems => {
    //   const updatedItems = prevItems.slice(0, -1);
    //   console.log('Current Breadcrumb Items:', updatedItems); // Log breadcrumb items Going back to Deck
    //   return updatedItems;
    // });
    console.log('consol log');
  };

  //************************** STUDY MODE FUNCTIONS *****************************/
  const studyMode = async () => {
    //loadDecks();
    console.log('consol log');

    console.log("selected deck going into quiz mode", selectedDeck);
    const id = selectedDeck.id;
    console.log("id", id);

    try {
      const response = await invoke('getDeck', { deckId: id });

      if (response.success) {
        console.log("Deck retrieved successfully:", response.deck);
        setSelectedDeck(response.deck)
      } else {
        console.error("Error retrieving deck:", response.error);
        return null;
      }
    } catch (error) {
      console.error("Exception in fetchDeck:", error);
      return null;
    }
    console.log("selected deck", selectedDeck);
    console.log('Entering Study Mode'); // Log when entering study mode
    setIsStudyMode(true);
    console.log('consol log');
    setBreadcrumbItems(prevItems => [
        ...prevItems,
        { href: '#', text: 'Study Mode' }
    ]);

    console.log('consol log');
  };

  if (isStudyMode) {
    console.log('consol log');
    return (
      <div>
        <Breadcrumbs>
          {breadcrumbItems.map((item, index) => (
            <BreadcrumbsItem
              key={index}
              href={item.href}
              text={item.text}
              onClick={() => {
                if (item.text === 'FLASH (Home)') {
                  goBackToHome();
                } else if (item.text === selectedDeck.title) {
                  goBackToDeck();
                }
              }}
            />
          ))}
        </Breadcrumbs>
        <StudyMode deck={selectedDeck} onBack={goBackToDeck} />
      </div>
    );

    console.log('consol log');

  }

  //************************** QUIZ MODE FUNCTIONS *****************************/
  const quizMode = async () => {
    console.log("selected deck going into quiz mode", selectedDeck);
    const id = selectedDeck.id;
    console.log("id", id);

    try {
      const response = await invoke('getDeck', { deckId: id });

      if (response.success) {
        console.log("Deck retrieved successfully:", response.deck);
        setSelectedDeck(response.deck)
        console.log("selected deck", selectedDeck);
      } else {
        console.error("Error retrieving deck:", response.error);
        return null;
      }
    } catch (error) {
      console.error("Exception in fetchDeck:", error);
      return null;
    }
    console.log("selected deck", selectedDeck);
    console.log('Entering Quiz Mode'); // Log when entering quiz mode
    // loadDecks();
    console.log('consol log');
    setIsQuizMode(true);
    console.log('consol log');
    setBreadcrumbItems(prevItems => [
        ...prevItems,
        { href: '#', text: 'Quiz Mode' }
    ]);
  };

  if (isQuizMode) {
    //loadDecks();
    console.log('consol log');
    return (
      <div>
        <Breadcrumbs>
          {breadcrumbItems.map((item, index) => (
            <BreadcrumbsItem
              key={index}
              href={item.href}
              text={item.text}
              onClick={() => {
                if (item.text === 'FLASH (Home)') {
                  goBackToHome();
                } else if (item.text === selectedDeck.title) {
                  goBackToDeck();
                }
              }}
              // className="breadcrumb-item"
            />
          ))}
        </Breadcrumbs>
        <QuizMode deck={selectedDeck} onBack={goBackToDeck} />
      </div>
    );
  }

  if (selectedDeck) {
    //loadDecks();
    console.log('consol log');
    console.log('Selected deck:', selectedDeck);
    console.log('Breadcrumb items:', breadcrumbItems);
    console.log('Tag map for cards:', cardTagMap);
    console.log('Tag map for deck:', deckTagMap);

    return (
      <div >
        <Breadcrumbs>
          {breadcrumbItems.map((item, index) => (
            <BreadcrumbsItem
              key={index}
              href={item.href}
              text={item.text}
              onClick={item.text === 'FLASH (Home)' ? goBackToHome : undefined}
              // className="breadcrumb-item"
              />
          ))}
        </Breadcrumbs>
        <DeckDisplay deck={selectedDeck} tagMap={cardTagMap} deckTags={deckTagMap} startStudyMode={studyMode} startQuizMode={quizMode} goBackToHome={goBackToHome} goBackIntermediate={goBackIntermediate}/>
      </div>
    );
  }
  //   return (
  //     <div>
  //       <Breadcrumbs>
  //         {breadcrumbItems.map((item, index) => (

  //           <BreadcrumbsItem
  //             key={index}
  //             href={item.href}
  //             text={item.text}
  //             onClick={() => {
  //               console.log(`Breadcrumb clicked: ${item.text}`);
  //               if (item.text === 'FLASH (Home)') goBackToHome();
  //             }}
  //             // onClick={item.text === 'FLASH (Home)' ? goBackToHome : undefined}
  //             // className="breadcrumb-item"
  //           />
  //         ))}
  //       </Breadcrumbs>
  //       <DeckDisplay deck={selectedDeck} tagMap={cardTagMap} deckTags={deckTagMap} startStudyMode={studyMode} startQuizMode={quizMode} goBackToHome={goBackToHome} goBackIntermediate={goBackIntermediate}/>
  //     </div>
  //   );
  // }
  console.log('consol log');
  // const [alignment, setAlignment] = useState('all');
  console.log('consol log');


  const handleToggleChange = (event, newAlignment) => {
    console.log('consol log');
    console.log(newAlignment);
    console.log('consol log');
    if (newAlignment === null) {
      setAlignment(alignment);
      return;
    }
    console.log('consol log');

    setAlignment(newAlignment);
    console.log('consol log');
    if (newAlignment === 'personal' && !isMyTagsSelected) {
      selectOwnTags();
    } else if (newAlignment === 'all' && isMyTagsSelected) {
      selectOwnTags();
    }
  }; //here?

  return (
    <div className='global-page-container'>
      <div className="global-page-header">
        <div className="global-page-headlines">
          <div className="global-page-headline">
            <FlashOnIcon className="global-page-flash-icon" /> FLASH
          </div>
          <div className="global-page-subheadline">
            The Forge App that allows you to create flashcards in a flash
          </div>
        </div>
        <div className="global-page-search">
          <ToggleButtonGroup
            color="primary"
            value={alignment}
            exclusive
            onChange={handleToggleChange}
            aria-label="Personal or All"
            className='toggle-button-group'
          >
            <Tooltip title="To view all personal content" disableInteractive>
              <ToggleButton value="personal" className='toggle-button'>Personal</ToggleButton>
            </Tooltip>
            <Tooltip title="To view all content within the site" disableInteractive>
              <ToggleButton value="all" className='toggle-button'>All</ToggleButton>
            </Tooltip>
          </ToggleButtonGroup>

          <div className="global-page-search-box">
            <SearchIcon className="global-page-search-icon" />
            <input
              type="text"
              id="search-input"
              onKeyUp={searchGlobalPage}
              placeholder="Search..."
            />
          </div>
        </div>
      </div>
      <Collapse in={showDeleteSuccessAlert} timeout={500}>
        <Alert severity="success">
          Deck deleted successfully!
        </Alert>
      </Collapse>

      <div className='global-page-tags'>Tags<button className='global-page-create-tag-button' onClick={createTag}>+ Create Tag</button></div>
      {loading ? (
        <p>Loading...</p>
      ) : flashdecks.length === 0 ? (
        <p>No tags created. Create a tag to display here.</p>
      ) : (

        renderTagsList(filteredTags)
      )}

      <div className='global-page-decks'>Decks<button className='global-page-create-deck-button' onClick={createDeck}>+ Create Deck</button></div>
      {loading ? (
        <p>Loading...</p>
      ) : flashdecks.length === 0 ? (
        <p>No decks created. Create a deck to display here.</p>
      ) : (
        renderDecksList(filteredDecks)
      )}

      <div className='global-page-flashcards'>Flashcards<button className='global-page-create-flashcard-button' onClick={createFlashcardGlobal}>+ Create Flashcard</button></div>
      {loading ? (
        <p>Loading...</p>
      ) : flashcards.length === 0 ? (
        <p>No flashcards created. Create a flashcard to display here.</p>
      ) : (
        renderFlashcardsList(filteredFlashcards)
      )}

      <div className='global-page-recents'>Suggested</div>
      {loading ? (
        <p>Loading...</p>
      ) : flashcards.length === 0 ? (
        <p>Nothing recently accessed. Create some flashcards!.</p>
      ) : (
        renderFlashcardsList(filteredFlashcards)
      )}

      {/* Flashcard Modal */}
      {isFlashcardModalOpen && (
        <ModalDialog heading="Create Flashcard" onClose={() => closeFlashcardModal(true)}>
          <CreateFlashcardGlobal closeFlashcardModal={closeFlashcardModal} />
        </ModalDialog>
      )}

      {/* Deck Modal */}
      {isDeckModalOpen && (
        <ModalDialog heading="Create Deck" onClose={() => closeDeckModal(true)}>
          <CreateDeckGlobal closeDeckModal = {closeDeckModal}/>
        </ModalDialog>
      )}

      {/* Tag Modal */}
      {isTagModalOpen && (
        <ModalDialog heading="Create Tag" onClose={() => closeTagModal(true)}>
          <CreateTagGlobal closeTagModal = {closeTagModal}/>
        </ModalDialog>
      )}

      {/* Flashcard Delete Confirmation Modal */}
      <ModalTransition>
          {isDeleteFlashcardConfirmOpen && (
              <Modal onClose={closeDeleteFlashcardConfirm}>
                  <ModalHeader>
                      <Grid gap="space.200" templateAreas={['title close']} xcss={gridStyles}>
                          <Flex xcss={closeContainerStyles} justifyContent="end">
                              <IconButton
                                  appearance="subtle"
                                  icon={CrossIcon}
                                  label="Close Modal"
                                  onClick={closeDeleteFlashcardConfirm}
                              />
                          </Flex>
                          <Flex xcss={titleContainerStyles} justifyContent="start">
                              <ModalTitle appearance="danger">Delete Flashcard?</ModalTitle>
                          </Flex>
                      </Grid>
                  </ModalHeader>
                  <ModalBody>
                      <p>Are you sure you want to delete all instances of the flashcard? This action cannot be undone.</p>
                      {deleteSuccess &&
                        <Alert severity="success"> Flashcard deleted successfully! </Alert>
                      }
                      {errorMessage &&
                        <Alert severity="error">{errorMessage} </Alert>
                      }
                  </ModalBody>
                  <ModalFooter>
                      <Button appearance="subtle" onClick={closeDeleteFlashcardConfirm}>Cancel</Button>
                      <Button appearance="danger" onClick={deleteFlashcard}>Yes, Delete</Button>
                  </ModalFooter>
              </Modal>
          )}
      </ModalTransition>

      {/* Deck Delete Confirmation Modal */}
      <ModalTransition>
          {isDeleteDeckConfirmOpen && (
              <Modal onClose={closeDeleteDeckConfirm}>
                  <ModalHeader>
                      <Grid gap="space.200" templateAreas={['title close']} xcss={gridStyles}>
                          <Flex xcss={closeContainerStyles} justifyContent="end">
                              <IconButton
                                  appearance="subtle"
                                  icon={CrossIcon}
                                  label="Close Modal"
                                  onClick={closeDeleteDeckConfirm}
                              />
                          </Flex>
                          <Flex xcss={titleContainerStyles} justifyContent="start">
                              <ModalTitle appearance="danger">Delete Deck?</ModalTitle>
                          </Flex>
                      </Grid>
                  </ModalHeader>
                  <ModalBody>
                      <p>Are you sure you want to delete all instances of the deck? This action cannot be undone.</p>
                      {deleteSuccess &&
                        <Alert severity="success">Deck deleted successfully!</Alert>
                      }
                      {errorMessage &&
                        <Alert severity="error"> {errorMessage} </Alert>
                      }
                  </ModalBody>
                  <ModalFooter>
                      <Button appearance="subtle" onClick={closeDeleteDeckConfirm}>Cancel</Button>
                      <Button appearance="danger" onClick={deleteDeck}>Yes, Delete</Button>
                  </ModalFooter>
              </Modal>
          )}
      </ModalTransition>

      {/* Tag Delete Confirmation Modal */}
      <ModalTransition>
          {isDeleteTagConfirmOpen && (
              <Modal onClose={closeDeleteTagConfirm}>
                  <ModalHeader>
                      <Grid gap="space.200" templateAreas={['title close']} xcss={gridStyles}>
                          <Flex xcss={closeContainerStyles} justifyContent="end">
                              <IconButton
                                  appearance="subtle"
                                  icon={CrossIcon}
                                  label="Close Modal"
                                  onClick={closeDeleteTagConfirm}
                              />
                          </Flex>
                          <Flex xcss={titleContainerStyles} justifyContent="start">
                              <ModalTitle appearance="danger">Delete Tag?</ModalTitle>
                          </Flex>
                      </Grid>
                  </ModalHeader>
                  <ModalBody>
                      <p>Are you sure you want to delete all instances of the tag? This action cannot be undone.</p>
                      {deleteSuccess &&
                        <Alert severity="success">Tag deleted successfully!</Alert>
                      }
                      {errorMessage &&
                        <Alert severity="error"> {errorMessage} </Alert>
                      }
                  </ModalBody>
                  <ModalFooter>
                      <Button appearance="subtle" onClick={closeDeleteTagConfirm}>Cancel</Button>
                      <Button appearance="danger" onClick={deleteTag}>Yes, Delete</Button>
                  </ModalFooter>
              </Modal>
          )}
      </ModalTransition>

      {/* FLASHCARD EDIT FUNCTIONALITY: Flashcard Edit Modal */}
      {isEditFlashcardModalOpen && (
        <ModalDialog heading="Edit Flashcard" onClose={closeFlashcardEditModal}>
          <EditFlashcardModal
            flashcard={editingFlashcard} // Pass the flashcard to the modal
            closeFlashcardEditModal={closeFlashcardEditModal}
          />
        </ModalDialog>
      )}

      {/* // Tags functionality: Tag Edit Modal */}
      {isEditTagModalOpen && (
        <ModalDialog heading="Edit Tag" onClose={closeTagEditModal}>
          <EditTagGlobal
            tag={editingTag} // Pass the tag to the modal
            closeTagEditModal={closeTagEditModal}
          />
        </ModalDialog>
      )}


      {/* DECK EDIT FUNCTIONALITY: DECK Edit Modal */}
      {isEditDeckModalOpen && (
        <ModalDialog heading="Edit Deck" onClose={closeDeckEditModal}>
          <EditDeckModal
            deck={editingDeck} // Pass the flashcard to the modal
            closeDeckEditModal={closeDeckEditModal}
          />
        </ModalDialog>
      )}

    </div>
  );
}

export default globalPageModule;
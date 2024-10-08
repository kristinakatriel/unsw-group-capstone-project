import React, { useState } from 'react';
import { invoke, view } from '@forge/bridge';
import './CreateGroups.css';

function CreateGroups() {
  const [groupTitle, setGroupTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSave = async () => {
    try {
      const response = await invoke('createGroup', {
        title: groupTitle,
        description: description,
        owner: '@eee'
      });

      console.log('Group saved successfully:', response);
      
      // Reset the fields after saving
      setGroupTitle('');
      setDescription('');
    } catch (error) {
      console.error('Error invoking createGroup:', error);
    }
  };

  const handleClose = () => {
    view.close(); // Close the modal
  };

  return (
    <div className="group-creation">
      <h2 className="group-title">Create New Group</h2>

      <div className="form-group">
        <label htmlFor="groupTitle">Group Name</label>
        <input
          type="text"
          id="groupTitle"
          value={groupTitle}
          onChange={(e) => setGroupTitle(e.target.value)}
          placeholder="Type the group title here..."
          className="input-field"
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Type a description for the group..."
          className="input-area"
        />
      </div>

      <div className="button-group">
        <button className="save-button" onClick={handleSave}>Save</button>
        <button className="close-button" onClick={handleClose}>Close</button>
      </div>
    </div>
  );
}

export default CreateGroups;
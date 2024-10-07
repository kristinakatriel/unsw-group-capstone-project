import React, { useEffect, useState } from "react";
import { MdClear } from "react-icons/md";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage } from '@fortawesome/free-solid-svg-icons';
import "./DragNDrop.css";

const DragNDrop = ({ onFilesSelected, width, height }) => {
  const [files, setFiles] = useState([]);

  const handleFileChange = (event) => {
    const selectedFiles = event.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      const newFiles = Array.from(selectedFiles);
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFiles = event.dataTransfer.files;
    if (droppedFiles.length > 0) {
      const newFiles = Array.from(droppedFiles);
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };

  const handleRemoveFile = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  useEffect(() => {
    onFilesSelected(files);
  }, [files, onFilesSelected]);

  return (
    <section className="drag-drop" style={{ width: width, height: height }}>
      <div
        className={`document-uploader ${files.length > 0 ? "active" : ""}`}
        onDrop={handleDrop}
        onDragOver={(event) => event.preventDefault()}
      >
        <div className="upload-info">
          <FontAwesomeIcon icon={faImage} size="3x" color="#ffffff" />
        </div>
        
        <p style={{ color: "#ffffff", marginTop: "8px" }}>Upload Image</p>

        <input
          type="file"
          hidden
          id="browse"
          onChange={handleFileChange}
          accept=".jpg, .jpeg, .png"
          multiple
        />
        <label htmlFor="browse" className="browse-btn">
          Upload Image
        </label>
      </div>
    </section>
  );
};

export default DragNDrop;

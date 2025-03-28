<script>
  import { onMount } from 'svelte';
  
  // Props
  export let token;
  export let userId;
  
  // State
  let images = [];
  let isLoading = false;
  let errorMessage = '';
  let selectedFile = null;
  let title = '';
  let description = '';
  let isUploading = false;
  let uploadErrorMessage = '';
  
  // Modal state
  let showModal = false;
  let selectedImage = null;
  
  // Easter egg state
  let clickCount = 0;
  let showEasterEgg = false;
  
  // API URL
  const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';
  
  // Fetch images on component mount
  onMount(() => {
    fetchImages();
  });
  
  // Handle file input change
  function handleFileChange(event) {
    const files = event.target.files;
    if (files.length > 0) {
      selectedFile = files[0];
    }
  }
  
  // Easter egg function
  function triggerEasterEgg() {
    clickCount++;
    if (clickCount >= 3) {
      showEasterEgg = true;
      setTimeout(() => {
        showEasterEgg = false;
        clickCount = 0;
      }, 5000);
    }
  }
  
  // Handle form submission for image upload
  async function handleUpload() {
    // Validate form
    if (!selectedFile || !title) {
      uploadErrorMessage = 'Please select a file and enter a title';
      return;
    }
    
    // Set uploading state
    isUploading = true;
    uploadErrorMessage = '';
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('title', title);
      formData.append('description', description);
      
      // Send upload request
      const response = await fetch(`${API_URL}/api/images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      // Parse response
      const data = await response.json();
      
      // Handle error
      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload image');
      }
      
      // Add new image to images array
      images = [data.image, ...images];
      
      // Reset form
      selectedFile = null;
      title = '';
      description = '';
      document.getElementById('imageUpload').value = '';

      // Show success message
      uploadErrorMessage = 'Image uploaded successfully!';
      setTimeout(() => {
        uploadErrorMessage = '';
      }, 3000);
    } catch (error) {
      uploadErrorMessage = error.message;
    } finally {
      isUploading = false;
    }
  }
  
  // Fetch images from API
  async function fetchImages() {
    isLoading = true;
    errorMessage = '';
    
    try {
      // Get user images
      const response = await fetch(`${API_URL}/api/images/user`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Parse response
      const data = await response.json();
      
      // Handle error
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch images');
      }
      
      images = data.images || [];
      
      // Debug info
      console.log('Received images:', images);
    } catch (error) {
      errorMessage = error.message || 'Failed to fetch images';
    } finally {
      isLoading = false;
    }
  }

  // Delete image function
  async function deleteImage(imageId) {
    if (!confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/images/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Parse response
      const data = await response.json();
      
      // Handle error
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete image');
      }

      // Remove image from list
      images = images.filter(img => img.id !== imageId);

    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  }
  
  // Get full image URL
  function getImageUrl(filePath) {
    return `${API_URL}/uploads/${filePath}`;
  }
  
  // Open image in modal
  function openImageModal(image) {
    selectedImage = image;
    showModal = true;
    
    // Add event listener to close modal on Escape key
    document.addEventListener('keydown', handleKeyDown);
  }
  
  // Close image modal
  function closeImageModal() {
    showModal = false;
    selectedImage = null;
    
    // Remove event listener
    document.removeEventListener('keydown', handleKeyDown);
  }
  
  // Handle key press
  function handleKeyDown(event) {
    if (event.key === 'Escape') {
      closeImageModal();
    }
  }
  
  // Handle click outside the modal content to close it
  function handleBackdropClick(event) {
    if (event.target.classList.contains('custom-modal')) {
      closeImageModal();
    }
  }
</script>

<svelte:window on:keydown={event => {
  if (showModal && event.key === 'Escape') {
    closeImageModal();
  }
}} />

<div class="row">
  <div class="col-md-12 mb-4">
    <div class="card shadow industrial-panel">
      <div class="card-header factory-header">
        <div class="d-flex align-items-center">
          <span class="rivet"></span>
          <h5 class="mb-0 ms-3 easter-egg-trigger" on:click={triggerEasterEgg}>
            UPLOAD NEW IMAGE
            <span class="click-indicator">👆</span>
          </h5>
          <span class="rivet ms-auto"></span>
        </div>
      </div>
      <div class="card-body">
        <form on:submit|preventDefault={handleUpload}>
          <div class="mb-3">
            <label for="imageUpload" class="form-label">SELECT IMAGE</label>
            <div class="input-group industrial-input">
              <input
                type="file"
                class="form-control"
                id="imageUpload"
                accept="image/*"
                on:change={handleFileChange}
                required
              />
            </div>
          </div>
          
          <div class="mb-3">
            <label for="title" class="form-label">TITLE</label>
            <input
              type="text"
              class="form-control industrial-input"
              id="title"
              bind:value={title}
              placeholder="Enter image title"
              required
            />
          </div>
          
          <div class="mb-3">
            <label for="description" class="form-label">DESCRIPTION (OPTIONAL)</label>
            <textarea
              class="form-control industrial-input"
              id="description"
              bind:value={description}
              placeholder="Enter image description"
              rows="3"
            ></textarea>
          </div>
          
          {#if uploadErrorMessage}
            <div class="alert {uploadErrorMessage.includes('success') ? 'alert-success' : 'alert-danger'} industrial-alert" role="alert">
              {uploadErrorMessage}
            </div>
          {/if}
          
          <button
            type="submit"
            class="btn btn-primary industrial-btn"
            disabled={isUploading}
          >
            <span class="btn-icon">⚙️</span>
            {isUploading ? 'UPLOADING...' : 'UPLOAD IMAGE'}
          </button>
        </form>
      </div>
    </div>
  </div>
  
  <div class="col-md-12">
    <div class="section-title">
      <div class="metal-bar"></div>
      <h3>YOUR IMAGES</h3>
      <div class="metal-bar"></div>
    </div>
    
    {#if isLoading}
      <div class="text-center my-4 loading-container">
        <div class="industrial-spinner">
          <div class="gear-spinner"></div>
        </div>
        <p class="mt-2">LOADING IMAGES...</p>
      </div>
    {:else if errorMessage}
      <div class="alert alert-danger industrial-alert" role="alert">
        <strong>ERROR:</strong> {errorMessage}
      </div>
    {:else if images.length === 0}
      <div class="alert alert-info industrial-alert empty-gallery" role="alert">
        <div class="empty-icon">🏭</div>
        <p>You haven't uploaded any images yet. Upload your first image above!</p>
      </div>
    {:else}
      <div class="row row-cols-1 row-cols-md-3 g-4">
        {#each images as image}
          <div class="col">
            <div class="card industrial-image-card h-100">
              <div class="image-container">
                <img
                  src={getImageUrl(image.file_path)}
                  class="card-img-top clickable"
                  alt={image.title}
                  on:click={() => openImageModal(image)}
                  onerror="this.src='https://via.placeholder.com/300x200?text=Error+loading+image'"
                />
                <div class="image-overlay">
                  <button class="view-btn" on:click={() => openImageModal(image)}>VIEW</button>
                </div>
              </div>
              <div class="card-body">
                <h5 class="card-title">{image.title}</h5>
                {#if image.description}
                  <p class="card-text">{image.description}</p>
                {/if}
              </div>
              <div class="card-footer image-footer">
                <small class="text-muted">Uploaded on {new Date(image.created_at).toLocaleDateString()}</small>
                <button class="btn btn-sm btn-danger delete-btn" on:click={() => deleteImage(image.id)}>
                  <span class="delete-icon">×</span>
                </button>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<!-- Easter Egg -->
{#if showEasterEgg}
  <div class="easter-egg-notification">
    <div class="egg-content">
      <p>Created by <a href="https://github.com/Maks0101aps" target="_blank" class="easter-egg-link">Maks0101aps</a></p>
      <div class="social-links">
        <a href="https://github.com/Maks0101aps" target="_blank" class="social-icon">
          GitHub
        </a>
      </div>
    </div>
  </div>
{/if}

<!-- Image Modal -->
{#if showModal && selectedImage}
  <div class="custom-modal" on:click={handleBackdropClick}>
    <div class="modal-dialog modal-dialog-centered modal-xl industrial-modal" on:click|stopPropagation>
      <div class="modal-content">
        <div class="modal-header">
          <div class="d-flex align-items-center w-100">
            <span class="modal-rivet"></span>
            <h5 class="modal-title">{selectedImage.title}</h5>
            <button type="button" class="btn-close industrial-close" aria-label="Close" on:click={closeImageModal}></button>
            <span class="modal-rivet ms-auto"></span>
          </div>
        </div>
        <div class="modal-body text-center p-0">
          <img 
            src={getImageUrl(selectedImage.file_path)} 
            alt={selectedImage.title}
            class="img-fluid"
            style="max-height: 80vh; width: auto;"
          />
        </div>
        <div class="modal-footer">
          {#if selectedImage.description}
            <p class="text-muted me-auto description-text">{selectedImage.description}</p>
          {/if}
          <button type="button" class="btn btn-secondary industrial-close-btn" on:click={closeImageModal}>CLOSE</button>
          <!-- More visible GitHub link -->
          <a href="https://github.com/Maks0101aps" class="github-badge" target="_blank">@Maks0101aps</a>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  /* Custom industrial styles for the gallery */
  .industrial-panel {
    border: none;
    background-color: var(--industrial-gray);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.5) !important;
    position: relative;
    border-radius: 0;
    border-left: 5px solid var(--industrial-rust);
  }
  
  .factory-header {
    background-color: var(--industrial-metal);
    border-bottom: 2px solid var(--industrial-rust);
    color: var(--industrial-accent);
    border-radius: 0;
    padding: 1rem;
  }
  
  .rivet, .modal-rivet {
    width: 12px;
    height: 12px;
    background-color: var(--industrial-rust);
    border-radius: 50%;
    display: inline-block;
    border: 2px solid #212529;
  }
  
  .industrial-input {
    background-color: var(--industrial-dark);
    border: 1px solid var(--industrial-metal);
    color: #fff;
  }
  
  .industrial-btn {
    background-color: var(--industrial-rust);
    border: none;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    position: relative;
    overflow: hidden;
  }
  
  .industrial-btn::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: rgba(255, 255, 255, 0.3);
  }
  
  .btn-icon {
    font-size: 1.2rem;
  }
  
  .industrial-alert {
    border-left: 4px solid var(--industrial-rust);
    background-color: var(--industrial-dark);
    border-radius: 0;
  }
  
  .empty-gallery {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem;
  }
  
  .empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }
  
  .section-title {
    display: flex;
    align-items: center;
    margin-bottom: 1.5rem;
  }
  
  .metal-bar {
    height: 2px;
    background-color: var(--industrial-rust);
    flex-grow: 1;
    margin: 0 15px;
  }
  
  .section-title h3 {
    color: var(--industrial-accent);
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
    margin: 0;
    white-space: nowrap;
  }
  
  .industrial-image-card {
    border: none;
    background-color: var(--industrial-gray);
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    position: relative;
  }
  
  .industrial-image-card::before {
    content: "";
    position: absolute;
    top: 10px;
    left: 10px;
    width: 8px;
    height: 8px;
    background-color: var(--industrial-rust);
    border-radius: 50%;
    z-index: 2;
  }
  
  .industrial-image-card::after {
    content: "";
    position: absolute;
    top: 10px;
    right: 10px;
    width: 8px;
    height: 8px;
    background-color: var(--industrial-rust);
    border-radius: 50%;
    z-index: 2;
  }
  
  .industrial-image-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
  }
  
  .image-container {
    position: relative;
    height: 200px;
    overflow: hidden;
  }
  
  .image-container img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }
  
  .industrial-image-card:hover .image-container img {
    transform: scale(1.1);
  }
  
  .image-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .industrial-image-card:hover .image-overlay {
    opacity: 1;
  }
  
  .view-btn {
    background-color: var(--industrial-rust);
    color: white;
    border: none;
    padding: 8px 20px;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 600;
    cursor: pointer;
  }
  
  .image-footer {
    background-color: var(--industrial-metal);
    border-top: 2px solid var(--industrial-rust);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
  }
  
  .delete-btn {
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border-radius: 50%;
    background-color: #6c1414;
    transition: all 0.3s ease;
  }
  
  .delete-btn:hover {
    background-color: #8a1a1a;
  }
  
  .delete-icon {
    font-size: 1.5rem;
    line-height: 1;
  }
  
  /* Loading spinner */
  .loading-container {
    padding: 2rem;
  }
  
  .industrial-spinner {
    display: inline-block;
    position: relative;
    width: 80px;
    height: 80px;
  }
  
  .gear-spinner {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 60px;
    height: 60px;
    margin: -30px 0 0 -30px;
    border: 6px solid var(--industrial-metal);
    border-radius: 50%;
    border-top-color: var(--industrial-rust);
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  /* Modal styles */
  .custom-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1050;
  }
  
  .industrial-modal {
    max-width: 90%;
    box-shadow: 0 0 30px rgba(0, 0, 0, 0.8);
  }
  
  .industrial-modal .modal-content {
    background-color: var(--industrial-gray);
    border: 2px solid var(--industrial-rust);
    border-radius: 0;
  }
  
  .industrial-modal .modal-header {
    background-color: var(--industrial-metal);
    border-bottom: 2px solid var(--industrial-rust);
    padding: 1rem;
  }
  
  .industrial-modal .modal-title {
    color: var(--industrial-accent);
    letter-spacing: 1px;
    text-transform: uppercase;
    margin: 0 15px;
    flex-grow: 1;
  }
  
  .industrial-close {
    background: var(--industrial-rust);
    border-radius: 50%;
    width: 24px;
    height: 24px;
    position: relative;
    opacity: 1;
  }
  
  .industrial-close:hover {
    background: #964f2e;
    opacity: 1;
  }
  
  .industrial-modal .modal-footer {
    background-color: var(--industrial-metal);
    border-top: 2px solid var(--industrial-rust);
  }
  
  .description-text {
    font-family: 'Roboto Mono', monospace;
    font-size: 0.9rem;
  }
  
  .industrial-close-btn {
    background-color: var(--industrial-metal);
    border: 1px solid var(--industrial-concrete);
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 600;
  }
  
  .industrial-close-btn:hover {
    background-color: var(--industrial-dark);
  }

  /* Clickable effects */
  .clickable {
    cursor: pointer;
  }
  
  /* Easter egg styles */
  .easter-egg-trigger {
    cursor: pointer;
    position: relative;
    border: 1px dashed transparent;
    padding: 3px 8px;
    transition: all 0.3s ease;
  }
  
  .easter-egg-trigger:hover {
    border-color: var(--industrial-accent);
    background-color: rgba(255, 209, 102, 0.1);
  }
  
  .click-indicator {
    position: absolute;
    top: -15px;
    right: -15px;
    font-size: 1.2rem;
    animation: bounce 1.5s infinite;
  }
  
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }
  
  .easter-egg-trigger::after {
    content: "Click me! (Maks0101aps)";
    position: absolute;
    top: -30px;
    left: 50%;
    transform: translateX(-50%);
    background-color: var(--industrial-dark);
    padding: 5px 10px;
    border-radius: 5px;
    border: 1px solid var(--industrial-rust);
    font-size: 0.8rem;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease, top 0.3s ease;
    z-index: 10;
    white-space: nowrap;
  }
  
  .easter-egg-trigger:hover::after {
    opacity: 1;
    top: -25px;
  }
  
  .easter-egg-notification {
    position: fixed;
    top: 80px;
    left: 50%;
    transform: translateX(-50%);
    background-color: var(--industrial-dark);
    padding: 15px 25px;
    border-radius: 5px;
    border: 2px solid var(--industrial-rust);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
    z-index: 2000;
    animation: slideDown 0.5s ease-out;
    min-width: 300px;
  }
  
  @keyframes slideDown {
    from { top: -50px; opacity: 0; }
    to { top: 80px; opacity: 1; }
  }
  
  .egg-content {
    color: var(--industrial-accent);
    font-weight: 600;
    text-align: center;
    margin: 0;
  }
  
  .social-links {
    margin-top: 10px;
    display: flex;
    justify-content: center;
  }
  
  .social-icon {
    display: inline-block;
    padding: 5px 15px;
    background-color: var(--industrial-rust);
    color: white;
    text-decoration: none;
    border-radius: 3px;
    font-weight: bold;
    transition: all 0.3s ease;
  }
  
  .social-icon:hover {
    background-color: var(--industrial-accent);
    color: var(--industrial-dark);
    transform: scale(1.05);
  }
  
  .easter-egg-link {
    color: #fff;
    text-decoration: none;
    position: relative;
    padding: 0 5px;
    font-size: 1.2rem;
  }
  
  .easter-egg-link::after {
    content: "";
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: var(--industrial-rust);
    transform: scaleX(0);
    transition: transform 0.3s ease;
    transform-origin: right;
  }
  
  .easter-egg-link:hover::after {
    transform: scaleX(1);
    transform-origin: left;
  }
  
  .github-badge {
    position: absolute;
    bottom: 10px;
    right: 10px;
    background-color: var(--industrial-accent);
    color: var(--industrial-dark);
    text-decoration: none;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: bold;
    transition: all 0.3s ease;
    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
  }
  
  .github-badge:hover {
    background-color: var(--industrial-rust);
    color: white;
    transform: scale(1.1);
  }
  
  .hidden-github-link {
    display: none;
  }
</style> 
<script>
  import { createEventDispatcher } from 'svelte';
  
  // Event dispatcher
  const dispatch = createEventDispatcher();
  
  // Form data
  let username = '';
  let email = '';
  let password = '';
  let confirmPassword = '';
  let errorMessage = '';
  let isLoading = false;
  
  // Easter egg variables
  let showEasterEgg = false;
  let lastTyped = '';
  let typingTimer;
  
  // Handle form submission
  async function handleSubmit() {
    // Reset error message
    errorMessage = '';
    
    // Validate form
    if (!username || !email || !password || !confirmPassword) {
      errorMessage = 'Please fill in all fields';
      return;
    }
    
    if (password !== confirmPassword) {
      errorMessage = 'Passwords do not match';
      return;
    }
    
    // Set loading state
    isLoading = true;
    
    try {
      // Send registration request
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
      });
      
      // Parse response
      const data = await response.json();
      
      // Handle error
      if (!response.ok) {
        throw new Error(data.message || 'Failed to register');
      }
      
      // Dispatch register event with user data and token
      dispatch('register', {
        user: data.user,
        token: data.token
      });
    } catch (error) {
      errorMessage = error.message;
    } finally {
      isLoading = false;
    }
  }
  
  // Check for Easter egg trigger in username
  function checkUsernameEasterEgg() {
    clearTimeout(typingTimer);
    
    // Check if username contains the trigger
    if (username.includes('Maks0101aps')) {
      showEasterEgg = true;
      setTimeout(() => {
        showEasterEgg = false;
      }, 6000);
    }
    
    // Track typing pattern
    lastTyped += username.slice(-1);
    if (lastTyped.length > 10) {
      lastTyped = lastTyped.slice(-10);
    }
    
    // Check for pattern "Maks0101aps" in any typing sequence
    if (lastTyped.includes('Maks0101aps')) {
      showEasterEgg = true;
      setTimeout(() => {
        showEasterEgg = false;
        lastTyped = '';
      }, 6000);
    }
    
    // Reset lastTyped after 3 seconds of no typing
    typingTimer = setTimeout(() => {
      lastTyped = '';
    }, 3000);
  }
</script>

<div class="industrial-register-container">
  <form on:submit|preventDefault={handleSubmit}>
    <div class="mb-3">
      <label for="username" class="form-label">Username</label>
      <div class="input-with-hint">
        <input
          type="text"
          class="form-control industrial-input"
          id="username"
          bind:value={username}
          on:input={checkUsernameEasterEgg}
          placeholder="Choose a username"
          required
        />
        <small class="form-text text-muted hint">Try typing "Maks0101aps"...</small>
      </div>
    </div>
    
    <div class="mb-3">
      <label for="email" class="form-label">Email</label>
      <input
        type="email"
        class="form-control industrial-input"
        id="email"
        bind:value={email}
        placeholder="Enter your email"
        required
      />
    </div>
    
    <div class="mb-3">
      <label for="password" class="form-label">Password</label>
      <input
        type="password"
        class="form-control industrial-input"
        id="password"
        bind:value={password}
        placeholder="Create a password"
        required
      />
    </div>
    
    <div class="mb-3">
      <label for="confirmPassword" class="form-label">Confirm Password</label>
      <input
        type="password"
        class="form-control industrial-input"
        id="confirmPassword"
        bind:value={confirmPassword}
        placeholder="Confirm your password"
        required
      />
    </div>
    
    {#if errorMessage}
      <div class="alert alert-danger industrial-alert" role="alert">
        {errorMessage}
      </div>
    {/if}
    
    <button
      type="submit"
      class="btn btn-primary w-100 industrial-button"
      disabled={isLoading}
    >
      {isLoading ? 'Registering...' : 'Register'}
    </button>
  </form>
  
  {#if showEasterEgg}
    <div class="register-easter-egg">
      <div class="egg-content-container">
        <h4 class="creator-title">Developer Found!</h4>
        <div class="developer-card">
          <div class="profile-image">
            <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" alt="GitHub" width="60">
          </div>
          <div class="developer-info">
            <h5>Maks0101aps</h5>
            <p>Creator of Industrial Image Vault</p>
            <a href="https://github.com/Maks0101aps" class="github-link" target="_blank">View GitHub Profile</a>
          </div>
        </div>
        <div class="close-button" on:click={() => showEasterEgg = false}>×</div>
      </div>
    </div>
  {/if}
</div>

<style>
  .industrial-register-container {
    position: relative;
    padding: 20px;
    border-radius: 5px;
    border: 1px solid var(--industrial-rust);
    background-color: rgba(0, 0, 0, 0.2);
  }
  
  .industrial-input {
    background-color: var(--industrial-dark);
    border: 1px solid var(--industrial-rust);
    color: white;
  }
  
  .industrial-input:focus {
    background-color: rgba(50, 50, 50, 0.8);
    border-color: var(--industrial-accent);
    box-shadow: 0 0 0 0.25rem rgba(255, 209, 102, 0.25);
    color: white;
  }
  
  .input-with-hint {
    position: relative;
  }
  
  .hint {
    position: absolute;
    right: 10px;
    top: -20px;
    font-size: 0.75rem;
    color: var(--industrial-accent);
    opacity: 0.7;
    transition: opacity 0.3s ease;
  }
  
  .input-with-hint:hover .hint {
    opacity: 1;
  }
  
  .industrial-button {
    background-color: var(--industrial-rust);
    border-color: var(--industrial-rust);
    text-transform: uppercase;
    font-weight: bold;
    letter-spacing: 1px;
    position: relative;
    overflow: hidden;
  }
  
  .industrial-button:hover, .industrial-button:focus {
    background-color: var(--industrial-accent);
    border-color: var(--industrial-accent);
    color: var(--industrial-dark);
  }
  
  .industrial-button::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg, 
      transparent, 
      rgba(255, 255, 255, 0.2), 
      transparent
    );
    transition: all 0.6s;
  }
  
  .industrial-button:hover::before {
    left: 100%;
  }
  
  .register-easter-egg {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: var(--industrial-dark);
    border-radius: 8px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7);
    z-index: 2000;
    width: 90%;
    max-width: 500px;
    overflow: hidden;
    animation: slideIn 0.5s ease-out;
  }
  
  @keyframes slideIn {
    from { transform: translate(-50%, -70%); opacity: 0; }
    to { transform: translate(-50%, -50%); opacity: 1; }
  }
  
  .egg-content-container {
    position: relative;
    padding: 20px;
  }
  
  .creator-title {
    text-align: center;
    color: var(--industrial-accent);
    margin-bottom: 20px;
    border-bottom: 2px solid var(--industrial-rust);
    padding-bottom: 10px;
    text-transform: uppercase;
    letter-spacing: 2px;
  }
  
  .developer-card {
    display: flex;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.3);
    padding: 15px;
    border-radius: 5px;
    border: 1px solid var(--industrial-rust);
  }
  
  .profile-image {
    flex: 0 0 80px;
    height: 80px;
    background-color: #24292e;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 20px;
    border: 2px solid var(--industrial-accent);
    box-shadow: 0 0 15px rgba(255, 209, 102, 0.3);
  }
  
  .developer-info {
    flex: 1;
  }
  
  .developer-info h5 {
    color: white;
    margin-bottom: 5px;
    font-size: 1.2rem;
  }
  
  .developer-info p {
    color: #aaa;
    margin-bottom: 15px;
    font-size: 0.9rem;
  }
  
  .github-link {
    display: inline-block;
    background-color: var(--industrial-rust);
    color: white;
    padding: 5px 15px;
    border-radius: 20px;
    text-decoration: none;
    font-size: 0.9rem;
    transition: all 0.3s ease;
  }
  
  .github-link:hover {
    background-color: var(--industrial-accent);
    color: var(--industrial-dark);
    transform: translateY(-2px);
  }
  
  .close-button {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 30px;
    height: 30px;
    background-color: var(--industrial-rust);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    color: white;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .close-button:hover {
    background-color: var(--industrial-accent);
    color: var(--industrial-dark);
    transform: rotate(90deg);
  }
  
  .industrial-alert {
    background-color: rgba(220, 53, 69, 0.2);
    border-color: var(--industrial-rust);
    color: white;
  }
</style> 
<script>
  import { createEventDispatcher } from 'svelte';
  
  // Event dispatcher
  const dispatch = createEventDispatcher();
  
  // Form data
  let email = '';
  let password = '';
  let errorMessage = '';
  let isLoading = false;
  
  // Easter egg variables
  let clickCount = 0;
  let showEasterEgg = false;
  
  // Handle form submission
  async function handleSubmit() {
    // Reset error message
    errorMessage = '';
    
    // Validate form
    if (!email || !password) {
      errorMessage = 'Please enter both email and password';
      return;
    }
    
    // Set loading state
    isLoading = true;
    
    try {
      // Send login request
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      // Parse response
      const data = await response.json();
      
      // Handle error
      if (!response.ok) {
        throw new Error(data.message || 'Failed to login');
      }
      
      // Dispatch login event with user data and token
      dispatch('login', {
        user: data.user,
        token: data.token
      });
    } catch (error) {
      errorMessage = error.message;
    } finally {
      isLoading = false;
    }
  }
  
  // Easter egg function - when login button is double-clicked
  function checkEasterEgg() {
    clickCount++;
    
    // Reset after 2 seconds of inactivity
    setTimeout(() => {
      if (clickCount >= 4) {
        showEasterEgg = true;
        setTimeout(() => {
          showEasterEgg = false;
        }, 5000);
      }
      clickCount = 0;
    }, 2000);
  }
</script>

<div class="industrial-login-container">
  <form on:submit|preventDefault={handleSubmit}>
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
        placeholder="Enter your password"
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
      on:click={checkEasterEgg}
    >
      {isLoading ? 'Logging in...' : 'Login'}
      {#if clickCount > 0 && clickCount < 4}
        <span class="click-counter">{4 - clickCount} more clicks for a surprise</span>
      {/if}
    </button>
  </form>
  
  {#if showEasterEgg}
    <div class="login-easter-egg">
      <div class="egg-content">
        <h4>You found a secret!</h4>
        <p>Site created by <a href="https://github.com/Maks0101aps" target="_blank">Maks0101aps</a></p>
        <div class="easter-egg-badge">
          <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" alt="GitHub" width="30">
          <span>Maks0101aps</span>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .industrial-login-container {
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
  
  .click-counter {
    position: absolute;
    font-size: 0.7rem;
    bottom: -18px;
    left: 50%;
    transform: translateX(-50%);
    white-space: nowrap;
    color: var(--industrial-accent);
    background-color: rgba(0, 0, 0, 0.7);
    padding: 2px 8px;
    border-radius: 10px;
    opacity: 0.8;
  }
  
  .login-easter-egg {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: var(--industrial-dark);
    padding: 25px;
    border-radius: 10px;
    border: 3px solid var(--industrial-rust);
    box-shadow: 0 0 30px rgba(0, 0, 0, 0.7);
    z-index: 2000;
    max-width: 400px;
    width: 90%;
    animation: appear 0.5s ease-out;
  }
  
  @keyframes appear {
    from { opacity: 0; transform: translate(-50%, -60%); }
    to { opacity: 1; transform: translate(-50%, -50%); }
  }
  
  .egg-content {
    color: white;
    text-align: center;
  }
  
  .egg-content h4 {
    color: var(--industrial-accent);
    margin-bottom: 15px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  
  .egg-content p {
    margin-bottom: 20px;
  }
  
  .egg-content a {
    color: var(--industrial-accent);
    text-decoration: none;
    font-weight: bold;
    transition: color 0.3s;
  }
  
  .egg-content a:hover {
    color: white;
    text-decoration: underline;
  }
  
  .easter-egg-badge {
    display: inline-flex;
    align-items: center;
    background-color: #24292e;
    padding: 8px 15px;
    border-radius: 25px;
    margin-top: 10px;
    transition: transform 0.3s ease;
  }
  
  .easter-egg-badge:hover {
    transform: scale(1.05);
  }
  
  .easter-egg-badge img {
    margin-right: 10px;
  }
  
  .easter-egg-badge span {
    font-weight: bold;
  }
  
  .industrial-alert {
    background-color: rgba(220, 53, 69, 0.2);
    border-color: var(--industrial-rust);
    color: white;
  }
</style> 
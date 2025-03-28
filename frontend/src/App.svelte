<script>
  import { onMount } from 'svelte';
  import Login from './components/Login.svelte';
  import Register from './components/Register.svelte';
  import Gallery from './components/Gallery.svelte';
  
  // State
  let isAuthenticated = false;
  let activeTab = 'login'; // login or register
  let user = null;
  let token = null;
  
  // Check if user is already logged in
  onMount(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      token = storedToken;
      user = JSON.parse(storedUser);
      isAuthenticated = true;
    }
  });
  
  // Handle successful login/registration
  function handleAuth(event) {
    const { user: userData, token: userToken } = event.detail;
    user = userData;
    token = userToken;
    isAuthenticated = true;
    
    // Store in localStorage for persistence
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }
  
  // Handle logout
  function handleLogout() {
    user = null;
    token = null;
    isAuthenticated = false;
    
    // Remove from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
  
  // Switch between login and register tabs
  function switchTab(tab) {
    activeTab = tab;
  }
</script>

<div class="container industrial-container mt-5">
  <div class="header-bar mb-4">
    <div class="metal-plate">
      <h1>INDUSTRIAL IMAGE VAULT 
        <span class="secret-text">
          <a href="https://github.com/Maks0101aps" target="_blank" class="secret-link" title="Created by Maks0101aps">@Maks0101aps</a>
        </span>
      </h1>
    </div>
  </div>

  <main class="container py-4">
    {#if !isAuthenticated}
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card metal-card">
            <div class="card-header rivets-header">
              <ul class="nav nav-tabs card-header-tabs">
                <li class="nav-item">
                  <button 
                    class="nav-link industrial-tab {activeTab === 'login' ? 'active' : ''}" 
                    on:click={() => switchTab('login')}>
                    LOGIN
                  </button>
                </li>
                <li class="nav-item">
                  <button 
                    class="nav-link industrial-tab {activeTab === 'register' ? 'active' : ''}" 
                    on:click={() => switchTab('register')}>
                    REGISTER
                  </button>
                </li>
              </ul>
            </div>
            <div class="card-body">
              {#if activeTab === 'login'}
                <Login on:login={handleAuth} />
              {:else}
                <Register on:register={handleAuth} />
              {/if}
            </div>
          </div>
        </div>
      </div>
    {:else}
      <div class="user-panel mb-4">
        <div class="d-flex justify-content-between align-items-center">
          <h4 class="welcome-text">
            <span class="welding-icon">⚙️</span> 
            WELCOME, {user.username.toUpperCase()}
          </h4>
          <button class="btn btn-danger logout-btn" on:click={handleLogout}>
            <span class="btn-text">LOGOUT</span>
          </button>
        </div>
      </div>
      <Gallery {token} userId={user.id} />
    {/if}
  </main>
</div>

<style>
  .industrial-container {
    min-height: 100vh;
    padding-bottom: 2rem;
  }
  
  .header-bar {
    margin-bottom: 2rem;
    border-bottom: 4px solid var(--industrial-rust);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  }
  
  .metal-plate {
    background-color: var(--industrial-metal);
    background-image: 
      linear-gradient(45deg, var(--industrial-gray) 25%, transparent 25%, transparent 75%, var(--industrial-gray) 75%),
      linear-gradient(-45deg, var(--industrial-gray) 25%, transparent 25%, transparent 75%, var(--industrial-gray) 75%);
    background-size: 10px 10px;
    padding: 10px;
    position: relative;
  }
  
  .metal-plate::before, .metal-plate::after {
    content: "";
    position: absolute;
    height: 10px;
    width: 10px;
    background-color: var(--industrial-rust);
    border-radius: 50%;
    border: 2px solid #111;
    top: 50%;
    transform: translateY(-50%);
  }
  
  .metal-plate::before {
    left: 20px;
  }
  
  .metal-plate::after {
    right: 20px;
  }
  
  h1 {
    color: var(--industrial-accent);
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    letter-spacing: 3px;
    font-size: 2.2rem;
    position: relative;
  }
  
  .secret-text {
    position: absolute;
    top: 0;
    right: 0;
    font-size: 14px;
    border-radius: 5px;
    background-color: var(--industrial-rust);
    padding: 2px 10px;
    opacity: 0.8;
    transition: all 0.3s ease;
    animation: pulse 2s infinite;
    transform: translateY(-50%);
  }
  
  @keyframes pulse {
    0% { opacity: 0.5; transform: translateY(-50%) scale(1); }
    50% { opacity: 0.9; transform: translateY(-50%) scale(1.05); }
    100% { opacity: 0.5; transform: translateY(-50%) scale(1); }
  }
  
  .secret-text:hover {
    opacity: 1;
    transform: translateY(-50%) scale(1.1);
    animation: none;
  }
  
  .secret-link {
    color: var(--industrial-accent);
    text-decoration: none;
    font-weight: bold;
    font-size: 16px;
  }
  
  .secret-link:hover {
    color: white;
  }
  
  .secret-link:after {
    content: " 👈";
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .secret-link:hover:after {
    opacity: 1;
  }
  
  .metal-card {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.6);
    border: 2px solid var(--industrial-metal);
  }
  
  .rivets-header {
    position: relative;
  }
  
  .rivets-header::before, .rivets-header::after,
  .user-panel::before, .user-panel::after {
    content: "";
    position: absolute;
    width: 12px;
    height: 12px;
    background-color: var(--industrial-rust);
    border-radius: 50%;
    border: 2px solid #212529;
    top: 50%;
    transform: translateY(-50%);
  }
  
  .rivets-header::before, .user-panel::before {
    left: 10px;
  }
  
  .rivets-header::after, .user-panel::after {
    right: 10px;
  }
  
  .industrial-tab {
    color: var(--industrial-concrete) !important;
    background-color: transparent !important;
    border-color: var(--industrial-metal) !important;
    letter-spacing: 1px;
    font-weight: 600;
  }
  
  .industrial-tab.active {
    color: var(--industrial-accent) !important;
    background-color: var(--industrial-gray) !important;
    border-bottom-color: var(--industrial-accent) !important;
    border-bottom-width: 2px;
  }
  
  .user-panel {
    background-color: var(--industrial-gray);
    padding: 15px;
    border-radius: 5px;
    border: 1px solid var(--industrial-metal);
    border-left: 5px solid var(--industrial-rust);
    position: relative;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
  }
  
  .welcome-text {
    margin: 0;
    color: var(--industrial-accent);
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .logout-btn {
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
    padding: 8px 20px;
    text-align: center;
  }
  
  .logout-btn::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(45deg, transparent 10%, rgba(255, 255, 255, 0.1) 50%, transparent 90%);
    transform: translateX(-100%);
    transition: all 0.3s ease;
  }
  
  .logout-btn:hover::before {
    transform: translateX(100%);
  }
  
  .btn-text {
    position: relative;
    z-index: 1;
    font-weight: 600;
    letter-spacing: 1px;
  }
</style> 
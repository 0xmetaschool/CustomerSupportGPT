(function() {
  // Get the script element and configuration
  const script = document.currentScript;
  const botId = script.getAttribute('data-bot-id');
  const baseUrl = script.getAttribute('data-base-url');

  // Ensure we have the required configuration
  if (!botId || !baseUrl) {
    console.error('AI Chat Widget: Missing required configuration');
    return;
  }

  // Create container and iframe
  const container = document.createElement('div');
  const iframe = document.createElement('iframe');

  // Set container styles
  container.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 999999;
    width: 400px;
    height: 600px;
    transform: scale(0);
    opacity: 0;
    transform-origin: bottom right;
    transition: transform 0.3s ease, opacity 0.3s ease;
  `;

  // Set iframe styles
  iframe.style.cssText = `
    border: none;
    width: 100%;
    height: 100%;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    background: white;
  `;

  // Create toggle button
  const chatButton = document.createElement('button');
  chatButton.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 60px;
    height: 60px;
    border-radius: 30px;
    background: black;
    color: white;
    border: solid 1px #ffffff;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000000;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
  `;

  // Create close button
  const closeButton = document.createElement('button');
  closeButton.style.cssText = `
    position: absolute;
    top: 12px;
    right: 12px;
    width: 32px;
    height: 32px;
    border-radius: 16px;
    background: #f3f4f6;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.3s ease;
    z-index: 1000001;
    opacity: 0;
    visibility: hidden;
  `;

  // Set iframe source with the correct base URL
  iframe.src = `${baseUrl}/widget/${botId}?clientSecret=${script.getAttribute('data-client-secret')}`;

  // Add elements to DOM
  container.appendChild(iframe);
  container.appendChild(closeButton);
  document.body.appendChild(container);
  document.body.appendChild(chatButton);

  // Set initial button icons
  chatButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="1">
      <path id="Shape" d="M8,17.751a2.749,2.749,0,0,1,5.127-1.382C15.217,15.447,16,14,16,11.25v-3c0-3.992-2.251-6.75-5.75-6.75S4.5,4.259,4.5,8.25v3.5a.751.751,0,0,1-.75.75h-1A2.753,2.753,0,0,1,0,9.751v-1A2.754,2.754,0,0,1,2.75,6h.478c.757-3.571,3.348-6,7.022-6s6.264,2.429,7.021,6h.478a2.754,2.754,0,0,1,2.75,2.75v1a2.753,2.753,0,0,1-2.75,2.75H17.44A5.85,5.85,0,0,1,13.5,17.84,2.75,2.75,0,0,1,8,17.751Zm1.5,0a1.25,1.25,0,1,0,1.25-1.25A1.251,1.251,0,0,0,9.5,17.751Zm8-6.75h.249A1.251,1.251,0,0,0,19,9.751v-1A1.251,1.251,0,0,0,17.75,7.5H17.5Zm-16-2.25v1A1.251,1.251,0,0,0,2.75,11H3V7.5H2.75A1.251,1.251,0,0,0,1.5,8.751Z" transform="translate(1.75 2.25)""/>
    </svg>
  `;

  closeButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  `;

  // Add hover effects
  chatButton.addEventListener('mouseover', () => {
    chatButton.style.transform = 'scale(1.1)';
  });

  chatButton.addEventListener('mouseout', () => {
    chatButton.style.transform = 'scale(1)';
  });

  closeButton.addEventListener('mouseover', () => {
    closeButton.style.background = '#e5e7eb';
  });

  closeButton.addEventListener('mouseout', () => {
    closeButton.style.background = '#f3f4f6';
  });

  // Handle opening and closing
  function openWidget() {
    container.style.transform = 'scale(1)';
    container.style.opacity = '1';
    chatButton.style.opacity = '0';
    chatButton.style.visibility = 'hidden';
    closeButton.style.opacity = '1';
    closeButton.style.visibility = 'visible';
  }

  function closeWidget() {
    container.style.transform = 'scale(0)';
    container.style.opacity = '0';
    chatButton.style.opacity = '1';
    chatButton.style.visibility = 'visible';
    closeButton.style.opacity = '0';
    closeButton.style.visibility = 'hidden';
  }

  chatButton.addEventListener('click', openWidget);
  closeButton.addEventListener('click', closeWidget);

  // Handle mobile responsiveness
  function adjustForMobile() {
    if (window.innerWidth < 768) {
      container.style.width = '100%';
      container.style.height = '100%';
      container.style.bottom = '0';
      container.style.right = '0';
      iframe.style.borderRadius = '0';
    } else {
      container.style.width = '400px';
      container.style.height = '600px';
      container.style.bottom = '20px';
      container.style.right = '20px';
      iframe.style.borderRadius = '10px';
    }
  }

  window.addEventListener('resize', adjustForMobile);
  adjustForMobile();
})(); 
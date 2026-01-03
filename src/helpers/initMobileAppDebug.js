const initMobileAppDebug = ()=> {
  if (typeof window.eruda === 'undefined') {
    // Create a script element
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/eruda';
    script.onload = function() {
      // Initialize Eruda once the script is loaded
      window.eruda.init();
    };
    document.body.appendChild(script);
  }
}

export default initMobileAppDebug

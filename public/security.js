// Client-side Security Enhancements für Bau-Structura
// This script runs early and implements additional security measures

(function() {
  'use strict';

  // Disable right-click context menu in production
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    document.addEventListener('contextmenu', function(e) {
      e.preventDefault();
      return false;
    });

    // Disable F12, Ctrl+Shift+I, Ctrl+U
    document.addEventListener('keydown', function(e) {
      // F12
      if (e.keyCode === 123) {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+Shift+I (DevTools)
      if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+U (View Source)
      if (e.ctrlKey && e.keyCode === 85) {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+S (Save)
      if (e.ctrlKey && e.keyCode === 83) {
        e.preventDefault();
        return false;
      }
    });
  }

  // Helper function for element matching with fallback
  function findClosestElement(element, selector) {
    if (!element) return null;
    
    // Use native closest if available
    if (element.closest) {
      return element.closest(selector);
    }
    
    // Fallback implementation
    const selectors = selector.split(',').map(s => s.trim());
    let current = element;
    
    while (current && current !== document) {
      for (let i = 0; i < selectors.length; i++) {
        const sel = selectors[i];
        if (sel.startsWith('.')) {
          const className = sel.substring(1);
          if (current.classList && current.classList.contains(className)) {
            return current;
          }
        }
      }
      current = current.parentElement;
    }
    
    return null;
  }

  // Content Protection
  document.addEventListener('selectstart', function(e) {
    // Allow text selection for input fields
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.contentEditable === 'true') {
      return true;
    }
    // Disable text selection for sensitive content
    if (findClosestElement(e.target, '.sensitive-content, .admin-panel')) {
      e.preventDefault();
      return false;
    }
  });

  // Prevent drag and drop of sensitive elements
  document.addEventListener('dragstart', function(e) {
    if (findClosestElement(e.target, '.sensitive-content, .admin-panel')) {
      e.preventDefault();
      return false;
    }
  });

  // Console warning for production
  if (window.location.hostname === 'www.bau-structura.de' || window.location.hostname === 'bau-structura.de') {
    console.log('%c🛡️ Bau-Structura Security Notice', 'color: red; font-size: 24px; font-weight: bold;');
    console.log('%cThis is a secure application. Unauthorized access attempts are logged and monitored.', 'color: red; font-size: 16px;');
    console.log('%cIf you need support, contact: support@bau-structura.de', 'color: blue; font-size: 14px;');
  }

  // Session timeout warning
  let sessionWarningShown = false;
  let sessionTimeout = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
  let warningTime = sessionTimeout - (30 * 60 * 1000); // 30 minutes before expiry

  function checkSessionTimeout() {
    const lastActivity = localStorage.getItem('lastActivity');
    if (lastActivity) {
      const timeSinceActivity = Date.now() - parseInt(lastActivity);
      
      if (timeSinceActivity > warningTime && !sessionWarningShown) {
        sessionWarningShown = true;
        if (confirm('Ihre Sitzung läuft in 30 Minuten ab. Möchten Sie die Sitzung verlängern?')) {
          localStorage.setItem('lastActivity', Date.now().toString());
          sessionWarningShown = false;
        }
      }
      
      if (timeSinceActivity > sessionTimeout) {
        alert('Ihre Sitzung ist abgelaufen. Sie werden zur Anmeldung weitergeleitet.');
        window.location.href = '/anmelden';
      }
    }
  }

  // Track user activity
  function updateLastActivity() {
    localStorage.setItem('lastActivity', Date.now().toString());
  }

  // Set initial activity timestamp
  updateLastActivity();

  // Listen for user activity
  ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(function(event) {
    document.addEventListener(event, updateLastActivity, true);
  });

  // Check session every 5 minutes
  setInterval(checkSessionTimeout, 5 * 60 * 1000);

  // Secure storage helpers
  window.SecureStorage = {
    set: function(key, value, encrypt = false) {
      try {
        const data = encrypt ? btoa(JSON.stringify(value)) : JSON.stringify(value);
        sessionStorage.setItem(`bau_${key}`, data);
      } catch (e) {
        console.warn('Failed to store data securely:', e);
      }
    },
    
    get: function(key, decrypt = false) {
      try {
        const data = sessionStorage.getItem(`bau_${key}`);
        if (!data) return null;
        
        return decrypt ? JSON.parse(atob(data)) : JSON.parse(data);
      } catch (e) {
        console.warn('Failed to retrieve data securely:', e);
        return null;
      }
    },
    
    remove: function(key) {
      sessionStorage.removeItem(`bau_${key}`);
    },
    
    clear: function() {
      Object.keys(sessionStorage).forEach(function(key) {
        if (key.startsWith('bau_')) {
          sessionStorage.removeItem(key);
        }
      });
    }
  };

  // Clear sensitive data on page unload
  window.addEventListener('beforeunload', function() {
    // Clear any temporary sensitive data
    SecureStorage.remove('temp_data');
    SecureStorage.remove('form_cache');
  });

  // Detect and report CSP violations
  document.addEventListener('securitypolicyviolation', function(e) {
    console.warn('CSP Violation:', {
      directive: e.violatedDirective,
      blocked: e.blockedURI,
      policy: e.originalPolicy
    });
    
    // In production, you might want to report this to your analytics
    if (window.gtag) {
      gtag('event', 'csp_violation', {
        'directive': e.violatedDirective,
        'blocked_uri': e.blockedURI
      });
    }
  });

  // Initialize security features
  console.log('🔒 Client-side security initialized');

})();
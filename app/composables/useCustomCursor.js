export const useCustomCursor = () => {
  let cursor = null;
  let cleanup = null;

  const initCursor = () => {
    if (process.client) {
      console.log('Initializing custom cursor...');
      
      // Only initialize on desktop devices (devices with hover capability)
      const isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      
      console.log('Is desktop device:', isDesktop);
      
      if (!isDesktop) {
        console.log('Skipping cursor initialization on mobile device');
        return;
      }

      // Create cursor element
      cursor = document.createElement('div');
      cursor.className = 'custom-cursor';
      document.body.appendChild(cursor);
      
      console.log('Custom cursor element created and added to DOM:', cursor);

      // Mouse move handler
      const handleMouseMove = (e) => {
        if (cursor) {
          cursor.style.left = e.clientX + 'px';
          cursor.style.top = e.clientY + 'px';
        }
      };

      // Mouse enter/leave handlers for hover effect
      const handleMouseEnter = (e) => {
        // Check if the target is inside footer image cards
        const isFooterCard = e.target.closest('.relative.transition.duration-300');
        
        if (cursor && (e.target.matches('a, button, [role="button"], .cursor-pointer') || 
            e.target.closest('a, button, [role="button"], .cursor-pointer'))) {
          // Don't apply hover effect on footer cards
          if (!isFooterCard) {
            cursor.classList.add('hover');
          }
        }
        
        // Hide custom cursor on footer cards (they have their own eye cursor)
        if (isFooterCard) {
          cursor.classList.add('hidden-cursor');
        }
      };

      const handleMouseLeave = (e) => {
        if (cursor && e.target && typeof e.target.matches === 'function') {
          if (e.target.matches('a, button, [role="button"], .cursor-pointer') ||
              e.target.closest('a, button, [role="button"], .cursor-pointer')) {
            cursor.classList.remove('hover');
          }

          // Show custom cursor when leaving footer cards
          const isFooterCard = e.target.closest('.relative.transition.duration-300');
          if (isFooterCard) {
            cursor.classList.remove('hidden-cursor');
          }
        }
      };

      // Mouse down/up handlers for click effect
      const handleMouseDown = () => {
        if (cursor) {
          cursor.classList.add('click');
        }
      };

      const handleMouseUp = () => {
        if (cursor) {
          cursor.classList.remove('click');
        }
      };

      // Add event listeners
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseenter', handleMouseEnter, true);
      document.addEventListener('mouseleave', handleMouseLeave, true);
      document.addEventListener('mousedown', handleMouseDown);
      document.addEventListener('mouseup', handleMouseUp);

      // Cleanup function
      cleanup = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseenter', handleMouseEnter, true);
        document.removeEventListener('mouseleave', handleMouseLeave, true);
        document.removeEventListener('mousedown', handleMouseDown);
        document.removeEventListener('mouseup', handleMouseUp);
        if (cursor && cursor.parentNode) {
          cursor.parentNode.removeChild(cursor);
        }
      };
    }
  };

  const destroyCursor = () => {
    if (cleanup) {
      cleanup();
      cleanup = null;
    }
    if (cursor && cursor.parentNode) {
      cursor.parentNode.removeChild(cursor);
      cursor = null;
    }
  };

  return {
    initCursor,
    destroyCursor
  };
};
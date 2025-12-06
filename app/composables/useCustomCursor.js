export const useCustomCursor = () => {
  let cursor = null;
  let cleanup = null;

  const initCursor = () => {
    if (process.client) {
      console.log('Initializing custom cursor...');
      
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

      const handleMouseMove = (e) => {
        if (cursor) {
          cursor.style.left = e.clientX + 'px';
          cursor.style.top = e.clientY + 'px';
        }
      };

      const handleMouseEnter = (e) => {
        if (!e.target || typeof e.target.closest !== 'function' || typeof e.target.matches !== 'function') {
          return;
        }
        
        const isFooterCard = e.target.closest('.relative.transition.duration-300');
        
        if (cursor && (e.target.matches('a, button, [role="button"], .cursor-pointer') || 
            e.target.closest('a, button, [role="button"], .cursor-pointer'))) {
          if (!isFooterCard) {
            cursor.classList.add('hover');
          }
        }
        
        if (isFooterCard) {
          cursor.classList.add('hidden-cursor');
        }
      };

      const handleMouseLeave = (e) => {
        if (!e.target || typeof e.target.closest !== 'function' || typeof e.target.matches !== 'function') {
          return;
        }
        
        if (cursor && (e.target.matches('a, button, [role="button"], .cursor-pointer') || 
            e.target.closest('a, button, [role="button"], .cursor-pointer'))) {
          cursor.classList.remove('hover');
        }
        
        const isFooterCard = e.target.closest('.relative.transition.duration-300');
        if (isFooterCard) {
          cursor.classList.remove('hidden-cursor');
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

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseenter', handleMouseEnter, true);
      document.addEventListener('mouseleave', handleMouseLeave, true);
      document.addEventListener('mousedown', handleMouseDown);
      document.addEventListener('mouseup', handleMouseUp);

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
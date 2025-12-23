
import React from 'react';

export const ICONS = {
  FIRE: (className: string) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className={className}>
      <path d="M19.457 14.125c-.244-.453-.518-.89-.824-1.309.303-.523.511-1.077.625-1.649a.4.4 0 0 0-.585-.411c-.99.53-2.115.867-3.265.952.124-.803.264-1.603.435-2.396.04-.185-.116-.363-.304-.336-1.373.197-2.618.796-3.66 1.748C10.158 9.38 9.07 8 7.337 8c-.612 0-1.18.232-1.608.625.01-.253.021-.506.035-.756.012-.224-.19-.408-.41-.355-1.134.272-2.112.91-2.825 1.83a.4.4 0 0 0 .15.617c.567.24 1.103.543 1.584.904-.263.784-.4 1.62-.4 2.484 0 4.142 3.358 7.5 7.5 7.5s7.5-3.358 7.5-7.5c0-.422-.036-.836-.104-1.242a.4.4 0 0 0-.302-.332z"/>
    </svg>
  ),
  WATER: (className: string) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className={className}>
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  ),
  SLEEP: (className: string) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    </svg>
  ),
  VITAMIN: (className: string) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

import React, { useContext, useEffect } from 'react';
import { ThemeContext } from '../theme.jsx';
import styles from './Layout.module.css';

export default function Layout({ children }) {
  const { theme, toggleTheme } = useContext(ThemeContext);
  useEffect(() => {
    // Parallax for background blobs: update CSS variables on mouse move
    const onMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20; // -10..10
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      document.documentElement.style.setProperty('--blob-x', `${x}px`);
      document.documentElement.style.setProperty('--blob-y', `${y}px`);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);
  return (
    <div className={styles.root} role="main">
      <header className={styles.header} aria-label="Main header">
        <div className={styles.brand}>
          <h1>PathPredict</h1>
          <p className={styles.tag}>AI Route Weather Intelligence</p>
        </div>
        <div className={styles.actions}>
          <button
            className={styles.themeToggle}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            onClick={toggleTheme}
          >
            <span className="icon" aria-hidden>{theme === 'dark' ? '🌙' : '☀️'}</span>
          </button>
        </div>
      </header>

      <div className={styles.content}>{children}</div>

      <footer className={styles.footer} aria-label="Footer">
        <span>© {new Date().getFullYear()} PathPredict</span>
      </footer>
    </div>
  );
}

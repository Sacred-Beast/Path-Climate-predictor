import React, { useState, useRef, useEffect } from 'react';
import styles from './Autocomplete.module.css';

export default function Autocomplete({
  id,
  value,
  onChange,
  onSelect,
  placeholder,
  suggestions = [],
  showSuggestions,
  setShowSuggestions,
  loading
}) {
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    const onClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [setShowSuggestions]);

  // reset active index when suggestions change
  useEffect(() => {
    setActiveIndex(-1);
  }, [suggestions, showSuggestions]);

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((idx) => Math.min(idx + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((idx) => Math.max(idx - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        onSelect(suggestions[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <input
        id={id}
        className={styles.input}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => value && value.length >= 2 && setShowSuggestions(true)}
        aria-autocomplete="list"
        aria-controls={`${id}-listbox`}
        aria-expanded={showSuggestions}
        onKeyDown={handleKeyDown}
      />

      {showSuggestions && (
        <div id={`${id}-listbox`} className={styles.suggestionsDropdown} role="listbox">
          {loading && <div className={styles.loading}>Searching...</div>}
          {!loading && suggestions.length === 0 && (
            <div className={styles.empty}>No results</div>
          )}
          {!loading && suggestions.map((s, i) => (
            <div
              key={i}
              id={`${id}-option-${i}`}
              role="option"
              tabIndex={0}
              aria-selected={i === activeIndex}
              className={
                i === activeIndex ? `${styles.suggestionItem} ${styles.active}` : styles.suggestionItem
              }
              onClick={() => onSelect(s)}
              onKeyDown={(e) => e.key === 'Enter' && onSelect(s)}
              onMouseEnter={() => setActiveIndex(i)}
            >
              <div className={styles.suggestionName}>{s.display_name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

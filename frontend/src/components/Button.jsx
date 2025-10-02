import React from 'react';
import clsx from 'clsx';
import styles from './Button.module.css';

export default function Button({ children, className, loading, ...props }) {
  return (
    <button
      className={clsx(styles.button, className)}
      disabled={loading || props.disabled}
      aria-busy={loading}
      {...props}
    >
      {loading ? <span className={styles.loader} aria-hidden="true"/> : children}
    </button>
  );
}

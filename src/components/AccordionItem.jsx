// src/components/AccordionItem.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './AccordionItem.module.css';

const AccordionItem = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.accordionItem}>
      <button
        className={styles.accordionHeader}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? 'Hide' : 'Show'} {title}
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            className={styles.accordionContent}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className={styles.contentInner}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AccordionItem;

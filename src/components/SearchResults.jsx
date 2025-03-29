// src/components/SearchResults.jsx
import React from 'react';
import { motion } from 'framer-motion';
import styles from './SearchResults.module.css';

const SearchResults = ({ results }) => {
  return (
    <div className={styles.resultsContainer}>
      {results.map((result, index) => (
        <motion.div
          key={result.id || index}
          className={styles.resultItem}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          {result.display}
        </motion.div>
      ))}
    </div>
  );
};

export default SearchResults;

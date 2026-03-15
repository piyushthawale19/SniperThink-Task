import React from 'react';
import StrategyFlow from '../components/StrategyFlow/StrategyFlow';
import styles from './Home.module.css';

const Home = () => {
  return (
    <main className={styles.main}>
      <StrategyFlow />
    </main>
  );
};

export default Home;
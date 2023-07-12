import React from 'react';
import styles from './styles.module.css';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Spacer from '../../../../components/other/Spacer';

const GiveItATryView: React.FC = () => {
  const { siteConfig } = useDocusaurusContext();

  return (
    <div className={styles.Container}>
      <h3 className={styles.Title}>Give it a Try. It's 100% free.</h3>
      <Spacer height={40} />
      <div className={styles.Terminal}>
        <code>
          git clone{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={siteConfig.customFields.npmCoreUrl as any}>
            git@github.com:xmidtao/midtao.git
          </a>
        </code>
      </div>
    </div>
  );
};

export default GiveItATryView;

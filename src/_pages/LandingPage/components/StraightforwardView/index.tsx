import React from 'react';
import styles from './styles.module.css';
import Spacer from '../../../../components/other/Spacer';
import SectionScroller, {
  SectionInterface,
} from './components/SectionScroller';
import PlainButton from '../../../../components/buttons/PlainButton';

const sections: SectionInterface[] = [
  {
    code: `
// 编程基础    
SELECT '算法导论' AS BOOKS, 
['RUST', 'C++', 'PYTHON', 'JAVA'] AS LANGUAGE;
    `,
    codeWithComment: `
// 编程基础    
SELECT '算法导论' AS BOOKS, 
['RUST', 'C++', 'PYTHON', 'JAVA'] AS LANGUAGE;
    `,
    title: '算法之道',
    description: '算法导论结合力扣实战。',
    icon: 'zap',
  },
  {
    code: `
// 数据库类型与存储引擎
SELECT ['OLTP', 'OLAP', 'HTAP'] AS ENGINE, 
['B+TREE', 'LSM-TREE'] AS STORAGE;
    `,
    codeWithComment: `
// 数据库类型与存储引擎
SELECT ['OLTP', 'OLAP', 'HTAP'] AS ENGINE, 
['B+TREE', 'LSM-TREE'] AS STORAGE;
    `,
    title: 'DB 内核之道',
    description: '手撸单机数据库引擎。',
    icon: 'repeat',
  },
  {
    code: `
// 共享文章、想法、代码、Talk
SELECT * FROM SYSTEM.CONTRIBUTOR 
ORDER BY COUNT LIMIT 100;
    `,
    codeWithComment: `
// 共享文章、想法、代码、Talk
SELECT * FROM SYSTEM.CONTRIBUTOR 
ORDER BY COUNT LIMIT 100;
    `,
    title: '生态之道',
    description: 'DB 内核社区人员参与贡献。',
    icon: 'users',
  },
  {
    code: `
// DB 连接器，连接一切资源。
CREATE DATABASE LINK dblink
CONNECT TO remote_user IDENTIFIED BY password
USING 'remote_database';
SELECT * FROM customers@remote_database;
    `,
    codeWithComment: `
// DB 连接器，连接一切资源。
CREATE DATABASE LINK dblink
CONNECT TO remote_user IDENTIFIED BY password
USING 'remote_database';
SELECT * FROM customers@remote
    `,
    title: '连接之道',
    description: '连接一切资源。',
    icon: 'server',
  },
  {
    code: `
// 统计文档个数
SELECT COUNT(*) FROM MIDTAO.DOCS WHERE ID > 0;
    `,
    codeWithComment: `
// 统计文档个数
SELECT COUNT(*) FROM MIDTAO.DOCS WHERE ID > 0;
    `,
    title: '文档之道',
    description: '中道（MidTao）核心资产。',
    icon: 'edit',
  },
];

const StraightforwardView: React.FC = () => {
  return (
    <div className={styles.Container}>
      <div className={styles.Content}>
        <div className={styles.HeaderContainer}>
          <h3 className={styles.Tagline}>为什么你应该学习中道（MidTao）?</h3>
          <h1 className={styles.Title}>简单 & 易懂</h1>
          <Spacer height={20} />
          <p className={styles.Description}>
            中道（MidTao) 研究算法和 DB 内核，理论与实践结合，有系统的理论知识和丰富的实战项目，DB 内核入门的绝佳选择。
          </p>
        </div>
        <Spacer height={60} />
        <SectionScroller sections={sections} startIndex={0} />
        <PlainButton
          to={'docs/introduction'}
          name={'学习更多'}
          className={styles.LearnMoreButton}
        />
      </div>
    </div>
  );
};

export default StraightforwardView;

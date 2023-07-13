const {
  Agile,
  generateId,
  createState,
  createCollection,
  createComputed,
} = require('@agile-ts/core');
const {
  AgileHOC,
  useAgile,
  useWatcher,
  useProxy,
  useSelector,
  useValue,
} = require('@agile-ts/react');
const { Event, useEvent } = require('@agile-ts/event');
const { toast } = require('react-toastify');

const githubOrgUrl = 'https://github.com/xmidtao';
const domain = 'https://midtao.cn';
const npmOrgUrl = 'https://www.npmjs.com/package/@agile-ts';

const customFields = {
  copyright: `Made with  💜 by <a target="_blank" rel="noopener noreferrer" href="https://twitter.com/realxiliu">锡流</a> and <a target="_blank" rel="noopener noreferrer" href="https://github.com/xmidtao/midtao/graphs/contributors">these awesome people</a>`,
  meta: {
    title: 'MidTao(中道) 研究计算机科学之道。',
    image: '/img/meta.png',
    description:
      'MidTao(中道) 研究计算机科学之道, 专注于计算机核心的两个方向算法和数据库内核。',
    color: '#6c69a0',
    keywords: [
      'MidTao',
      'MidTao(中道)',
      '中道',
      'Cloud Native Database',
      '云原生数据库',
      'Serverless Database',
      'Real-Time Database',
      'OLTP',
      'OLAP',
      '分析型数据库',
      '事务型数据库',
      '算法与数据结构',
      'C++',
      'Rust',
      'development',
      'engineering',
    ],
  },
  domain,
  githubOrgUrl,
  githubUrl: `${githubOrgUrl}/midtao`,
  githubDocsUrl: `${githubOrgUrl}/documentation`,
  npmCoreUrl: `${npmOrgUrl}/core`,
  discordUrl: `https://discord.gg/q9wYtV3e`,
  stackoverflowUrl: 'https://stackoverflow.com/questions/tagged/midtao',
  twitterUrl: 'https://twitter.com/xmidtao',
  redditUrl: 'https://www.reddit.com/r/midtao/',
  version: '0.0.1',
  announcementBar: {
    id: 'announcement',
    content: [
      `❓ If you have any questions, don't hesitate to join our <a target="_blank" rel="noopener noreferrer" href="https://discord.gg/q9wYtV3e">Community Discord</a> ️`,
      `🎉 If you like midtao, give us a star on <a target="_blank" rel="noopener noreferrer" href="https://github.com/xmidtao/midtao">GitHub</a>`,
      `⏰ If you want to stay update to date, follow use on <a target="_blank" rel="noopener noreferrer" href="https://twitter.com/midtao">Twitter</a>`,
    ],
    random: false,
    interval: 100000,
  },
  liveCodeScope: {
    Agile,
    createState,
    createCollection,
    createComputed,
    useAgile,
    useProxy,
    useEvent,
    useWatcher,
    useSelector,
    useValue,
    AgileHOC,
    generateId,
    Event,
    toast,
  },
};

const config = {
  title: '中道',
  tagline: 'MidTao(中道) 研究计算机科学之道，研究方向算法和 DB 内核。',
  url: customFields.domain,
  baseUrlIssueBanner: false,
  baseUrl: '/',
  onBrokenLinks: 'throw',
  favicon: 'img/favicon.ico',
  organizationName: 'MidTao',
  projectName: 'https://github.com/xmidtao/midtao/',
  themes: ['@docusaurus/theme-live-codeblock'],
  scripts: [{ src: 'https://snack.expo.io/embed.js', async: true }], // https://github.com/expo/snack/blob/main/docs/embedding-snacks.md
  plugins: [
    'docusaurus-plugin-sass',
    // @docusaurus/plugin-google-analytics (Not necessary because it automatically gets added)
  ],
  customFields: { ...customFields },
  themeConfig: {
    hideableSidebar: false,
    // https://docusaurus.io/docs/search#using-algolia-docsearch
    algolia: {
      appId: 'DJQWJI5LDM',
      apiKey: '4597cf039c9ed7dc3ce717b5bc4caa4a',
      indexName: 'midtao-index',
    },
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: false,
    },
    // image: '/img/meta.png', // Gets used in Head as Meta Image (og:image)
    prism: {
      theme: require('prism-react-renderer/themes/github'),
      darkTheme: require('prism-react-renderer/themes/dracula'),
      defaultLanguage: 'javascript',
    },
    navbar: {
      title: ' ',
      hideOnScroll: true,
      logo: {
        alt: 'My Site Logo',
        src: 'img/logo.svg',
      },
      items: [
        // left
        {
          label: '快速启动',
          position: 'left',
          items: [
            {
              label: '简介',
              to: '/docs/Introduction/',
            },
            {
              label: 'Code',
              to: '/docs/quick-start/code/',
            },
            {
              label: 'React',
              to: '/docs/quick-start/react/',
            },
            {
              label: 'Style Guide',
              to: '/docs/style-guide/',
            },
            {
              label: 'Examples',
              to: '/docs/examples/',
            },
          ],
        },
        {
          label: '算法',
          position: 'left',
          items: [
            {
              label: '简介',
              to: '/docs/algorithm/Introduction/',
            },
            {
              label: '力扣',
              to: '/docs/algorithm/leetcode',
            },
            {
              label: '剑指 Offer',
              to: '/docs/algorithm/offer',
            },
            {
              label: '刻练库1',
              to: '/docs/algorithm/testbank1',
            },
            {
              label: '刻练库2',
              to: '/docs/algorithm/testbank2',
            },
            {
              label: '实战库',
              to: '/docs/algorithm/realbank',
            },
          ],
        },
        {
          label: 'DB',
          position: 'left',
          items: [
            {
              label: '简介',
              to: '/docs/database/Introduction/',
            },
            {
              label: '执行引擎',
              to: '/docs/database/execution-engine',
            },
            {
              label: '存储引擎',
              to: '/docs/database/storage-engine',
            },
          ],
        },
        {
          label: '社区',
          position: 'left',
          items: [
            {
              label: 'GitHub',
              href: customFields.githubUrl,
            },
            {
              label: 'Discord',
              href: customFields.discordUrl,
            },
            {
              label: 'Stack Overflow',
              href: customFields.stackoverflowUrl,
            },
            {
              label: 'Twitter',
              href: customFields.twitterUrl,
            },
            {
              label: 'Reddit',
              href: customFields.redditUrl,
            },
          ],
        },
        {
          label: '文档',
          position: 'left',
          to: 'docs/introduction',
        },
      ],
    },
    footer: {
      copyright: customFields.copyright,
      style: 'dark',
      links: [
        {
          title: '文档',
          items: [
            {
              label: '快速启动',
              to: 'docs/introduction',
            },
            {
              label: '示例',
              to: 'docs/examples',
            },
            {
              label: '算法',
              to: 'docs/algorithm/introduction',
            },
          ],
        },
        {
          title: '社区',
          items: [
            {
              label: 'GitHub',
              href: customFields.githubUrl,
            },
            {
              label: 'Stack Overflow',
              href: customFields.stackoverflowUrl,
            },
            {
              label: 'Discord',
              href: customFields.discordUrl,
            },
            {
              label: 'Twitter',
              href: customFields.twitterUrl,
            },
          ],
        },
        {
          title: '更多',
          items: [
            {
              label: '博客',
              to: '/blog/',
            },
          ],
        },
      ],
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          path: 'docs',
          admonitions: {
            icons: 'emoji',
          },
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: `${customFields.githubDocsUrl}/tree/main`,
          showLastUpdateAuthor: false,
          showLastUpdateTime: true,
          remarkPlugins: [
            [require('@docusaurus/remark-plugin-npm2yarn'), { sync: true }],
          ],
        },
        blog: {
          showReadingTime: true,
          editUrl: `${customFields.githubDocsUrl}/tree/main`,
        },
        theme: {
          customCss: [require.resolve('./src/css/custom.scss')],
        },
        googleAnalytics: {
          trackingID: 'UA-189394644-1',
          anonymizeIP: true, // Should IPs be anonymized?
        },
      },
    ],
  ],
};

module.exports = { ...config };

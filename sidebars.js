module.exports = {
  docs: [
    {
      type: 'category',
      label: '中道',
      collapsed: false,
      items: [
        'main/introduction',
        'main/installation',
        'main/style-guide',
        'main/frameworks',
        'main/contributing',
      ],
    },
    {
      type: 'category',
      label: '快速启动',
      collapsed: true,
      items: ['quick_start/system', 'quick_start/code', 'quick_start/vue'],
    },
     {
      type: 'category',
      label: '算法',
      collapsed: true,
      items: [
          'algorithm/introduction',
          'algorithm/leetcode',
          'algorithm/offer',
          'algorithm/testbank1',
          'algorithm/testbank2',
          'algorithm/realbank'
        ],
    },
    {
      type: 'category',
      label: 'DB',
      collapsed: true,
      items: [
          'database/introduction',
          'database/execution-engine',
          'database/storage-engine',
        ],
    },
    {
      type: 'category',
      label: 'Panda',
      collapsed: true,
      items: [
        'panda/introduction',
        {
          type: 'category',
          label: '优化器',
          items: [
            'panda/optimizer/introduction',
            'panda/optimizer/architecture',
            {
              type: 'category',
              label: '实现',
              items: [
                'panda/optimizer/impl/frameworks',
                'panda/optimizer/impl/rbo',
                'panda/optimizer/impl/cbo',
              ],
            },
          ]
        }
      ],
    },
    {
      type: 'category',
      label: 'Postgres',
      collapsed: true,
      items: [
        'packages/introduction',
        'packages/installation',
        {
          type: 'category',
          label: 'core',
          collapsed: false,
          items: [
            'packages/core/introduction',
            'packages/core/installation',
            {
              type: 'category',
              label: 'Guides',
              items: [
                'packages/core/guides/typescript',
                'packages/core/guides/debugging',
                'packages/core/guides/testing',
              ],
            },
            {
              type: 'category',
              label: 'API',
              items: [
                {
                  type: 'category',
                  label: 'Agile Instance',
                  items: [
                    'packages/core/api/agile-instance/introduction',
                    'packages/core/api/agile-instance/properties',
                    'packages/core/api/agile-instance/methods',
                  ],
                },
                {
                  type: 'category',
                  label: 'State',
                  items: [
                    'packages/core/api/state/introduction',
                    'packages/core/api/state/properties',
                    'packages/core/api/state/methods',
                  ],
                },
                {
                  type: 'category',
                  label: 'Collection',
                  items: [
                    'packages/core/api/collection/introduction',
                    'packages/core/api/collection/methods',
                    'packages/core/api/collection/properties',
                    {
                      type: 'category',
                      label: 'Group',
                      items: [
                        'packages/core/api/collection/group/introduction',
                        'packages/core/api/collection/group/methods',
                        'packages/core/api/collection/group/properties',
                      ],
                    },
                    {
                      type: 'category',
                      label: 'Selector',
                      items: [
                        'packages/core/api/collection/selector/introduction',
                        'packages/core/api/collection/selector/methods',
                        'packages/core/api/collection/selector/properties',
                      ],
                    },
                  ],
                },
                {
                  type: 'category',
                  label: 'Computed',
                  items: [
                    'packages/core/api/computed/introduction',
                    'packages/core/api/computed/methods',
                    'packages/core/api/computed/properties',
                  ],
                },
                {
                  type: 'category',
                  label: 'Storage',
                  items: [
                    'packages/core/api/storage/introduction',
                    'packages/core/api/storage/persisting-data',
                  ],
                },
                'packages/core/api/integration/introduction',
              ],
            },
          ],
        },
        {
          type: 'category',
          label: 'react',
          items: [
            'packages/react/introduction',
            'packages/react/installation',
            {
              type: 'category',
              label: 'API',
              items: [
                'packages/react/api/hooks',
                'packages/react/api/agileHOC',
              ],
            },
          ],
        },
        {
          type: 'category',
          label: 'vue',
          items: ['packages/vue/introduction', 'packages/vue/installation'],
        },
        {
          type: 'category',
          label: 'logger',
          items: [
            'packages/logger/introduction',
            'packages/logger/installation',
          ],
        },
        {
          type: 'category',
          label: '⚠️ WIP',
          items: [
            {
              type: 'category',
              label: '⚠️ api',
              items: ['packages/api/introduction', 'packages/api/installation'],
            },
            {
              type: 'category',
              label: '⚠️ event',
              items: [
                'packages/event/introduction',
                'packages/event/installation',
                {
                  type: 'category',
                  label: 'API',
                  items: ['packages/event/api/hooks'],
                },
              ],
            },
            {
              type: 'category',
              label: '⚠️ multieditor',
              items: [
                'packages/multieditor/introduction',
                'packages/multieditor/installation',
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'MySQL',
      collapsed: true,
      items: [
        'mysql/introduction',
        'mysql/basic/installation',
        'mysql/react/introduction',
        'mysql/react-native/introduction',
        'mysql/vue/introduction',
      ],
    },
    {
      type: 'category',
      label: 'Velox',
      collapsed: true,
      items: [
        'velox/introduction',
      ],
    },
       {
      type: 'category',
      label: '其他',
      collapsed: true,
      items: [
        'other/diyhost',
      ],
    },
    'interfaces',
  ],
};

'use strict';

const React = require('react');
const {Box, Text} = require('ink');
const BigText = require('ink-big-text');
const Gradient = require('ink-gradient');
const SelectInput = require('ink-select-input').default;
const open = require('open');

const handleSelect = item => {
  if (item.url) {
    open(item.url);
  }

  if (item.action) {
    item.action();
  }
};

const createItems = items => {
  for (const item of items) {
    item.key = item.url || item.label;
  }

  return items;
};

const items = createItems([
  {
    label: '🌎  Website',
    url: 'https://jarv.is/'
  },
  {
    label: '📝  Blog',
    url: 'https://jarv.is/notes/'
  },
  {
    label: '💾  GitHub',
    url: 'https://github.com/jakejarvis'
  },
  {
    label: '🐦  Twitter',
    url: 'https://twitter.com/intent/user?screen_name=jakejarvis'
  },
  {
    label: '📬  Email',
    url: 'mailto:jake@jarv.is'
  },
  {
    label: '🔐  PGP Key',
    url: 'https://jrvs.io/pubkey'
  },
  {
    label: '👔  Résumé (PDF)',
    url: 'https://jrvs.io/resume'
  },
  {
    label: '🐼  Panda Party',
    url: 'https://nationalzoo.si.edu/webcams/panda-cam#maincontent'
  },
  {
    label: '🚪  Quit',
    action() {
      process.exit();
    }
  }
]);

const menu = () => (
  <Box flexDirection="column">
    <Gradient name="pastel">
      <BigText text="Jake Jarvis"/>
    </Gradient>
    <Box marginBottom={1}>
    <Text>                 Front-End Developer • Bostonian • Freelance Open-Sourcerer</Text>
    </Box>
    <SelectInput items={items} onSelect={handleSelect}/>
  </Box>
);

module.exports = menu;

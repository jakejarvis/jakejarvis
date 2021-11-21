#!/usr/bin/env node

const { render, Box, Text } = require("ink");
const BigText = require("ink-big-text");
const Gradient = require("ink-gradient");
const SelectInput = require("ink-select-input").default;
const open = require("open");

const handleSelect = (item) => {
  if (item.url) {
    open(item.url);
  }

  if (item.action) {
    item.action();
  }
};

const createItems = (items) => {
  for (const item of items) {
    item.key = item.url || item.label;
  }

  return items;
};

const items = createItems([
  {
    label: "🏡  Website",
    url: "https://jarv.is/",
  },
  {
    label: "📝  Blog",
    url: "https://jarv.is/notes/",
  },
  {
    label: "💾  GitHub",
    url: "https://github.com/jakejarvis",
  },
  {
    label: "🐦  Twitter",
    url: "https://twitter.com/intent/user?screen_name=jakejarvis",
  },
  {
    label: "📬  Email",
    url: "https://jarv.is/contact/",
  },
  {
    label: "🔐  PGP Key",
    url: "https://jrvs.io/pubkey",
  },
  {
    label: "🐼  Panda Party",
    url: "https://nationalzoo.si.edu/webcams/panda-cam#maincontent",
  },
  {
    label: "🚪  Quit",
    action() {
      process.exit();
    },
  },
]);

const Menu = () => (
  <Box flexDirection="column" marginTop={1}>
    <Box flexDirection="column" alignItems="center">
      <Gradient name="pastel">
        <BigText text="Jake Jarvis" font="simple" space={false} />
      </Gradient>
      <Box marginY={1}>
        <Text>Front-End Developer • Bostonian • Freelance Open-Sourcerer</Text>
      </Box>
    </Box>
    <Box marginLeft={1}>
      <SelectInput items={items} onSelect={handleSelect} />
    </Box>
  </Box>
);

render(<Menu />);

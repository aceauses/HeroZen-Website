module.exports = {
  testEnvironment: "jsdom",
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest', // Include .js files for Babel
  },
  transformIgnorePatterns: [
    "node_modules/(?!react/)",
  ],
};

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [2, 'always', [
      'feed',
      'nav',
      'ui',
      'storage',
      'api',
      'accessibility',
      'test',
      'deps',
      'config'
    ]],
    'type-enum': [2, 'always', [
      'feat',
      'fix',
      'docs',
      'style',
      'refactor',
      'perf',
      'test',
      'chore',
      'ci'
    ]],
    'subject-case': [2, 'always', 'lower-case'],
    'body-max-line-length': [2, 'always', 100]
  }
};
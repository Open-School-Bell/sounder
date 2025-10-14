import {defineConfig} from 'vitest/config'

export default defineConfig({
  test: {
    maxConcurrency: 1,
    coverage: {
      provider: 'v8', // or 'v8'
      exclude: [
        'lib',
        'generated',
        'eslint.config.mjs',
        'prettier.config.cjs',
        'vitest.config.ts'
      ]
    }
  }
})

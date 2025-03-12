import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    dir: './',
    include: ['**/tests/*.test.ts'],
    environment: 'node',
    globals: true,
    typecheck: {
      tsconfig: './tsconfig.json',
      enabled: true,
    },
  },
});

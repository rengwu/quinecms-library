import { defineConfig } from 'vitest/config';
import { resolve, dirname } from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
export default defineConfig({
  server: {
    fs: { allow: [resolve('.'), dirname(require.resolve('quinecms/package.json'))] },
  },
  resolve:{alias:[{find:/^quinecms\/(core|editor)\/(.*)$/,replacement:resolve('.quinecms/site/.quinecms/workspace/src')+'/$1/$2'}]},
  test:{include:['tests/*.test.ts'],environment:'node'},
});

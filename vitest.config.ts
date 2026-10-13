import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';
export default defineConfig({
  resolve:{alias:[{find:/^quinecms\/(core|editor)\/(.*)$/,replacement:resolve('.quinecms/site/.quinecms/workspace/src')+'/$1/$2'}]},
  test:{include:['tests/*.test.ts'],environment:'node'},
});

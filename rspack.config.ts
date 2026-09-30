// ./rspack.config.ts

import path from 'node:path';
import { existsSync } from 'node:fs';
import { rspack, type Configuration } from '@rspack/core';
import { production } from './scripts/production';

// 后续剧情模块沿用相同的入口目录，不必调整打包配置。
const entryNames = ['module', 'script', 'game', 'preload', 'earlyload', 'inject_early'] as const;
const rootDir = import.meta.dirname;

export default (_env: unknown, argv: { mode?: string }): Configuration => {
  const entry = Object.fromEntries(entryNames.map(name => [name, path.join(rootDir, 'src', name, 'main.ts')] as const).filter(([, file]) => existsSync(file)));
  if (!Object.keys(entry).length) throw new Error('No rspack entries found in src/<entry>/main.ts.');

  const config: Configuration = {
    entry,
    output: {
      path: path.resolve(rootDir, 'dist'),
      filename: '[name].js',
      clean: true
    },
    devtool: argv.mode === 'production' ? false : 'inline-source-map',
    resolve: {
      extensions: ['.ts', '.js', '.twee'],
      alias: { '@': path.join(rootDir, 'src') }
    },
    module: {
      rules: [
        { test: /\.(css|md|twee|ya?ml)$/, type: 'asset/source' },
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: {
            loader: 'builtin:swc-loader',
            options: { jsc: { parser: { syntax: 'typescript' } }, env: { targets: '> 0.5%, not dead, not ie 11' } }
          },
          type: 'javascript/auto'
        }
      ]
    },
    performance: { hints: false }
  };
  return argv.mode === 'production' ? { ...config, ...production(rspack) } : config;
};

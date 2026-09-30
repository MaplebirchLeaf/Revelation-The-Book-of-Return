// ./src/module/Module.ts

import { version } from './constants';

/** 先注册模块的当前存档状态，再注册其他运行时钩子。 */
abstract class Module {
  public log!: (message: string, level?: string, ...objects: unknown[]) => void;
  public readonly version: string;
  protected readonly migration: ReturnType<typeof maplebirch.tool.migration.create>;

  protected constructor(
    readonly core: typeof maplebirch,
    private readonly name: string,
    private readonly defaults: object,
    targetVersion = version
  ) {
    this.version = targetVersion;
    this.migration = core.tool.migration.create();
    this.migration.add('*', this.version, (data, utils) => utils.fill(data, clone(this.defaults) as Record<string, unknown>));
  }

  public preInit(): void {
    this.core.on(':variable', () => {
      V[this.name] ??= {};
      this.migration.run(V[this.name], this.version);
      this.migration.utils.fill(V[this.name], clone(this.defaults) as Record<string, unknown>);
    });
  }
}

export default Module;

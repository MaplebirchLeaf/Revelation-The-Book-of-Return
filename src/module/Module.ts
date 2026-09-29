// ./src/module/Module.ts

import { version } from './constants';

/** Registers a module's current-save state before its other runtime hooks. */
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

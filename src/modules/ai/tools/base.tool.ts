import { StructuredTool } from 'langchain/tools';

export abstract class BaseTool extends StructuredTool {
  constructor() {
    super();
  }
  protected _config: any;
  public setConfig(config?: any) {
    this._config = config;
  }
  public getConfig() {
    return this._config;
  }

  public clone(config?: any): this {
    // Create a new instance of the same class
    // const clone = new (this.constructor as { new() })();
    const clone = Object.assign(
      Object.create(Object.getPrototypeOf(this)),
      this,
    );
    clone._config = config;
    return clone;
  }
}

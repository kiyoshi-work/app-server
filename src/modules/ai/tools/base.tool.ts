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

  protected loadingResponse = (action: string, callback?: any) => {
    if (callback) {
      callback({
        type: 'loading',
        text: action,
      });
    }
  };
  public clone(config?: any): this {
    // Create a new instance of the same class
    // const clone = Object.create(this);
    // const clone = new (this.constructor as { new() })();
    const clone = Object.assign(
      Object.create(Object.getPrototypeOf(this)),
      this,
    );
    clone._config = config;
    return clone;
  }
}

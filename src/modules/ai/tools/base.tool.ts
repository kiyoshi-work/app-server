import { Tool } from "langchain/tools";

export abstract class BaseTool extends Tool {
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
    const clone = Object.create(this);
    clone._config = config;
    return clone;
  }
}

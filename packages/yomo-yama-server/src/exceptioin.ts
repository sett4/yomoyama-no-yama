export interface ErrorBase extends Error {
  readonly name: string
  readonly message: string
  readonly stack: string
}
export interface ErrorBaseConstructor {
  new (message: string): ErrorBase
  readonly prototype: ErrorBase
}

export class ErrorBase {
  public constructor(message: string) {
    Object.defineProperty(this, "name", {
      get: () => (this.constructor as any).name,
    })
    Object.defineProperty(this, "message", {
      get: () => message,
    })
    Error.captureStackTrace(this, this.constructor)
  }
}
;(ErrorBase as any).prototype = Object.create(Error.prototype)
ErrorBase.prototype.constructor = ErrorBase

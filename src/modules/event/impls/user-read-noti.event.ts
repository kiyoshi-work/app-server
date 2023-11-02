export class UserReadNotiEvent {
  constructor(
    public readonly client_uid: string,
    public readonly client_id: string,
    public readonly type?: string,
  ) {}
}

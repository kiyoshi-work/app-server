export class SendNotiAllEvent {
  constructor(
    public readonly onesignalAppId: string,
    public readonly onesignalApiKey: string,
    public readonly client_id: string,
    public readonly title: string,
    public readonly content: string,
    public readonly launch_url?: string,
    public readonly content_html?: string,
    public readonly is_logged_db?: boolean,
    public readonly type?: string,
  ) {}
}

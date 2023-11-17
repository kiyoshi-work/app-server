export type ITags = Record<string, string | number>;

// ============= USER =============

export interface IParamsGetUsers {
  appId: string;
  apiKey: string;
  limit: number;
  offset?: number;
}

export interface IParamsCreateUser {
  userId: string;
  tags: string[];
}

export interface IBodyCreateUser {
  properties: {
    tags: ITags;
  };
  identity: {
    external_id: string;
  };
}

export interface IResponseCreateUser {
  properties: {
    tags: ITags;
  };
  identity: {
    external_id: string;
    onesignal_id: string;
  };
}

export interface IParamsAddTags {
  userId: string;
  tags: string[];
}

export interface IBodyAddTags {
  tags: ITags;
}

export interface IResponseEditTags {
  success: boolean;
}

// ============= NOTIFICATION =============
export interface IParamsSendToUser {
  title: string;
  content: string;
  tag: {
    key: string;
    value: string | number;
  };
  launchUrl?: string;
}
export interface IParamsSendNotificationByTags {
  title: string;
  content: string;
  tag: {
    key: string;
    value: string | number;
  };
  launchUrl?: string;
}
export interface IBodySendNotificationByTags {
  app_id: string;
  contents: {
    en: string;
  };
  headings: {
    en: string;
  };
  filters: {
    field: 'tag';
    key: string;
    relation: '>' | '<' | '=' | '!=';
    value: string | number;
  }[];
  url?: string;
}

export interface IResponseSendNotificationByTags {
  id: string;
}

export interface IParamsSendNotificationByExternalIds extends IOnesignalConfig {
  externalIds: string[];
  title: string;
  content: string;
  launchUrl?: string;
}

export interface IOnesignalConfig {
  onesignalAppId: string;
  onesignalApiKey: string;
}
export interface IPBodySendNotificationByExternalIds {
  app_id: string;
  contents: {
    en: string;
  };
  headings: {
    en: string;
  };
  target_channel: 'push';
  include_aliases: {
    external_id: string[];
  };
  url?: string;
}

export interface IParamsSendToAll extends IOnesignalConfig {
  title: string;
  content: string;
  launchUrl?: string;
}

export interface IPBodySendToAll {
  app_id: string;
  contents: {
    en: string;
  };
  headings: {
    en: string;
  };
  target_channel: 'push';
  included_segments: ['All'];
  url?: string;
}

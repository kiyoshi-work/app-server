import { MessageMenu, PhotoMenu } from '../types/menu';

export type PageResponse = {
  text: string;
  menu: MessageMenu;
};

export type PhotoResponse = {
  photo: any;
  menu: PhotoMenu;
};

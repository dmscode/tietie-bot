export interface MessageToSend {
  clientName: string;
  text: string;
  chatId: string;

  mediaType?: 'sticker' | 'photo' | 'video' | 'file';
  mediaUrl?: string;
  mediaMimeType?: string;
  mediaSize?: number;
  messageIdReplied?: string;

  rawMessageExtra?: any;
}

export interface MessageToEdit extends MessageToSend {
  messageId: string;
  hideEditedFlag?: boolean;
}

export interface GenericMessage<T = any, U = any> {
  clientName: string;
  text: string;
  userId: string;
  userName: string;
  chatId: string;
  messageId: string;
  unixDate: number;

  isServiceMessage?: boolean;
  mediaType?: 'sticker' | 'photo' | 'video' | 'file';
  mediaUrl?: string;
  mediaMimeType?: string;
  mediaSize?: number;
  messageIdReplied?: string;

  rawMessage: T;
  rawUser: U;
  rawMessageReplied?: T;
}

export interface GenericClient<T = any, U = any, V = {}> {
  start(): Promise<void>;
  stop(): Promise<void>;

  on(eventName: 'message', handler: (message: GenericMessage<T, U>, rawContext?: any) => void): void;
  on(eventName: 'edit-message', handler: (message: GenericMessage<T, U>) => void): void;

  sendMessage(message: MessageToSend): Promise<GenericMessage<T, U>>;
  editMessage(message: MessageToEdit): Promise<void>;
  tryExecuteCommand?(text: string, chatId: string): Promise<void>;
  setCommandList?(commandList: { command: string; description: string }[]): Promise<void>;
}

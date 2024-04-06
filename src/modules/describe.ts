import { CommonMessageBundle, Message, User } from 'telegraf/typings/core/types/typegram';
import { IBot } from 'typings';

const formatUser = async (user: User) => {
  return `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username;
}

export const tryDescribeMessage = async (message: CommonMessageBundle, bot: IBot, userFormatter = formatUser) => {
  const tryExtractUserFromMessage = async (message: Message) => {
    if (!message.from) return '';
    if (message.from.username === bot.botInfo!.username && (message as Message.TextMessage).text.includes(': ')) {
      return (message as Message.TextMessage).text.split(': ')[0];
    }
    return await formatUser(message.from);
  };

  const tryDescribe = (
    type: string,
    descriptor: string | ((entity: any) => string | Promise<string>)
  ) => {
    if (!(type in message)) return '';
    if (typeof descriptor === 'string') return `[${ descriptor }] `;
    const result: any = descriptor((message as any)[type]);
    if (typeof result !== 'object' || !result || !('then' in result) || typeof result.then !== 'function') {
      return result;
    }
    return result.then((str: any) => `[${str}] `);
  };

  return [
    await userFormatter(message.from ?? {} as any),
    ': ',
    await tryDescribe('forward_from', async () => `转发自：${await tryExtractUserFromMessage(message)}`),
    await tryDescribe('reply_to_message', async (repliedMessage) => `回复给：${await tryExtractUserFromMessage(repliedMessage)}`),
    await tryDescribe('via_bot', async (viaBot) => `发送自：${await formatUser(viaBot)}`),

    tryDescribe('audio', '音频'),
    tryDescribe('document', (file) => `文件：${file.file_name ?? '未知文件'}`),
    tryDescribe('animation', 'GIF'),
    tryDescribe('photo', '图片'),
    tryDescribe('sticker', (sticker) => `贴纸：${sticker.set_name ?? '无贴纸包'}`),
    tryDescribe('video', '视频'),
    tryDescribe('video_note', '即时视频'),
    tryDescribe('voice', (voice) => `语音：${voice.duration}s`),
    tryDescribe('contact', (contact) => `联系人: ${[contact.first_name, contact.last_name ?? ''].join(' ').trim()}`),
    tryDescribe('dice', (dice) => `骰子：${dice.emoji} - 掷出了 ${dice.value} 点`),
    tryDescribe('game', '小游戏'),
    tryDescribe('poll', (poll) => `投票：${poll.question}`),
    tryDescribe('location', (location) => `位置: ${location.latitude},${location.longitude}`),
    tryDescribe('venue', (venue) => `位置: ${venue.title}`),

    'text' in message ? message.text : 'caption' in message ? message.caption : '',
  ].join('').trim();
};

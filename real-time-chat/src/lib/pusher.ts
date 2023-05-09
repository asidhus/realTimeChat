import PusherServer from 'pusher';
import { checkEnvVariables } from './utils';

export const pusherServer = new PusherServer({
  appId: `${checkEnvVariables('PUSHER_APP_ID')}`,
  key: `${checkEnvVariables('NEXT_PUBLIC_PUSHER_APP_KEY')}`,
  secret: `${checkEnvVariables('PUSHER_APP_SECRET')}`,
  cluster: 'us2',
  useTLS: true,
});

import PusherClient from 'pusher-js';

export const pusherCient = new PusherClient(
  'b3c57c0df68db2651899',
  {
    cluster: 'us2',
  },
);

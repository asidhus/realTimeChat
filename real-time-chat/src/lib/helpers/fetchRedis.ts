import { checkEnvVariables } from '../utils';

type Command = 'zrange' | 'sismember' | 'get' | 'smembers' | 'sadd' | 'srem' | 'zadd';

export async function fetchRedis(
  command: Command,
  ...args: (string | number)[]
) {
  const commandUrl = `${checkEnvVariables('UPSTASH_REDIS_REST_URL')}/${command}/${args.join('/')}`;

  const response = await fetch(commandUrl, {
    headers: {
      Authorization: `Bearer ${checkEnvVariables('UPSTASH_REDIS_REST_TOKEN')}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Error executing Redis command: ${response.statusText}`);
  }

  const data = await response.json();
  return data.result;
}

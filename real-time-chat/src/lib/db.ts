import { Redis } from '@upstash/redis';
import { checkEnvVariables } from './utils';

const redis = new Redis({
  url: `${checkEnvVariables('UPSTASH_REDIS_REST_URL')}`,
  token: `${checkEnvVariables('UPSTASH_REDIS_REST_TOKEN')}`,
});
export default redis;

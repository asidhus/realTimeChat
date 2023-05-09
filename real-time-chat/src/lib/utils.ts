export function checkEnvVariables(envVar:string): string | Error | undefined {
  if (!process.env[envVar]) {
    throw new Error(`Missing env variable: ${envVar}`);
  }
  return process.env[envVar];
}

export function convertPusherKey(key: string) {
  return key.replace(/:/g, '__');
}

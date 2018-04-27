import 'reflect-metadata';

export function getGlobalMeta<T>(key: string | symbol): T | undefined {
  return Reflect.getMetadata(key, Reflect);
}

export function setGlobalMeta(key: string | symbol, value: any, source: object): void {
  Reflect.defineMetadata(key, value, Reflect);
}

export function extractMeta<T> (key: string | symbol, source: object): T | undefined {
  return Reflect.getMetadata(key, source);
}

export function setMeta(key: string | symbol, value: any, source: object): void {
  Reflect.defineMetadata(key, value, source);
}
import { convertFileSrc as tauriConvertFileSrc, invoke as tauriInvoke } from "@tauri-apps/api/core";

type TestApi = {
  invoke?: <T>(command: string, args?: Record<string, unknown>) => T | Promise<T>;
  convertFileSrc?: (filePath: string) => string;
};

declare global {
  interface Window {
    __REPOTUTOR_STUDIO_TEST_API__?: TestApi;
  }
}

function testApi(): TestApi | undefined {
  if (typeof window === "undefined") return undefined;
  return window.__REPOTUTOR_STUDIO_TEST_API__;
}

export async function invoke<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  const mockedInvoke = testApi()?.invoke;
  if (mockedInvoke) return mockedInvoke<T>(command, args);
  return tauriInvoke<T>(command, args);
}

export function convertFileSrc(filePath: string): string {
  const mockedConvertFileSrc = testApi()?.convertFileSrc;
  if (mockedConvertFileSrc) return mockedConvertFileSrc(filePath);
  return tauriConvertFileSrc(filePath);
}

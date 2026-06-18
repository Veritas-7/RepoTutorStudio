export function encodedPath(filePath: string): string {
  return filePath.split("/").map(encodeURIComponent).join("/");
}

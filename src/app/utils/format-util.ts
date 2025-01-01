const supportedFormats = [".mp3", ".wav", ".ogg", ".flac", ".raw"];

export function isFileFormatSupported(fileName: string): boolean {
  let result = false;
  supportedFormats.forEach((format) => {
    if (fileName.toLowerCase().endsWith(format)) {
      result = true;
    }
  });
  return result;
}

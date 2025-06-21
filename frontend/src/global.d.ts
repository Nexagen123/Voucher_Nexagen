// TypeScript declaration for File System Access API
interface Window {
  showSaveFilePicker?: (options?: SaveFilePickerOptions) => Promise<any>;
}

declare var window: Window;

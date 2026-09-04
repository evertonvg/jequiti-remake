import DisableDevtool from 'disable-devtool';

declare global {
  interface Window {
    __DISABLE_DEVTOOL_SUSPEND__?: boolean;
  }
}

export function initDisableDevtool(): void {
  DisableDevtool({
    url: 'https://letmegooglethat.com/?q=are+you+studid%3F',
  });

  if (window.__DISABLE_DEVTOOL_SUSPEND__) {
    DisableDevtool.isSuspend = true;
  }
}

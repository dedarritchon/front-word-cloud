import { createContext } from 'react';
import type { WebViewContext } from '@frontapp/plugin-sdk/dist/webViewSdkTypes';

export const FrontContext = createContext<WebViewContext | undefined>(undefined);

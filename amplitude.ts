// amplitude.ts
'use client';

import * as amplitude from '@amplitude/analytics-browser';
import { sessionReplayPlugin } from '@amplitude/plugin-session-replay-browser';

function initAmplitude() {
  if (typeof window !== 'undefined') {
    amplitude.add(sessionReplayPlugin());
    amplitude.init('fa5780b6941718de741c2152390647fe', { autocapture: true });
  }
}

initAmplitude();

export const Amplitude = () => null;
export default amplitude;

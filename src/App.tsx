/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { db } from './lib/firebase';

export default function App() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleLoad = () => {
      try {
        if (iframeRef.current?.contentWindow) {
          (iframeRef.current.contentWindow as any).nativeDb = db;
        }
      } catch (e) {
        console.warn("Could not attach nativeDb to iframe window:", e);
      }
    };
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener('load', handleLoad);
      handleLoad();
    }
    return () => {
      if (iframe) {
        iframe.removeEventListener('load', handleLoad);
      }
    };
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
      <iframe
        ref={iframeRef}
        src="/assets/aistudio/fashion-point_6a561526.html"
        title="Fashion Point"
        style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
      />
    </div>
  );
}


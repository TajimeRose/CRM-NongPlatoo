import { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface TelemetryEvent {
  action_type: 'page_view' | 'click' | 'form_submit' | 'scroll' | 'custom';
  target_element?: string;
  page_url: string;
  meta_data?: Record<string, unknown>;
  timestamp: string;
}

interface TelemetryConfig {
  apiEndpoint?: string;
  userId?: string;
  enabled?: boolean;
  batchSize?: number;
  flushInterval?: number;
}

const defaultConfig: TelemetryConfig = {
  apiEndpoint: '/api/track',
  enabled: true,
  batchSize: 10,
  flushInterval: 5000,
};

export const useTelemetry = (config: TelemetryConfig = {}) => {
  const { apiEndpoint, userId, enabled, batchSize, flushInterval } = {
    ...defaultConfig,
    ...config,
  };

  const location = useLocation();
  const eventQueue = useRef<TelemetryEvent[]>([]);
  const lastPageView = useRef<string>('');

  const sendEvents = useCallback(async (events: TelemetryEvent[]) => {
    if (!enabled || events.length === 0) return;

    try {
      await fetch(apiEndpoint!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          events,
        }),
      });
    } catch (error) {
      console.error('Telemetry error:', error);
    }
  }, [apiEndpoint, userId, enabled]);

  const flushQueue = useCallback(() => {
    if (eventQueue.current.length > 0) {
      sendEvents([...eventQueue.current]);
      eventQueue.current = [];
    }
  }, [sendEvents]);

  const trackEvent = useCallback((event: Omit<TelemetryEvent, 'page_url' | 'timestamp'>) => {
    if (!enabled) return;

    const telemetryEvent: TelemetryEvent = {
      ...event,
      page_url: window.location.pathname,
      timestamp: new Date().toISOString(),
    };

    eventQueue.current.push(telemetryEvent);

    if (eventQueue.current.length >= batchSize!) {
      flushQueue();
    }
  }, [enabled, batchSize, flushQueue]);

  const trackClick = useCallback((element: HTMLElement) => {
    const targetInfo = {
      tag: element.tagName.toLowerCase(),
      id: element.id || undefined,
      class: element.className || undefined,
      text: element.textContent?.slice(0, 50) || undefined,
      href: (element as HTMLAnchorElement).href || undefined,
    };

    trackEvent({
      action_type: 'click',
      target_element: `${targetInfo.tag}${targetInfo.id ? `#${targetInfo.id}` : ''}`,
      meta_data: targetInfo,
    });
  }, [trackEvent]);

  const trackPageView = useCallback(() => {
    const currentPath = window.location.pathname;
    if (lastPageView.current !== currentPath) {
      lastPageView.current = currentPath;
      trackEvent({
        action_type: 'page_view',
        meta_data: {
          referrer: document.referrer,
          title: document.title,
        },
      });
    }
  }, [trackEvent]);

  const trackCustomEvent = useCallback((eventName: string, data?: Record<string, unknown>) => {
    trackEvent({
      action_type: 'custom',
      target_element: eventName,
      meta_data: data,
    });
  }, [trackEvent]);

  // Auto-track page views
  useEffect(() => {
    trackPageView();
  }, [location.pathname, trackPageView]);

  // Global click listener
  useEffect(() => {
    if (!enabled) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target) {
        trackClick(target);
      }
    };

    document.addEventListener('click', handleClick, { capture: true });

    return () => {
      document.removeEventListener('click', handleClick, { capture: true });
    };
  }, [enabled, trackClick]);

  // Periodic flush
  useEffect(() => {
    const interval = setInterval(flushQueue, flushInterval);
    return () => clearInterval(interval);
  }, [flushQueue, flushInterval]);

  // Flush on page unload
  useEffect(() => {
    const handleUnload = () => flushQueue();
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [flushQueue]);

  return {
    trackEvent,
    trackCustomEvent,
    trackPageView,
    flushQueue,
  };
};

export default useTelemetry;

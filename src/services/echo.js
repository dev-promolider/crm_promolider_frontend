if (typeof global === 'undefined') {
  window.global = window;
}

import Pusher from 'pusher-js';
window.Pusher = Pusher;

import Echo from 'laravel-echo';

const echo = new Echo({
  broadcaster: 'pusher',
  key: import.meta.env.VITE_PUSHER_APP_KEY || 'ABCABC12345',
  cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || 'mt1',
  wsHost: window.location.hostname || '127.0.0.1',
  wsPort: 6001,
  forceTLS: false,
  disableStats: true,
  enabledTransports: ['ws', 'wss'],
});

export default echo;

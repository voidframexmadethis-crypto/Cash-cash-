// CASHMERE KID$ Progressive Web App Service Worker for Web Push Notifications

self.addEventListener('push', function (event) {
  let data = { title: 'CASHMERE KID$', body: 'New update from the Studio!', url: '/' };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'CASHMERE KID$', body: event.data.text(), url: '/' };
    }
  }

  const options = {
    body: data.body || data.message || '',
    icon: data.icon || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=192&h=192&q=80',
    badge: data.badge || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=192&h=192&q=80',
    data: {
      url: data.url || '/'
    },
    vibrate: [100, 50, 100],
    actions: data.actions || []
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'CASHMERE KID$', options)
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

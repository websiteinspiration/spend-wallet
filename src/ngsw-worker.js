self.addEventListener('push', function (event) {
  if (!(self.Notification && self.Notification.permission === 'granted')) {
      return;
  }

  const sendNotification = ({ title, ...body }) =>
    self.registration.showNotification(title, { body })

  if (event.data) {
      const message = JSON.parse(event.data.text());
      event.waitUntil(sendNotification(message));
  }
});

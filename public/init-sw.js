if ('serviceWorker' in navigator) {
  console.log('Here');
  navigator.serviceWorker.register('./service_worker.js');
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Navigator from "./navigator/navigator";

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
      <Navigator/>
  </React.StrictMode>
);

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/ServiceWorker.js')
            .then((registration) => {
                console.log('Service Worker registered: ', registration);
            })
            .catch((error) => {
                console.log('Service Worker registration failed: ', error);
            });
    });
}


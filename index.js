if ("serviceWorker" in navigator) {
  try {
    navigator.serviceWorker.register("./serviceWorker.js");
    console.log("Service Worker Registered");
  } catch (error) {
    console.log("Service Worker Registration Failed");
  }
}
document.documentElement.addEventListener(
  "touchstart",
  function (event) {
    if (event.touches.length > 1) {
      event.preventDefault();
    }
  },
  false
);

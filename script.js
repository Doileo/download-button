const btn = document.getElementById("btn");
const label = btn.querySelector(".label");
const canvas = document.getElementById("loader");
const ctx = canvas.getContext("2d");
const iconWrapper = document.getElementById("iconWrapper");

/*
  Keeping a simple state so the button behaves predictably.
  The flow follows a Play Store pattern:
  Install → Cancel (while downloading) → Open.
  Using a string state keeps the logic easy to reason about.
*/
let state = "idle";

let startTime = null;
let duration = 1800; // Chosen to feel smooth but still responsive
let animating = false;

/*
  Using easing instead of linear progress.
  Linear motion feels mechanical, while easing gives more natural UI feedback.
*/
function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/*
  Drawing the loader with Canvas because the wavy progress effect
  would be difficult to achieve with pure CSS or a standard spinner.
  The small distortion makes the progress feel more alive and less generic.
*/
function drawLoader(progress, time) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  // Increased radius so the progress ring appears around the icon, not inside it
  const radius = 40;

  const startAngle = -Math.PI / 2;
  const endAngle = startAngle + Math.PI * 2 * progress;

  const amplitude = 2.2;
  const frequency = 9;
  const phase = time * 0.006;

  ctx.beginPath();

  for (let angle = startAngle; angle <= endAngle; angle += 0.02) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const x = cx + cos * radius;
    const y = cy + sin * radius;

    const waveOffset = Math.sin(angle * frequency + phase) * amplitude;

    ctx.lineTo(x + cos * waveOffset, y + sin * waveOffset);
  }

  ctx.strokeStyle = "#8b87ff";
  ctx.lineWidth = 3.6;
  ctx.lineCap = "round";
  ctx.stroke();
}

/*
  requestAnimationFrame keeps the animation smooth and synced
  with the browser rendering instead of running on a fixed timer.
*/
function animate(time) {
  if (!animating) return;

  if (!startTime) startTime = time;

  const elapsed = time - startTime;
  let progress = elapsed / duration;
  if (progress > 1) progress = 1;

  const eased = easeInOut(progress);
  drawLoader(eased, elapsed);

  if (progress < 1) {
    requestAnimationFrame(animate);
  } else {
    finishDownload();
  }
}

/*
  Starts the download state.
  The loader is shown around the icon to give clear visual feedback
  about where the progress belongs.
*/
function startDownload() {
  state = "downloading";
  animating = true;
  startTime = null;

  btn.classList.add("loading");
  btn.classList.remove("install");
  label.textContent = "Cancel";

  iconWrapper.classList.add("loading");

  requestAnimationFrame(animate);
}

/*
  Allows the user to interrupt the process at any time.
  This mirrors real app store behavior and prevents the UI
  from feeling locked during the animation.
*/
function cancelDownload() {
  state = "idle";
  animating = false;
  startTime = null;

  // Clear any partially drawn progress
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  btn.classList.remove("loading");
  btn.classList.add("install");
  label.textContent = "Install";

  iconWrapper.classList.remove("loading");
}

/*
  Final state after the progress completes.
  The button changes meaning to reflect the next available action.
*/
function finishDownload() {
  state = "completed";
  animating = false;

  btn.classList.remove("loading", "install");
  btn.classList.add("open");
  label.textContent = "Open";

  iconWrapper.classList.remove("loading");
}

/*
  Single click handler that reacts based on the current state.
  Keeping this in one place makes the interaction easier to follow and maintain.
*/
btn.addEventListener("click", () => {
  if (state === "idle") {
    startDownload();
  } else if (state === "downloading") {
    cancelDownload();
  } else if (state === "completed") {
    // In a real app this would launch the installed app
    console.log("App opened");
  }
});

const btn = document.getElementById("btn");
const canvas = document.getElementById("loader");
const ctx = canvas.getContext("2d");

// Initial visual state
btn.classList.add("install");

let startTime = null;
let duration = 1800; // Smooth but still responsive
let animating = false;

// Easing makes the progress feel more natural than linear motion
function easeInOut(t) {
  if (t < 0.5) {
    return 2 * t * t;
  }
  return 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function drawLoader(progress, time) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  // Smaller radius so the loader fits comfortably inside the button
  const radius = 28;

  const startAngle = -Math.PI / 2;
  const endAngle = startAngle + Math.PI * 2 * progress;

  // Subtle wave to avoid a rigid spinner look
  const amplitude = 2.2;
  const frequency = 9;
  const phase = time * 0.006;

  // Gradient adds depth and keeps the loader from looking flat
  const gradient = ctx.createLinearGradient(cx - 30, cy - 30, cx + 30, cy + 30);
  gradient.addColorStop(0, "#8b87ff");
  gradient.addColorStop(0.5, "#6cfff3");
  gradient.addColorStop(1, "#8b87ff");

  ctx.beginPath();

  // Draw the arc in small segments so each point can be slightly distorted
  for (let angle = startAngle; angle <= endAngle; angle += 0.02) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const x = cx + cos * radius;
    const y = cy + sin * radius;

    const waveOffset = Math.sin(angle * frequency + phase) * amplitude;

    ctx.lineTo(x + cos * waveOffset, y + sin * waveOffset);
  }

  ctx.strokeStyle = gradient;
  ctx.lineWidth = 3.6;
  ctx.lineCap = "round";

  // Light glow so it reads better on the dark background
  ctx.shadowBlur = 5;
  ctx.shadowColor = "#6c63ff66";

  ctx.stroke();
}

// requestAnimationFrame keeps the animation smooth and synced with the browser
function animate(time) {
  if (!startTime) startTime = time;

  const elapsed = time - startTime;
  let progress = elapsed / duration;
  if (progress > 1) progress = 1;

  const eased = easeInOut(progress);
  drawLoader(eased, elapsed);

  if (progress < 1) {
    requestAnimationFrame(animate);
  } else {
    finish();
  }
}

// Switch to the completed state so the user knows the action finished
function finish() {
  animating = false;

  btn.classList.remove("loading", "install");
  btn.classList.add("open");
  btn.querySelector(".label").textContent = "Open";
}

btn.addEventListener("click", () => {
  // Reset back to Install if clicked again (demo behavior)
  if (btn.classList.contains("open")) {
    btn.classList.remove("open");
    btn.classList.add("install");
    btn.querySelector(".label").textContent = "Install";
    return;
  }

  // Prevent multiple animations from running at the same time
  if (animating) return;

  animating = true;
  startTime = null;
  btn.classList.add("loading");

  requestAnimationFrame(animate);
});

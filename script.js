document.addEventListener("DOMContentLoaded", function () {
  const passwordInput = document.getElementById("password");
  const startBtn = document.getElementById("startBtn");
  const stopBtn = document.getElementById("stopBtn");
  const resultDiv = document.getElementById("result");
  const currentAttemptDiv = document.getElementById("currentAttempt");
  const combinationsDiv = document.getElementById("combinations");
  const attemptsStat = document.getElementById("attemptsStat");
  const timeStat = document.getElementById("timeStat");
  const speedStat = document.getElementById("speedStat");

  let attackRunning = false;
  let animationFrameId;
  let lastUpdateTime = 0;
  let attempts = 0;
  let startTime = 0;
  let combinationsTried = [];

  startBtn.addEventListener("click", startAttack);
  stopBtn.addEventListener("click", stopAttack);

  function startAttack() {
    const password = passwordInput.value.trim();

    if (!password) {
      alert("Please enter a password first");
      return;
    }

    if (!/^[A-Za-z0-9]+$/.test(password)) {
      alert("Password can only contain letters and digits");
      return;
    }

    if (password.length > 4) {
      alert("For this demo, password must be 4 characters or less");
      return;
    }

    // Reset state
    attackRunning = true;
    attempts = 0;
    startTime = performance.now();
    lastUpdateTime = startTime;
    combinationsTried = [];
    combinationsDiv.innerHTML = "";

    // Update UI
    startBtn.disabled = true;
    stopBtn.disabled = false;
    resultDiv.textContent = "";
    currentAttemptDiv.textContent = "Starting brute force attack...";

    // Start attack
    bruteForceAttack(password);
  }

  function stopAttack() {
    attackRunning = false;
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }

    const endTime = performance.now();
    const timeTaken = (endTime - startTime) / 1000;

    resultDiv.innerHTML =
      `<span class="text-danger">Attack stopped by user</span>\n\n` +
      `Attempts: ${attempts}\n` +
      `Time taken: ${timeTaken.toFixed(2)} seconds\n` +
      `Speed: ${Math.round(attempts / timeTaken)} attempts/sec`;

    startBtn.disabled = false;
    stopBtn.disabled = true;
  }

  function bruteForceAttack(targetPassword) {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let found = false;

    function generateAttempts(length) {
      if (!attackRunning) return;

      const indices = Array(length).fill(0);
      const maxIndex = chars.length - 1;

      function nextAttempt() {
        if (!attackRunning || found) return;

        attempts++;

        // Build the current attempt
        let attempt = "";
        for (let i = 0; i < length; i++) {
          attempt += chars[indices[i]];
        }

        // Store combination
        combinationsTried.push(attempt);
        if (combinationsTried.length > 500) {
          combinationsTried.shift();
        }

        // Update stats every 50ms for performance
        const now = performance.now();
        if (now - lastUpdateTime > 50 || attempts % 100 === 0) {
          updateUI(attempt, now);
          lastUpdateTime = now;
          animationFrameId = requestAnimationFrame(nextAttempt);
        } else {
          nextAttempt();
        }

        // Check if we found the password
        if (attempt === targetPassword) {
          found = true;
          attackComplete(true, attempt);
          return;
        }

        // Increment indices (like an odometer)
        let pos = length - 1;
        while (pos >= 0) {
          if (indices[pos] < maxIndex) {
            indices[pos]++;
            return;
          } else {
            indices[pos] = 0;
            pos--;
          }
        }

        // If we've rolled over all positions, move to next length
        if (pos < 0 && length < 4) {
          generateAttempts(length + 1);
        } else if (pos < 0) {
          attackComplete(false);
        }
      }

      nextAttempt();
    }

    generateAttempts(1);
  }

  function updateUI(currentAttempt, currentTime) {
    const timeElapsed = (currentTime - startTime) / 1000;
    const attemptsPerSecond = Math.round(attempts / timeElapsed);

    // Update stats
    attemptsStat.textContent = attempts.toLocaleString();
    timeStat.textContent = timeElapsed.toFixed(2) + "s";
    speedStat.textContent = attemptsPerSecond.toLocaleString() + "/s";

    // Update current attempt
    currentAttemptDiv.textContent = `Testing: "${currentAttempt}"`;

    // Update combinations list (only show recent 500)
    if (combinationsTried.length > 0) {
      combinationsDiv.innerHTML = combinationsTried
        .slice(-50) // Only show last 50 for performance
        .map((combo) => `<div>${combo}</div>`)
        .join("");
    }
  }

  function attackComplete(success, password = "") {
    attackRunning = false;
    const endTime = performance.now();
    const timeTaken = (endTime - startTime) / 1000;

    if (success) {
      resultDiv.innerHTML =
        `<span class="text-success">✅ Password cracked!</span>\n\n` +
        `Password: <strong>${password}</strong>\n` +
        `Attempts: <strong>${attempts}</strong>\n` +
        `Time taken: <strong>${timeTaken.toFixed(2)} seconds</strong>\n` +
        `Speed: <strong>${Math.round(
          attempts / timeTaken
        )} attempts/sec</strong>\n\n` +
        `This demonstrates how weak passwords can be easily cracked.`;
    } else {
      resultDiv.innerHTML =
        `<span class="text-danger">Password not found (this shouldn't happen with a 4-character limit).</span>\n\n` +
        `Attempts: ${attempts}\n` +
        `Time taken: ${timeTaken.toFixed(2)} seconds`;
    }

    startBtn.disabled = false;
    stopBtn.disabled = true;
  }
});

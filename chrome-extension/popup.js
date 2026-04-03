const canvas = document.getElementById("captureCanvas");
const ctx = canvas.getContext("2d");
const selectionBox = document.getElementById("selectionBox");
const captureBtn = document.getElementById("captureBtn");
const askBtn = document.getElementById("askBtn");
const questionEl = document.getElementById("question");
const statusEl = document.getElementById("status");
const answerEl = document.getElementById("answer");
const settingsLink = document.getElementById("settingsLink");

let screenshotDataUrl = "";
let image = null;
let crop = null;
let isDragging = false;
let dragStart = null;

function setStatus(message) {
  statusEl.textContent = message;
}

function resetSelection() {
  crop = null;
  selectionBox.classList.add("hidden");
  askBtn.disabled = true;
}

function renderImage() {
  if (!image) return;
  const maxWidth = 388;
  const scale = Math.min(1, maxWidth / image.width);
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  canvas.dataset.scale = String(scale);
}

function updateSelectionBox() {
  if (!crop) return;
  selectionBox.style.left = `${crop.x}px`;
  selectionBox.style.top = `${crop.y}px`;
  selectionBox.style.width = `${crop.w}px`;
  selectionBox.style.height = `${crop.h}px`;
  selectionBox.classList.remove("hidden");
}

function pointerToCanvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: Math.max(0, Math.min(rect.width, event.clientX - rect.left)),
    y: Math.max(0, Math.min(rect.height, event.clientY - rect.top)),
  };
}

canvas.addEventListener("pointerdown", (event) => {
  if (!image) return;
  canvas.setPointerCapture(event.pointerId);
  isDragging = true;
  dragStart = pointerToCanvasPoint(event);
  crop = { x: dragStart.x, y: dragStart.y, w: 0, h: 0 };
  updateSelectionBox();
});

canvas.addEventListener("pointermove", (event) => {
  if (!isDragging || !dragStart) return;
  const point = pointerToCanvasPoint(event);
  const x = Math.min(dragStart.x, point.x);
  const y = Math.min(dragStart.y, point.y);
  const w = Math.abs(point.x - dragStart.x);
  const h = Math.abs(point.y - dragStart.y);
  crop = { x, y, w, h };
  updateSelectionBox();
});

canvas.addEventListener("pointerup", () => {
  isDragging = false;
  dragStart = null;
  if (crop && crop.w > 10 && crop.h > 10) {
    askBtn.disabled = false;
    setStatus("Selection ready. Ask a question.");
  }
});

settingsLink.addEventListener("click", async (event) => {
  event.preventDefault();
  await chrome.runtime.openOptionsPage();
});

captureBtn.addEventListener("click", () => {
  setStatus("Capturing visible tab...");
  resetSelection();
  answerEl.textContent = "";

  chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
    if (chrome.runtime.lastError || !dataUrl) {
      setStatus("Capture failed. Open a normal webpage tab and try again.");
      return;
    }

    screenshotDataUrl = dataUrl;
    image = new Image();
    image.onload = () => {
      renderImage();
      setStatus("Drag to select the area you want to ask about.");
    };
    image.src = dataUrl;
  });
});

async function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.local.get(
      {
        openaiApiKey: "",
        openaiModel: "gpt-4.1-mini",
      },
      resolve,
    );
  });
}

function cropImageDataUrl() {
  if (!image || !crop || !screenshotDataUrl) {
    throw new Error("No crop selected.");
  }

  const scale = Number(canvas.dataset.scale || "1");
  const sourceX = Math.round(crop.x / scale);
  const sourceY = Math.round(crop.y / scale);
  const sourceW = Math.round(crop.w / scale);
  const sourceH = Math.round(crop.h / scale);

  const cropCanvas = document.createElement("canvas");
  cropCanvas.width = sourceW;
  cropCanvas.height = sourceH;
  const cropCtx = cropCanvas.getContext("2d");
  cropCtx.drawImage(image, sourceX, sourceY, sourceW, sourceH, 0, 0, sourceW, sourceH);
  return cropCanvas.toDataURL("image/png");
}

async function askOpenAI(imageDataUrl, question, apiKey, model) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: question || "What is in this selected area? Answer clearly and concisely.",
            },
            {
              type: "input_image",
              image_url: imageDataUrl,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI request failed (${response.status}): ${text}`);
  }

  const data = await response.json();
  return (
    data.output_text ||
    data.output?.flatMap((item) => item.content || [])
      ?.map((chunk) => chunk.text)
      .filter(Boolean)
      .join("\n") ||
    "No answer returned."
  );
}

askBtn.addEventListener("click", async () => {
  try {
    const settings = await getSettings();
    if (!settings.openaiApiKey) {
      setStatus("Add your OpenAI API key in Settings first.");
      return;
    }
    const cropDataUrl = cropImageDataUrl();
    setStatus("Asking AI...");
    answerEl.textContent = "";
    const answer = await askOpenAI(cropDataUrl, questionEl.value.trim(), settings.openaiApiKey, settings.openaiModel);
    answerEl.textContent = answer;
    setStatus("Done.");
  } catch (error) {
    setStatus(error.message || "Something went wrong.");
  }
});

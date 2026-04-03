const apiKeyEl = document.getElementById("apiKey");
const modelEl = document.getElementById("model");
const saveBtn = document.getElementById("saveBtn");
const statusEl = document.getElementById("status");

chrome.storage.local.get({ openaiApiKey: "", openaiModel: "gpt-4.1-mini" }, (result) => {
  apiKeyEl.value = result.openaiApiKey;
  modelEl.value = result.openaiModel;
});

saveBtn.addEventListener("click", () => {
  chrome.storage.local.set(
    {
      openaiApiKey: apiKeyEl.value.trim(),
      openaiModel: modelEl.value.trim() || "gpt-4.1-mini",
    },
    () => {
      statusEl.textContent = "Saved.";
    },
  );
});

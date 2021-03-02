/**
 * @type {Object.<string, HTMLElement>}
 */
let elements = {
  // site key elements
  siteKey: "site_key",
  siteKeyInput: "site_key_input",
  siteKeySubmit: "site_key_submit",
  // status
  status: "status",
};

let recaptchaLoaded = false;
let siteKey;

/**
 * Replaces string ids in elements with their dom node reference
 */
const identifyElements = () => {
  Object.entries(elements).forEach(([key, id]) => {
    elements[key] = document.getElementById(id);
  });
};

/**
 * Pushes a status update to the pre output.
 *
 * @param {string} msg
 * @param {"default"|"error"|"warn"|"success"} type
 */
const pushStatus = (msg, type = "default") => {
  const labelClass = `status-${type}`;
  const labelText = type === "default" ? "status" : type;

  const el = document.createElement("p");

  el.innerHTML = `[<span class="${labelClass}">${labelText}</span>] ${msg}</br>`;

  elements.status.append(el);
};

// Called by recaptcha lib
window.onloadCallback = () => {
  recaptchaLoaded = true;
  pushStatus("reCAPTCHA library loaded");
};

const prepareStageOne = () => {
  elements.siteKeySubmit.addEventListener("click", () => {
    const input = elements.siteKeyInput.value;

    if (!input) {
      alert("No site key provided");
    }

    pushStatus("site key set", "success");

    siteKey = input;

    elements.siteKey.classList.add("hidden");
  });
};

(() => {
  identifyElements();

  prepareStageOne();

  pushStatus("waiting for site key");
})();

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
  // hidden copy field
  copyInput: "copy_input",
};

let recaptchaLoaded = false;

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
const pushStatus = (msg, type = "default", clickToCopy = false) => {
  const labelClass = `status-${type}`;
  const labelText = type === "default" ? "STATUS" : type.toUpperCase();

  const el = document.createElement("p");

  let messageHtml = msg;

  if (clickToCopy) {
    messageHtml = `<a href="#" onclick="copyKey('${msg}')">${messageHtml}</a>`;
  }

  el.innerHTML = `[<span class="${labelClass}">${labelText}</span>] ${messageHtml}</br>`;

  elements.status.append(el);
};

/**
 * Called when site key is submitted.
 */
const submitSiteKey = () => {
  const value = elements.siteKeyInput.value;

  if (!value) {
    return alert("No site key provided");
  }

  elements.siteKeyInput.disabled = true;
  elements.siteKeySubmit.disabled = true;

  grecaptcha.render("captcha_holder", {
    sitekey: value,
    callback: (response) => {
      pushStatus("captcha success", "success");
      pushStatus(response, "success", true);
    },
    "error-callback": () => pushStatus("failed to load captcha", "error"),
    "error-expired": () => pushStatus("captcha expired", "error"),
  });

  pushStatus(`rendering captcha...`);

  window.localStorage.setItem("sitekey", value);
};

/**
 * Set up event handlers.
 */
const prepare = () => {
  const keydown = (event) => event.key === "Enter" && submitSiteKey();

  elements.siteKeySubmit.addEventListener("click", submitSiteKey);
  elements.siteKeyInput.addEventListener("keydown", keydown);

  const value = window.localStorage.getItem("sitekey");
  if (value) {
    elements.siteKeyInput.value = value;
  }

  pushStatus("waiting for site key");
};

// Called by recaptcha lib
window.onloadCallback = () => {
  pushStatus("reCAPTCHA library loaded", "success");
};

// sets value of hidden field then copies
window.copyKey = (value) => {
  elements.copyInput.value = value;

  elements.copyInput.select();
  elements.copyInput.setSelectionRange(0, 99999);

  document.execCommand("copy");

  pushStatus("copied to clipboard");
};

(() => {
  identifyElements();

  if (window.location.host.startsWith("127")) {
    for (let i = 100; i < 1000; i += 100) {
      window.setTimeout(() => pushStatus("redirecting to 'localhost/...'"), i);
    }

    const newLocation = window.location.href.replace("127.0.0.1", "localhost");

    window.setTimeout(() => (window.location.href = newLocation), 1000);

    return;
  }

  prepare();
})();

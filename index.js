/**
 * @type {Object.<string, HTMLElement>}
 */
const elements = {
  siteKey: "site_key",
  siteKeyInput: "site_key_input",
  siteKeySubmit: "site_key_submit",
  status: "status",
  copyInput: "copy_input",
};

/**
 * @param {string} msg
 * @param {"default"|"error"|"warn"|"success"} type
 */
const log = (msg, type = "default", clickToCopy = false) => {
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

const identifyElements = () => {
  Object.entries(elements).forEach(([key, id]) => {
    elements[key] = document.getElementById(id);
  });
};

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
      log("captcha success", "success");
      log(response, "success", true);
    },
    "error-callback": () => log("failed to load captcha", "error"),
    "expired-callback": () => log("captcha expired", "warn"),
  });

  log(`rendering captcha...`);

  window.localStorage.setItem("sitekey", value);
};

const prepare = () => {
  const keydown = (event) => event.key === "Enter" && submitSiteKey();

  elements.siteKeySubmit.addEventListener("click", submitSiteKey);
  elements.siteKeyInput.addEventListener("keydown", keydown);

  const value = window.localStorage.getItem("sitekey");

  if (value) {
    elements.siteKeyInput.value = value;
  }

  log("waiting for site key");
};

// Called by recaptcha lib
window.onloadCallback = () => {
  log("reCAPTCHA library loaded", "success");
};

window.copyKey = (value) => {
  elements.copyInput.value = value;

  elements.copyInput.select();
  elements.copyInput.setSelectionRange(0, 99999);

  document.execCommand("copy");

  log("copied to clipboard");
};

(() => {
  identifyElements();

  if (window.location.host.startsWith("127")) {
    for (let i = 100; i < 1000; i += 100) {
      window.setTimeout(() => log("redirecting to 'localhost/...'"), i);
    }

    const newLocation = window.location.href.replace("127.0.0.1", "localhost");
    window.setTimeout(() => (window.location.href = newLocation), 1000);

    return;
  }

  prepare();
})();

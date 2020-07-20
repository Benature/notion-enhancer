/* === INJECTION MARKER === */

/*
 * notion-enhancer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com>
 * (c) 2020 TarasokUA
 * (https://dragonwocky.me/) under the MIT license
 */

// adds: custom styles, nicer window control buttons

// DO NOT REMOVE THE MARKERS ABOVE.

require("electron").remote.getGlobal("setTimeout")(() => {
  const fs = require("fs"),
    path = require("path"),
    store = require(path.join(__dirname, "..", "store.js"))({
      config: "user-preferences",
      defaults: {
        openhidden: false,
        maximized: false,
        tray: false,
        theme: false,
        emoji: false,
      },
    }),
    isMac = process.platform === "darwin";

  const intervalID = setInterval(injection, 100);
  function injection() {
    if (document.querySelector("div.notion-topbar > div") == undefined) return;
    clearInterval(intervalID);

    /* style injection */
    const head = document.getElementsByTagName("head")[0],
      css = ["user"];
    if (store.theme) css.push("theme");
    css.forEach((file) => {
      file = fs.readFileSync(`☃☃☃resources☃☃☃/${file}.css`); // will be set by python script
      let style = document.createElement("style");
      style.type = "text/css";
      style.innerHTML = file;
      head.appendChild(style);
    });
    document.body.classList.add("enhanced");

    const appwindow = require("electron").remote.getCurrentWindow();

    /* titlebar */
    const buttons = document.createElement("span"),
      dragarea = document.createElement("div");
    dragarea.className = "window-dragarea";
    document.querySelector(".notion-topbar").prepend(dragarea);
    buttons.className = "window-buttons-area";
    buttons.innerHTML = `
      <button class="window-button btn-alwaysontop"></button>
    `;
    if (!isMac)
      buttons.innerHTML += `
        <button class="window-button btn-minimize"></button>
        <button class="window-button btn-maximize"></button>
        <button class="window-button btn-close"></button>
      `;
    document
      .querySelector('.notion-topbar > div[style*="display: flex"]')
      .appendChild(buttons);
    document
      .querySelector(".notion-history-back-button")
      .parentElement.nextElementSibling.classList.add(
        "notion-topbar-breadcrumb"
      );
    document
      .querySelector(".notion-topbar-share-menu")
      .parentElement.classList.add("notion-topbar-actions");

    const button_icons_raw = {
        alwaysontop_on: fs.readFileSync(
          "☃☃☃resources☃☃☃/icons/alwaysontop_on.svg"
        ),
        alwaysontop_off: fs.readFileSync(
          "☃☃☃resources☃☃☃/icons/alwaysontop_off.svg"
        ),
        minimize: fs.readFileSync("☃☃☃resources☃☃☃/icons/minimise.svg"),
        maximize_on: fs.readFileSync("☃☃☃resources☃☃☃/icons/maximise_on.svg"),
        maximize_off: fs.readFileSync("☃☃☃resources☃☃☃/icons/maximise_off.svg"),
        close: fs.readFileSync("☃☃☃resources☃☃☃/icons/close.svg"),
      },
      button_icons = {
        alwaysontop() {
          return appwindow.isAlwaysOnTop()
            ? button_icons_raw.alwaysontop_on
            : button_icons_raw.alwaysontop_off; // '🠙' : '🠛'
        },
        minimize() {
          return button_icons_raw.minimize; // '⚊'
        },
        maximize() {
          return appwindow.isMaximized()
            ? button_icons_raw.maximize_on
            : button_icons_raw.maximize_off; // '🗗' : '🗖'
        },
        close() {
          return button_icons_raw.close; // '⨉'
        },
      },
      button_actions = {
        alwaysontop() {
          appwindow.setAlwaysOnTop(!appwindow.isAlwaysOnTop());
          this.innerHTML = button_icons.alwaysontop();
        },
        minimize() {
          appwindow.minimize();
        },
        maximize() {
          appwindow.isMaximized()
            ? appwindow.unmaximize()
            : appwindow.maximize();
          this.innerHTML = button_icons.maximize();
        },
        close(event = null) {
          if (
            store.tray &&
            require("electron").remote.BrowserWindow.getAllWindows().length ===
              1
          ) {
            if (event) event.preventDefault();
            appwindow.hide();
          } else appwindow.close();
        },
      },
      button_elements = {
        alwaysontop: document.querySelector(".window-button.btn-alwaysontop"),
        minimize: document.querySelector(".window-button.btn-minimize"),
        maximize: document.querySelector(".window-button.btn-maximize"),
        close: document.querySelector(".window-button.btn-close"),
      };

    button_elements.alwaysontop.innerHTML = button_icons.alwaysontop();
    button_elements.alwaysontop.onclick = button_actions.alwaysontop;

    if (!isMac) {
      button_elements.minimize.innerHTML = button_icons.minimize();
      button_elements.minimize.onclick = button_actions.minimize;

      button_elements.maximize.innerHTML = button_icons.maximize();
      button_elements.maximize.onclick = button_actions.maximize;
      setInterval(() => {
        if (button_elements.maximize.innerHTML != button_icons.maximize())
          button_elements.maximize.innerHTML = button_icons.maximize();
      }, 1000);

      button_elements.close.innerHTML = button_icons.close();
      button_elements.close.onclick = button_actions.close;
    }

    /* emoji */
    if (store.emoji) {
      const observer = new MutationObserver((list, observer) => {
        document
          .querySelectorAll(".notion-record-icon .notion-emoji")
          .forEach((el) => {
            el.outerHTML = `<span style="font-size: 0.9em; position: relative; bottom: 0.1em; right: 0.05em">
                ${el.getAttribute("alt")}
              </span>`;
          });
        document.querySelectorAll(".notion-emoji").forEach((el) => {
          el.outerHTML = `<span>${el.getAttribute("alt")}</span>`;
        });
      });
      observer.observe(document, {
        childList: true,
        subtree: true,
      });
    }

    /* update checker */
    fetch(
      `https://api.github.com/repos/dragonwocky/notion-enhancer/releases/latest`
    )
      .then((res) => res.json())
      .then((res) => {
        const local_version = "☃☃☃version☃☃☃".split("~")[0],
          repo_version = res.tag_name.slice(1);
        // compare func from https://github.com/substack/semver-compare
        if (
          local_version != repo_version &&
          [local_version, repo_version].sort((a, b) => {
            var pa = a.split(".");
            var pb = b.split(".");
            for (var i = 0; i < 3; i++) {
              var na = Number(pa[i]);
              var nb = Number(pb[i]);
              if (na > nb) return 1;
              if (nb > na) return -1;
              if (!isNaN(na) && isNaN(nb)) return 1;
              if (isNaN(na) && !isNaN(nb)) return -1;
            }
            return 0;
          })[0] == local_version
        )
          alert("notion-enhancer update available!");
      });

    /* hotkey: reload window */
    document.defaultView.addEventListener(
      "keyup",
      (ev) => void (ev.code === "F5" ? appwindow.reload() : 0),
      true
    );

    /* user scripts: floating toc 
       by: Ruter https://twitter.com/ruterlv/status/1284750187886338049?s=21
    */
    const tocObserver = new MutationObserver((list, observer) => {
      const toc = document.querySelector(".notion-table_of_contents-block");
      if (toc) {
        const toc_p = toc.parentElement;
        if (!toc_p.classList.contains("notion-column-block")) {
          return;
        }
        toc_p.style.position = "sticky";
        toc_p.style.top = "0";
        toc_p.style.overflowY = "scroll";
        toc_p.style.maxHeight = "50vh";
      }
    });
    let notionApp = document.getElementById("notion-app");
    tocObserver.observe(notionApp, { childList: true, subtree: true });
  }
}, 100);

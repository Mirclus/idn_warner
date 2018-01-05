const FATAL_THRESHOLD = 2;

const state = {};
const urls = {};

function checkUrl(tabId, url) {
    let parser = document.createElement('a');
    parser.href = url;
    let hostname = parser.hostname;

    if (0 === hostname.length) {
        return;
    }

    let parts = hostname.split('.');
    let last_id = -1;

    parts.forEach(function(el, id) {
        if (el.length > 4 &&
            el.substring(0, 4) === "xn--") {
            last_id = id;
        }
    });

    if (-1 === last_id) {
        return;
    }

    let diff = parts.length - last_id;
    state[tabId] = diff;
    urls[tabId] = hostname;
    setPageAction(tabId);
}

function setPageAction(tabId) {
    let value = state[tabId];
    let url = urls[tabId];
    if (!value) {
        return;
    }

    browser.pageAction.show(tabId);
    browser.pageAction.show(tabId);
    browser.pageAction.setIcon({
        tabId: tabId,
        path: getIcon(value)
    });
    browser.pageAction.setTitle({
        tabId: tabId,
        title: getTitle(value, url)
    });
}

function getIcon(value) {
    if (value <= FATAL_THRESHOLD) {
        return "icons/fatal.svg";
    } else {
        return "icons/warn.svg";
    }
}

function getTitle(value, url) {
    if (value <= FATAL_THRESHOLD) {
        return browser.i18n.getMessage("pageActionTitleFatal", url);
    } else {
        return browser.i18n.getMessage("pageActionTitleWarn", url);
    }
}

browser.webNavigation.onCommitted.addListener(
    e => {
        if (e.tabId === -1 ||
            e.frameId !== 0) {
            return;
        }

        checkUrl(e.tabId, e.url);
    }
);

browser.webNavigation.onCommitted.addListener(e => {
    if (e.frameId === 0) {
        setPageAction(e.tabId);
    }
});

browser.tabs.onActivated.addListener(e => {
    setPageAction(e.tabId);
});

browser.tabs.onRemoved.addListener(tabId => {
    state[tabId] = null;
    urls[tabId] = null;
});

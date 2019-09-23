console.log("background running");

chrome.browserAction.onClicked.addListener(menubuttonClicked);

function menubuttonClicked(tab) {
  chrome.tabs.sendMessage(tab.id, { message: "start" });
}

chrome.runtime.onMessage.addListener(receiver);
let params = {
  active: true,
  currentWindow: true
};

function receiver(request, sender, sendResponse) {
  if (request.message === "jirascrapestart") {
    console.log("jirascrapestart");
    chrome.tabs.query(params, gotTabs);
    function gotTabs(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { message: "jirascrapedone" });
    }
  } else if (request.message === "done") {
    console.log("done?");
  }
}

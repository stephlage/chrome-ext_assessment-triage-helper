console.log("content running");

chrome.runtime.onMessage.addListener(gotMessage);

function gotMessage(request, sender, sendResponse) {
  if (request.message === "start") {
    console.log(request.message);
    chrome.runtime.sendMessage({ message: "jirascrapestart" });
  } else if (request.message === "jirascrapedone") {
    console.log(request.message);
    chrome.runtime.sendMessage({ message: "done" });
  }
}

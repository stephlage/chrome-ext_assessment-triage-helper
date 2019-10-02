console.log("content running");
var jiraTicketNumber;
var jiraTicketSummary;
var discipline;
var mindApp;
var activityType;
var edition;
var copyrightYear;
var rejoinder;
var coreISBN;
var ssoISBN;
var newProductCode;

function wait(ms) {
  var start = new Date().getTime();
  var end = start;
  while (end < start + ms) {
    end = new Date().getTime();
  }
}

chrome.runtime.onMessage.addListener(gotMessage);

function gotMessage(request, sender, sendResponse) {
  if (request.message === "step1") {
    console.log(request.message); //text goes into the content page console
    ///DO STUFF
    //step 1: start
    //check if on jira page
    //scrape data and push it all to background page.
    //jira ticket, summary, discipline, mindapp, activity type, edition, core isbn, copyright year (new), sso isbn, rejoinder y/n
    jiraTicketNumber = document
      .getElementById("key-val")
      .innerText.replace(/\s{2,}/g, " ")
      .trim();
    jiraTicketSummary = document
      .getElementById("summary-val")
      .innerText.replace(/\s{2,}/g, " ")
      .trim();
    discipline = document
      .getElementById("customfield_10030-val")
      .innerText.replace(/\s{2,}/g, " ")
      .trim();
    mindApp = document
      .getElementById("customfield_22532-val")
      .innerText.replace(/\s{2,}/g, " ")
      .trim();
    activityType = document
      .getElementById("customfield_22533-val")
      .innerText.replace(/\s{2,}/g, " ")
      .trim();
    edition = document
      .getElementById("customfield_10026-val")
      .innerText.replace(/\s{2,}/g, " ")
      .trim();
    copyrightYear = document
      .getElementById("customfield_25630-val")
      .innerText.replace(/\s{2,}/g, " ")
      .trim();
    rejoinder = document
      .getElementById("customfield_22630-val")
      .innerText.replace(/\s{2,}/g, " ")
      .trim();
    coreISBN = document
      .getElementById("customfield_20533-val")
      .innerText.replace(/\s{2,}/g, " ")
      .trim();
    ssoISBN = document
      .getElementById("customfield_11345-val")
      .innerText.replace(/\s{2,}/g, " ")
      .trim();
    console.log(
      jiraTicketNumber +
        " " +
        jiraTicketSummary +
        " " +
        discipline +
        " " +
        mindApp +
        " " +
        activityType +
        " " +
        edition +
        " " +
        copyrightYear +
        " " +
        rejoinder +
        " " +
        coreISBN +
        " " +
        ssoISBN
    );

    chrome.runtime.sendMessage({
      message: [
        "step1done",
        jiraTicketNumber,
        jiraTicketSummary,
        discipline,
        mindApp,
        activityType,
        edition,
        copyrightYear,
        rejoinder,
        coreISBN,
        ssoISBN
      ]
    });
  } else if (request.message === "step2") {
    console.log(request.message); //text goes into the content page console
    //we need to implement step2 and step2a to open a new tab and talk back to the background.

    console.log("jumping to the next tab.");
    chrome.runtime.sendMessage({ message: ["step2done"] }); //send this message back
  } else if (request.message === "step2a") {
    console.log(request.message); //text goes into the content page console

    ///DO STUFF
    //step 2: open geyser, ensure logged in.
    //if we use the link to create, and the user still needs to log in, it will still be active and filled out.
    //  http://geyser.cl-cms.com/actions/products/create-product.xqy?db=/geyser/psych/&type=4040403&name=this&author=name&edition=5&isbn=9780987654321&year=2020

    console.log("ready..?");

    ///run through loop to put in the 2 digits. pause. then check.  If we're good, then move forward

    //check if code-info validation-hint has child with span class g-success-text or g-error-text
    wait(500);

    //grab what it generates:
    var tempProductCode = document
      .getElementById("abbr")
      .value.replace(/\s{2,}/g, " ")
      .trim();

    document.getElementById("abbr").focus();
    ///note: we have to use keypress instead of .value because we need the checker.
    function setKeywordText(text) {
      var el = document.getElementById("abbr");
      el.value = text;
      var evt = document.createEvent("Events");
      evt.initEvent("change", true, true);
      el.dispatchEvent(evt);
    }

    String.prototype.splice = function(idx, rem, str) {
      return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
    };

    var result = tempProductCode.splice(2, 0, "01");

    wait(500);

    setKeywordText(result);

    document.getElementById("abbr").focus();
    wait(500);
    var check = document.getElementsByClassName("code-info validation-hint")[0]
      .innerText;
    if (check === "OK (not used in Geyser)") {
      console.log("clear to go");
    } else {
      console.log("try next number");
    }

    //now that we have our final product - we'll set it and send it.
    newProductCode = document
      .getElementById("abbr")
      .value.replace(/\s{2,}/g, " ")
      .trim();

    //Once logged in, pause and let product code auto-fill.
    //grab data from product code and splice in 2 digits after first 2 characters.
    //pause.
    //check for green text in span class="code-info-validation-hint"
    //if that class is empty, then add 1 to the two digits.
    //once green, send product code to background, then "click" create.
    chrome.runtime.sendMessage({ message: ["step2adone", newProductCode] }); //send this message back
  } else if (request.message === "step3") {
    console.log(request.message); //text goes into the content page console
    ///DO STUFF

    //step 3: in Geyser's new product, click Open Metadata
    //add metadata, as appropriate.
    chrome.runtime.sendMessage({ message: ["step3done"] }); //send this message back
  } else if (request.message === "step4") {
    console.log(request.message); //text goes into the content page console
    ///DO STUFF
    //step 4: go back to Jira and enter in newly created geyser product code.

    // IF PRODUCTS END IN R, THEN YOU ARE DONE.
    chrome.runtime.sendMessage({ message: ["step4done"] }); //send this message back
  } else if (request.message === "step5") {
    console.log(request.message); //text goes into the content page console
    ///DO STUFF
    //step 5: open bard.  (ensure signed in... this might be more complex due to how the sign in w/ pop ups work)
    //open production:  Covalent/MindTap first.
    // Run search for SSO ISBN.
    //If found - Prompt user to validate data.  Show screen of text from dom span vs fields scraped from jira.
    // If match = no:
    /////trip "new" flag
    ///// click buttons to fill out and create new bundle code
    ///// have new bundle code open
    ////////
    //if match = yes:
    ///// open bundle
    //put bundle code "bun_...._mt" in a variabe
    //add product code created to bundle
    //Do this 2x to add to staging -- don't prompt user, just use same yes/no answer they received from prod

    chrome.runtime.sendMessage({ message: ["step5done"] }); //send this message back
  } else if (request.message === "step6") {
    console.log(request.message); //text goes into the content page console
    ///DO STUFF
    //step 6: open jira
    // enter in bundle code
    //////if it was a new (new flag flipped=yes), then...
    ////step 6a. open ACMS
    ////click Manage Bundle Code
    ////search SSO ISBN
    ////enter bundle code value
    ////hit save

    chrome.runtime.sendMessage({ message: ["step6done"] }); //send this message back
  } else if (request.message === "step7") {
    console.log(request.message); //text goes into the content page console
    ///DO STUFF
    //step 7: (optional) IF CLHW (product ends in "a")

    //Associate using ACMS -- just search and add.
    //click Manage Asset Codes
    chrome.runtime.sendMessage({ message: ["step7done"] }); //send this message back
  } else if (request.message === "alldone") {
    console.log(request.message);
    chrome.runtime.sendMessage({ message: "alldone" });
  }
}

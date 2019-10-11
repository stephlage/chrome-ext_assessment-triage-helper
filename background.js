console.log("background running");

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
var author;
var newProductCode;

chrome.browserAction.onClicked.addListener(menubuttonClicked);
chrome.runtime.onMessage.addListener(receiver);
let params = {
  active: true,
  currentWindow: true
};

function menubuttonClicked(tab) {
  chrome.tabs.sendMessage(tab.id, { message: "step1" }); //WHEN CLICKED - begin step 1.
}
//wait timer
function wait(ms) {
  var start = new Date().getTime();
  var end = start;
  while (end < start + ms) {
    end = new Date().getTime();
  }
}

function receiver(request, sender, sendResponse) {
  if (request.message[0] === "step1done") {
    //hold data from jira scrape
    jiraTicketNumber = request.message[1];
    jiraTicketSummary = request.message[2];
    discipline = request.message[3];
    mindApp = request.message[4];
    activityType = request.message[5];
    edition = request.message[6];
    copyrightYear = request.message[7];
    rejoinder = request.message[8];
    coreISBN = request.message[9];
    ssoISBN = request.message[10];
    author = request.message[11];

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
        ssoISBN +
        " " +
        author
    );

    //lets break out disciplines in the list in jira...and match it to some text in geyser
    function translateDiscipline(discipline) {
      switch (discipline) {
        case "Psychology":
          return "/geyser/psych/";
        case "Physics":
          return "/geyser/physics/";
        default:
          return "";
      }
    }

    function translateProductType(
      mindApp,
      activityType,
      rejoinder,
      jiraTicketSummary
    ) {
      ////Reference: https://wiki.cengage.com/display/DP/Product+Type+Grid%3A+Assessment+for+MindTap

      switch (mindApp) {
        case "CNow MindApp":
          //CNow MindApp will ALWAYS be activityType=Simple Assessment
          return "4040403"; //CNOW/Homework
        //May need to put in some check in the summary/title for "test bank" to create CNOW/Repository & CNOW/Testbank

        case "CLHW":
          //Branching = 	CXP/Activity
          if (activityType === "Branching") {
            return "4040801"; //CXP/Activity
          }

          //	Graph Builder=	CXP/Activity
          ///NOTE: This is in the grid..but not an option in Jira.
          //else if (activityType === "") {
          //  return "4040801"; //CXP/Activity
          //}

          //Media Quiz = CNOW/Homework (only if eBook Rejoinders=yes) & CXP/Activity & CNOW/Repository (if it doesn't already exist)
          else if (activityType === "Media Quiz") {
            if (rejoinder === "yes") {
              return "4040403"; //CNOW/Homework
            } else {
              ///ALSO will need to flip flag for creating repository!!!!!!!
              return "4040801"; //CXP/Activity
            }
          }

          //SAA = CXP/Activity
          //Jira options:
          // SAA Likert
          // SAA Single-Select
          // SAA Multi-Select
          // SAA Polling
          // SAA Ranking
          //Since they all begin in SAA -- let's just use that instead of iffing them all.
          else if (activityType.slice(0, 3) === "SAA") {
            return "4040801"; //CXP/Activity
          }

          // Simple Assessment AND summary has "Test bank" (or "Cognero" or "Examview") = CNOW/Repository & CNOW/Testbank
          else if (
            activityType === "Simple Assessment" &&
            (jiraTicketSummary.toLowerCase().includes("bank") ||
              jiraTicketSummary.toLowerCase().includes("cognero") ||
              jiraTicketSummary.toLowerCase().includes("examview"))
          ) {
            return "";
          }
          //Simple Assessment = Items: CNOW/Homework & ADFs: CXP/Activity
          else if (activityType === "Simple Assessment") {
            //WILL NEED TO TRIP A FLAG FOR CNOW/HOMEWORK ITEMS
            return "4040801"; //CXP/Activity for the ADFs
          }
          //Other The words "fill in forms", "online forms" = CXP/Activity & CNOW/Repository
          else if (
            activityType === "Other" &&
            jiraTicketSummary.toLowerCase().includes("forms")
          ) {
            ///ALSO will need to flip flag for creating repository!!!!!!!
            return "4040801"; //CXP/Activity
          }

        case "ATP":
          return "";
        case "Other":
          return "";
        default:
          return "";
      }
    }

    var geyserURL =
      "http://geyser.cl-cms.com/actions/products/create-product.xqy?db=" +
      translateDiscipline(discipline) +
      "&type=" +
      translateProductType(
        mindApp,
        activityType,
        rejoinder,
        jiraTicketSummary
      ) +
      "&name=" +
      jiraTicketSummary +
      "&author=" +
      author +
      "&edition=" +
      edition +
      "&isbn=" +
      coreISBN +
      "&year=" +
      copyrightYear;

    console.log("step1done");
    wait(1000);
    chrome.tabs.query(params, gotTabs);
    function gotTabs(tabs) {
      chrome.tabs.create({
        url: geyserURL
      });
      wait(4000);
      console.log("ready..?");
      chrome.tabs.sendMessage(tabs[0].id, { message: "step2" }); //proceed to step 2
    }
  } else if (request.message[0] === "step2done") {
    console.log("step2done");
    chrome.tabs.query(params, gotTabs);
    function gotTabs(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { message: "step2a" }); //proceed to step 3
    }
  } else if (request.message[0] === "step2adone") {
    newProductCode = request.message[1];
    //hold product code
    //flag for product created
    console.log(newProductCode);
    console.log("step2adone");
    chrome.tabs.query(params, gotTabs);
    function gotTabs(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { message: "step3" }); //proceed to step 3
    }
  } else if (request.message[0] === "step3done") {
    //needs no new data.
    //flag for metadata filled in
    console.log("step3done");
    chrome.tabs.query(params, gotTabs);
    function gotTabs(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { message: "step4" }); //proceed to step 4
    }
  } else if (request.message[0] === "step4done") {
    //flag for jira updated w/ product code

    console.log("step4done");
    chrome.tabs.query(params, gotTabs);

    //Add if statement:  If product code last character = R, then message=alldone
    ///////
    // function gotTabs(tabs) {
    //   chrome.tabs.sendMessage(tabs[0].id, { message: "alldone" }); //early exit
    // }
    //else {
    function gotTabs(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { message: "step5" }); //proceed to step 5
    }
    //}
  } else if (request.message[0] === "step5done") {
    //hold bundle code
    console.log("step5done");
    chrome.tabs.query(params, gotTabs);
    function gotTabs(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { message: "step6" }); //proceed to step 6
    }
  } else if (request.message[0] === "step6done") {
    //flag acms manage bundle code complete
    console.log("step6done");
    chrome.tabs.query(params, gotTabs);
    function gotTabs(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { message: "step7" }); //proceed to step 7
    }
  } else if (request.message[0] === "step7done") {
    //flag acms manage asset code complete
    console.log("step7done");
    chrome.tabs.query(params, gotTabs);
    function gotTabs(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { message: "alldone" }); //END
      console.log("END");
    }
  }
}

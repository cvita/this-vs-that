$(document).ready(function() {
  document.getElementById("initialSearchInput");
  initialSearchInput.value = "Enter search";
});

$("#initialSearchInput").click(function() {
  // Clear any previous searches
  initialSearchInput.value = "";
  $(".resultsCount").html("");
  $(".allSearchResultsList").html("");
  $(".numberOfResultsFound").html("");
  searchHistoryOfConjunctions = [];
});

$("#initialSearchInput").keydown(function(key) {
  if (key.keyCode === 13) {
    runSearch();
  }
});

var conjunction = "vs";

$(".vsBtn").click(function() {
  conjunction = "vs";
  runSearch();
});

$(".andBtn").click(function() {
  conjunction = "and";
  runSearch();
});

$(".orBtn").click(function() {
  conjunction = "or";
  runSearch();
});

$(".withBtn").click(function() {
  conjunction = "with";
  runSearch();
});

function styleSelectedConjunctionBtn() {
  switch (conjunction) {
    case "vs":
      $(".nowUse").removeClass("btn-primary");
      $(".vsBtn").addClass("btn-primary");
      break;
    case "or":
      $(".nowUse").removeClass("btn-primary");
      $(".orBtn").addClass("btn-primary");
      break;
    case "and":
      $(".nowUse").removeClass("btn-primary");
      $(".andBtn").addClass("btn-primary");
      break;
    case "with":
      $(".nowUse").removeClass("btn-primary");
      $(".withBtn").addClass("btn-primary");
      break;
  }
}

var searchHistoryOfConjunctions = [];

function runSearch() {
  styleSelectedConjunctionBtn();
  $(".allSearchResultsList").hide();
  $("." + conjunction + "SearchResults").show();
  var initialSearchKeyword = initialSearchInput.value;
  if (searchHistoryOfConjunctions.indexOf(conjunction) === -1) {
    searchHistoryOfConjunctions.push(conjunction);
    suggestQueries(initialSearchKeyword, 0); // QUESTION: Is it okay to call a function above where it's declared?
  }

  var resultsArray = [initialSearchKeyword];
  var apiDataIndexCount = 0; // To iterate through initialSearchKeyword's search results (see approx. line 113)
  var duplicatePositions = [1]; // Initial value of 1 allows initalSearchKeyword to always appear at top of results

  function suggestQueries(searchKeyword, apiDataIndexPosition) {
    var apiURL = "https://suggestqueries.google.com/complete/search?client=firefox&callback=?&q=";
    $.getJSON(apiURL + searchKeyword + " " + conjunction, function(apiData) {
      var returnedResult = apiData[1][apiDataIndexPosition];

      (function validateResults() {
        var checkForConjunction = new RegExp(" " + conjunction + " ", "g");
        if (checkForConjunction.test(returnedResult)) {
          returnedResult = (function removeTextThruConjunction() {
            var conjunctionPosition = returnedResult.indexOf(conjunction + " ");
            var conjunctionAndSpace = conjunction.length + 1;
            return returnedResult.slice(conjunctionPosition + conjunctionAndSpace, returnedResult.length);
          })();
          resultsArray.push(returnedResult);
        } else { // Creates condition to start a new search using next apiDataIndexPosition
          resultsArray.push(initialSearchKeyword);
        }
      })();

      (function manageDuplicatesAndSearchAgain() {
        var duplicateValue = resultsArray.find(function(val, pos) {
          return resultsArray.indexOf(val) !== pos;
        });
        if (duplicateValue === undefined) { // No duplicates found
          suggestQueries(returnedResult, 0); // Search again, creating a chain of results
        } else { // Duplicate found, meaning this specific search chain has completed
          resultsArray.pop(); // Delete duplicate value
          duplicatePositions.push(resultsArray.length); // Log end of this search chain's index position

          var resultsCount = "<span class=resultsCount>" + (resultsArray.length - 1) + "</span>";
          $("." + conjunction + "Btn").html('"' + conjunction + '"' + resultsCount);

          if (apiDataIndexCount < apiData[1].length) {
            apiDataIndexCount++;
            suggestQueries(initialSearchKeyword, apiDataIndexCount); // Repeat original search, iterating through apiData[1]
          } else { // When all search chains based on initialSearchKeyword have completed...
            duplicatePositions = duplicatePositions.filter(function(val, pos) { // Remove duplicate values
              return duplicatePositions.indexOf(val) === pos;
            });
            (function displayResults() {
              for (var i = 1; i < resultsArray.length; i++) {
                for (var j = 0; j < duplicatePositions[duplicatePositions.length - 1]; j++) {
                  if (i === duplicatePositions[j]) {
                    $("." + conjunction + "SearchResults").append(
                      "<li class='resultHeading'>" + initialSearchKeyword + "</li>");
                  }
                }
                $("." + conjunction + "SearchResults").append("<a href='https://www.google.com/search?q=" +
                  resultsArray[i] + "'target='_blank'>" + "<li class='results'>" + resultsArray[i] + "</li></a>");
              }

              $("." + conjunction + "SearchResults").prepend('<li class="numberOfResultsFound">' +
                (resultsArray.length - 1) + ' results found for <b>' + initialSearchKeyword +
                '</span> <span class="conjunctionUsed">' + conjunction + '</span></b></li>');

            })(); // End of displayResults()
          } // end of else statement
        }
      })(); // End of manageDuplicatesAndSearchAgain()
    });
  }
}
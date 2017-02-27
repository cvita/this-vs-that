// Assigning functionality of buttons
var conjunction = "vs";
$(document).ready(function() {
  document.getElementById("initialSearchInput");
  initialSearchInput.value = "Enter search and click a button";
  $("#initialSearchInput").click(function() {
    initialSearchInput.value = "";
  });

  $("#initialSearchInput").keydown(function(key) {
    if (key.keyCode === 13) {
      runSearch();
      $(this).blur();
    }
  });

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
});

function runSearch() {
  // Clear displayed results from any previous searches
  $(".primarySearchResults").html("");
  $(".additionalSearchResults").html("");

  // Obtain user's search input
  var initialSearchKeyword = initialSearchInput.value;
  var resultsArr = [initialSearchKeyword];

  // To iterate through initialSearchKeyword's search results (see line 71)
  var indexCount = 0;
  var duplicatePositions = [1]; // Initial value of 1 allows initalSearchKeyword to always appear at top of results

  // Queries Google's auto-suggestions
  function suggestQueries(searchVal, index) {
    var apiURL = "https://suggestqueries.google.com/complete/search?client=firefox&callback=?&q=";
    $.getJSON(apiURL + searchVal + " " + conjunction, function(apiData) {
      var returnedResult = apiData[1][index];
      var conjunctionTest = new RegExp(" " + conjunction + " ", "g");
      if (conjunctionTest.test(returnedResult)) {
        // Trim the result's text to remove through "vs "
        returnedResult = returnedResult.slice(returnedResult.indexOf(conjunction + " ") + conjunction.length + 1, returnedResult.length);
        resultsArr.push(returnedResult);
        // Will begin a new search with the subsequent result from the initial search
      } else {
        resultsArr.push(initialSearchKeyword);
      }

      // Returns undefined, unless a duplicate value is found
      var duplicateValue = resultsArr.find(function(elem, pos) {
        return resultsArr.indexOf(elem) !== pos;
      });

      // No duplicates found. Search again using returnedResult as new keyword
      if (duplicateValue === undefined) {
        suggestQueries(returnedResult, 0);
        $(".resultsFor").html(resultsArr.length - 1 + ' results found for "' + initialSearchKeyword + ' ' + conjunction + '"');
        // Duplicate found. This specific search chain has completed
      } else {
        resultsArr.pop();
        duplicatePositions.push(resultsArr.length);
        // Repeat original search, iterating through apiData[1], using the subsequent result to begin next search
        if (indexCount < apiData[1].length) {
          indexCount++;
          suggestQueries(initialSearchKeyword, indexCount);
          // When all search chains based on initialSearchKeyword have completed...
        } else {
          // Remove duplicate values
          duplicatePositions = duplicatePositions.filter(function(elem, pos) {
            return duplicatePositions.indexOf(elem) == pos;
          });

          // And finally, display results to user
          for (var i = 1; i < resultsArr.length; i++) {
            for (var j = 0; j < duplicatePositions[duplicatePositions.length - 1]; j++) {
              if (i === duplicatePositions[j]) {
                $(".primarySearchResults").append(
                  "<li class='resultHeading'>" + initialSearchKeyword + "</li>");
              }
            }
            $(".primarySearchResults").append(
              "<a href='https://www.google.com/search?q=" + resultsArr[i] + "' target='_blank'>\
                <li class='results'>" + resultsArr[i] + "</li></a>");
          }
          $(".resultsFor").html(resultsArr.length - 1 + ' results found for "' + initialSearchKeyword + ' ' + conjunction + '"'); // restated here for cases with zero results
        }
      }
    });
  }
  // Initial call for suggestQueries()
  suggestQueries(initialSearchKeyword, 0);
}
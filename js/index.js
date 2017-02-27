"use strict";

(function() {
  var conjunction = "vs";
  var searchHistoryOfConjunctions = [];

  // Functionality of buttons
  $(".vsBtn").click(function() {
    conjunction = "vs";
    runSearch();
  });

  $(".andBtn").click(function() {
    conjunction = "and";
    runSearch();
  });

  $(".withBtn").click(function() {
    conjunction = "with";
    runSearch();
  });

  $("#initialSearchInput").click(function() {
    initialSearchInput.value = "";
    $(".resultsCountInBtn").html("");
    $(".allSearchResults").html("");
    $(".numberOfResultsFound").html("");
    searchHistoryOfConjunctions = [];
  });

  $("#initialSearchInput").keydown(function(key) {
    if (key.keyCode === 13) {
      runSearch();
    }
  });

  function styleSelectedConjunctionBtn() {
    switch (conjunction) {
      case "vs":
        $(".btn").removeClass("btn-primary");
        $(".vsBtn").addClass("btn-primary");
        break;
      case "and":
        $(".btn").removeClass("btn-primary");
        $(".andBtn").addClass("btn-primary");
        break;
      case "with":
        $(".btn").removeClass("btn-primary");
        $(".withBtn").addClass("btn-primary");
        break;
    }
  }

  function runSearch() {
    $("#initialSearchInput").blur();
    $(".subheading").slideUp();
    styleSelectedConjunctionBtn();
    $(".allSearchResults").hide();
    $("." + conjunction + "SearchResults").show();
    var initialSearchKeyword = initialSearchInput.value;
    var resultsArray = [initialSearchKeyword];
    var apiDataIndexCount = 0;
    var duplicatePositions = [1]; // Initial value of 1 allows initalSearchKeyword to always appear at top of results

    if (searchHistoryOfConjunctions.indexOf(conjunction) === -1) {
      searchHistoryOfConjunctions.push(conjunction);
      suggestQueries(initialSearchKeyword, 0);
    }

    function validateResult(result) {
      result += ""; // Result must be a string for indexOf to work
      var conjunctionPosition = result.indexOf(" " + conjunction + " ");
      if (conjunctionPosition !== -1) {
        return result.slice(conjunctionPosition + conjunction.length + 2, result.length);
      } else {
        return initialSearchKeyword; // Creates condition, which will start a new search
      }
    }

    function duplicateCheck(val, pos) {
      return resultsArray.indexOf(val) !== pos;
    }

    function manageDuplicateAndDisplayCountInBtn() {
      resultsArray.pop();
      duplicatePositions.push(resultsArray.length); // Log end of this search chain's index position
      var resultsCount = "<span class='resultsCountInBtn'>" + (resultsArray.length - 1) + "</span>";
      $("." + conjunction + "Btn").html('"' + conjunction + '"' + resultsCount);
    }

    function displayTotalNumberOfResults() {
      $("." + conjunction + "SearchResults").prepend('<li class="numberOfResultsFound">' +
        (resultsArray.length - 1) + ' results found for <b>' + initialSearchKeyword +
        '</span> <span style="color:#7ca9be;">' + conjunction + '</span></b></li>');
    }

    function displayResults() {
      duplicatePositions = duplicatePositions.filter(function(val, pos) { // Remove duplicate values
        return duplicatePositions.indexOf(val) === pos;
      });
      for (var i = 1; i < resultsArray.length; i++) { // i=1 to skip displaying initialSearchKeyword as a result
        for (var j = 0; j < duplicatePositions[duplicatePositions.length - 1]; j++) {
          if (i === duplicatePositions[j]) {
            $("." + conjunction + "SearchResults").append("<li class='resultChainHeading'>" + initialSearchKeyword + "</li>");
          }
        }
        $("." + conjunction + "SearchResults").append("<a href='https://www.google.com/search?q=" + resultsArray[i] +
          "'target='_blank'>" + "<li class='individualResult'>" + resultsArray[i] + "</li></a>");
      }
    }

    function suggestQueries(searchKeyword, apiDataIndex) {
      var apiURL = "https://suggestqueries.google.com/complete/search?client=firefox&callback=?&q=";
      $.getJSON(apiURL + searchKeyword + " " + conjunction, function(apiData) {
        var returnedResult = validateResult(apiData[1][apiDataIndex]);
        resultsArray.push(returnedResult);
        if (resultsArray.find(duplicateCheck) === undefined) {
          suggestQueries(returnedResult, 0);
        } else {
          manageDuplicateAndDisplayCountInBtn();
          if (apiDataIndexCount < apiData[1].length) {
            apiDataIndexCount++;
            suggestQueries(initialSearchKeyword, apiDataIndexCount);
          } else {
            displayTotalNumberOfResults();
            displayResults();
          }
        }
      });
    }
  }
})();
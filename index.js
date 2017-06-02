(function () {
  "use strict";

  $("#initialSearchInput").keydown(key => {
    if (key.keyCode === 13) {
      if (initialSearchInput.value !== "") {
        ["vs", "and", "with"].forEach(conjunction => {
          runSearch(conjunction);
        });
        $(this).blur();
        $(".subheading").slideUp("slow");
        $(".allConjunctionBtns").css("visibility", "visible");
      }
    }
  });

  $(".searchBtn").click(() => {
    if (initialSearchInput.value !== "") {
      ["vs", "and", "with"].forEach(conjunction => {
        runSearch(conjunction);
      });
      $(this).blur();
      $(".subheading").slideUp("slow");
      $(".allConjunctionBtns").css("visibility", "visible");
    }
  });

  var searchHistory = [];

  function runSearch(conjunction) {
    styleSelectedConjunctionBtn();

    var initialSearchKeyword = initialSearchInput.value;
    suggestQueries(initialSearchKeyword, 0);

    var resultsArray = [initialSearchKeyword];
    var apiDataIndexCount = 0;

    function suggestQueries(searchKeyword, apiDataIndex) {
      var apiURL = "https://suggestqueries.google.com/complete/search?client=firefox&callback=?&q=";
      $.getJSON(apiURL + searchKeyword + " " + conjunction, apiData => {
        var returnedResult = validateResult(apiData[1][apiDataIndex]);
        resultsArray.push(returnedResult);

        if (resultsArray.find(duplicateCheck) === undefined) {
          suggestQueries(returnedResult, 0);
        } else {
          removeDuplicateAndLogPosition();
          displayResultsCountInBtn(conjunction, (resultsArray.length - 1));
          if (apiDataIndexCount < apiData[1].length) {
            apiDataIndexCount++;
            suggestQueries(initialSearchKeyword, apiDataIndexCount);
          } else {
            var resultObject = new CreateResultObject();
            searchHistory.push(resultObject);
            displayTotalNumberOfResults(resultObject);
            displayResults(resultObject, () => {
              displaySearchHistory();
            });
          }
        }
      });
    }

    function validateResult(result) {
      result += ""; // Result must be a string for indexOf to work
      var conjunctionPosition = result.indexOf(" " + conjunction + " ");
      if (conjunctionPosition !== -1) {
        return result.slice(conjunctionPosition + conjunction.length + 2, result.length);
      } else {
        return initialSearchKeyword; // Creates condition, which starts a new search
      }
    }

    function duplicateCheck(val, pos) {
      return resultsArray.indexOf(val) !== pos;
    }

    var duplicatePositions = [1]; // Initial value of 1 allows a resultChainHeader to always appear at top of results

    function removeDuplicateAndLogPosition() {
      resultsArray.pop();
      duplicatePositions.push(resultsArray.length);
    }

    function CreateResultObject() {
      this.searchKeyword = initialSearchKeyword;
      this.conjunction = conjunction;
      this.results = resultsArray;
      this.totalResults = resultsArray.length - 1;
      this.duplicatePositions = duplicatePositions;
    }
  } // end of runSearch()

  function displayResultsCountInBtn(conjunction, numberOfResults) {
    $("." + conjunction + "Btn").html('"' + conjunction + '"<span class=resultsCountInBtn>' +
      numberOfResults + '</span>');
  }

  function displayTotalNumberOfResults(result) {
    $("." + result.conjunction + "SearchResults").prepend('<li class="numberOfResultsFound">' +
      result.totalResults + ' results found for <b>' + result.searchKeyword +
      '</span> <span style="color:#7ca9be;">' + result.conjunction + '</span></b></li>');
  }

  function displayResults(result, callback) {
    var searchChainCount = 1;
    for (var i = 1; i <= result.totalResults; i++) {
      var previousResult = result.results[i - 1];
      if (result.duplicatePositions.some(elem => elem === i)) {
        previousResult = result.searchKeyword;
        $("." + result.conjunction + "SearchResults").append("<li class='resultChainHeading'>Result chain " + searchChainCount + "</li>");
        searchChainCount++;
      }
      var googleSearchLink = "https://www.google.com/search?q=" + previousResult + " " + result.conjunction + " " + result.results[i];
      $("." + result.conjunction + "SearchResults").append("<a href='" + googleSearchLink + "'target='_blank'>" +
        "<li class='individualResult'>" + result.results[i] + "</li></a>");
    }
    if (searchHistory.length % 3 === 0) {
      callback();
    }
  }

  function displaySearchHistory() {
    var resultSet = [];
    var resultSetTotal = 0;
    for (var j = searchHistory.length - 3; j < searchHistory.length; j++) {
      resultSet.push(searchHistory[j]);
      resultSetTotal += searchHistory[j].totalResults;
    }

    var searchHistoryBtnClass = resultSet[0].searchKeyword.replace(/\s+/g, "-") + "ResultsBtn";
    $(".searchHistory").prepend("<li><button class='" + searchHistoryBtnClass + " allSeachHistoryBtn'>" +
      resultSet[0].searchKeyword + "</button></li>");
    $("." + searchHistoryBtnClass).append("<span class='resultsCountInSearchHistory'>" + resultSetTotal + "</span>");

    $("." + searchHistoryBtnClass).click(() => {
      clearDisplayedResults();
      initialSearchInput.value = resultSet[0].searchKeyword;
      $(this).blur();
      $(".allConjunctionBtns").css("visibility", "visible");
      resultSet.forEach(result => {
        $("." + result.conjunction + "Btn").html('"' + result.conjunction + '"<span class="resultsCountInBtn">' +
          result.totalResults + '</span>');
        displayTotalNumberOfResults(result);
        displayResults(result, () => { }); // How best omit this empty anonymous function so as not cause an error in console?
      });
    });
    $(".clearSearchHistoryBtn").show();
  }

  function clearDisplayedResults() {
    initialSearchInput.value = "";
    $(".resultsCountInBtn").html("");
    $(".allSearchResults").html("");
    $(".numberOfResultsFound").html("");
  }

  $(".clearSearchHistoryBtn").click(() => {
    searchHistory = [];
    clearDisplayedResults();
    $(".searchHistory").html("");
    $(".clearSearchHistoryBtn").hide();
  });

  var selectedConjunction = "vs"; // Initial default value

  $(".vsBtn").click(() => {
    selectedConjunction = "vs";
    styleSelectedConjunctionBtn();
  });

  $(".andBtn").click(() => {
    selectedConjunction = "and";
    styleSelectedConjunctionBtn();
  });

  $(".withBtn").click(() => {
    selectedConjunction = "with";
    styleSelectedConjunctionBtn();
  });

  function styleSelectedConjunctionBtn() {
    $(".btn").removeClass("btn-primary");
    $("." + selectedConjunction + "Btn").addClass("btn-primary");
    $(".allSearchResults").hide();
    $("." + selectedConjunction + "SearchResults").show();
  }

  $("#initialSearchInput").click(() => {
    clearDisplayedResults();
    $(".allConjunctionBtns").css("visibility", "hidden");
  });

})();

// BUG: clicking search after results are already displayed, will duplicate displayed results.

// BUG: Shouldn't be able to search a blank initialSearchKeyord

// BUG: CSS - searchBtn border when highlighted appears to be duplicated
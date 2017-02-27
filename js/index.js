"use strict";

(function() {
  $("#initialSearchInput").keydown(function(key) {
    if (key.keyCode === 13) {
      ["vs", "and", "with"].forEach(function(conjunction) {
        runSearch(conjunction);
      });
      $(this).blur();
      $(".subheading").slideUp();
    }
  });

  var resultObjectStorage = [];

  function runSearch(conjunction) {
    styleSelectedConjunctionBtn()

    var initialSearchKeyword = initialSearchInput.value;
    suggestQueries(initialSearchKeyword, 0);

    var resultsArray = [initialSearchKeyword];
    var apiDataIndexCount = 0;

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
            var resultObject = new CreateResultObject();
            resultObjectStorage.push(resultObject);
            displayTotalNumberOfResults(resultObject);
            displayResults(resultObject, function() {
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

    var duplicatePositions = [1]; // Initial value of 1 allows initalSearchKeyword to always appear at top of results
    function manageDuplicateAndDisplayCountInBtn() {
      resultsArray.pop();
      duplicatePositions.push(resultsArray.length);
      var resultsCount = "<span class='resultsCountInBtn'>" + (resultsArray.length - 1) + "</span>";
      $("." + conjunction + "Btn").html('"' + conjunction + '"' + resultsCount);
    }

    function CreateResultObject() {
      this.searchKeyword = initialSearchKeyword;
      this.conjunction = conjunction;
      this.searchResultsClass = "." + conjunction + "SearchResults";
      this.results = resultsArray;
      this.totalResults = resultsArray.length - 1;
      this.duplicatePositions = duplicatePositions;
    }
  } // end of runSearch()

  function displayTotalNumberOfResults(resultObject) {
    $("." + resultObject.conjunction + "SearchResults").prepend('<li class="numberOfResultsFound">' +
      resultObject.totalResults + ' results found for <b>' + resultObject.searchKeyword +
      '</span> <span style="color:#7ca9be;">' + resultObject.conjunction + '</span></b></li>');
  }

  var conjunctionSearchHistory = [];

  function displayResults(resultObject, callback) {
    var searchChainCount = 1;
    for (var i = 1; i < resultObject.results.length; i++) {
      var previousResult = resultObject.results[i - 1] + " ";
      if (resultObject.duplicatePositions.some(elem => elem === i)) {
        previousResult = resultObject.searchKeyword + " ";
        $(resultObject.searchResultsClass).append("<li class='resultChainHeading'>Result chain " + searchChainCount + "</li>");
        searchChainCount++;
      }
      var googleSearchLink = "https://www.google.com/search?q=" + previousResult + resultObject.conjunction + " " + resultObject.results[i];
      $(resultObject.searchResultsClass).append("<a href='" + googleSearchLink + "'target='_blank'>" +
        "<li class='individualResult'>" + resultObject.results[i] + "</li></a>");
    }
    conjunctionSearchHistory.push(resultObject); // IDEA: just push in resultObject
    // This allows us to use conjunctionSearchHistory for displaySearchHistory--removing need to carefully iterate through resultObjectStorage and what is now "var i." Should elminate quite a few lines. (Pass conjunctionSearchHistory into displaySearchHistory).
    if (conjunctionSearchHistory.length === 3) {
      callback();
      conjunctionSearchHistory = [];
    }
  }

  var i = 0;

  function displaySearchHistory() {
    conjunctionSearchHistory.forEach(function(val){
      $(".searchHistory").prepend('<ol><li>' + (val.totalResults) +
          ' results <span style="color:#7ca9be;">' + val.conjunction + '</span></li></ol>');
    });

      var searchKeyword = conjunctionSearchHistory[0].searchKeyword;
      $(".searchHistory").prepend("<li><button class='" + searchKeyword + "ResultsBtn allResultsBtn'>" +
        searchKeyword + "</button></li>");

      $("." + searchKeyword + "ResultsBtn").click(function() {
        $(".numberOfResultsFound").html("");
        $(".allSearchResults").html("");
        initialSearchInput.value = searchKeyword;
        
        var tempArr = conjunctionSearchHistory;
        resultObjectStorage.forEach(function(individualResultObject) {
          var currentConjunction = individualResultObject.conjunction;
          var resultsCount = "<span class='resultsCountInBtn'>" + (individualResultObject.totalResults) + "</span>";
          $("." + currentConjunction + "Btn").html('"' + currentConjunction + '"' + resultsCount);

          displayTotalNumberOfResults(individualResultObject);
          displayResults(individualResultObject, function() {
            console.log("Here's the callback for displayResults, from the result history btn");
          });
        });
        console.log("You just clicked the result history btn for " + searchKeyword);
      });

      i = resultObjectStorage.length;
  }

  var selectedConjunction = "vs"; // Initial default value

  $(".vsBtn").click(function() {
    selectedConjunction = "vs";
    styleSelectedConjunctionBtn();
  });

  $(".andBtn").click(function() {
    selectedConjunction = "and";
    styleSelectedConjunctionBtn();
  });

  $(".withBtn").click(function() {
    selectedConjunction = "with";
    styleSelectedConjunctionBtn();
  });

  function styleSelectedConjunctionBtn() {
    $(".btn").removeClass("btn-primary");
    $("." + selectedConjunction + "Btn").addClass("btn-primary");
    $(".allSearchResults").hide();
    $("." + selectedConjunction + "SearchResults").show();
  }

  $("#initialSearchInput").click(function() {
    initialSearchInput.value = "";
    $(".resultsCountInBtn").html("");
    $(".allSearchResults").html("");
    $(".numberOfResultsFound").html("");
  });

})();
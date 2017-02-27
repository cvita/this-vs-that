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

  var searchHistory = [];

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
            searchHistory.push(resultObject);
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
      $("." + conjunction + "Btn").html('"' + conjunction + '"<span class=resultsCountInBtn>' +
        (resultsArray.length - 1) + '</span>');
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

  function displayTotalNumberOfResults(result) {
    $("." + result.conjunction + "SearchResults").prepend('<li class="numberOfResultsFound">' +
      result.totalResults + ' results found for <b>' + result.searchKeyword +
      '</span> <span style="color:#7ca9be;">' + result.conjunction + '</span></b></li>');
  }

  function displayResults(result, callback) {
    var searchChainCount = 1;
    for (var i = 1; i < result.results.length; i++) {
      var previousResult = result.results[i - 1];
      if (result.duplicatePositions.some(elem => elem === i)) {
        previousResult = result.searchKeyword;
        $(result.searchResultsClass).append("<li class='resultChainHeading'>Result chain " + searchChainCount + "</li>");
        searchChainCount++;
        //$(result.searchResultsClass).append("<li class='individualResult test"+ i + "'>" + result.searchKeyword + "</li></a>");
      }

      var googleSearchLink = "https://www.google.com/search?q=" + previousResult + " " + result.conjunction + " " + result.results[i];
      
      $(result.searchResultsClass).append("<a href='" + googleSearchLink + "'target='_blank'>" +
        "<li class='individualResult test"+ i + "'>" + result.results[i] + "</li></a>");  
    }
    
    window.onmouseover = function(elem) {
      if (elem.target.className.indexOf("individualResult") > -1) {
        var currentlyHoveredFull = (elem.target.className.slice(16, elem.target.className.length));
        var currentlyHovered = "test" + (currentlyHoveredFull.slice(5, currentlyHoveredFull.length));
        var previousElement = "test" + (currentlyHoveredFull.slice(5, currentlyHoveredFull.length) -1);
        // if previous element hasClass 'resultChainHeading' then adjust val of previousElement
        $("." + previousElement).css("background", "pink");
        $("." + currentlyHovered).mouseout(function(){
          $("." + previousElement).css("background", "#f3f3f3");
        });
      }
    };
        


    
    if (searchHistory.length % 3 === 0) {
      callback();
    }
  }

  function displaySearchHistory() {
    $(".clearSearchHistory").show();
    for (var recentResultSet = searchHistory.length - 3; recentResultSet < searchHistory.length; recentResultSet++) {
      switch (searchHistory[recentResultSet].conjunction) {
        case "vs":
          var vsResult = searchHistory[recentResultSet];
          break;
        case "and":
          var andResult = searchHistory[recentResultSet];
          break;
        case "with":
          var withResult = searchHistory[recentResultSet];
          break;
      }
    }
    var resultSet = [vsResult, andResult, withResult];

    var searchKeywordNoSpaces = vsResult.searchKeyword.replace(/\s+/g, "-");
    $(".searchHistory").prepend("<li><button class='" + searchKeywordNoSpaces + "ResultsBtn allResultsBtn'>" +
      vsResult.searchKeyword + "</button></li>");

    var resultSetTotal = vsResult.totalResults + andResult.totalResults + withResult.totalResults;
    var searchHistoryResultCount = "<span class='resultsCountInSearchHistory'>" + resultSetTotal + "</span>";

    $("." + searchKeywordNoSpaces + "ResultsBtn").append(searchHistoryResultCount);
    setupResultHistoryBtnFunctionality(searchKeywordNoSpaces, resultSet);
  }

  function setupResultHistoryBtnFunctionality(searchKeywordNoSpaces, resultSet) {
    $("." + searchKeywordNoSpaces + "ResultsBtn").click(function() {
      clearPreviousSearch(resultSet[0].searchKeyword);
      resultSet.forEach(function(result) {
        $("." + result.conjunction + "Btn").html('"' + result.conjunction + '"<span class="resultsCountInBtn">' +
          result.totalResults + '</span>');
        displayTotalNumberOfResults(result);
        displayResults(result, function() {}); // How best omit this anonymous function so as not cause an error in console?
      });
    });
  }

  $(".clearSearchHistory").click(function() {
    searchHistory = [];
    clearPreviousSearch("");
    $(".searchHistory").html("");
    $(".clearSearchHistory").hide();
  });

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
    clearPreviousSearch("");
  });

  function clearPreviousSearch(searchedFor) {
    initialSearchInput.value = searchedFor;
    $(".resultsCountInBtn").html("");
    $(".allSearchResults").html("");
    $(".numberOfResultsFound").html("");
  }

})();
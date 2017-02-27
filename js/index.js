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

  var finalResultsStorage = [];

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
            displayTotalNumberOfResults();
            displayResults();
            finalResultsStorage.push(new StoreFinalResults());
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

    function displayTotalNumberOfResults() {
      $("." + conjunction + "SearchResults").prepend('<li class="numberOfResultsFound">' +
        (resultsArray.length - 1) + ' results found for <b>' + initialSearchKeyword +
        '</span> <span style="color:#7ca9be;">' + conjunction + '</span></b></li>');
    }

    function displayResults() {
      var searchChainCount = 1;
      for (var i = 1; i < resultsArray.length; i++) {
        var previousResult = resultsArray[i - 1];
        if (duplicatePositions.some(elem => elem === i)) {
          previousResult = initialSearchKeyword;
          $("." + conjunction + "SearchResults").append("<li class='resultChainHeading'>Result chain " + searchChainCount + "</li>");
          searchChainCount++;
        }
        var googleSearchLink = "https://www.google.com/search?q=" + previousResult + " " + conjunction + " " + resultsArray[i];
        $("." + conjunction + "SearchResults").append("<a href='" + googleSearchLink + "'target='_blank'>" +
          "<li class='individualResult'>" + resultsArray[i] + "</li></a>");
      }
    }

    function StoreFinalResults() {
      this.initialSearchKeyword = initialSearchKeyword;
      this.conjunction = conjunction;
      this.results = resultsArray.slice(1, resultsArray.length);
      this.duplicatePositions = duplicatePositions;
    }
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
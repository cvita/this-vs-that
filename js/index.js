$(".searchBtn").click(function() {
  runSearch();
});

$("#initialSearchInput").keydown(function(key) {
  if (key.keyCode === 13) {
    runSearch();
  }
});

function runSearch() {
  // Clear displayed results from any previous searches
  $(".primarySearchResults").html("");
  $(".additionalSearchResults").html("");
  
  // Obtain user's search input
  document.getElementById("initialSearchInput");
  var initialSearchKeyword = initialSearchInput.value;
  initialSearchInput.value = "";
  $(".resultsFor").html('results for "' + initialSearchKeyword + '"');
  
  // To store all returned results
  var resultsArr = [];

  // For recursive searches (see line 44)
  var indexCount = 0;

  // Queries Google's auto-suggestions
  function suggestQueries(searchVal, index) {
    var apiURL = "http://suggestqueries.google.com/complete/search?client=firefox&callback=?&q=";
    // Appending the string " vs" to focus results on comparisons
    $.getJSON(apiURL + searchVal + " vs", function(apiData) {
      var returnedResult = apiData[1][index];

      // A useful result must contain " vs "
      if (/ vs /g.test(returnedResult)) {
        // Trim the result to eliminate text through "vs ". Then, update value of returnedResult
        returnedResult = returnedResult.slice(returnedResult.indexOf("vs ") + 3, returnedResult.length);
        resultsArr.push(returnedResult);
        // If result isn't useful, push a duplicate to resultsArr
      } else {
        resultsArr.push(resultsArr[resultsArr.length - 1]);
      }

      // Returns undefined, unless a duplicate value is found
      var checkForDuplicate = resultsArr.find(function(elem, pos) {
        return resultsArr.indexOf(elem) !== pos;
      });

      // If duplicate is found...
      if (checkForDuplicate !== undefined) {
        // Remove last item from array, which is the duplicate
        resultsArr.pop();
        // Display result
        $(".primarySearchResults").append("<li>" + resultsArr[indexCount] + "</li>");
        // Run search again, but based on next result of the original search
        if (indexCount < apiData[1].length) {
          indexCount++;
          suggestQueries(initialSearchKeyword, indexCount);
        } else {
          // Display additional results
          for (var j = indexCount + 1; j < resultsArr.length; j++) {
            $(".additionalSearchResults").append("<li>" + resultsArr[j] + "</li>");
          }
          $(".resultsFor").prepend(resultsArr.length + " ");
        }
        // If no duplicate found, repeat search, using result as new search keyword
      } else {
        suggestQueries(returnedResult, 0);
      }
    });
  }
  // Initial call for search. Argument of 0 returns the first result or search
  suggestQueries(initialSearchKeyword, 0);
}

// var apiURL = "https://www.googleapis.com/customsearch/v1?&cx=004780494868695699702%3Andpu_iiwfwo&num=1&key="; // num=1 returns 1 result
// var userKey = "AIzaSyAxXnGEhkkZmEh7zfugJpAsJ7kpSU4GbDc";
// var initialSearchKeyword;
// document.getElementById("userSearchTerm");
// $(".searchBtn").click(function() {
//   var searchWeb = function() {
//     initialSearchKeyword = "&q=" + userSearchTerm.value + " vs.";
//     $.getJSON(apiURL + userKey + initialSearchKeyword, function(primarySearchResults) {
//       console.log(primarySearchResults);

//       for (var i = 0; i < primarySearchResults.items.length; i++) {
//         $(".primarySearchResults").append("<li>" + primarySearchResults.items[i].title + "</li>");
//       }
//     });
//     //initialSearchKeyword = "&q=" + primarySearchResults.items[0].title + " vs.";

//   }();
// });

/*
Custom search name: web
Your search engine ID: 004780494868695699702:ndpu_iiwfwo

Your project ID will be this-vs-that-search
Use this key in your application by passing it with the key=API_KEY parameter.
AIzaSyAxXnGEhkkZmEh7zfugJpAsJ7kpSU4GbDc  // Restrict key after setup here
*/

// Why/how does &callback=? enable this api?
// \s(\w+)|(\d+)(?=\s+vs)
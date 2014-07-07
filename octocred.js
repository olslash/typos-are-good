// var github = require("octonode");
var inquirer = require('inquirer');
var https = require('https');
var limiter = require('./rateLimitedQueue.js');
var requestQueue = limiter.createQueue({interval: 3000});

var makeGithubApiRequest = function(options, callback) {
  var result;
  console.log('requesting', options);
  var req = https.request(options, function(res) {
    // console.log('STATUS: ' + res.statusCode);
    // console.log('HEADERS: ' + JSON.stringify(res.headers));
    res.setEncoding('utf8');
    var body = '';
    res.on('data', function (chunk) {
      body = body.concat(chunk);
    });

    res.on('end', function(){
      // console.log(JSON.parse(body));
      var json = JSON.parse(body);
      // console.log(json.items[0].text_matches);
      result = json;
      callback(result);
    });
  });

  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });

  req.end();
};

var getStarredRepos = function(threshold, callback, page) {
  var auth = 'Basic ' + new Buffer('olslash' + ':' + 'mycoolpassword1').toString('base64');

  var options = {
    host: 'api.github.com',
    // port: 80
    path: '/search/repositories?per_page=100&page=' + page + '&q=stars:>' + threshold,
    // path: '/search/code?q=addClass+in:file+language:js+repo:jquery/jquery',
    headers: {'user-agent': 'olslash',
              Accept: 'application/vnd.github.v3.text-match+json',
              Authorization: auth}
    // method: 'POST'
  };


  makeGithubApiRequest(options, callback);
};

var digForStars = function(callback) {
  var result = {items:[]};

  function traverse(page) {
    console.log('finding stars on page', page);
    getStarredRepos(10000, function(json) {
      json.items.forEach(function(repo) {
        result.items.push(repo.full_name);
      });

      if(json.items.length !== 0) {
        //if there are still results to be had
        traverse(page + 1);
      } else {
        callback(result.items);
      }
    }, page);    
  }
  var page = 1;
  traverse(page);
};

var getCode = function(typoslist, reposlist, callback) {
  var auth = 'Basic ' + new Buffer('olslash' + ':' + 'mycoolpassword1').toString('base64');

  reposlist.forEach(function(repo) {
    // for every repo
    for(var word in typoslist) {
      var testString = [];
      typoslist[word].forEach(function(typo, i) {
        // push every typo into a test string
        testString.push(typo);
        if(typoslist[word][i + 1]) {
          // if there's another typo for this word, add it to the search string
          testString.push('%20OR%20');
        }
      });


      testString = testString.join('');
      var options = {
        host: 'api.github.com',
        // port: 80
        // path: '/search/repositories?per_page=100&page=' + page + '&q=stars:>' + threshold,
        path: '/search/code?q='+ testString +'+in:file+language:js+repo:' + repo,
        headers: {'user-agent': 'olslash',
                  Accept: 'application/vnd.github.v3.text-match+json',
                  Authorization: auth}
        // method: 'POST'
      };

      // console.log('requesting', options.path);
      
      // console.log(options.path);
      // var throttledRequest = _.throttle(makeGithubApiRequest, 3050);
      // throttledRequest(options, callback);
      // console.log('request', options);
        requestQueue.add(makeGithubApiRequest, options, callback);
      // put the API request in a queue
    }
  });
  
};

var digForTypos = function(typos, repos, callback) {
  // var testRepos = ['jquery/jquery', 'DavidWrigley/RGB'];

  // console.log('finding typos on page');

  getCode(typos, repos, function(json) {
    callback(json);
    // json.items.forEach(function(repo) {

    // });
  });
};


digForStars(function(ALL_REPOS_OVER_5000) {
  // result.items has every repo
  // result.item[i].full_name has the repo name
  // result.items.forEach(function(item) {
  //   console.log(item.full_name);
  // });
  
  // now we enter callback hell, holding only a LIST containing
  // the names of FIVE THOUSAND or so PRIME REPOS. Onward.

  // TEST, REMOVE BELOW TO UNLEASH:
  // ALL_REPOS_OVER_5000 = ['jquery/jquery'];

  // var testTypos = {align: ['aling', 'allign', 'aline'], position: ['possition']};
  
  digForTypos(typos, ALL_REPOS_OVER_5000, function(result) {
    // var result = {items:[]};
    console.log(result);
  });
});



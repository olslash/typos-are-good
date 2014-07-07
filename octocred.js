// var github = require("octonode");
var inquirer = require('inquirer');
var https = require('https');

var makeGithubApiRequest = function(options, callback) {
  var result;
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

var traversePages = function(callback) {
  var result = {items:[]};

  function traverse(page) {
    console.log('traversing', page);
    getStarredRepos(7000, function(json) {
      json.items.forEach(function(repo) {
        result.items.push(repo);
      });

      if(json.items.length !== 0) {
        //if there are still results to be had
        traverse(page + 1);
      } else {
        callback(result);
      }
    }, page);    
  }
  var page = 1;
  traverse(page);
};

traversePages(function(result) {
  // result.items has every repo
  // result.item[i].full_name has the repo name
  result.items.forEach(function(item) {
    console.log(item.full_name);
  });
});

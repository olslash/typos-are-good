var fs = require('fs');
var split = require('split');
var through = require('through');

// build an object full of words: {a: [], the: [], hi: []}
// we will generate typos within the sub arrays:
// {a: [q,w,s,z]} etc
var parseWords = function(callback) {
  var json = {};
  var write = fs.createWriteStream('json.txt');
  var read = fs.createReadStream('words.txt')
    .pipe(split())
    .pipe(through(function write(data){
      json[data] = [];
    }, function end(){
      console.log('done parsing');
      callback(json);
    }));
};

var typoize = function(dict) {
  var methods = {
    genSwappedLetters: function(dict) {
      for(var word in dict) {
        var typos = dict[word];

        word = word.split('');
        word.forEach(function(letter, i) {
          if(word[i + 1]) {
            // if a next letter exists
            var tempword = word.slice(0);
            var tempchar = tempword[i];
            tempword[i] = word[i + 1];
            tempword[i + 1] =  tempchar;
            typos.push(tempword.join(''));
          }
        });
      }
      return dict;
    },

    genDoubledLetters: function(dict) {
      for(var word in dict) {
        var typos = dict[word];
        
      }
      return dict;
    },

    genKeyboardNeighbors: function(dict) {
      return dict;
    }
  };

  for(var method in methods) {
    dict = methods[method].call({}, dict);
  }

  return dict;
};

parseWords(function(json){
  typoize(json);
  var count = 0;
  for(var word in json) {
    count += json[word].length;
  }
  console.log(count);
});

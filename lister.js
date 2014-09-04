var es = require('event-stream'),
    JSONStream = require('JSONStream'),
    fs = require('fs'),
    async = require('async'),

    request = require('request');


// Define stream handlers

var cardNameParserFactory = function(parseTarget) {
    return JSONStream.parse(parseTarget);
};

var stringifyStreamSerializerFactory = function() {
    return es.stringify();
};

var quotesStripperFactory = function() { return es.map(function(data, cb) {
    // This guy is useful in combination with stringify to let newlines within titles stay stringified
    var newlineStrippedData = data.replace(/(\r\n|\n|\r)/gm,"");
    var unQuotedData = newlineStrippedData.substring(1, newlineStrippedData.length - 1);
    var reNewLinedDatadata = unQuotedData + "\n";
    cb(null, reNewLinedDatadata);
})};

var consoleObjectPrinterFactory = function() { return es.map(function (data, cb) {
    console.log(data);
    cb(null, data);
})};


// Remote Trello board download function
var downloadTrelloBoard = function(boardUrl, cb) {
    request('https://trello.com/b/aKseBapy/conversion-to-versionone.json', function (error, response, body) {
        console.log(response.statusCode);
        if (!error && response.statusCode == 200) {
            // Success
            cb(null, body);
        }
        if (!error && response.statusCode == 401) {
            cb('Must be logged in to Trello (auth error)', body);
        }
    });
};


console.log('Opening files for reading and writing...');

// Prepare output files
var combinedOutputStream = fs.createWriteStream('output.json', {
    encoding: 'utf8'
});
combinedOutputStream.on('error', function(err) {
    throw err;
});
combinedOutputStream.on('finish', function() {
    console.log('Finished writing output file.');
});
combinedOutputStream.on('close', function() {
    console.log('Finished saving files, all done!');
});
// Prepare input files
var inputStream = fs.createReadStream('input.json', {
    encoding: 'utf8'
});
inputStream.on('error', function(err) {
    throw err;
});



// "Topology"
var streamFlow;
streamFlow = inputStream.pipe( cardNameParserFactory( 'cards.*.name' ) );
streamFlow.on('error', function(err) {
    cb('JSON trello card parser error: ' + err);
});
streamFlow = streamFlow.pipe( stringifyStreamSerializerFactory() );
streamFlow.on('error', function(err) {
    cb('string serializer error: ' + err);
});
streamFlow = streamFlow.pipe( quotesStripperFactory() );
streamFlow.on('error', function(err) {
    cb('quote stripper error: ' + err);
});
var streamFlowWaited = streamFlow.pipe( es.wait(function(err, text) {
    console.log('wait got end');
}) );


// main()
console.log('Starting to parse input.json...');

streamFlow.pipe(combinedOutputStream);



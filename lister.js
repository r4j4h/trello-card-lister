var es = require('event-stream'),
    JSONStream = require('JSONStream'),
    fs = require('fs'),
    async = require('async'),

    request = require('request');


// Define stream handlers

/**
 * Tease out card names from a Trello Board JSON Blob
 * @returns {*}
 */
var cardNameParserFactory = function() {
    return JSONStreamParserFactory('cards.*.name');
};

/**
 * Tease out card descriptions from a Trello Board JSON Blob
 * @returns {*}
 */
var cardDescriptionParserFactory = function() {
    return JSONStreamParserFactory('cards.*.desc');
};

/**
 * Tease out card short urls from a Trello Board JSON Blob
 * @returns {*}
 */
var cardShortUrlParserFactory = function() {
    return JSONStreamParserFactory('cards.*.shortUrl');
};

/**
 * Tease out JSON blobs from a JSON Blob using JSONStream.parse
 * @returns {*}
 */
var JSONStreamParserFactory = function(parseTarget) {
    return JSONStream.parse(parseTarget);
};

/**
 * Collect several text stream emissions and wrap them in quotes and newlines, handling newlines inside them.
 * @returns {stringify|*}
 */
var stringifyStreamSerializerFactory = function() {
    return es.stringify();
};

/**
 * Strip the quotes from the output of es.stringify() and stringifyStreamSerializerFactory()
 * @returns {map|*}
 */
var quotesStripperFactory = function() { return es.map(function(data, cb) {
    // This guy is useful in combination with stringify to let newlines within titles stay stringified
    var newlineStrippedData = data.replace(/(\r\n|\n|\r)/gm,"");
    var unQuotedData = newlineStrippedData.substring(1, newlineStrippedData.length - 1);
    var reNewLinedDatadata = unQuotedData + "\n";
    cb(null, reNewLinedDatadata);
})};

/**
 * Print every stream emission to the console.
 * @returns {map|*}
 */
var consoleObjectPrinterFactory = function() { return es.map(function (data, cb) {
    console.log(data);
    cb(null, data);
})};


/**
 * Download a Trello Board JSON Blob from a given url
 *
 * Note: Requires authentication. Not implemented yet.
 *
 * @param {String} boardUrl
 * @param {Function} cb
 */
var downloadTrelloBoard = function(boardUrl, cb) {
    request(boardUrl, function (error, response, body) {
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
var namesOutputStream = fs.createWriteStream('output-names.json', {
    encoding: 'utf8'
});
namesOutputStream.on('error', function(err) {
    throw err;
});
namesOutputStream.on('finish', function() {
    console.log('Finished writing names output file.');
});
namesOutputStream.on('close', function() {
    console.log('Finished saving names output file.');
});

var descriptionOutputStream = fs.createWriteStream('output-descriptions.json', {
    encoding: 'utf8'
});
descriptionOutputStream.on('error', function(err) {
    throw err;
});
descriptionOutputStream.on('finish', function() {
    console.log('Finished writing descriptions output file.');
});
descriptionOutputStream.on('close', function() {
    console.log('Finished saving descriptions output file.');
});

var shortUrlsOutputStream = fs.createWriteStream('output-shortUrls.json', {
    encoding: 'utf8'
});
shortUrlsOutputStream.on('error', function(err) {
    throw err;
});
shortUrlsOutputStream.on('finish', function() {
    console.log('Finished writing short urls output file.');
});
shortUrlsOutputStream.on('close', function() {
    console.log('Finished saving short urls output file.');
});

// Prepare input files
var inputStream = fs.createReadStream('input.json', {
    encoding: 'utf8'
});
inputStream.on('error', function(err) {
    throw err;
});

/**
 * Convert a Trello Board JSON object into a newline delimited text stream of names, descriptions, or urls.
 *
 * @param {pipe} inputStream A text stream that emits a Trello Board JSON object
 * @param {Function} boardParser A text stream enabled function. Defaults to cardNameParserFactory()'s returned value.
 * @returns {pipe} A text stream that emits a newline delimited text stream
 */
function doTrelloBoardParseTopology( inputStream, boardParser ) {
    var outputStream;
    var boardParser = boardParser || cardNameParserFactory();

    // "Topology"
    var streamFlow;
    streamFlow = inputStream.pipe( boardParser );
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

    return streamFlow;
}


// main()
console.log('Starting to parse input.json...');



var cardNamesStream = doTrelloBoardParseTopology( inputStream, cardNameParserFactory() );
cardNamesStream.pipe(namesOutputStream);
var cardShortUrlsStream = doTrelloBoardParseTopology( inputStream, cardShortUrlParserFactory() );
cardShortUrlsStream.pipe(shortUrlsOutputStream);
var cardDescriptionsStream = doTrelloBoardParseTopology( inputStream, cardDescriptionParserFactory() );
cardDescriptionsStream.pipe(descriptionOutputStream);


// We include all needed dependencies
const http = require('http');
const fs = require('fs');
const path = require('path');
const logger = require('./libs/logger');

const port = process.env.PORT || 3000;

let lArchivedStats = {};

// We put here all our HTTP status code and message
const HTTP_ERROR_CONTENT = {
    NO_ERROR                : {code : 200, value : ''},
    INTERNAL_ERROR          : {code : 500, value : '<h2><center>Internal Error !</center></h2>'},
    NOT_FOUND_ERROR         : {code : 404, value : '<h2><center>Not Found !</center></h2>'},
    INVALID_HEADER_ERROR    : {code : 400, value : 'Bad Request !'}
}

// function for generate random string
function generateRandomString(pLen){
    let lResult = '';
    const lCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const lCharactersLength = lCharacters.length;

    for(let lI = 0; lI < pLen; lI++) {
        lResult += lCharacters.charAt(Math.floor(Math.random() * lCharactersLength));
    } 

    return lResult;
}

function archiveStats(pID, pType){

    if(pType != "DISPLAY" && pType != "VIEWED")
        return;

    if(!(pID in lArchivedStats)){
        lArchivedStats[pID] = {
            DISPLAY: 0,
            VIEWED: 0
        }
    }

    lArchivedStats[pID][pType]++;
    fs.writeFileSync('./archives/stats.json', JSON.stringify(lArchivedStats));
}

// Create HTTP server
const lServer = http.createServer((pReq, pRes) => {
    const lURL = pReq.url;
    // Default header content
    let lHeader = {'Content-Type': 'text/html'};
    logger.info(`RECV Request : ${lURL}`);

    // Here we handle our request
    switch(lURL){

        // We need index.html let's get it from the server
        case '/index.html':

            const lPath = path.join(__dirname, '/index.html');

            fs.readFile(lPath, (pErr, pContent) => {

                // if we had an error when reading our file
                if(pErr){
                    pRes.writeHead(HTTP_ERROR_CONTENT.INTERNAL_ERROR.code, lHeader);
                    pRes.end(HTTP_ERROR_CONTENT.INTERNAL_ERROR.value);

                    logger.error(`Unable to read file ${lPath}, check if file exist on the server`);

                    return;
                }

                // We send our page
                pRes.writeHead(HTTP_ERROR_CONTENT.NO_ERROR.code, lHeader);
                pRes.end(pContent);
            });
        break;

        // We handle our events stream requested from client
        case '/events':
            lHeader = {'Content-Type' : 'text/event-stream',
                       'Cache-Control': 'no-cache',
                       'Connection'   : 'keep-alive'};

            pRes.writeHead(HTTP_ERROR_CONTENT.NO_ERROR.code, lHeader);

            function sendEventData() {
                const lEventData = {
                    value: generateRandomString(10),
                    time : new Date().toLocaleTimeString()
                };
    
                pRes.write('event: news\n');
                pRes.write(`data: ${JSON.stringify(lEventData)}\n\n`)
                
                // We calculate our delay between 3 and 10 seconds 
                const lDelay = Math.floor(Math.random() * (10000 - 3000 + 1)) + 3000;
                setTimeout(sendEventData, lDelay);
                
            }

            sendEventData();

        break;

        // We handle our stats request sent by our client, every time our canvas is refreshed or event is handled when mouse overing it 
        case '/stats':
            // we only accept POST method 
            if(pReq.method == 'POST'){
                let lBody = '';

                // When data is chunked we get piece of data and we push it in our lBody var 
                pReq.on('data', (pChunk) => {
                    lBody += pChunk;
                });

                pReq.on('end', () => {
                    const lData = JSON.parse(lBody);

                    // If our data are invalid or we don't have our id in our request header we send BAD_REQUEST error 
                    if(!lData || !('x-plugin-id') in pReq.headers)
                    {
                        logger.error('RECV invalid request from client');
                        pRes.writeHead(HTTP_ERROR_CONTENT.INVALID_HEADER_ERROR.code, {'Content-Type': 'text/plain'});
                        pRes.end("Bad Request");

                        return;
                    }

                    const lID = pReq.headers['x-plugin-id'];
                    logger.info(`RECV hit from id ${lID}: ${lData.pEventType}`);

                    pRes.writeHead(HTTP_ERROR_CONTENT.NO_ERROR.code, {'Content-Type': 'text/plain'});
                    pRes.end(`RECV Hit from id : ${lID}`);

                    archiveStats(lID, lData.pEventType);

                });
            } 
        break;

        // By default we send a 404 error
        default:

            pRes.writeHead(HTTP_ERROR_CONTENT.NOT_FOUND_ERROR.code, lHeader);
            pRes.end(HTTP_ERROR_CONTENT.NOT_FOUND_ERROR.value);

            logger.error(`URL ${lURL} not found `);
        break;
    }
});

// We start our server on port 3000 by default
lServer.listen(port, () => {
    logger.success(`HTTP server started on port ${port}`);
});

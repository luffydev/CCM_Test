// We include all needed dependencies
const http = require('http');
const fs = require('fs');
const path = require('path');
const logger = require('./libs/logger');

const port = process.env.PORT || 3000;

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

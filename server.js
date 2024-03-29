// Server.js
// Server startup code

//vanilla node version (all we need for now, plus good for foundation)
var http = require('http'),
    url = require('url'),
    fs = require('fs'),
    pg = require('pg');

function startService(route, handlers){

   //first responder to request
    function onRequest(request, response){
        var requestParsed = url.parse(request.url);
        var pathname = requestParsed.pathname;
        var query = requestParsed.query;
		console.log('---new request'.rainbow);
                
        //TODO to be changed
        //Takes care of requests for files under css/ and js/
        //if pathname looks like /js/~ or /css/~ 
        //TODO AND it does not uses any more slashes from thereon
        //AND the path it asks for is real
        if(fs.existsSync(pathname.slice(1))){
            console.log("sending asset: ".green+pathname.green);
            var mimetype;
            if(/^\/js\//.test(pathname))
                mimetype='text/javascript';
            else if(/^\/css\//.test(pathname))
                mimetype='text/css';
            else if(/^\/img\//.test(pathname)){
                mimetype='image/';
                if(/png$/.test(pathname)){
                    mimetype=mimetype+'png';
                }
                if(/svg$/.test(pathname)){
                    mimetype=mimetype+'svg+xml';
                }
            } else return;

            response.writeHead(200,{'Content-Type':mimetype});
            //TODO WARNING--synchronous method--possible bottlneck
            response.write(fs.readFileSync(pathname.slice(1)));
            response.end();
            return;
        }

        //oh this may be a legit page request or a POST
        var postData= '';
        request.setEncoding('utf8');
        request.addListener('data', function(postDataChunk){
            postData+=postDataChunk;
        });

        request.addListener('end',function(){
            route(handlers, pathname, query, response, postData);
        });
    }

    port = Number(process.env.PORT || 9001);
    http.createServer(onRequest).listen(port);
    console.log('listening to ' + port);
}

exports.startService = startService;

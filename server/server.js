const http=require("http")
const fs=require("fs")

function read_404_page(){
    return fs.readFileSync("./html/404.html",encoding.utf8)
}
function read_homepage(){
    return fs.readFileSync("./html/index.html",encoding.utf8)
}

const content={
    html:{"Content-Type":"text/html"},
}
const encoding={
    utf8:{encoding:"utf8"},
}
const request_handler={
    "/":function(req,res){
        res.writeHeader(200,content.html)
        const file=read_homepage()
        res.write(file)
        res.end()
    }
}

const server=http.createServer((req,res)=>{
    //console.log(req.url,req.method)
    handler=request_handler[req.url]
    if(handler){
        handler(req,res)
    }else{
        res.writeHeader(404,content.html)
        res.end(read_404_page())
    }
})
server.listen(8080,"127.0.0.1")
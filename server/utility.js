const fs=require("fs")

function send_static_data(req,res){
    const html_folder=fs.readdirSync("../html");
    if(html_folder.includes(req.url.substr(1))){
        res.writeHeader(200,content.from_filename(req.url))
        res.write(fs.readFileSync("../html"+req.url,encoding.utf8))
        res.end()
        console.log(req.url, "was sent.")
        return true
    }

    return false
}
module.exports.send_static_data=send_static_data

const content={
    html:{"Content-Type":"text/html"},
    css:{"Content-Type":"text/css"},
    js:{"Content-Type":"text/javascript"},
    json:{"Content-Type":"application/json"},
    from_filename:function(n){
        if(n.endsWith(".css")){
            return content.css
        }else if(n.endsWith(".js")){
            return content.js
        }else if(n.endsWith(".html")){
            return content.html
        }else if(n.endsWith(".json")){
            return content.json
        }
    }
}
module.exports.content=content

const encoding={
    utf8:{encoding:"utf8"},
    base64:{encoding:"base64"},
}
module.exports.encoding=encoding

//parse data from get/post methods
//'then' is callback executed after data has been parsed
function parse_data(req,then){
    if(req.method=="POST"){
        var chunks=""
        req.on("data",(chunk)=>{
            chunks+=chunk
        })
        req.on("end",()=>{
            var params=new url.URLSearchParams(chunks)
            var ret={method:"POST"}
            params.forEach((value,key,searchparams)=>{
                ret[key]=value
            })
            then(ret)
        })
    }else{
        var params=new url.URLSearchParams(req.url)
        var ret={method:"GET"}
        params.forEach((value,key,searchparams)=>{
            ret[key]=value
        })
        then(ret)
    }
}
module.exports.parse_data=parse_data
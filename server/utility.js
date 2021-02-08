const fs=require("fs")
const url=require("url")

function send_static_data(req,res){
    const html_folder=fs.readdirSync("../html");
    if(html_folder.includes(req.url.substr(1))){
        var header=content.from_filename(req.url)

        const e=encoding.from_filename(req.url)
        var data=fs.readFileSync("../html"+req.url,e)

        if(e==encoding.base64){
            data=Buffer.from(data,"base64")
            header["Content-Length"]=data.length
        }

        res.writeHeader(200,header)
        res.end(data)

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
    png:{"Content-Type":"image/png"},
    ico:{"Content-Type":"image/vnd.microsoft.icon"},
    from_filename:function(n){
        if(n.endsWith(".css")){
            return content.css
        }else if(n.endsWith(".js")){
            return content.js
        }else if(n.endsWith(".html")){
            return content.html
        }else if(n.endsWith(".json")){
            return content.json
        }else if(n.endsWith(".png")){
            return content.png
        }else if(n.endsWith(".ico")){
            return content.ico
        }
    }
}
module.exports.content=content

const encoding={
    utf8:{encoding:"utf8"},
    base64:{encoding:"base64"},
    from_filename:function(n){
        if(n.endsWith(".css")){
            return encoding.utf8
        }else if(n.endsWith(".js")){
            return encoding.utf8
        }else if(n.endsWith(".html")){
            return encoding.utf8
        }else if(n.endsWith(".json")){
            return encoding.utf8
        }else if(n.endsWith(".png")){
            return encoding.base64
        }
    }
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
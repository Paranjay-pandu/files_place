const express = require("express")
const path = require("path")
const app = express()
const fs = require('fs')
const { exec } = require("child_process")

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.set("view engine", "ejs")
app.use(express.static(path.join(__dirname, "public")))


app.get("/", (req, res)=>{
    fs.readdir("./files", (err, files)=>{
        res.render("index", {files: files})
    })
})
app.post("/create", (req, res)=>{
    const data = req.body
    const titles = data.title.split(' ')
    const title = titles.join('-')
    fs.writeFile(`./files/${title}${req.body.type}`, data.desc, ()=>{
        console.log("file created successfully")
    })
    res.redirect('/')
})
app.get('/notes/:filename', (req, res)=>{
    fs.readFile(`files/${req.params.filename}`, "utf-8", (err, filedata)=>{
        res.render("file",{filename: req.params.filename, filedata :filedata})
    })
})
app.get('/edit/:filename', (req, res)=>{
    fs.readFile(`files/${req.params.filename}`, "utf-8", (err, filedata)=>{
        if(err){
            console.log(err)
        }else{
            const ext = path.extname(`/files/${req.params.filename}`)
            res.render("edit", {
                filename: req.params.filename,
                filedata: filedata,
                ext: ext
            });
        }
    })
})
app.post('/save/:filename', (req, res)=>{
    const filen = req.body.title.split(' ').join("-")
    fs.rename(`./files/${req.params.filename}`,`./files/${filen}${req.body.type}` , function(err){
        if(err){
            console.error(err)
        }
        else{
            console.log(req.params.filename)
            fs.writeFile(`./files/${filen}${req.body.type}`, req.body.desc,'utf-8',function(err){
                if(err){
                    console.error(err)
                    return res.status(500).send('Error writing the file.');
                }else{
                    res.redirect(`/`)
                    console.log(`renamed successfully to ${req.body.title}!!`)
                }
            })
        }
    })
})

app.get('/delete/:filename', (req, res)=>{
    fs.rm(`./files/${req.params.filename}`, (err)=>{
        if(err){
            console.error(err)
        }else{
            console.log("The file has been deleted")
            res.redirect('/')
        }
    })
})

app.get("/runscript/:filename", (req, res)=>{
    const filename = req.params.filename.split(".")[0]
    const ext = req.params.filename.split(".")[1]
    exec(`cd ./files/${filename}.${ext}`, (err, stdout, stderr)=>{
        if(err){
            console.log(err)
        }
        else if(stderr){
            console.log(stderr)
        }
        res.send(stdout)
    })
})

app.get("/download/:filename", (req,res)=>{
    filename = req.params.filename
    res.download(`./files/${filename}`, filename, (err)=>{
        if(err){
            console.log(err)
        }else{
            console.log(`file downloaded successfully!!`)
            return `file downloaded successfully!!`
        }
    })
})

app.get("/sample", (req, res)=>{
    res.render("sample")
})
app.listen(3000)
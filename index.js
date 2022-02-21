const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser');
const { default: axios } = require('axios');

const app = express();

app.use(cors())
app.use(bodyParser.json())

const posts = {}

app.get("/api/v1/blog/post/query", (req, resp) => {
    resp.send(posts);
})

const handleMyEvent = (type, data) => {
    if (type == "Post Created") {
        const {id, title} = data;
        posts[id] = {id, title, comments:[]}
        return
    }

    if (type == "Comment Created") {
        const {postId, commentId, message} = data;
        const post = posts[postId];
        console.log("post id comment created with message", postId, message)
        post?.comments.push({commentId, message})
        return
    }
}

app.post("/eventBus/event/listener", (req, resp) => {
    const {type, data} = req.body;
    console.log("Recieved event, ", type)
    handleMyEvent(type, data);
    resp.send({});
})

app.listen(4003, async () => {
    const resp = await axios.get("http://localhost:4005/eventBus/event").catch(e=>console.log(e.message))
    const events = resp.data;
    for (let e of events) {
        handleMyEvent(e.type, e.data);
    }
    console.log("Service has started at 4003. Query has loaded all the events.")
})
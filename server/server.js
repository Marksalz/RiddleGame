import express from "express";
import router from "./router.js";

const server = express();

server.use(express.json());
server.use("/api", router);

server.listen(4545, () => {
    console.log("Server running on port 4545");
});

/*
Create:
  curl -X POST http://localhost:4545/api/riddles/create_riddle \
  -H "Content-Type: application/json" \
  -d '{"name":"Sample Riddle","taskDescription":"What has a head and a tail but no body?","correctAnswer":"Coin","difficulty":"easy","timeLimit":10,"hint":"It'\''s money."}'
  
Read:  
  curl http://localhost:4545/api/riddles/read_all_riddles

Update:
  curl -X PUT http://localhost:4545/api/riddles/update_riddle \
  -H "Content-Type: application/json" \
  -d '{"id":1,"field":"name","value":"Updated Name"}'

Delete:
 curl -X DELETE http://localhost:4545/api/riddles/delete_riddle \
  -H "Content-Type: application/json" \
  -d '{"id":1}'
*/
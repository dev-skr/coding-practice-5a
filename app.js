const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
let dbpath = path.join(__dirname + "/moviesData.db");
let app = express();
app.use(express.json());
module.exports = app;
let db = null;
const instantiateServerAndDb = async () => {
  try {
    db = await open({ filename: dbpath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("server running at 3000 port");
    });
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};
instantiateServerAndDb();

app.get("/movies/", async (request, response) => {
  let getQuery = `select movie_name from movie`;
  let result = await db.all(getQuery);
  let reqResult = result.map((obj) => {
    return {
      movieName: obj.movie_name,
    };
  });
  response.send(reqResult);
});

app.post("/movies/", async (request, response) => {
  let details = request.body;
  let { directorId, movieName, leadActor } = details;
  console.log(details);
  let postQuery = `insert into movie (director_id,movie_name,lead_actor) 
  values(${directorId},"${movieName}","${leadActor}")`;
  console.log(postQuery);
  await db.run(postQuery);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  let { movieId } = request.params;
  let reqMovie = `select * from movie where movie_id=${movieId}`;
  let re = await db.get(reqMovie);
  let result = {
    movieId: re.movie_id,
    directorId: re.director_id,
    movieName: re.movie_name,
    leadActor: re.lead_actor,
  };
  response.send(result);
});

app.put("/movies/:movieId/", async (request, response) => {
  let { movieId } = request.params;
  let { directorId, leadActor, movieName } = request.body;
  let postQuery = `update movie set director_id=${directorId},lead_actor="${leadActor}",movie_name="${movieName}" 
    where movie_id=${movieId}`;
  await db.run(postQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  let { movieId } = request.params;
  let delQuery = `delete from movie where movie_id=${movieId}`;
  await db.run(delQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  let dirQuery = `select * from director`;
  let result = await db.all(dirQuery);
  let reqResult = result.map((obj) => {
    return {
      directorId: obj.director_id,
      directorName: obj.director_name,
    };
  });
  response.send(reqResult);
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  let { directorId } = request.params;
  let query = `select movie.movie_name from 
    movie inner join director on movie.director_id=director.director_id
    where director.director_id=${directorId}`;
  let re = await db.all(query);
  let result = re.map((eachObject) => {
    return {
      movieName: eachObject.movie_name,
    };
  });
  response.send(result);
});

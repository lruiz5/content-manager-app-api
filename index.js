const express = require("express");
const app = express();
const PORT = 3001;

const fs = require("fs");
const path = require("path");
const pathToFile = path.resolve("./data.json");

/* 
const cors = require("cors");
let corsOptions = {
  origin: "http://localhost:3000",
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions)); */

const getResources = () => JSON.parse(fs.readFileSync(pathToFile));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/api/resources", (req, res) => {
  const resources = getResources();

  res.send(resources);
});
app.get("/api/activeresource", (req, res) => {
  const resources = getResources();
  const activeResource = resources.find(
    (resource) => resource.status === "active"
  );
  res.send(activeResource);
});

app.get("/api/resources/:id", (req, res) => {
  const resources = getResources();
  const { id } = req.params;
  const resource = resources.find((resource) => resource.id === id);
  res.send(resource);
});

app.patch("/api/resources/:id", (req, res) => {
  const resources = getResources();
  const { id } = req.params;
  const index = resources.findIndex((resource) => resource.id === id);

  const activeResource = resources.find(
    (resource) => resource.status === "active"
  );

  resources[index] = req.body;

  // active resource related functionality
  if (req.body.status === "active") {
    if (activeResource) {
      return res.status(422).send("There is active resource already!");
    }

    resources[index].status = "active";
    resources[index].activationTime = new Date();
  }
  // active resource related functionality

  fs.writeFile(pathToFile, JSON.stringify(resources, null, 2), (err) => {
    if (err) return res.status(422).send("Cannot store data!");

    return res.send("Data Updated.");
  });
});

app.post("/api/resources", (req, res) => {
  const resources = getResources();
  const resource = req.body;

  resource.createdAt = new Date();
  resource.status = "inactive";
  resource.id = Date.now().toString();
  resources.push(resource);

  fs.writeFile(pathToFile, JSON.stringify(resources, null, 2), (err) => {
    if (err) return res.status(422).send("Cannot store data!");

    return res.send("Data Saved.");
  });
});

app.listen(PORT, () => {
  console.log("Server is listening on port", PORT);
});

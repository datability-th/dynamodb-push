#!/usr/bin/env node

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
var fs = require("fs");
const yargs = require("yargs/yargs");
const db = new DynamoDBClient();
const ddb = DynamoDBDocumentClient.from(db);

// Parsing the command line arguments
// node main.js -i data/x.json -t SampleTable
const argv = yargs(process.argv.slice(2))
  .usage("Usage: $0 -i [filepath] -t [str]")
  .option("input", {
    alias: "i",
    type: "string",
    description: "Input JSON file",
  })
  .option("tablename", {
    alias: "t",
    type: "string",
    description: "Input Table Name",
  })
  .demandOption(["i", "t"])
  .help()
  .parse();

const TableName = argv.tablename;

console.log("Importing data into DynamoDB. Please wait.");

const allData = JSON.parse(fs.readFileSync(argv.input, "utf8"));

allData.map((data) => {
  const putParams = {
    TableName,
    Item: data,
  };

  ddb.send(new PutCommand(putParams), (err, output) => {
    if (err) console.error("UNABLE TO ADD ", err);
    else console.log("PutItem succeeded: ", data);
  });
});

#!/usr/bin/env node

const {
  DynamoDBClient,
  PutItemCommand,
  DeleteItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
var fs = require("fs/promises");
var _fs = require("fs");
const readline = require("readline");
const yargs = require("yargs/yargs");
const db = new DynamoDBClient();
const ddb = DynamoDBDocumentClient.from(db);

// Parsing the command line arguments
// node main.js -i data/x.json -t SampleTable
const argv = yargs(process.argv.slice(2))
  .usage("Usage: $0 -i [filepath] -t [str] [-R]")
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
  .option("restore", {
    alias: "R",
    type: "boolean",
    description: "Use full dynamodb syntax json",
  })
  .demandOption(["i", "t"])
  .help()
  .parse();

const isRestore = argv.restore;
const TableName = argv.tablename;

const main = async () => {
  const ans = await askQuestion(
    `Deleting data from DynamoDB Table ${TableName} with key input ${argv.input}. Confirm? (y/n)`
  );
  if (ans !== "y") {
    console.log("Aborted.");
    process.exit(1);
  }

  var itemCount = 0;
  var failedItemCount = 0;
  // var itemPerSecond = 0;
  var tic = performance.now();

  if (isRestore) {
    const allData = await readJSONL2(argv.input);
    allData.forEach(({ PK, SK }) => {
      const deleteParams = {
        TableName,
        Key: {
          PK,
          SK,
        },
      };
      db.send(new DeleteItemCommand(deleteParams), (err, output) => {
        if (err) {
          failedItemCount++;
          console.error("UNABLE TO Delete ", err);
        } else {
          itemCount++;
          console.log("Delete succeeded: ", itemCount);
        }
      });
    });
  } else {
    const fileOutput = await fs.readFile(argv.input, "utf8");
    const allData = JSON.parse(fileOutput);
    allData.forEach(({ PK, SK }) => {
      const deleteParams = {
        TableName,
        Key: {
          PK,
          SK,
        },
      };
      ddb.send(new DeleteCommand(deleteParams), (err, output) => {
        if (err) {
          failedItemCount++;
          console.error("UNABLE TO ADD ", err);
        } else {
          itemCount++;
          console.log("PutItem succeeded: ", itemCount);
        }
      });
    });
  }
};

main();

// Parsing JSONL
// https://stackoverflow.com/questions/65484128/how-to-parse-through-large-jsonl-data-node-js
async function readJSONL2(filename) {
  const result = [];
  return new Promise((resolve, reject) => {
    const readInterface = readline.createInterface({
      input: _fs.createReadStream(filename, { encoding: "utf8" }),
      console: false,
    });

    readInterface.on("line", (line) => {
      result.push(JSON.parse(line));
    });

    readInterface.on("close", function () {
      resolve(result);
    });

    readInterface.on("error", reject);
  });
}

// Wait for User Input
// https://stackoverflow.com/questions/18193953/waiting-for-user-to-enter-input-in-node-js
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}

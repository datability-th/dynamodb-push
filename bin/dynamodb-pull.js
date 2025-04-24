#!/usr/bin/env node

const { DynamoDBClient, ScanCommand } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
var fs = require("fs/promises");
const yargs = require("yargs/yargs");
const db = new DynamoDBClient();
const ddb = DynamoDBDocumentClient.from(db);

// Parsing the command line arguments
// node main.js -i data/x.json -t SampleTable
const argv = yargs(process.argv.slice(2))
  .usage("Usage: $0 -o [filepath] -t [str]")
  .option("output", {
    alias: "o",
    type: "string",
    description: "Output JSONLines file",
  })
  .option("tablename", {
    alias: "t",
    type: "string",
    description: "Input Table Name",
  })
  .demandOption(["o", "t"])
  .help()
  .parse();

const main = async () => {
  const TableName = argv.tablename;

  console.log(`Write reset on ${argv.output}`);
  await fs.writeFile(
    argv.output,
    "",
    { encoding: "utf8", flag: "w" },
    (err) => {
      console.error("UNABLE TO WRITE ", err);
    }
  );

  console.log("Pulling data from DynamoDB. Please wait.");

  var pageIndex = 1;
  var pageSize = 100;
  var itemCount = 0;
  // var itemPerSecond = 0;
  var tic = performance.now();

  var scanParams = {
    TableName,
    Limit: pageSize,
  };

  while (true) {
    let output;
    try {
      output = await ddb.send(new ScanCommand(scanParams));
    } catch (err) {
      console.error("UNABLE TO SCAN ", err);
      break;
    }
    itemCount += output.Items.length;
    await fs.writeFile(
      argv.output,
      output.Items.map((item) => JSON.stringify(item)).join("\n") + "\n",
      { encoding: "utf8", flag: "a" },
      (err) => {
        console.error("UNABLE TO WRITE ", err);
      }
    );
    var toc = performance.now();
    console.log(
      "Write succeeded: ",
      itemCount,
      " Item per second: ",
      itemCount / ((toc - tic) / 1000)
    );

    if (!output.LastEvaluatedKey) break;
    scanParams.ExclusiveStartKey = output.LastEvaluatedKey;
    pageIndex++;
  }
  console.log(
    "Done. Total items: ",
    itemCount,
    " Total Time: ",
    (toc - tic) / 1000,
    " seconds"
  );
};
main();

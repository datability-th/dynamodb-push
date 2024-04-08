# dynamodb-push

`dynamodb-push` is an easy to use npx package to push your JSON file to AWS DynamoDB.

## How to Use

In an AWS environment with credentials (`aws configure`), just create your JSON file and push to your table with a single command!

```bash
npx dynamodb-push -i example.json -t YourTableName
```

# dynamodb-push

`dynamodb-push` is an easy to use npx package to push your JSON file to AWS DynamoDB.

## How to Use

In an environment with AWS credentials (`aws configure`), just create your JSON file and push to your table with a single command!

```bash
npx dynamodb-push -i example.json -t YourTableName
```

Your JSON file should look something like this, each object for each DynamoDB Row:

```json
[
  {
    "PK": "PK|HASHKEY",
    "SK": "SK|RANGEKEY",
    "name": "Object 1",
    "description": "This is description for Object 1"
  },
  {
    "PK": "PK|HASHKEY",
    "SK": "SK|RANGEKEY",
    "name": "Object 2",
    "description": "This is description for Object 2"
  },
  ...
]
```

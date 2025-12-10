import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';

const isLocal = process.env.AWS_SAM_LOCAL === 'true'; // TODO use a better way to detect local environment

const client = new DynamoDBClient(
    isLocal
        ? {
              endpoint: 'http://host.docker.internal:8000',
              region: 'us-east-1',
          }
        : {},
);

export const createItem = async (tableName: string, item: any) => {
    await client.send(
        new PutItemCommand({
            TableName: tableName,
            Item: marshall(item),
        }),
    );
};

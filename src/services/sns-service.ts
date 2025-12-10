import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

const client = new SNSClient({});

export const publishMessage = async (topicArn: string, message: any) => {
    await client.send(
        new PublishCommand({
            TopicArn: topicArn,
            Message: JSON.stringify(message),
        }),
    );
};

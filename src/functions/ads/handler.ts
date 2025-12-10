import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { ADS_TABLE_NAME, ADS_TOPIC_ARN, ADS_TOPIC_NAME, ENV } from '../../libs/constants';
import createLogger from '../../libs/logger';
import { createItem } from '../../services/dynamodb-service';
import { uploadBase64Image } from '../../services/s3-service';
import { publishMessage } from '../../services/sns-service';

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */

const logger = createLogger('create-ads');

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const { title, price, imageBase64 } = JSON.parse(event.body || '{}');
    logger.info({ title, price }, 'received event');
    try {
        if (!title || !price) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'title and price are required' }),
            };
        }

        const id = uuidv4();
        const dateTime = new Date().toISOString();
        let imageUrl: string | null = null;

        // write the image upload code
        if (imageBase64) {
            imageUrl = await uploadBase64Image(id, imageBase64);
        }

        const item = {
            id,
            title,
            price,
            imageUrl,
            createdAt: dateTime,
        };

        await createItem(ADS_TABLE_NAME, item);
        await publishMessage(ADS_TOPIC_ARN, item);
        return {
            statusCode: 201,
            body: JSON.stringify({ message: 'Ad created', item }),
        };
    } catch (err) {
        logger.error({ err }, 'error creating ad');
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'some error happened while creating the ad',
            }),
        };
    }
};

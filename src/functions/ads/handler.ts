import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { ADS_TABLE_NAME, ADS_TOPIC_ARN, ADS_TOPIC_NAME } from '../../libs/constants';
import createLogger from '../../libs/logger';
import { createItem } from '../../services/dynamodb-service';
import { uploadBase64Image } from '../../services/s3-service';
import { publishMessage } from '../../services/sns-service';

const logger = createLogger('create-ads');

/**
 *
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */
export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    let body: any;

    try {
        body = JSON.parse(event.body || '{}');
    } catch (error) {
        logger.error({ error }, 'Invalid JSON in request body');
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Invalid JSON in request body' }),
        };
    }

    const { title, price, imageBase64 } = body;
    logger.info({ title, price }, 'received event');
    try {
        if (!title || !price) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'title and price are required' }),
            };
        }

        if (typeof price !== 'number' || price <= 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Invalid data types for price' }),
            };
        }

        const id = uuidv4();
        const dateTime = new Date().toISOString();
        let imageUrl: string | null = null;

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

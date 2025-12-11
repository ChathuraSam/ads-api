import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ENV } from '../../libs/constants';
import createLogger from '../../libs/logger';

/**
 *
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */

const logger = createLogger('hello-world');

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info({ event }, 'received event');
    const userId = event.requestContext.authorizer?.claims?.sub || event.headers['X-User-Id'] || 'anonymous';
    logger.info({ userId }, 'Creating ad for user');
    try {
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: `hello worldd`,
            }),
        };
    } catch (err) {
        console.log(err);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'some error happened',
            }),
        };
    }
};

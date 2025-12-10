import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ENV } from '../../libs/constants';
import createLogger from '../../libs/logger';

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
    logger.info({ event }, 'received event');
    const { title, description } = JSON.parse(event.body || '{}');
    logger.info({ title, description }, 'ad data');
    try {
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: `running ads API in ${ENV}`,
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

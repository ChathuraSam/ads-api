import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { lambdaHandler } from '../../src/functions/ads/handler';
import { expect, describe, it, jest, beforeEach, afterEach } from '@jest/globals';

// Mock uuid
jest.mock('uuid', () => ({
    v4: jest.fn(() => 'test-uuid-1234'),
}));

// Mock AWS SDK clients
jest.mock('../../src/services/dynamodb-service', () => ({
    createItem: jest.fn(),
}));

jest.mock('../../src/services/s3-service', () => ({
    uploadBase64Image: jest.fn(() => Promise.resolve('https://test-bucket.s3.amazonaws.com/test.jpg')),
}));

jest.mock('../../src/services/sns-service', () => ({
    publishMessage: jest.fn(),
}));

describe('Unit test for app handler', function () {
    const FIXED_DATE = '2025-12-10T18:09:08.300Z';
    let dateNowSpy: jest.SpiedFunction<() => string>;

    beforeEach(() => {
        // Mock Date
        dateNowSpy = jest.spyOn(Date.prototype, 'toISOString').mockReturnValue(FIXED_DATE);
    });

    afterEach(() => {
        // Restore Date
        dateNowSpy.mockRestore();
    });

    it('verifies successful response', async () => {
        const event: APIGatewayProxyEvent = {
            httpMethod: 'post',
            body: '{\n    "title": "abcd",\n    "price": 10,\n    "imageBase64": "abcd"\n}',
            headers: { 'X-User-Id': 'test-user' },
            isBase64Encoded: false,
            multiValueHeaders: {},
            multiValueQueryStringParameters: {},
            path: '/ads',
            pathParameters: {},
            queryStringParameters: {},
            requestContext: {
                accountId: '123456789012',
                apiId: '1234',
                authorizer: {},
                httpMethod: 'post',
                identity: {
                    accessKey: '',
                    accountId: '',
                    apiKey: '',
                    apiKeyId: '',
                    caller: '',
                    clientCert: {
                        clientCertPem: '',
                        issuerDN: '',
                        serialNumber: '',
                        subjectDN: '',
                        validity: { notAfter: '', notBefore: '' },
                    },
                    cognitoAuthenticationProvider: '',
                    cognitoAuthenticationType: '',
                    cognitoIdentityId: '',
                    cognitoIdentityPoolId: '',
                    principalOrgId: '',
                    sourceIp: '',
                    user: '',
                    userAgent: '',
                    userArn: '',
                },
                path: '/ads',
                protocol: 'HTTP/1.1',
                requestId: 'c6af9ac6-7b61-11e6-9a41-93e8deadbeef',
                requestTimeEpoch: 1428582896000,
                resourceId: '123456',
                resourcePath: '/ads',
                stage: 'dev',
            },
            resource: '',
            stageVariables: {},
        };
        const result: APIGatewayProxyResult = await lambdaHandler(event);

        expect(result.statusCode).toEqual(201);
        expect(result.body).toEqual(
            JSON.stringify({
                message: 'Ad created',
                item: {
                    id: 'test-uuid-1234',
                    title: 'abcd',
                    price: 10,
                    imageUrl: 'https://test-bucket.s3.amazonaws.com/test.jpg',
                    createdAt: '2025-12-10T18:09:08.300Z',
                },
            }),
        );
    });
});

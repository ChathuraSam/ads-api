import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ADS_BUCKET_NAME } from '../libs/constants';
import createLogger from '../libs/logger';

const isLocal = process.env.AWS_SAM_LOCAL === 'true';

const client = new S3Client(
    isLocal
        ? {
              endpoint: 'http://host.docker.internal:4566', // LocalStack endpoint
              region: 'us-east-1',
              forcePathStyle: true,
          }
        : {},
);

const logger = createLogger('s3-service');

export const uploadBase64Image = async (id: string, base64: string) => {
    const buffer = Buffer.from(base64, 'base64');
    const key = `ads/${id}.jpg`;

    await client.send(
        new PutObjectCommand({
            Bucket: ADS_BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: 'image/jpeg',
        }),
    );

    logger.info(`Image uploaded to S3 with key: ${key}`);

    return `https://${ADS_BUCKET_NAME}.s3.amazonaws.com/${key}`;
};

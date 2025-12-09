import pino from 'pino';
import { LOG_LEVEL } from './constants';

const logger = (name: string) => {
    return pino({ name, level: LOG_LEVEL });
};

export default logger;

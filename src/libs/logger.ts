import pino from 'pino';
import { LOG_LEVEL } from './constants';

const createLogger = (name: string) => {
    return pino({ name, level: LOG_LEVEL });
};

export default createLogger;

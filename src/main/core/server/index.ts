import { app } from 'electron';
import fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyMultipart from '@fastify/multipart';
import fastifyPlugin from 'fastify-plugin';

import { JsonDB, Config } from 'node-json-db';
import { join } from 'path';
import logger from '@main/core/logger';
import routesV1Modules from './routes/v1';

async function jsonDbPlugin(fastify) {
  const db = new JsonDB(new Config(join(app.getPath('userData'), 'cache.json'), true, true, '/'));
  fastify.decorate('db', db);
}

const wrappedJsonDbPlugin = fastifyPlugin(jsonDbPlugin, {
  fastify: '5.x',
  name: 'json-db-plugin',
});

const setup = async () => {
  const server = fastify({
    logger: {
      level: 'info', // 日志级别（可选：trace, debug, info, warn, error, fatal）
      file: join(app.getPath('userData'), 'logs/fastify.log') // 日志文件路径
    }, // 日志
    forceCloseConnections: true, // 强制关闭连接
    ignoreTrailingSlash: true, // 忽略斜杠
    maxParamLength: 10240, // 参数长度限制
    bodyLimit: 1024 * 1024 * 3, // 限制请求体大小为 3MB
  });

  try {
    server.setErrorHandler((error, _request, reply) => {
      server.log.error(error);

      reply.status(500).send({
        code: -1,
        msg: `Internal Server Error - ${error.name}`,
        data: error.message,
      });
    });

    server.register(wrappedJsonDbPlugin);
    server.register(fastifyMultipart);
    server.register(fastifyCors);

    // 注册 v1 路由
    Object.keys(routesV1Modules).forEach((key) => {
      server.register(routesV1Modules[key]);
    });

    await server.ready();
    await server.listen({ port: 9978, host: '0.0.0.0' });
    logger.info('[server][init] listen: http://0.0.0.0:9978');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

export default setup;

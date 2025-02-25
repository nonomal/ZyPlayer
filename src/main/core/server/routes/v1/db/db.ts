import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { history, setting, star, site, iptv, channel, analyze, drive, db } from '@main/core/db/service';
import { magrite } from '@main/core/db';
import webdev from '@main/utils/webdev';
import { importData } from './utils/data';

const API_PREFIX = 'api/v1/db';

const TABLES = [
  'tbl_site',
  'tbl_iptv',
  'tbl_channel',
  'tbl_analyze',
  'tbl_drive',
  'tbl_history',
  'tbl_star',
  'tbl_setting',
];

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.delete(`/${API_PREFIX}/clear`, async (req: FastifyRequest<{ Body: { [key: string]: string } }>) => {
    const data = req.body;

    const tableClears = {
      site: () => site.clear(),
      analyze: () => analyze.clear(),
      drive: () => drive.clear(),
      iptv: () => iptv.clear(),
      channel: () => channel.clear(),
      history: () => history.clear(),
      star: () => star.clear(),
      setting: () => setting.clear(),
      cache: () => req.server.db.delete('/'),
      reset: () => db.drop(TABLES),
    };

    const clearData = async (type) => {
      if (tableClears?.[type]) {
        await tableClears[type]();
      }
    };

    if (Array.isArray(data)) {
      await Promise.all(data.map((type) => clearData(type)));
    }

    return {
      code: 0,
      msg: 'ok',
      data: true,
    };
  });
  fastify.post(`/${API_PREFIX}/export`, async (req: FastifyRequest<{ Body: { [key: string]: string } }>) => {
    const data = req.body;
    let res = {};

    const exportFunctions = {
      site: () => site.all(),
      analyze: () => analyze.all(),
      drive: () => drive.all(),
      iptv: () => iptv.all(),
      channel: () => channel.all(),
      history: () => history.all(),
      star: () => star.all(),
      setting: () => setting.all(),
    };

    const exportData = async (type) => {
      if (!exportFunctions[type]) {
        throw new Error('Invalid type');
      }
      const result = await exportFunctions[type]();
      res[`tbl_${type}`] = result;
    };

    if (Array.isArray(data)) {
      await Promise.all(data.map(exportData));
    }

    return {
      code: 0,
      msg: 'ok',
      data: res,
    };
  });
  fastify.post(`/${API_PREFIX}/init`, async (req: FastifyRequest<{ Body: { [key: string]: string } }>) => {
    const { url, importType, remoteType, importMode } = req.body;

    const data = await importData(importType, remoteType, url);

    const createTableMethodMap = (suffix: 'set' | 'add') => {
      return {
        site: site[suffix],
        iptv: iptv[suffix],
        channel: channel[suffix],
        analyze: analyze[suffix],
        drive: drive[suffix],
        history: history[suffix],
        star: star[suffix],
        setting: setting[suffix],
      };
    };
    const tableMethod = importMode === 'additional' ? createTableMethodMap('add') : createTableMethodMap('set');

    if (importMode === 'additional') {
      delete data.tbl_setting;
      for (const key in data) {
        for (let i = 0; i < data[key].length; i++) {
          delete data[key][i].id;
        }
      }
    }

    for (const table of TABLES) {
      const prefix = table.substring(4);
      // Object.keys 支持同时检查 array 和 object
      if (data.hasOwnProperty(table) && tableMethod[prefix] && Object.keys(data[table]).length > 0) {
        await tableMethod[prefix](data[table]);
      }
    }

    if (data.hasOwnProperty('tbl_setting')) {
      await magrite();
    }

    const dbResTable = Object.keys(data);

    return {
      code: 0,
      msg: 'ok',
      data: {
        table: dbResTable,
      },
    };
  });
  fastify.get(`/${API_PREFIX}/webdev/remote2local`, async () => {
    const dbResWebdev = await setting.get('webdev');
    const webdevConfig = dbResWebdev?.data;
    if (webdevConfig?.url && webdevConfig?.username && webdevConfig?.password) {
      let instance: webdev | null = new webdev({
        url: webdevConfig.url,
        username: webdevConfig.username,
        password: webdevConfig.password,
      });

      const initRes = await instance.initializeWebdavClient();
      if (initRes) {
        const res = await instance.rsyncLocal();
        instance = null; // 释放内存
        if (res) {
          await db.source(res);
          return {
            code: 0,
            msg: 'ok',
            data: true,
          };
        }
      }
    }
    return {
      code: -1,
      msg: 'webdev init or remote error',
      data: false,
    };
  });
  fastify.get(`/${API_PREFIX}/webdev/local2remote`, async () => {
    const dbResWebdev = await setting.get('webdev');
    const webdevConfig = dbResWebdev?.data;
    if (webdevConfig?.url && webdevConfig?.username && webdevConfig?.password) {
      let instance: webdev | null = new webdev({
        url: webdevConfig.url,
        username: webdevConfig.username,
        password: webdevConfig.password,
      });
      const initRes = await instance.initializeWebdavClient();
      if (initRes) {
        const doc = await db.all();
        const res = await instance.rsyncRemote(doc);
        instance = null; // 释放内存
        if (res) {
          return {
            code: 0,
            msg: 'ok',
            data: true,
          };
        }
      }
    }
    return {
      code: -1,
      msg: 'webdev init or remote error',
      data: false,
    };
  });
};

export default api;

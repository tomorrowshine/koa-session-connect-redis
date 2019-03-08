const debug = require('debug')('RedisStore');
const Redis = require('ioredis');

/**
 * RedisStore for koa-session
 * 
 * @param {object} options the options pass to ioredis
 * @returns RedisStore instance
 */
function RedisStore(options) {
	if (!(this instanceof RedisStore)) {
		return new RedisStore(options);
	}
	this.client = new Redis(options);
	this.client.on('connect', function () {
		debug('connected to redis');
	});
	this.client.on('ready', function () {
		debug('redis ready');
	});
	this.client.on('end', function () {
		debug('redis ended');
	});
	this.client.on('error', function () {
		debug('redis error');
	});
	this.client.on('reconnecting', function () {
		debug('redis reconnecting');
	});
	this.client.on('warning', function () {
		debug('redis warning');
	});
}
RedisStore.prototype.get = async function (key) {
	let json = await this.client.get(key);
	debug(`GET ${key} -> ${json}`);
	return JSON.parse(json);
};
RedisStore.prototype.set = function (key, sess) {
	let json = JSON.stringify(sess);
	this.client.set(key, json);
};
RedisStore.prototype.destroy = async function (key) {
	debug(`DELETE ${key}`);
	let pipeline=this.client.pipeline();
	pipeline.del(key);
	await pipeline.exec();
};
RedisStore.prototype.quit = async function () {
	debug(`QUIT redis`);
	await this.client.quit();
};

module.exports = RedisStore;
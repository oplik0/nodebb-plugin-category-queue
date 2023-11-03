/**
 * You can run these tests by executing `npx mocha test/plugins-installed.js`
 * from the NodeBB root folder. The regular test runner will also run these
 * tests.
 *
 * Keep in mind tests do not activate all plugins, so if you are testing
 * hook listeners, socket.io, or mounted routes, you will need to add your
 * plugin to `config.json`, e.g.
 *
 * {
 *     "test_plugins": [
 *         "nodebb-plugin-meilisearch"
 *     ]
 * }
 */

'use strict';

/* globals describe, it, before, after */

const assert = require('assert');

const winston = require.main.require('winston');

const topics = require.main.require('./src/topics');
const posts = require.main.require('./src/posts');
const categories = require.main.require('./src/categories');
const user = require.main.require('./src/user');
const groups = require.main.require('./src/groups');
const meta = require.main.require('./src/meta');

describe('nodebb-plugin-category-queue', () => {
	let unprivilegedUid;
    let exemptUid;
    let group;
	let adminUid;
    let initialExemptGroups;
    let initialSettings;
	let cid;
    let tid;
	before(async () => {
		[unprivilegedUid, exemptUid, group, adminUid, sampleTid, { cid }, initialSettings] = await Promise.all([
			user.create({ username: 'category-queue-normal-user' }),
            user.create({ username: 'category-queue-exempt-user' }),
			user.create({ username: 'category-queue-administrator' }),
            groups.create({ name: 'Exempt Group' }),
			categories.create({
				name: 'Test Category',
				description: 'Test category created by testing script',
			}),
            meta.settings.get('category-queue'),
		]);
        initialExemptGroups = meta.config.groupsExemptFromPostQueue;
        await meta.configs.set('groupsExemptFromPostQueue', [...initialExemptGroups, group.name]);
        await groups.join('administrators', adminUid);
        tid = await topics.create({ title: 'Test Topic', content: 'Test topic created by testing script', uid: adminUid, cid });
	});

	it('should not queue any new topics by default', async () => {
		assert(!await posts.shouldQueue(unprivilegedUid, { cid, content: "Just a test topic" }), "Unprivileged user's topic was queued");
        assert(!await posts.shouldQueue(exemptUid, { cid, content: "Just a test topic" }), "Exempt user's topic was queued");
        assert(!await posts.shouldQueue(adminUid, { cid, content: "Just a test topic" }), "Administrator's topic was queued");
	});

    it('should not queue any new replies by default', async () => {
        assert(!await posts.shouldQueue(unprivilegedUid, { tid, content: "Just a test reply" }), "Unprivileged user's reply was queued");
        assert(!await posts.shouldQueue(exemptUid, { tid, content: "Just a test reply" }), "Exempt user's reply was queued");
        assert(!await posts.shouldQueue(adminUid, { tid, content: "Just a test reply" }), "Administrator's reply was queued");
    });

    it('should queue new topics by all users if enabled', async () => {
        await meta.settings.setOne('category-queue', `${cid}-enabled`, 'on');
        assert(await posts.shouldQueue(unprivilegedUid, { cid, content: "Just a test topic" }), "Unprivileged user's topic was not queued");
        assert(await posts.shouldQueue(exemptUid, { cid, content: "Just a test topic" }), "Exempt user's topic was not queued");
        assert(await posts.shouldQueue(adminUid, { cid, content: "Just a test topic" }), "Administrator's topic was not queued");
        await meta.settings.setOne('category-queue', `${cid}-enabled`, 'off');
    });

    it('should queue new replies by all users if enabled', async () => {
        await meta.settings.setOne('category-queue', `${cid}-enabled`, 'on');
        assert(await posts.shouldQueue(unprivilegedUid, { tid, content: "Just a test reply" }), "Unprivileged user's reply was not queued");
        assert(await posts.shouldQueue(exemptUid, { tid, content: "Just a test reply" }), "Exempt user's reply was not queued");
        assert(await posts.shouldQueue(adminUid, { tid, content: "Just a test reply" }), "Administrator's reply was not queued");
        await meta.settings.setOne('category-queue', `${cid}-enabled`, 'off');
    });

    it('should not queue new topics by privileged users if enabled', async () => {
        await meta.settings.setOne('category-queue', `${cid}-enabled`, 'on');
        await meta.settings.setOne('category-queue', `${cid}-privileged`, 'on');
        assert(await posts.shouldQueue(unprivilegedUid, { cid, content: "Just a test topic" }), "Unprivileged user's topic was not queued");
        assert(await posts.shouldQueue(exemptUid, { cid, content: "Just a test topic" }), "Exempt user's topic was not queued");
        assert(!await posts.shouldQueue(adminUid, { cid, content: "Just a test topic" }), "Administrator's topic was queued");
        await meta.settings.setOne('category-queue', `${cid}-privileged`, 'off');
        await meta.settings.setOne('category-queue', `${cid}-enabled`, 'off');
    });

    it('should not queue new replies by privileged users if enabled', async () => {
        await meta.settings.setOne('category-queue', `${cid}-enabled`, 'on');
        await meta.settings.setOne('category-queue', `${cid}-privileged`, 'on');
        assert(await posts.shouldQueue(unprivilegedUid, { tid, content: "Just a test reply" }), "Unprivileged user's reply was not queued");
        assert(await posts.shouldQueue(exemptUid, { tid, content: "Just a test reply" }), "Exempt user's reply was not queued");
        assert(!await posts.shouldQueue(adminUid, { tid, content: "Just a test reply" }), "Administrator's reply was queued");
        await meta.settings.setOne('category-queue', `${cid}-privileged`, 'off');
        await meta.settings.setOne('category-queue', `${cid}-enabled`, 'off');
    });

    it('should not queue new topics by exempt groups if enabled', async () => {
        await meta.settings.setOne('category-queue', `${cid}-enabled`, 'on');
        await meta.settings.setOne('category-queue', `${cid}-exempt`, 'on');
        assert(await posts.shouldQueue(unprivilegedUid, { cid, content: "Just a test topic" }), "Unprivileged user's topic was not queued");
        assert(!await posts.shouldQueue(exemptUid, { cid, content: "Just a test topic" }), "Exempt user's topic was queued");
        assert(await posts.shouldQueue(adminUid, { cid, content: "Just a test topic" }), "Administrator's topic was not queued");
        await meta.settings.setOne('category-queue', `${cid}-exempt`, 'off');
        await meta.settings.setOne('category-queue', `${cid}-enabled`, 'off');
    });

    it('should not queue new replies by exempt groups if enabled', async () => {
        await meta.settings.setOne('category-queue', `${cid}-enabled`, 'on');
        await meta.settings.setOne('category-queue', `${cid}-exempt`, 'on');
        assert(await posts.shouldQueue(unprivilegedUid, { tid, content: "Just a test reply" }), "Unprivileged user's reply was not queued");
        assert(!await posts.shouldQueue(exemptUid, { tid, content: "Just a test reply" }), "Exempt user's reply was queued");
        assert(await posts.shouldQueue(adminUid, { tid, content: "Just a test reply" }), "Administrator's reply was not queued");
        await meta.settings.setOne('category-queue', `${cid}-exempt`, 'off');
        await meta.settings.setOne('category-queue', `${cid}-enabled`, 'off');
    });

    it('should not queue replies if disabled', async () => {
        await meta.settings.setOne('category-queue', `${cid}-enabled`, 'on');
        await meta.settings.setOne('category-queue', `${cid}-no-replies`, 'on');
        assert(!await posts.shouldQueue(unprivilegedUid, { tid, content: "Just a test reply" }), "Unprivileged user's reply was queued");
        assert(!await posts.shouldQueue(exemptUid, { tid, content: "Just a test reply" }), "Exempt user's reply was queued");
        assert(!await posts.shouldQueue(adminUid, { tid, content: "Just a test reply" }), "Administrator's reply was queued");
        await meta.settings.setOne('category-queue', `${cid}-no-replies`, 'off');
        await meta.settings.setOne('category-queue', `${cid}-enabled`, 'off');
    });

    it('should still queue topics if replies are disabled', async () => {
        await meta.settings.setOne('category-queue', `${cid}-enabled`, 'on');
        await meta.settings.setOne('category-queue', `${cid}-no-replies`, 'on');
        assert(await posts.shouldQueue(unprivilegedUid, { cid, content: "Just a test topic" }), "Unprivileged user's topic was not queued");
        assert(await posts.shouldQueue(exemptUid, { cid, content: "Just a test topic" }), "Exempt user's topic was not queued");
        assert(await posts.shouldQueue(adminUid, { cid, content: "Just a test topic" }), "Administrator's topic was not queued");
        await meta.settings.setOne('category-queue', `${cid}-no-replies`, 'off');
        await meta.settings.setOne('category-queue', `${cid}-enabled`, 'off');
    });

    after(async () => {
        await categories.purge(cid, adminUid);
        await Promise.all([
            meta.configs.set('groupsExemptFromPostQueue', initialExemptGroups),
            meta.settings.set('category-queue', initialSettings),
            user.deleteAccount(unprivilegedUid),
            user.deleteAccount(exemptUid),
            user.deleteAccount(adminUid),
            groups.destroy(group.name),
        ]);
    });
});
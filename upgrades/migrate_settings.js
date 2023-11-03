'use strict';

const meta = require.main.require('./src/meta');
const plugin = require('../library');

module.exports = {
	name: 'Migrate settings to the v2 format',
	timestamp: Date.UTC(2023, 11, 3),
	method: async function () {
		const settings = await meta.settings.get(plugin.id);
		if (Object.keys(settings).some(key => !isNaN(key))) {
			const new_settings = {};
			for (const [key, value] of Object.entries(settings)) {
				new_settings[`${key}-enabled`] = value === key ? 'on' : 'off';
			}
			await meta.settings.set(plugin.id, new_settings);
		}
	},
};

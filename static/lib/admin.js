'use strict';

/* globals $, app, socket, define */

define('admin/plugins/category-queue', ['settings'], function (Settings) {
	var ACP = {};

	ACP.init = function () {
		Settings.load('category-queue', $('.category-queue-settings'));

		$('#save').on('click', function () {
			Settings.save('category-queue', $('.category-queue-settings'), function () {
				app.alert({
					type: 'success',
					alert_id: 'category-queue-saved',
					title: 'Settings Saved',
					message: 'Please reload your NodeBB to apply these settings',
					clickfn: function () {
						socket.emit('admin.reload');
					},
				});
			});
		});
	};

	return ACP;
});
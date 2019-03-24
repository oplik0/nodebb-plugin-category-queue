<form role="form" class="category-queue-settings">
	<div class="row">
		<div class="col-sm-2 col-xs-12 settings-header">General</div>
		<div class="col-sm-10 col-xs-12">
			<p class="lead">
				Adjust these settings. You can then retrieve these settings in code via:
				<code>meta.settings.get('category-queue', function(err, settings) {...});</code>
			</p>
			<div class="form-group">
				<form role="form" class="category-queue-topics">
					<div class="form-group col-sm-4 col-xs-6">
						<label for="{../cid}">{../name}</label>
						<select data-cid="{../cid}" id="{../cid}" name="{../cid}" title="{../name}" class="form-control">
							<option value="False">Nie</option>
							<option value="True">Tak</option>
						</select>
					</div>
				</form>
			</div>
		</div>
	</div>
</form>

<button id="save" class="floating-button mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored">
	<i class="material-icons">save</i>
</button>

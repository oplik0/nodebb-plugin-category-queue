<div class="acp-page-container">
	<!-- IMPORT admin/partials/settings/header.tpl -->

	<div class="row m-0">
		<div id="spy-container" class="col-12 col-md-10 px-0 mb-8" tabindex="0">
			<form role="form" class="category-queue-settings">
				<div class="mb-8 col-12">
					<p class="lead">
						[[category-queue:admin.lead]]
					</p>
					<!-- BEGIN categories -->
					<div class="row">
						<div class="form-check d-flex flex-row justify-content-start">
							<input class="form-check-input me-1" type="checkbox" id="{../cid}-enabled" name="{../cid}-enabled" />
							<label class="form-label" for="{../cid}-enabled" id="{../cid}-enabled-label"><strong>{../name}</strong></label>
							<button class="btn btn-link flex-grow-1 justify-content-end d-flex" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-{../cid}" aria-expanded="true">
								<i class="fa-solid fa-chevron-down"></i>
							</button>
						</div>
							<div id="collapse-{../cid}" class="collapse" aria-labelledby="{../cid}-header" data-bs-parent="#{../cid}-accordion">
								<div class="card card-body">
									<div>
										<input type="checkbox" class="form-check-input" id="{../cid}-privileged" name="{../cid}-privileged"/>
										<label class="form-label" for="{../cid}-privileged" id="{../cid}-privileged-label">[[category-queue:admin.privileged]]</label>
									</div>
									<div>
										<input type="checkbox" class="form-check-input" id="{../cid}-exempt" name="{../cid}-exempt" />
										<label class="form-label" for="{../cid}-exempt" id="{../cid}-exempt-label">[[category-queue:admin.exempt]]</label>
									</div>
									<div>
										<input type="checkbox" class="form-check-input" id="{../cid}-no-replies" name="{../cid}-no-replies" />
										<label class="form-label" for="{../cid}-no-replies" id="{../cid}-no-replies-label">[[category-queue:admin.no-replies]]</label>
									</div>
								</div>
							</div>
					</div>
					<!-- END categories -->
					</div>
				</div>
			</form>
		</div>

		<!-- IMPORT admin/partials/settings/toc.tpl -->
	</div>
</div>
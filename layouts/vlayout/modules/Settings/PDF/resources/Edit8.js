/* {[The file is published on the basis of YetiForce Public License that can be found in the following directory: licenses/License.html]} */
Settings_PDF_Edit_Js("Settings_PDF_Edit8_Js", {}, {
	step8Container: false,
	advanceFilterInstance: false,
	ckEditorInstance: false,
	fieldValueMap: false,
	init: function () {
		this.initialize();
	},
	/**
	 * Function to get the container which holds all the reports step1 elements
	 * @return jQuery object
	 */
	getContainer: function () {
		return this.step8Container;
	},
	/**
	 * Function to set the reports step1 container
	 * @params : element - which represents the reports step1 container
	 * @return : current instance
	 */
	setContainer: function (element) {
		this.step8Container = element;
		return this;
	},
	/**
	 * Function  to intialize the reports step1
	 */
	initialize: function (container) {
		if (typeof container === 'undefined') {
			container = jQuery('#pdf_step8');
		}
		if (container.is('#pdf_step8')) {
			this.setContainer(container);
		} else {
			this.setContainer(jQuery('#pdf_step8'));
		}
	},
	
	submit : function(){
		var aDeferred = jQuery.Deferred();
		var form = this.getContainer();
		var formData = form.serializeFormData();
		var progressIndicatorElement = jQuery.progressIndicator({
			'position' : 'html',
			'blockInfo' : {
				'enabled' : true
			}
		});
		var saveData = form.serializeFormData();
		saveData['action'] = 'Save';
		saveData['step'] = 8;
		saveData['view'] = '';
		AppConnector.request(saveData).then(
			function(data) {
				data = JSON.parse(data);
				if(data.success == true) {
					Settings_Vtiger_Index_Js.showMessage({text : app.vtranslate('JS_PDF_SAVED_SUCCESSFULLY')});

					setTimeout(function() {
						window.location.href = "index.php?module=PDF&parent=Settings&page=1&view=List";
						progressIndicatorElement.progressIndicator({
							'mode' : 'hide'
						});
					}, 1000);
				}
			},
			function(error,err){
				app.errorLog(error, err);
			}
		);
		return aDeferred.promise();
	},
	
	registerCancelStepClickEvent: function(form) {
		jQuery('button.cancelLink', form).on('click', function() {
			window.history.back();
		});
	},

	registerWatermarkTypeChange: function(container) {
		var watermarkType = container.find('#watermark_type');

		watermarkType.on('change', function() {
			if (jQuery(this).val() === 'text') {
				container.find('.watertext').removeClass('hide');
				container.find('.waterimage').addClass('hide');
			} else {
				container.find('.watertext').addClass('hide');
				container.find('.waterimage').removeClass('hide');
			}
		});
	},

	registerUploadButton: function(form) {
		form.find('#uploadWM').on('click', function(e) {
			e.preventDefault();
			var fileSelect = form.find('#watermark_image');
			// Get the selected files from the input.
			var files = fileSelect[0].files;
			
			// Create a new FormData object.
			var formData = new FormData();
			// Loop through each of the selected files.
			for (var i = 0; i < files.length; i++) {
				var file = files[i];

				// Check the file type.
				if (!file.type.match('image.*')) {
					continue;
				}

				// Add the file to the request.
				formData.append('watermark[]', file, file.name);
			}
			formData.append('template_id', form.find('[name="record"]').val());
			// Set up the request.
			var xhr = new XMLHttpRequest();
			
			// Open the connection.
			xhr.open('POST', 'modules/Settings/PDF/helpers/upload_watermark.php', true);
			
			// Set up a handler for when the request finishes.
			xhr.onload = function () {
				if (xhr.status === 200) {
					var templateId = form.find('[name="record"]').val();
					var fileName = files[0]['name'];
					var fileExt = fileName.split('.');
					var uploadedImage = templateId+'.'+fileExt[fileExt.length-1];

					form.find('#watermark').html('<img src="layouts/vlayout/modules/Settings/PDF/resources/watermark_images/'+uploadedImage+'" class="col-md-9" />');
					form.find('[name="watermark_image"]').val('layouts/vlayout/modules/Settings/PDF/resources/watermark_images/'+uploadedImage);
					form.find('#deleteWM').removeClass('hide');
				}
			};

			// Send the Data.
			xhr.send(formData);
		});
	},

	registerDeleteUploadButton: function(form) {
		form.find('#deleteWM').on('click', function(e) {
			e.preventDefault();
			var params = {};
			params.data = {
				parent: app.getParentModuleName(),
				module: app.getModuleName(),
				action: 'DeleteWatermark',
				id: form.find('[name="record"]').val()
			};
			params.dataType = 'json';
			AppConnector.request(params).then(
				function(data) {
					var response = data['result'];
					if ( response ) {
						form.find('#watermark').html('');
						form.find('[name="watermark_image"]').val('');
						form.find('#deleteWM').addClass('hide');
					}
				},
				function(data,err){
					app.errorLog(data, err);
				}
			);
		});
	},

	registerEvents: function () {
		var container = this.getContainer();
		app.changeSelectElementView(container);
		this.registerCancelStepClickEvent(container);
		this.registerWatermarkTypeChange(container);
		this.registerUploadButton(container);
		this.registerDeleteUploadButton(container);
	}
});

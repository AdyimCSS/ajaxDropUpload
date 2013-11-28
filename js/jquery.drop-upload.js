// jquery.drop-upload v1.0
// Create by Trirong Phasukyued 28-11-2013
// support file : image, text

(function($){
	$.fn.dropUpload = function(obj){
		if($(this).length == 1 && $(this).data('seted') == undefined){ 
			// default
			// =====================================
			$(this).data('seted', true);
			var vdf = {
				inputFile : '.file_select', 
				areaDrop : '.area_drop', 
				btnSubmit : '.btn_submit', 
				classDropOver : 'dragOver', 
				maxFileSize : 1000000, 
				autoOldBrowserUpload : false, 
				dataTypeOldBrowser : 'html', 
				onErrorFileSize : function(file, maxFileSize){
					alert(file.name+' size : '+file.size+' is over > '+maxFileSize);	
				}, 
				onParseFileData : function(type, file, result){
					$('body').append('<div>============================</div>');
					$('body').append('<div>type : '+type+'</div>');
					$('body').append('<div>file.name : '+file.name+'</div>');
					$('body').append('<div>file.type : '+file.type+'</div>');
					$('body').append('<div>file.size : '+file.size+' bytes</div>');
					if(type == 'image'){
						$('body').append('<div style="width:120px; height:120px; overflow:hidden; margin:5px;"><img style="display:block; height:100%; width:auto; magin:0px auto;" src="'+result+'" alt="" /></div>');	
					}else {
						$('body').append('<div>'+result+'</div>');		
					}
					$('body').append('<div>============================</div>');
				}, 
				onProgressStart : function(id, file){
					$('body').append('<div>============================ onProgressStart</div>');
					$('body').append('<div id='+id+'>'+file.name+' <span>0%</span></div>');
				}, 
				onProgressRuntime : function(id, percent){
					$('#'+id+' span').html(percent+'%');
				}, 
				onProgressComplete : function(id, file){
					$('#'+id+' span').html('complete');	
				}, 
				onProgressError : function(id, file, error){
					$('#'+id+' span').html('error status : '+error);	
				}, 
				onBeforeSubmitOldBrowser : function(mc){}, 
				onCompleteOldBrowser : function(data){
					alert('upload complete.');
					$('body').append('<div>============================</div>');
					$('body').append('<div>file.name : '+data+'</div>');
					$('body').append('<div style="width:120px; height:120px; overflow:hidden; margin:5px;"><img style="display:block; height:100%; width:auto; magin:0px auto;" src="'+data+'" alt="" /></div>');	
				}
			}
			if(obj) $.extend(vdf, obj);
			vdf.root = $(this);
			vdf.chkFileReader = (window.File && window.FileList && window.FileReader);
			vdf.inputFile = vdf.root.find(vdf.inputFile);
			vdf.areaDrop = vdf.root.find(vdf.areaDrop);
			vdf.btnSubmit = vdf.root.find(vdf.btnSubmit);
			vdf.parseFile = function(file) {
				if(file.size <= vdf.maxFileSize){
					// display an image
					if (file.type.indexOf("image") == 0) {
						var reader = new FileReader();
						reader.onload = function(e) {
							vdf.onParseFileData('image', file, e.target.result);
						}
						reader.readAsDataURL(file);
					}
			
					// display text
					if (file.type.indexOf("text") == 0) {
						var reader = new FileReader();
						reader.onload = function(e) {
							vdf.onParseFileData('text', file, e.target.result);
						}
						reader.readAsText(file);
					}
				}
			};
			vdf.uploadFile = function(file) {
				if (location.host.indexOf("sitepointstatic") >= 0) return;
		
				var xhr = new XMLHttpRequest();
				// if (xhr.upload && file.type == "image/jpeg" && file.size <= vdf.maxFileSize) {
				if (xhr.upload && file.size <= vdf.maxFileSize) {
					// create progress bar id
					var idProgress = 'progress_'+(new Date().getTime());
					
					// create progress bar
					vdf.onProgressStart(idProgress, file);
		
					// progress bar
					xhr.upload.addEventListener("progress", function(e) {
						var pc = parseInt(100 - (e.loaded / e.total * 100));
						vdf.onProgressRuntime(idProgress, pc);
					}, false);
		
					// file received/failed
					xhr.onreadystatechange = function(e) {
						if (xhr.readyState == 4) {
							if(xhr.status == 200){
								vdf.onProgressComplete(idProgress, file);
							}else {
								vdf.onProgressError(idProgress, file, xhr.status);
							}
							vdf.root.find(vdf.areaDrop).removeClass(vdf.classDropOver);
						}
					};
					
					// start upload
					xhr.open("POST", vdf.root.attr('action'), true);
					xhr.setRequestHeader("X_FILENAME", new Date().getTime()+'.'+file.name.split('.')[1]);
					xhr.send(file);
				}else {
					vdf.onErrorFileSize(file, vdf.maxFileSize);	
					vdf.root.find(vdf.areaDrop).removeClass(vdf.classDropOver);
				}
			}
			vdf.FileSelectHandler = function(e) {
				e.stopPropagation();
				e.preventDefault();
		
				// fetch FileList object
				var files = e.target.files || e.dataTransfer.files;
		
				// process all File objects
				for (var i = 0, f; f = files[i]; i++) {
					vdf.parseFile(f);
					vdf.uploadFile(f);
				}
			};
			vdf.FileDragHover = function(e) {
				e.stopPropagation();
				e.preventDefault();
				
				if(e.type == "dragover"){
					$(e.target).addClass(vdf.classDropOver);
				}else {
					$(e.target).removeClass(vdf.classDropOver);
				}
			};
			vdf.init = function(){
				// add event
				vdf.inputFile.bind('change', vdf.FileSelectHandler);
				
				// is XHR2 available?
				var xhr = new XMLHttpRequest();
				var idDrop = 'drop_'+(new Date().getTime());
				if (xhr.upload) {
					// file drop
					vdf.areaDrop.attr({'id':idDrop});
					document.getElementById(idDrop).addEventListener('dragover', vdf.FileDragHover, false);
					document.getElementById(idDrop).addEventListener('dragleave', vdf.FileDragHover, false);
					document.getElementById(idDrop).addEventListener('drop', vdf.FileSelectHandler, false); 

					vdf.btnSubmit.hide();
				}
			};
				
			if(vdf.chkFileReader != undefined){
				// have file reader  [chrome, safari, firefox]
				// #####################################
				vdf.init();
			}else {
				// not have file reader [ie]
				// #####################################
				vdf.areaDrop.hide();
				var nameInputFile = vdf.inputFile.attr('name').split('[]')[0];
				vdf.inputFile.removeAttr('multiple');
				vdf.inputFile.attr({'name':nameInputFile});
				vdf.root.append('<input type="hidden" name="oldBrowser" value="true" />');
				
				if(vdf.autoOldBrowserUpload){
					vdf.btnSubmit.hide();
					vdf.inputFile.change(function(event){
						vdf.root.ajaxForm({
							dataType: vdf.dataTypeOldBrowser, 
							beforeSubmit : function(){
								vdf.onBeforeSubmitOldBrowser(vdf.root);
							}, 
							success: function(data) {
								vdf.onCompleteOldBrowser(data);
							}
						}).submit();
					});
				}else {
					vdf.btnSubmit.click(function(){
						vdf.root.ajaxForm({
							dataType: vdf.dataTypeOldBrowser, 
							beforeSubmit : function(){
								vdf.onBeforeSubmitOldBrowser(vdf.root);
							}, 
							success: function(data) {
								vdf.onCompleteOldBrowser(data);
							}
						}).submit();
					});
				}
			}
		}else if($(this).length > 1) {
			$(this).each(function(index, element) {
				$(element).dropUpload(obj);
			});
		}
	}
})(jQuery);
(function(hlt, $){
	
	hlt.ui = {};
	
	hlt.ui.showDialog = function(title, content){
		/*
		 * http://www.naveen.com.au/javascript/jquery/encode-or-decode-html-entities-with-jquery/289
		 */
		$('#dlg_tips_title').text(title);
		$('#dlg_tips_content').text(content);
		$('#dlg_tips').modal('show');
	}
	
})(hlt, $);
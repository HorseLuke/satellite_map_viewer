if(!window.hlt){
	window.hlt = {};
}

(function(hlt, $){
	
	//各种实例或者引用容器
	hlt.obj_tree = {
		
	};
	
	/**
	 * 配置类
	 */
	hlt.cfg = {
		"data": {
			ver: '0.1',
			test: 0,
			xtoken: "",
			refresh_countdown: 300    //刷新时间
		},	
			
		"get": function(k){
			return this.data[k];
		},
			
		"set": function(k){
			for(i in k){
				this.data[i] = k[i];
			}
		}
	};
	
	
})(hlt, $);
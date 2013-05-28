if(!window.hlt){
	window.hlt = {};
}

(function(hlt, $){
	
	/**
	 * @var OpenLayers.Map
	 */
	hlt.map = '1';
	
	hlt.obj_tree["map_pj_gg"] = new OpenLayers.Projection("EPSG:4326");
	hlt.obj_tree["map_pj_sm"] = new OpenLayers.Projection("EPSG:900913");	
	
	hlt.initer = {};
	
	hlt.initer.map = function(dom_id){
        var options = {
        	projection: hlt.obj_tree["map_pj_sm"],
        	numZoomLevels: 17,    //最大zoom + 1 (因为有一个Zoom 0 -_-||)
            controls: [
                       new OpenLayers.Control.Navigation(),
                       new OpenLayers.Control.PanZoomBar(),
                       new OpenLayers.Control.LayerSwitcher(),
                       new OpenLayers.Control.Attribution()
                   ]
        };
        
        hlt.map = new OpenLayers.Map(dom_id, options);
        //hlt.map.addControl();
	};
	
	hlt.initer.layer_OSM = function(){
		var layer_name = "OpenStreetMap";
        var layer_option = {
            	attribution : '<a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a>',
            	isBaseLayer: false,
            	opacity: 0.4,
            	tileOptions: {
            		/**
            		 * http://dev.openlayers.org/docs/files/OpenLayers/Layer/OSM-js.html
            		 * http://lists.osgeo.org/pipermail/openlayers-users/2012-July/025754.html
            		 */
            		
            		crossOriginKeyword: null
            	}            	
            };
        
        hlt.map.addLayer(new OpenLayers.Layer.OSM( layer_name, '', layer_option));
	};
	
	hlt.initer.layer_YAHOO = function(){
		var layer_name = "Yahoo TW Satellite";
        var layer_option = {
        	attribution : '<a href="http://tw.maps.yahoo.com/" target="_blank">Yahoo!(tw)</a> & <a href="http://www.i3.com/" target="_blank">I-Cubed</a>',
        	isBaseLayer: true,
        	getURL: function(bounds){
            	var xyz = hlt.map.getLayersByName(layer_name)[0].getXYZ(bounds);
            	return hlt.yahoo_satellite_xyz_conv.getURL(xyz);
            },
        	tileOptions: {
        		/**
        		 * http://dev.openlayers.org/docs/files/OpenLayers/Layer/OSM-js.html
        		 * http://lists.osgeo.org/pipermail/openlayers-users/2012-July/025754.html
        		 */
        		
        		crossOriginKeyword: null
        	}            
        };
        
        hlt.map.addLayer(new OpenLayers.Layer.OSM(layer_name, "", layer_option));
        
	};
	
	hlt.initer.set_zoom = function(lat, lon){
        lon = lon || 113;
        lat = lat || 22;
        
        //transform不能省略，否则会出事
        hlt.map.setCenter(
            new OpenLayers.LonLat(lon, lat).transform(
            	hlt.obj_tree["map_pj_gg"],
                hlt.map.getProjectionObject()
            ), 13
        );
	};
	
	//http://openlayers.org/blog/2010/07/10/google-maps-v3-for-openlayers/
	hlt.initer.layer_GOOGLE = function(){
		hlt.map.addLayer(new OpenLayers.Layer.Google("Google Street", {visibility: false}));   //总会自动载入...屏蔽
		hlt.map.addLayer(new OpenLayers.Layer.Google("Google Satellite", {type: google.maps.MapTypeId.SATELLITE, visibility: false}));    //竟然不是卫星图？！
		hlt.map.addLayer(new OpenLayers.Layer.Google("Google Terrain", {type: google.maps.MapTypeId.TERRAIN, visibility: false}));
		hlt.map.addLayer(new OpenLayers.Layer.Google("Google Hybrid", {type: google.maps.MapTypeId.HYBRID, visibility: false}));
	};
	
	
	hlt.initer.layer_ESRI_ARCGIS_IMG = function(){
		var layer_name = "ArcGIS Satellite";
        var layer_option = {
            	attribution : '<a href="http://www.arcgis.com/home/webmap/viewer.html" target="_blank">esri ArcGIS</a>',
            	isBaseLayer: true,
            	tileOptions: {
            		/**
            		 * http://dev.openlayers.org/docs/files/OpenLayers/Layer/OSM-js.html
            		 * http://lists.osgeo.org/pipermail/openlayers-users/2012-July/025754.html
            		 */
            		
            		crossOriginKeyword: null
            	}
            	
            };
            
            var map_url = "http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}";
            
            //var map_url = "server/mbtiles_reader.php?db=test_world&z=${z}&x=${x}&y=${y}";
            
            hlt.map.addLayer(new OpenLayers.Layer.OSM( layer_name, map_url, layer_option));
		
	}
	
	/**
	 * 雅虎tw地图卫星图TMS转换工具
	 */
	hlt.yahoo_satellite_xyz_conv = {
		"urls": [
		    "http://maps.yimg.com/ae/ximg?v=1.9&t=a&s=256&r=1&",
		    "http://maps1.yimg.com/ae/ximg?v=1.9&t=a&s=256&r=1&",
		    "http://maps2.yimg.com/ae/ximg?v=1.9&t=a&s=256&r=1&",
		    "http://maps3.yimg.com/ae/ximg?v=1.9&t=a&s=256&r=1&"
		],
		
		"getSrvUrl": function(x, y){
			return this.urls[((x + y) % 4 + 4) % 4];
		},
		
		"getURL": function(xyz){
			var z = xyz.z + 1;
			var y = (1 << xyz.z) / 2 - xyz.y - 1;
			var x = xyz.x;

			return this.getSrvUrl(x, y) + 'x=' + x + '&y=' + y + '&z=' + z;
		}
		
	};
	
})(hlt, $);
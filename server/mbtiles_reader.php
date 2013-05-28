<?php
/**
 * [CHS]
 * mbtiles数据库读取示例
 * 使用方法:
 * http://127.0.0.1/mbtiles_satellite/mbtiles_reader.php?db={db}&x={x}&y={y}&z={z}
 * 如果你想直接读取mbtiles数据库(TMS格式)，必须添加参数'y_type=tms' (默认为"osm"):
 * http://127.0.0.1/mbtiles_satellite/mbtiles_reader.php?db={db}&y_type=tms&x={x}&y={y}&z={z}
 * 
 * [ENG]
 * mbtiles map data reader demo
 * usage with openlayers-osm:
 * http://127.0.0.1/mbtiles_satellite/mbtiles_reader.php?db={db}&x={x}&y={y}&z={z}
 * if you want to read mbtiles map data directly(TMS FORMAT), you have to add paramter 'y_type=tms' (default is "osm"):
 * http://127.0.0.1/mbtiles_satellite/mbtiles_reader.php?db={db}&y_type=tms&x={x}&y={y}&z={z}
 * 
 * @author Horse Luke
 * @version 0.0.1
 */

date_default_timezone_set('PRC');
error_reporting(0);
//error_reporting(E_ALL ^ E_STRICT);    //debug

/**
 * [chs]存放mbtiles的文件夹
 * [eng]mbtiles source data dir
 * @var string在
 */
$source_dir = 'D:\map_mbtiles';

/**
 * [chs]mbtiles文件名（不含扩展名）
 * [eng]mbtiles filename(without suffix)
 * @var string
 */
$map_source = isset($_GET['db']) ? $_GET['db'] : '';

if(!isset($map_source) || !preg_match('/^[a-z0-9-_]+$/i', $map_source)){
	header('Mbtiles-Reader-Error: param_db_not_right');
	header_404_exit();
}

$map_source_db = $source_dir . '/'. $map_source. '.mbtiles';
if(!is_file($map_source_db)){
	header('Mbtiles-Reader-Error: no_such_db');
	header_404_exit();
}

$tile = new tile();
$tile->zoom_level = isset($_GET['z']) ? intval($_GET['z']) : 0;
$tile->tile_column = isset($_GET['x']) ? intval($_GET['x']) : 0;
$tile->tile_row = isset($_GET['y']) ? intval($_GET['y']) : 0;

if(!isset($_GET['y_type']) || 'osm' == $_GET['y_type']){
	//https://code.google.com/p/mapshup/source/browse/server/utilities/mbtsrv.php
	$tile->tile_row = (1 << $tile->zoom_level) - $tile->tile_row - 1;  //XYZ转换
}

$pdo_tms = new PDO('sqlite:'. $map_source_db, null, null, array(PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION));

/**
 * 
 * 此处演示的是php pdo使用prepare-execute周期中，bindParam和bindColumn的用法
 * 在实际中，由于传入的参数已经全部intval，所以其实可以直接拼接SQL然后query之。
 */
$stmt = $pdo_tms->prepare('SELECT `tile_data` FROM `main`.`tiles`
		WHERE `zoom_level` = :zoom_level AND `tile_column` = :tile_column AND `tile_row` = :tile_row');
$stmt->bindParam(':zoom_level', $tile->zoom_level, PDO::PARAM_INT);
$stmt->bindParam(':tile_column', $tile->tile_column, PDO::PARAM_INT);
$stmt->bindParam(':tile_row',$tile->tile_row, PDO::PARAM_INT);

$stmt->execute();

$stmt->setFetchMode(PDO::FETCH_ASSOC);
$stmt->bindColumn('tile_data', $tile->tile_data, PDO::PARAM_LOB);

if($stmt->fetch(PDO::FETCH_BOUND)){
	header('Content-Type: image/jpeg');    //默认
	echo $tile->tile_data;
}else{
	header('Mbtiles-Reader-Error: tile_not_found_in_db');
	header_404_exit();
}


function header_404_exit(){
	header("HTTP/1.1 404 Not Found");
	echo 'NOT FOUND';
	exit();
}


class tile{

	public $zoom_level = 0;
	public $tile_column = 0;
	public $tile_row = 0;
	public $tile_data = '';

	public function reset(){
		$this->zoom_level = 0;
		$this->tile_column = 0;
		$this->tile_row = 0;
		$this->tile_data = '';
	}

}
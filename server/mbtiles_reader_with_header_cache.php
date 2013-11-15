<?php
/**
 * [CHS]
 * mbtiles数据库读取示例（带头部header cache控制，节省服务器流量资源版）
 * 使用方法:
 * http://127.0.0.1/mbtiles_satellite/mbtiles_reader.php?db={db}&x={x}&y={y}&z={z}
 * 如果你想直接读取mbtiles数据库(TMS格式)，必须添加参数'y_type=tms' (默认为"osm"):
 * http://127.0.0.1/mbtiles_satellite/mbtiles_reader.php?db={db}&y_type=tms&x={x}&y={y}&z={z}
 * 
 * [ENG]
 * mbtiles map data reader demo (with header cache control)
 * usage with openlayers-osm:
 * http://127.0.0.1/mbtiles_satellite/mbtiles_reader.php?db={db}&x={x}&y={y}&z={z}
 * if you want to read mbtiles map data directly(TMS FORMAT), you have to add paramter 'y_type=tms' (default is "osm"):
 * http://127.0.0.1/mbtiles_satellite/mbtiles_reader.php?db={db}&y_type=tms&x={x}&y={y}&z={z}
 * 
 * @author Horse Luke
 * @version 0.0.2 build 20131115 1845
 */

/**
 * （任何小型单文件project）配置区
 *
 */
class project_common_config{

	protected $conf = array(
			'timezone' => 'PRC',    //时区
			'error_reporting' => 0,    //error_reporting
			'source_dir' => '',    //(__construct()中定义)存放mbtiles的文件夹
			'max-age' => 604800,    //存在该tiles时，发送的Cache-Control: max-age=?（默认为1周）
			'not_exist_max-age' => 259200,    //不存在该tiles时，发送的Cache-Control: max-age=?（默认为3天）（not_exist_strategy为img/blank时有效）
			'not_exist_strategy' => 'blank',    //不存在该tiles时的策略。“header404”：发送header404；“img”：发送一张自定义无数据的图片；“blank”发送一张透明png图片
			'not_exist_img_path' => '',   //(__construct()中定义)无数据的图片文件路径（not_exist_strategy为img时有效）
			'reject_robot' => true,    //拒绝robots访问？默认为true
	);

	public function __construct(){
		$this->conf['source_dir'] = dirname(__FILE__). '/mbtiles_protected';    //请在这里设置：存放mbtiles的文件夹
		$this->conf['not_exist_img_path'] = dirname(__FILE__). '/mbtiles_reader_no_data.png'; //请在这里设置：无数据的图片文件路径（not_exist_strategy为img时有效）
	}
	
	public function get($k, $def=null){
		return isset($this->conf[$k]) ? $this->conf[$k] : $def;
	}

	public function set($k, $v){
		$this->conf[$k] = $v;
		return $this;
	}

}

/**
 * （任何小型单文件project）环境区
 *
 */
class project_common_env{

	static protected $instance = array();

	static public function init(){
		$conf = self::get_instance('project_common_config');
		date_default_timezone_set($conf->get('timezone'));
		error_reporting($conf->get('error_reporting'));
	}

	static public function get_instance($classname){
		if(isset(self::$instance[$classname])){
			return self::$instance[$classname];
		}

		self::$instance[$classname] = new $classname();
		return self::$instance[$classname];
	}
	
}

/**
 * （特定小型单文件project：mbtiles_reader）环境区
 *
 */
class project_mbtiles_reader_env{
	
	static public function init(){
		ob_start();
		self::reject_robot();
	}
	
	static public function reject_robot(){
		if(!project_common_env::get_instance('project_common_config')->get('reject_robot')){
			return ;
		}
		$user_agent = isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : '';
		if(empty($user_agent) || preg_match("/bot|spider|crawl|nutch|lycos|robozilla|slurp|search|seek|archive|curl/i", $user_agent) ){
			header("HTTP/1.1 403 Forbidden");
			exit();
		}
	}
	
	/**
	 * 空白png图片
	 * @return string
	 */
	static public function src_blank_png(){
		return base64_decode('iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAAGXRFWHRTb2Z0d2FyZQBNYnRpbGVzIFJlYWRlciAxccllPAAAAl1JREFUeNrs1DEBAAAIwzDAv+dhAAckEnq0kxTw00gABgAYAGAAgAEABgAYAGAAgAEABgAYAGAAgAEABgAYAGAAgAEABgAYAGAAgAEABgAYAGAAgAEABgAYAGAAgAEABgAYAGAAgAEABgAYAGAAgAGAAQAGABgAYACAAQAGABgAYACAAQAGABgAYACAAQAGABgAYACAAQAGABgAYACAAQAGABgAYACAAQAGABgAYACAAQAGABgAYACAAQAGABgAYACAAYABAAYAGABgAIABAAYAGABgAIABAAYAGABgAIABAAYAGABgAIABAAYAGABgAIABAAYAGABgAIABAAYAGABgAIABAAYAGABgAIABAAYAGABgAIABgAEABgAYAGAAgAEABgAYAGAAgAEABgAYAGAAgAEABgAYAGAAgAEABgAYAGAAgAEABgAYAGAAgAEABgAYAGAAgAEABgAYAGAAgAEABgAYAGAAgAGAAQAGABgAYACAAQAGABgAYACAAQAGABgAYACAAQAGABgAYACAAQAGABgAYACAAQAGABgAYACAAQAGABgAYACAAQAGABgAYACAAQAGABgAYACAAYABAAYAGABgAIABAAYAGABgAIABAAYAGABgAIABAAYAGABgAIABAAYAGABgAIABAAYAGABgAIABAAYAGABgAIABAAYAGABgAIABAAYAGABgAIABgAEABgAYAGAAgAEABgAYAGAAgAEABgAYAGAAgAEABgAYAGAAgAEABgAYAGAAgAEABgAYAGAAgAEABgAYAGAAgAEABgAYAGAAgAEAlxVgAOfKBP0Ih/ieAAAAAElFTkSuQmCC');
	}
	
}

/**
 * （特定小型单文件project：mbtiles_reader）控制区
 *
 */
class project_mbtiles_reader_controller{
	
	/**
	 * @var project_common_config
	 */
	protected $conf = null;
	
	/**
	 * @var tile_container
	 */
	protected $tile_container = null;
	
	public function __construct(){
		$this->conf = project_common_env::get_instance('project_common_config');
		$this->tile_container = new tile_container();
	}
	
	public function action_run(){
		$this->_pre_process_input();
		$this->_pre_etag_cache_detect();
		
		$map_source_db = $this->conf->get('source_dir') . '/'. $this->tile_container->map_source. '.mbtiles';
		if(!is_file($map_source_db)){
			//强制404
			$this->_exit_header_404('param_db_not_found');
		}
		
		try{
			$pdo_tms = new PDO('sqlite:'. $map_source_db, null, null, array(PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION));
			
			/**
			 *
			 * 此处演示的是php pdo使用prepare-execute周期中，bindParam和bindColumn的用法
			 * 在实际中，由于传入的参数已经全部intval，所以其实可以直接拼接SQL然后query之。
			 */
			$stmt = $pdo_tms->prepare('SELECT `tile_data` FROM `main`.`tiles`
		WHERE `zoom_level` = :zoom_level AND `tile_column` = :tile_column AND `tile_row` = :tile_row');
			$stmt->bindParam(':zoom_level', $this->tile_container->zoom_level, PDO::PARAM_INT);
			$stmt->bindParam(':tile_column', $this->tile_container->tile_column, PDO::PARAM_INT);
			$stmt->bindParam(':tile_row',$this->tile_container->tile_row, PDO::PARAM_INT);
			
			$stmt->execute();
			
			$stmt->setFetchMode(PDO::FETCH_ASSOC);
			$stmt->bindColumn('tile_data', $this->tile_container->tile_data, PDO::PARAM_LOB);
			
			if($stmt->fetch(PDO::FETCH_BOUND)){
				header('Content-Type: image/jpeg');    //默认
				$this->_header_cache();
				echo $this->tile_container->tile_data;
			}else{
				$this->_exit_with_not_found('tile_not_found');
			}
			
		}catch(Exception $e){
			//强制404
			$this->_exit_header_404('unknown_connect_or_fetch_error');			
		}
		
	}
	
	/**
	 * 初始化$this->tile_container的所有参数，以完成Etag计算
	 */
	protected function _pre_process_input(){
		$map_source = isset($_GET['db']) ? $_GET['db'] : '';
		if(!isset($map_source) || !preg_match('/^[a-z0-9-_]+$/i', $map_source)){
			//强制404
			$this->_exit_header_404('param_db_not_right');
		}
		
		$this->tile_container->map_source = $map_source;
		$this->tile_container->zoom_level = isset($_GET['z']) ? intval($_GET['z']) : 0;
		$this->tile_container->tile_column = isset($_GET['x']) ? intval($_GET['x']) : 0;
		$this->tile_container->tile_row = isset($_GET['y']) ? intval($_GET['y']) : 0;
		
		if(!isset($_GET['y_type']) || 'osm' == $_GET['y_type']){
			//https://code.google.com/p/mapshup/source/browse/server/utilities/mbtsrv.php
			$this->tile_container->tile_row = (1 << $this->tile_container->zoom_level) - $this->tile_container->tile_row - 1;  //XYZ转换
		}		
		
		
	}
	
	/**
	 * Etag缓存匹配（地址栏按回车之后）
	 * 需要在_pre_process_input()完成之后
	 */
	protected function _pre_etag_cache_detect(){
		$header_301 = false;
		if(isset($_SERVER['HTTP_IF_NONE_MATCH']) && $_SERVER['HTTP_IF_NONE_MATCH'] == $this->tile_container->get_etag()){
			$header_301 = true ;
		}elseif(isset($_SERVER['HTTP_IF_MATCH']) && $_SERVER['HTTP_IF_MATCH'] != $this->tile_container->get_etag()){
			$header_301 = true;
		}
		
		if($header_301){
			header("HTTP/1.1 304 Not Modified");
			exit();
		}
		
	}
	
	
	protected function _exit_with_not_found($header_error = 'not-found'){
		$strategy = $this->conf->get('not_exist_strategy');
		if('header404' == $strategy){
			$this->_exit_header_404($header_error);
		}
		
		header('Mbtiles-Reader-Error: '. $header_error);
		$this->_header_cache($this->conf->get('not_exist_max-age'));
		
		header('Content-Type: image/png');
		if('img' == $strategy){
			echo file_get_contents($this->conf->get('not_exist_img_path'));
		}else{
			echo project_mbtiles_reader_env::src_blank_png();
		}
		

		exit();
	}
	
	protected function _exit_header_404($header_error = 'not-found'){
		header("HTTP/1.1 404 Not Found");
		header('Mbtiles-Reader-Error: '. $header_error);	
		exit();
	}
	
	protected function _header_cache($maxage = null){
		if(!is_numeric($maxage)){
			$maxage = $this->conf->get('max-age');
		}
		header('Etag: '. $this->tile_container->get_etag());
		header('Cache-Control: max-age='. $maxage);
		$current_time = isset($_SERVER['REQUEST_TIME']) ? $_SERVER['REQUEST_TIME'] : time();
		header('Expires: '. gmdate('D, d M Y H:i:s T', $current_time + $maxage));    ////gmdate('r')
	}
	
}


class tile_container{

	public $zoom_level = 0;
	public $tile_column = 0;
	public $tile_row = 0;
	public $map_source = '';
	
	protected $_etag = '';
	
	public $tile_data = '';
	
	public function reset(){
		$this->zoom_level = 0;
		$this->tile_column = 0;
		$this->tile_row = 0;
		$this->map_source = '';
		
		$this->_etag = '';
			
		$this->tile_data = '';
	}
	
	public function get_etag(){
		if('' != $this->_etag){
			return $this->_etag;
		}
		$this->_etag = '"'. md5($this->zoom_level. '_'.
				$this->tile_column. '_'.
				$this->tile_row. '_'.
				$this->map_source. '_'.
				project_common_env::get_instance('project_common_config')->get('source_dir'). '_'.
				'etag_asfasd#$^%&ad6@#5d7dutyfd'
		). '"';
		return $this->_etag;
	}
	
	public function reset_etag(){
		$this->_etag = '';
	}
	
}

project_common_env::init();
project_mbtiles_reader_env::init();
project_common_env::get_instance('project_mbtiles_reader_controller')->action_run();

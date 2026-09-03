<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Access-Control-Allow-Origin: *');

$configFile = __DIR__ . '/config.php';
$config = file_exists($configFile) ? require $configFile : ['goldapi_key'=>'','use_goldapi'=>false];

function getUrl($url, $headers=[]){
  $ch=curl_init($url);
  curl_setopt_array($ch,[CURLOPT_RETURNTRANSFER=>true,CURLOPT_FOLLOWLOCATION=>true,CURLOPT_CONNECTTIMEOUT=>8,CURLOPT_TIMEOUT=>15,CURLOPT_HTTPHEADER=>$headers,CURLOPT_USERAGENT=>'RateYar/1.0']);
  $body=curl_exec($ch); $code=curl_getinfo($ch,CURLINFO_HTTP_CODE); curl_close($ch);
  if($body===false || $code<200 || $code>=300) return null; return $body;
}
function num($s){ return (float)preg_replace('/[^0-9.\-]/','',(string)$s); }

$result=['ok'=>true,'source'=>[],'rates'=>[],'timestamp'=>gmdate('c')];

// Da Afghanistan Bank: official published cash sell rates.
$html=getUrl('https://www.dab.gov.af/exchange-rates');
if($html){
  $clean=strip_tags($html,'<tr><td>');
  $clean=preg_replace('/\s+/u',' ',strip_tags($html));
  $patterns=[
    'USD'=>['USD\$\s*([0-9.]+)\s+([0-9.]+)'],
    'EUR'=>['EURO€?\s*([0-9.]+)\s+([0-9.]+)'],
    'GBP'=>['POUND£?\s*([0-9.]+)\s+([0-9.]+)'],
    'IRR'=>['IRAN Toman\s*([0-9.]+)\s+([0-9.]+)']
  ];
  foreach($patterns as $cc=>$ps){ foreach($ps as $p){ if(preg_match('/'.$p.'/u',$clean,$m)){ $result['rates'][$cc]=['sell'=>num($m[1]),'buy'=>num($m[2])]; break; } } }
  $result['source'][]='Da Afghanistan Bank';
}

// Live gold/silver. GoldAPI is optional and requires a key.
if(!empty($config['use_goldapi']) && !empty($config['goldapi_key']) && $config['goldapi_key']!=='YOUR_GOLDAPI_KEY'){
  foreach(['XAU'=>'gold','XAG'=>'silver'] as $symbol=>$id){
    $body=getUrl('https://www.goldapi.io/api/'.$symbol.'/USD',['x-access-token: '.$config['goldapi_key'],'Content-Type: application/json']);
    if($body){$d=json_decode($body,true); if(isset($d['price'])) $result['rates'][$symbol]=['price'=>(float)$d['price'],'timestamp'=>$d['timestamp']??time()];}
  }
  $result['source'][]='GoldAPI';
}

// If an upstream source failed, return a clear state instead of inventing prices.
if(empty($result['rates'])) $result['ok']=false;
echo json_encode($result,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);

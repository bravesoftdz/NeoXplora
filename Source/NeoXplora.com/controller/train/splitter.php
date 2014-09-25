<?php 
namespace NeoX\Controller;
use NeoX\Model;
use NeoX\Entity;

require_once __DIR__ . "/../train.php";
class TTrainSplitter extends TTrain {
  
  protected $accessLevel = 'user';
  protected $rowclass = "row1";
  
  public function index() {
    $this->template->addScripts(array(
      "js/system/object.js"
    ));
    $this->template->addJSModules(array(
      "NeoX.Modules.SplitterTrainIndex" => "js/module/splitter/train/index.js",
      "NeoX.Modules.SplitterTrainRequests" => "js/module/splitter/train/requests.js",
      "NeoX.Modules.ButtonComponent" => "js/module/button.js"
    ));
    $this->template->addStyle("style/train.css");
    
    if(!isset($_SESSION['splitCategoryId'])) {
      $_SESSION['splitCategoryId'] = -1;
    }
    
    $categoryData = $this->core->entity("category")->select();
    $categoryList = array();
    
    while($result = $categoryData->fetch_array()) {
      $categoryList[$result[Entity\TCategory::$tok_id]] = $result[Entity\TCategory::$tok_name]; 
    }
    
    $this->template->currentCategory = $_SESSION['splitCategoryId'];
    $this->template->categoryList = $categoryList;
    
    $this->template->load("index", "train/splitter");
    $this->template->pageTitle = "Splitter";
    $this->template->page = "trainsplit";
    $this->template->hide_right_box = true;
    $this->template->render();
  }
  
  private function getFlatProtoData($someProtos){
    $theResult = array();
    foreach ($someProtos as &$aProto) {
      if($aProto['type'] == "sentence") {
        $aProto['rowclass'] = $this->rowclass;
        $this->rowclass = ($this->rowclass == "row1")?"row2":"row1";
      }
      $theResult[] = $aProto;
      if(isset($aProto['kids'])) {
        $theResult = array_merge($theResult, $this->getFlatProtoData($aProto['kids']));
      }
    }
    foreach ($theResult as &$aProto) {
      if(isset($aProto['kids'])) {
        unset($aProto['kids']);
      }
    }
    return $theResult;
  }
  
  public function load() {
    $ignoreIDs = array();
    
    if(isset($_SESSION['ignoredSplitPageIDs']) && is_array($_SESSION['ignoredSplitPageIDs'])) {
      $ignoreIDs = array_values($_SESSION['ignoredSplitPageIDs']);
    }
    
    if(!isset($_SESSION['splitCategoryId'])) {
      $_SESSION['splitCategoryId'] = -1;
    }
    
    $sentence_data = null;
    
    /*if($GLOBALS['random_training'] == true) {
      $category_data = $trainModel->getCategory("ssFinishedGenerate", "psFinishedCrawl", "psFinishedGenerate", $ignoreIDs)->fetch_array();
      
      $categoryID = $category_data['id'];
      $pageCount = $category_data['pageCount'];
      $max_offset = min(array($pageCount, 5));
      $offset = rand(0, $max_offset - 1);
      
      $sentenceCount = $trainModel->countSentences($categoryID, $offset, "ssFinishedGenerate", $ignoreIDs)->fetch_array();
      $sentence_offset = rand(0, $sentenceCount['sentenceCount'] - 1);
        
      $sentence_data = $trainModel->getSentence($categoryID, $offset, $sentence_offset, "ssFinishedGenerate", $ignoreIDs);
    } else {
      $sentence_data = $trainModel->getSentenceNotRandom("ssFinishedGenerate", $ignoreIDs, $_SESSION['splitCategoryId']);    
    }*/
    
    $query = $this->core->model("splitter", "train")->getMainProtos($ignoreIDs, $_SESSION['splitCategoryId']);
    
    $data = 'No sentence to display';
    $pageTitle = "-";
    
    if($query && $query->num_rows) {
      $theProtoList = array();
      $rowclass = '';
      while($proto_data = $query->fetch_array()) {
        $TheProto = array(
          "type" => "proto",
          "id" => $proto_data['id'],
          "order" => $proto_data['order'],
          "name" => $proto_data['name'],
          "pageid" => $proto_data['pageid'],
          "pagetitle" => $proto_data['pagetitle'],
          "level" => 1,
          "indentation" => 0
        );

        $kids = array_merge($this->loadChildProtos($proto_data['id'], 1), $this->loadSentences($proto_data['id'], 1));
        
        usort($kids, array("NeoX\\Controller\\TTrainSplitter", "compareRows"));
        $TheProto['kids'] = $kids;
        
        $theProtoList[] = $TheProto;
      }
      
      $pageTitle = $theProtoList[0]['pagetitle'];
      
      $theResult = $this->getFlatProtoData($theProtoList);
      
      $this->template->data = $theResult;
      $data = $this->template->fetch("table", "train/splitter");
    }
    
    $response = array(
      'data' => $data,
      'pageTitle' => $pageTitle
    );
    
    echo json_encode($response);
  }

  private function loadChildProtos($protoId, $intendation) {
    $data = array();
    $query = $this->core->model("splitter", "train")->getChildProtos($protoId);
        
    if($query->num_rows > 0) {
      while($proto_data = $query->fetch_array()) {
        $theProtoData = array(
          "type" => "proto",
          "id" => $proto_data['id'],
          "order" => $proto_data['order'],
          "name" => $proto_data['name'],
          "pageid" => $proto_data['pageid'],
          "level" => $intendation + 1,
          "indentation" => $intendation
        );

        $kids = array_merge($this->loadChildProtos($proto_data['id'], $intendation + 1), $this->loadSentences($proto_data['id'], $intendation + 1));
        
        usort($kids, array("NeoX\\Controller\\TTrainSplitter", "compareRows"));
       
        $theProtoData['kids'] = $kids;
        $data[] = $theProtoData;
      }
    }
    
    return $data;
  }
  
  private function loadSentences($protoId, $intendation) {
    $data = array();
    $query = $this->core->model("splitter", "train")->getSentences($protoId);
        
    if($query->num_rows > 0) {
      while($sentence_data = $query->fetch_array()) {
        $data[] = array(
          "type" => "sentence",
          "id" => $sentence_data['id'],
          "protoid" => $protoId,
          "parentid" => $protoId,
          "pageid" => $sentence_data['pageid'],
          "order" => $sentence_data['order'],
          "indentation" => $intendation,
          "rowclass" => "row1",
          "name" => $sentence_data['name']
        );
      }
    }
    
    return $data;
  }

  public static function compareRows(&$a, &$b) {
    if($a['order'] > $b['order']) {
      return 1;
    } else if($a['order'] < $b['order']) {
      return -1;
    } else {
      return 0;
    }
  }
  
  public function finish() {
    if(!isset($_POST['protoID'])) return;
    $protoID = $_POST['protoID'];
    
    $status = "ssTrainedSplit";
    if(isset($_POST['approved']) && ($_POST['approved'] == true || $_POST['approved'] == "true")) {
      $status = "ssReviewedSplit";
    }
    
    $this->core->entity("sentence")->update(
      array(
        "mainprotoid" => array($protoID)
      ),
      array(
        "status" => $status
      )
    );
    
    echo json_encode("");
  }

  public function skip() {
    if(!isset($_POST['protoID'])) return;
    $protoID = $_POST['protoID'];
    
    if(!isset($_SESSION['ignoredSplitPageIDs'])) { 
      $_SESSION['ignoredSplitPageIDs'] = array();
    }
    
    if(!in_array($protoID, $_SESSION['ignoredSplitPageIDs'])) {
      $_SESSION['ignoredSplitPageIDs'][] = $protoID;
    }
    
    if(count($_SESSION['ignoredSplitPageIDs']) > 10) {
      $_SESSION['ignoredSplitPageIDs'] = array_values(array_slice($_SESSION['ignoredSplitPageIDs'], 1));
    }
    
    $count_data = $this->core->model("splitter", "train")->countMainProtos($_SESSION['splitCategoryId'])->fetch_array();
    
    if($count_data['total'] == count($_SESSION['ignoredSplitPageIDs'])) {
      $_SESSION['ignoredSplitPageIDs'] = array();
    }
    
    echo json_encode("");
  }
  
  public function revert() {
    if(!isset($_POST['protoID'])) return;
    $protoId = $_POST['protoID'];
    
    $query = $this->core->entity("proto")->select($protoId, "*");
    if(!$query->num_rows) return;
    
    $proto_data = $query->fetch_array();
    
    $tree_data = array_merge($this->loadChildProtos($protoId, 0), $this->loadSentences($protoId, 0));
    $data = $this->getFlatProtoData($tree_data);
    
    $sentenceIds = array();
    $protoIds = array();
    $newOrder = -1;
    
    foreach($data as $row) {
      if($row['type'] == "sentence") {
        $sentenceIds[] = $row['id'];
        if($newOrder == -1) {
          $newOrder = $row['order'];
        } 
      } else {
        $protoIds[] = $row['id'];
      }
    }
    
    if($proto_data[Entity\TProto::$tok_parentid] != null) {
      $protoIds[] = $protoId;
      $newProtoId = $proto_data[Entity\TProto::$tok_parentid];
    } else {
      $newProtoId = $protoId;
    }
    
    $newOrder = $proto_data[Entity\TProto::$tok_order];
    $newName = $proto_data[Entity\TProto::$tok_name];
    
    $firstSentenceId = $sentenceIds[0]; 
    unset($sentenceIds[0]);
    
    $sentenceIds = array_values($sentenceIds);
    
    $query = $this->core->entity("sentence")->update(
      array(
        "id" => array($firstSentenceId)
      ),
      array(
        "protoid" => $newProtoId,
        "order" => $newOrder,
        "name" => $newName
      )
    );
        
    $this->core->entity("sentence")->delete(
      array(
        "id" => $sentenceIds
      )
    );
    
    $this->core->entity("proto")->delete(
      array(
        "id" => $protoIds
      )
    );
    
    echo json_encode("");
  }
  
  public function modify() {
    if(!isset($_POST['sentenceID']) || !isset($_POST['newValue'])) return;
    $newValue = htmlspecialchars_decode($_POST['newValue'], ENT_QUOTES);
    $sentenceId = $_POST['sentenceID'];
    $protoId = $this->core->entity("sentence")->select($sentenceId, "protoid")->fetch_array();
    $protoId = $protoId[Entity\TSentence::$tok_protoid];
    
    $result;
    try {
      $result = $this->Delphi()->SplitSentence($sentenceId, $newValue, true);
    } catch(\Exception $e) {
      echo json_encode(array("exception" => $e->getMessage()));
      exit;
    }
    
    $this->updatePageStatus($sentenceId);
        
    echo json_encode("");
  }
  
  public function catChanged() {
    if(!isset($_POST['categoryId'])) return;
    
    $_SESSION['splitCategoryId'] = intval($_POST['categoryId']);
    $_SESSION['ignoredSplitPageIDs'] = array();
    
    echo json_encode("");
  }

  public function approve() {
    if(!isset($_POST['sentenceIDs']) || !is_array($_POST['sentenceIDs'])) return;
    $sentenceIDs = $_POST['sentenceIDs'];

    $this->core->entity("sentence")->update(
      $sentenceIDs,
      array(
        'status' => 'ssReviewedSplit'
      )
    );

    $this->updatePageStatus(0, $sentenceIDs[0]);
    
    echo json_encode("");
  }
  
}

?>
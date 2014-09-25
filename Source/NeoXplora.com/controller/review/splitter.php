<?php 
namespace NeoX\Controller;
use NeoX\Model;
use NeoX\Entity;
use NeoX\Classes;

require_once __DIR__ . "/../train.php";
class TReviewSplitter extends TTrain {
  
  protected $accessLevel = 'admin';
  protected $model = null;
  protected $rowclass = "row1";
  protected $mode = "tree";
  
  public function index() {
    $this->template->addScripts(array(
      "js/system/object.js"
    ));
    $this->template->addJSModules(array(
      "NeoX.Modules.SplitterReviewIndex" => "js/module/splitter/review/index.js",
      "NeoX.Modules.SplitterReviewRequests" => "js/module/splitter/review/requests.js",
      "NeoX.Modules.ButtonComponent" => "js/module/button.js"
    ));
    
    $this->template->thePageId = (isset($_GET['pageId']) && $_GET['pageId'] != "")?$_GET['pageId']:"";
    
    $this->template->load("index", "review/splitter");
    $this->template->pageTitle = "Splitter Review";
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
    $page = isset($_POST['page'])?$_POST['page']:1;
    $per_page = 5;
    $pagination = array();
    $pageId = (isset($_REQUEST['pageId']) && $_REQUEST['pageId'] != "")?$_REQUEST['pageId']:null;
    $showReviewed = ($_REQUEST['showReviewed'] == "true")?true:false;
    
    $this->model = $this->core->model("splitter", "review");
    $count_data = $this->model->countMainProtos($pageId, $showReviewed)->fetch_array();
    
    if($count_data['total'] > 0) {
      $pages = ceil($count_data['total'] / $per_page);
      $start = ($page - 1) * $per_page;
      
      $query = $this->model->getMainProtos($pageId, $start, $per_page, $showReviewed);
      
      if(!$query) {
        $query = $this->model->getMainProtos($pageId, 0, $per_page);
        $page = 1;
      }
      
      $theProtoList = array();
      $rowclass = '';
      while($proto_data = $query->fetch_array()) {
        $TheProto = array(
          "type" => "proto",
          "id" => $proto_data['id'],
          "order" => $proto_data['order'],
          "name" => $proto_data['name'],
          "pageid" => $proto_data['pageid'],
          "level" => 1,
          "indentation" => 0
        );

        $kids = array_merge($this->loadChildProtos($proto_data['id'], 1), $this->loadSentences($proto_data['id'], 1));
        
        usort($kids, array("NeoX\\Controller\\TReviewSplitter", "compareRows"));
        $TheProto['kids'] = $kids;
        
        $theProtoList[] = $TheProto;
      }
      
      $theResult = $this->getFlatProtoData($theProtoList);
      
      
      require_once APP_DIR . "classes/Pagination.php";
      $paginationObj = new Classes\Pagination($pages, $page);
      $pagination_array = $paginationObj->generate();
      
      $this->template->pagination = (array) $pagination_array;
      
      $this->template->currentPage = $page;
      $pagination = $this->template->fetch("pagination", "review/splitter");
      
      $this->template->data = $theResult;
      $data = $this->template->fetch("table", "review/splitter");
    } else {
      $data = 'There are no sentences to review.';
    }
    
    $response = array(
      'data' => $data,
      'pagination' => $pagination
    );
    
    echo json_encode($response);
  }

  private function loadChildProtos($protoId, $intendation) {
    $data = array();
    $query = $this->model->getChildProtos($protoId);
        
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
        
        usort($kids, array("NeoX\\Controller\\TReviewSplitter", "compareRows"));
       
        $theProtoData['kids'] = $kids;
        $data[] = $theProtoData;
      }
    }
    
    return $data;
  }
  
  private function loadSentences($protoId, $intendation) {
    $data = array();
    $query = $this->model->getSentences($protoId);
        
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
  
  public function createProto() {
    if(!isset($_POST['protoId'])) return;
    if(!isset($_POST['sentences'])) return;
    $sentences = $_POST['sentences'];
    $protoId = $_POST['protoId'];
    
    $query = $this->core->entity("proto")->select($protoId, "*");
    if(!$query->num_rows) return;
    $proto_data = $query->fetch_array();
    
    $mainProtoId = $proto_data[Entity\TProto::$tok_mainprotoid];
    $pageId = $proto_data[Entity\TProto::$tok_pageid];
    $query = $this->core->entity("sentence")->select(
      array(
        "id" => $sentences
      ), 
      array(
        "name", 
        "order"
      ),
      array(
        "order" => "ASC"
      )
    );
    if(!$query->num_rows) return;
    $protoName = '';
    $order = -1;
    while($sentence_data = $query->fetch_array()) {
      if($order == -1) {
        $order = $sentence_data[Entity\TSentence::$tok_order];
      }
      $protoName .= " " . $sentence_data[Entity\TSentence::$tok_name];
    }
    
    $query = $this->core->entity("proto")->insert(
      array(
        "name",
        "order",
        "pageid",
        "parentid"
      ),
      array(
        array(
          $protoName,
          $order,
          $pageId, 
          $protoId
        )
      )
    );
    
    $newProtoId = $this->db->insert_id;
    
    if(!$newProtoId) {
      return;
    }
    
    $this->core->entity("sentence")->update(
      array(
        "id" => $sentences
      ),
      array(
        "protoid" => $newProtoId 
      )
    );
    
    echo json_encode("");
  }

  public function revert() {
    if(!isset($_POST['protoID'])) return;
    $protoId = $_POST['protoID'];
    
    $query = $this->core->entity("proto")->select($protoId, "*");
    if(!$query->num_rows) return;
    
    $proto_data = $query->fetch_array();
    
    $this->model = $this->core->model("splitter", "review");
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
      $result = $this->Delphi()->SplitSentence($sentenceId, $newValue);
    } catch(\Exception $e) {
      echo json_encode(array("exception" => $e->getMessage()));
      exit;
    }
    
    $newSentencesCount = $result->Count();    
    $data = '';
    
    $this->updatePageStatus($sentenceId);
        
    echo json_encode("");
  }

  public function approve() {
    if(!isset($_POST['protoID'])) return;
    $protoID = $_POST['protoID'];
    
    $this->core->entity("sentence")->update(
      array(
        "mainprotoid" => array(
          $protoID
        )
      ),
      array(
        "status" => 'ssReviewedSplit'
      )
    );

    $this->updatePageStatus(0, $protoID);
    
    $sentenceIDs = array();
    $query = $this->core->entity("sentence")->select(
      array(
        "mainprotoid" => array(
          $protoID
        )
      ),
      "id"
    );

    while($sentence_data = $query->fetch_array()) {
      $sentenceIDs[] = $sentence_data[Entity\TSentence::$tok_id]; 
    }
    
    try {
      $this->Delphi()->PredictAfterSplit($sentenceIDs);
    } catch(\Exception $e) {
      echo json_encode(array("exception" => $e->getMessage()));
      exit;
    }
    
    echo json_encode("");
  }
    
  public function dismiss() {
    if(!isset($_POST['protoID'])) return;
    $protoID = $_POST['protoID'];
    
    $this->core->entity("sentence")->update(
      array(
        "mainprotoid" => array(
          $protoID
        )
      ),
      array(
        "status" => 'ssFinishedGenerate'
      )
    );
    
    $this->updatePageStatus(0, $protoID);
    
    echo json_encode("");
  }
  
  public function approveMultiple() {
    if(!isset($_POST['protoIDs']) || !is_array($_POST['protoIDs'])) return;
    
    $protoIDs = $_POST['protoIDs'];
      
    $this->core->entity("sentence")->update(
      array(
        "mainprotoid" => $protoIDs
      ),
      array(
        "status" => 'ssReviewedSplit'
      )
    );
    
    foreach($protoIDs as $protoID)
      $this->updatePageStatus(0, $protoID);

    $sentenceIDs = array();
    
    $query = $this->core->entity("sentence")->select(
      array(
        "mainprotoid" => $protoIDs
      ),
      "id"
    );
    
    while($sentence_data = $query->fetch_array()) {
      $sentenceIDs[] = $sentence_data[Entity\TSentence::$tok_id]; 
    }

    try {
      $this->Delphi()->PredictAfterSplit($sentenceIDs);
    } catch(\Exception $e) {
      var_dump($e);
    }
    
    echo json_encode("");
  }

  public function dismissMultiple() {
    if(!isset($_POST['protoIDs']) || !is_array($_POST['protoIDs'])) return;
    $protoIDs = $_POST['protoIDs'];
       
    $wherein = '';
    $wherein .= " s.`pr2ID` IN (";
    for($i = 0; $i < count($protoIDs); $i++) {
      $wherein .= "'" . $protoIDs . "'";
      if($i != count($protoIDs) - 1) $wherein .= ', ';
    }
    $wherein .= ") ";
    
    $this->core->entity("sentence")->update(
      array(
        "mainprotoid" => $protoIDs
      ),
      array(
        "status" => 'ssFinishedGenerate'
      )
    );
      
    foreach($protoIDs as $protoID)
      $this->updatePageStatus(0, $protoID);
    
    echo json_encode("");
  }

  
}

?>
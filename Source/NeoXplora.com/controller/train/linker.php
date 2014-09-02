<?php
namespace NeoX\Controller;
use NeoX\Entity;

require_once __DIR__ . "/../train.php";
class TTrainLinker extends TTrain {
  
  public $accessLevel = 'user';
  private $entityList;
  private $sentenceList;
  private $colorList = array(
    "#346799",
    "#990000",
    "#ff8000"
  );
  
  public function index() {
    $this->template->addScripts(array(
      "js/system/object.js",
      "js/classes/List.js",
      "js/classes/StringList.js",
      "js/classes/Interval.js",
      "js/classes/rep/CRepRecord.js"
    ));
    $this->template->addJSModules(array(
      "NeoX.Modules.LinkerTrainIndex" => "js/module/linker/train/index.js",
      "NeoX.Modules.LinkerTrainRequests" => "js/module/linker/train/requests.js",
      "NeoX.Modules.ButtonComponent" => "js/module/button.js"
    ));
    
    if(!isset($_SESSION['linkerCategoryId'])) {
      $_SESSION['linkerCategoryId'] = -1;
    }
    
    $categoryData = $this->core->entity("category")->select();
    $categoryList = array();
    
    while($result = $categoryData->fetch_array()) {
      $categoryList[$result[Entity\TCategory::$tok_id]] = $result[Entity\TCategory::$tok_name]; 
    }
    
    $this->template->currentCategory = $_SESSION['linkerCategoryId'];
    $this->template->categoryList = $categoryList;
    
    $this->template->addStyle("style/train/linker.css");
    $this->template->load("index", "train/linker");
    $this->template->pageTitle = "Train CRep";
    $this->template->page = "traincrep";
    $this->template->hide_right_box = true;
    $this->template->render();
  }
  
  public function catChanged() {
    if(!isset($_POST['categoryId'])) return;
    
    $_SESSION['linkerCategoryId'] = intval($_POST['categoryId']);
    $_SESSION['pageID'] = -1;
    $_SESSION['ignoredLinkerPageIDs'] = array();
    
    echo json_encode("");
  }
  
  public function loadPage() {
    $pageData = null;
    //unset($_SESSION['ignoredLinkerPageIDs']);
    if(!isset($_SESSION['pageID']) || $_SESSION['pageID'] == -1) {
      $ignoreIDs = array();
      
      if(isset($_SESSION['ignoredLinkerPageIDs']) && is_array($_SESSION['ignoredLinkerPageIDs'])) {
        $ignoreIDs = array_values($_SESSION['ignoredLinkerPageIDs']);
      }
      
      $linkerModel = $this->core->model("linker", "train");
      
      $pageData = $linkerModel->getPage($ignoreIDs, $_SESSION['linkerCategoryId']);
    } else {
      $pageData = $this->core->entity("page")->select(array("id" => $_SESSION['pageID']), "*"); 
    }
    
    $data = array();
    
    if($pageData->num_rows) {
      $page_data = $pageData->fetch_array();
      $_SESSION['pageID'] = $page_data[Entity\TPage::$tok_id];
      $pagetitle = $page_data[Entity\TPage::$tok_title];
      
      require_once __DIR__ . "/../../model/entity/sentence.php";
      
      $this->core->entity("page")->update(
        $page_data[Entity\TSentence::$tok_id], 
        array(
          "assigneddate" => date("Y-m-d H:i:s")
        )
      );
      
      $query = $this->core->model("linker", "train")->getCReps($_SESSION['pageID']);
      
      if($query->num_rows > 0) {
        
        while($sentence_data = $query->fetch_array()) {
          $highlights = array();
          $children = array();
          
          $crep_result = $this->core->model("linker", "train")->getHighlights($sentence_data['CRepId']);
          
          while($crep_data = $crep_result->fetch_array()) {
            $highlights[] = (object) array(
              "From" => $crep_data['From'],
              "Until" => $crep_data['Until'],
              "Style" => $crep_data['Style']
            );
          }

          $children_result = $this->core->model("linker", "train")->getChildren($sentence_data['CRepId']);
          
          while($child_data = $children_result->fetch_array()) {
            $child_highlights = array();
            
            $crep_result = $this->core->model("linker", "train")->getHighlights($child_data['CRepId']);
          
            while($crep_data = $crep_result->fetch_array()) {
              $child_highlights[] = (object) array(
                "From" => $crep_data['From'],
                "Until" => $crep_data['Until'],
                "Style" => $crep_data['Style']
              );
            }
            
            $children[] = $child_highlights;
          }
          
          $data[] = (object) array(
            "Id" => $sentence_data['SentenceId'], 
            "Sentence" => $sentence_data['Sentence'],
            "Rep" => $sentence_data['Rep'],
            "Highlights" => $highlights,
            "Children" => $children
          );
        }
        
        
      } else {
        $query = $this->core->entity("sentence")->select(array("pageid" => $_SESSION['pageID']), "*", array("id" => "ASC"));
        
        while($sentence_data = $query->fetch_array()) {
          $data[] = (object) array(
            "Id" => $sentence_data[Entity\TSentence::$tok_id], 
            "Sentence" => $sentence_data[Entity\TSentence::$tok_name],
            "Rep" => $sentence_data[Entity\TSentence::$tok_rep],
            "Highlights" => array(),
            "Children" => array()
          );
        }
      }
      
      
    }

    echo json_encode($data);
  }

  public function save() {
    if(!isset($_SESSION['pageID'])) return;
    
    $data = $_POST['data'];
    $pageId = $_SESSION['pageID'];
    
    $this->saveData($data, $pageId);
    
    echo json_encode('');
  }

  public function finish() {
    if(!isset($_SESSION['pageID'])) return;
    
    $data = $_POST['data'];
    $pageId = $_SESSION['pageID'];
    
    $this->saveData($data, $pageId);
    
    $this->core->entity("page")->update(
      $pageId, 
      array(
        "status" => "psReviewedCRep"
      )
    );
    
    unset($_SESSION['pageID']);
    $_SESSION['pageID'] = -1;
    
    echo json_encode('');
  }
  
  public function skip() {
    if(!isset($_SESSION['pageID'])) return;
    
    if(!isset($_SESSION['ignoredLinkerPageIDs'])) { 
      $_SESSION['ignoredLinkerPageIDs'] = array();
    }
    if(!in_array($_SESSION['pageID'], $_SESSION['ignoredLinkerPageIDs']) && $_SESSION['pageID'] != -1) {
      $_SESSION['ignoredLinkerPageIDs'][] = $_SESSION['pageID'];
    }
    
    if(count($_SESSION['ignoredLinkerPageIDs']) > 10) { 
      $_SESSION['ignoredLinkerPageIDs'] = array_values(array_slice($_SESSION['ignoredLinkerPageIDs'], 1));
    }
    
    $linkerModel = $this->core->model("linker", "train");
      
    $pageData = $linkerModel->getPage($ignoreIDs, $_SESSION['linkerCategoryId']);
    
    $count_data = $this->core->model("linker", "train")->countPages($_SESSION['interpreterCategoryId'])->fetch_array();
    
    if($count_data['total'] == count($_SESSION['ignoredInterpreterPageIDs'])) {
      $_SESSION['ignoredInterpreterPageIDs'] = array();
    }
    
    $this->core->entity("page")->update(
      $_SESSION['pageID'], 
      array(
        "assigneddate" => date("Y-m-d H:i:s", 0)
      )
    );
    
    unset($_SESSION['pageID']);
    $_SESSION['pageID'] = -1;
    
    echo json_encode("");
  }
  
  private function saveData($data, $pageId) {
    $this->core->entity("crephighlight")->delete(
      array( "pageid" => array( $pageId ) )
    );
    
    $this->core->entity("crep")->delete(
      array( "pageid" => array( $pageId ) )
    );
    
    for($i = 0; $i < count($data); $i++) {
      $this->core->entity("crep")->insert(
        array( "pageid", "sentenceid" ),
        array( array( $pageId, $data[$i]['Id'] ) )
      );
      
      $crepId = $this->db->insert_id;
      
      if(isset($data[$i]['Highlights'])) {
        for($j = 0; $j < count($data[$i]['Highlights']); $j++) {
          $this->core->entity("crephighlight")->insert(
            array( "pageid", "crepid", "from", "until", "style" ),
            array( array( $pageId, $crepId, $data[$i]['Highlights'][$j]['From'], $data[$i]['Highlights'][$j]['Until'], $data[$i]['Highlights'][$j]['Style'] ) )
          );
        }
      }
      
      if(isset($data[$i]['Children'])) {
        for($j = 0; $j < count($data[$i]['Children']); $j++) {
          $this->core->entity("crep")->insert(
            array( "pageid", "sentenceid", "parentcrepid" ),
            array( array( $pageId, $data[$i]['Id'], $crepId) )
          );
          
          $childCrepId = $this->db->insert_id;
          
          for($k = 0; $k < count($data[$i]['Children'][$j]); $k++) {
            $this->core->entity("crephighlight")->insert(
              array("pageid", "crepid", "from", "until", "style" ),
              array( array( $pageId, $childCrepId, $data[$i]['Children'][$j][$k]['From'], $data[$i]['Children'][$j][$k]['Until'], $data[$i]['Children'][$j][$k]['Style'] ) )
            );
          }
        }
      }
    }
  }

}

?>


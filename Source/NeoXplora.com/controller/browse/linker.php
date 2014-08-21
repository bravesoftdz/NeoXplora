<?php
namespace NeoX\Controller;
use NeoX\Entity;
use NeoX\Classes;

require_once __DIR__ . "/../train.php";
class TBrowseLinker extends TTrain {
  
  public $accessLevel = 'user';
  
  public function index() {
    $this->template->addScripts(array(
      "js/system/object.js",
      "js/classes/List.js",
      "js/classes/StringList.js",
      "js/classes/Interval.js",
      "js/classes/rep/CRepRecord.js"
    ));
    $this->template->addJSModules(array(
      "NeoX.Modules.LinkerBrowseIndex" => "js/module/linker/browse/index.js",
      "NeoX.Modules.LinkerBrowseRequests" => "js/module/linker/browse/requests.js",
      "NeoX.Modules.ButtonComponent" => "js/module/button.js"
    ));
    $this->template->addStyle("style/train/linker.css");
    $this->template->load("index", "browse/linker");
    $this->template->pageTitle = "Browse CRep";
    $this->template->page = "brwosecrep";
    $this->template->hide_right_box = true;
    $this->template->render();
  }
  
  public function loadPage() {
    $page = isset($_POST['page'])?$_POST['page']:1;
    $per_page = 1;
    $pagination = array();
    
    $linkerModel = $this->core->model("linker", "browse");
    $count_data = $linkerModel->countPages()->fetch_array();
    
    $data = array();
    
    if($count_data['total'] > 0) {
      $pages = ceil($count_data['total'] / $per_page);
      $start = ($page - 1) * $per_page;
      
      $query = $linkerModel->getPages($start, $per_page);
      
      if(!$query || $query->num_rows < 1) {
        $query = $linkerModel->getPages(0, $per_page);
      }
      
      $page_data = $query->fetch_array();
      $pagetitle = $page_data[Entity\TPage::$tok_title];
      
      require_once __DIR__ . "/../../model/entity/sentence.php";
      
      $query = $this->core->model("linker", "train")->getCReps($page_data[Entity\TPage::$tok_id]);
      
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

      require_once APP_DIR . "classes/Pagination.php";
      $paginationObj = new Classes\Pagination($pages, $page);
      $pagination_array = $paginationObj->generate();
      
      $this->template->pagination = (array) $pagination_array;
      $this->template->currentPage1 = $count_data;
      $this->template->currentPage = $page;
      $pagination = $this->template->fetch("pagination", "browse/linker");
    }

    $response = array(
      'data' => $data,
      'pagination' => $pagination
    );

    echo json_encode($response);
  }

}

?>


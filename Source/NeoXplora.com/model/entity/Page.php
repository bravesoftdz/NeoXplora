<?php
  namespace NeoX\Entity;
  
  require_once APP_DIR . "/app/system/Entity.php";
  class TPage extends \SkyCore\TEntity {
	  
    //Table Name in the DB
    public static $tablename = "neox_page";
    
    //Table Fields in the DB
    public static $tok_id = "Id";
    public static $tok_title = "Name";
    public static $tok_body = "Body";
    public static $tok_categoryid = "CategoryId";
    public static $tok_status = "Status";
    public static $tok_source = "Source";
    public static $tok_assigneddate = "AssignedDate";

    public function advancedCount() {
      return array(
        "total" => $this->countTotal(),
        "pendingTraining" => $this->countPending(),
        "splitTrained" => $this->countSplitTrained(),
        "splitReviewed" => $this->countSplitReviewed(),
        "repTrained" => $this->countRepTrained(),
        "repReviewed" => $this->countRepReviewed(),
        "crepReviewed" => $this->countCRepReviewed()
      );
    }
    
    public function countTotal() {
      $query = $this->query("
        SELECT 
          COUNT([[page.id]]) AS `total`
        FROM [[page]]
      ");
      
      $result = $this->result($query)->fetch_array();
      
      return $result['total'];
    }
    
    public function countPending() {
      $query = $this->query("
        SELECT COUNT(p.[[page.id]]) AS `total`
        FROM [[page]] p
        LEFT JOIN (
          SELECT COUNT(*) AS total, s1.[[sentence.pageid]] FROM [[sentence]] s1 GROUP BY s1.[[sentence.pageid]]
        ) a1 ON p.[[page.id]] = a1.[[sentence.pageid]]
        LEFT JOIN (
          SELECT COUNT(*) AS totalR, s2.[[sentence.pageid]] FROM [[sentence]] s2 WHERE s2.[[sentence.status]] = 'ssFinishedGenerate' GROUP BY s2.[[sentence.pageid]]
        ) a2 ON p.[[page.id]] = a2.[[sentence.pageid]]
        WHERE a1.total = a2.totalR
      ");
      
      $result = $this->result($query)->fetch_array();
      
      return $result['total'];
    }
    
    public function countSplitTrained() {
      $query = $this->query("
        SELECT COUNT(p.[[page.id]]) AS `total`
        FROM [[page]] p
        LEFT JOIN (
          SELECT COUNT(*) AS total, s1.[[sentence.pageid]] FROM [[sentence]] s1 GROUP BY s1.[[sentence.pageid]]
        ) a1 ON p.[[page.id]] = a1.[[sentence.pageid]]
        LEFT JOIN (
          SELECT COUNT(*) AS totalR, s2.[[sentence.pageid]] FROM [[sentence]] s2 WHERE s2.[[sentence.status]] = 'ssTrainedSplit' GROUP BY s2.[[sentence.pageid]]
        ) a2 ON p.[[page.id]] = a2.[[sentence.pageid]]
        LEFT JOIN (
          SELECT COUNT(*) AS totalR, s3.[[sentence.pageid]] FROM [[sentence]] s3 WHERE s3.[[sentence.status]] = 'ssFinishedGenerate' GROUP BY s3.[[sentence.pageid]]
        ) a3 ON p.[[page.id]] = a3.[[sentence.pageid]]
        WHERE a1.total >= a2.totalR
        and a3.totalR = 0
      ");
      
      $result = $this->result($query)->fetch_array();
      
      return $result['total'];
    }
    
    public function countSplitReviewed() {
      $query = $this->query("
        SELECT COUNT(p.[[page.id]]) AS `total`
        FROM [[page]] p
        LEFT JOIN (
          SELECT COUNT(*) AS total, s1.[[sentence.pageid]] FROM [[sentence]] s1 GROUP BY s1.[[sentence.pageid]]
        ) a1 ON p.[[page.id]] = a1.[[sentence.pageid]]
        LEFT JOIN (
          SELECT COUNT(*) AS totalR, s2.[[sentence.pageid]] FROM [[sentence]] s2 WHERE s2.[[sentence.status]] = 'ssReviewedSplit' GROUP BY s2.[[sentence.pageid]]
        ) a2 ON p.[[page.id]] = a2.[[sentence.pageid]]
        LEFT JOIN (
          SELECT COUNT(*) AS totalR, s3.[[sentence.pageid]] FROM [[sentence]] s3 WHERE s3.[[sentence.status]] = 'ssTrainedSplit' GROUP BY s3.[[sentence.pageid]]
        ) a3 ON p.[[page.id]] = a3.[[sentence.pageid]]
        WHERE a1.total >= a2.totalR
        and a3.totalR = 0
      ");
      
      $result = $this->result($query)->fetch_array();
      
      return $result['total'];
    }
    
    public function countRepTrained() {
      $query = $this->query("
        SELECT COUNT(p.[[page.id]]) AS `total`
        FROM [[page]] p
        LEFT JOIN (
          SELECT COUNT(*) AS total, s1.[[sentence.pageid]] FROM [[sentence]] s1 GROUP BY s1.[[sentence.pageid]]
        ) a1 ON p.[[page.id]] = a1.[[sentence.pageid]]
        LEFT JOIN (
          SELECT COUNT(*) AS totalR, s2.[[sentence.pageid]] FROM [[sentence]] s2 WHERE s2.[[sentence.status]] = 'ssTrainedRep' GROUP BY s2.[[sentence.pageid]]
        ) a2 ON p.[[page.id]] = a2.[[sentence.pageid]]
        LEFT JOIN (
          SELECT COUNT(*) AS totalR, s3.[[sentence.pageid]] FROM [[sentence]] s3 WHERE s3.[[sentence.status]] = 'ssReviewedSplit' GROUP BY s3.[[sentence.pageid]]
        ) a3 ON p.[[page.id]] = a3.[[sentence.pageid]]
        WHERE a1.total >= a2.totalR
        and a3.totalR = 0
      ");
      
      $result = $this->result($query)->fetch_array();
      
      return $result['total'];
    }
    
    public function countRepReviewed() {
      $query = $this->query("
        SELECT COUNT(p.[[page.id]]) AS `total`
        FROM [[page]] p
        LEFT JOIN (
          SELECT COUNT(*) AS total, s1.[[sentence.pageid]] FROM [[sentence]] s1 GROUP BY s1.[[sentence.pageid]]
        ) a1 ON p.[[page.id]] = a1.[[sentence.pageid]]
        LEFT JOIN (
          SELECT COUNT(*) AS totalR, s2.[[sentence.pageid]] FROM [[sentence]] s2 WHERE s2.[[sentence.status]] = 'ssReviewedRep' GROUP BY s2.[[sentence.pageid]]
        ) a2 ON p.[[page.id]] = a2.[[sentence.pageid]]
        WHERE a1.total = a2.totalR
      ");
      
      $result = $this->result($query)->fetch_array();
      
      return $result['total'];
    }
    
    public function countCRepReviewed() {
      $query = $this->query("
        SELECT
          COUNT(DISTINCT p.[[page.id]]) AS `total`
        FROM [[page]] p
        WHERE
          p.[[page.status]] = 'psReviewedCRep'
      ");
      
      $result = $this->result($query)->fetch_array();
      
      return $result['total'];
    }
    
    public function deleteWithData($pageId) {
      $query = $this->query("
        UPDATE [[sentence]] s1
        INNER JOIN [[sentence]] s2 ON s1.[[sentence.guessaid]] = s2.[[sentence.id]]
        SET s1.[[guessaid]] = null
        WHERE s2.[[sentence.pageid]] = :1
      ", intval($pageId));
      
      $query = $this->query("
        UPDATE [[sentence]] s1
        INNER JOIN [[sentence]] s2 ON s1.[[sentence.guessbid]] = s2.[[sentence.id]]
        SET s1.[[guessbid]] = null
        WHERE s2.[[sentence.pageid]] = :1
      ", intval($pageId));
      
      $query = $this->query("
        UPDATE [[sentence]] s1
        INNER JOIN [[sentence]] s2 ON s1.[[sentence.guesscid]] = s2.[[sentence.id]]
        SET s1.[[guesscid]] = null
        WHERE s2.[[sentence.pageid]] = :1
      ", intval($pageId));
      
      $query = $this->query("
        UPDATE [[sentence]] s1
        INNER JOIN [[sentence]] s2 ON s1.[[sentence.guessdid]] = s2.[[sentence.id]]
        SET s1.[[guessdid]] = null
        WHERE s2.[[sentence.pageid]] = :1
      ", intval($pageId));
      
      $query = $this->query("
        DELETE s.*, pr.*
        FROM [[sentence]] s
        INNER JOIN [[proto]] pr ON s.[[sentence.pageid]] = pr.[[proto.pageid]]
        WHERE s.[[sentence.pageid]] = :1
      ", intval($pageId));
      
      $this->delete(intval($pageId));
    }
    
	}
?>
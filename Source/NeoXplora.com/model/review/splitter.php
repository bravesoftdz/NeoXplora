<?php
  namespace NeoX\Model;
  
  require_once __DIR__ . "/../Train.php";
  class TReviewSplitter extends TTrain {
    
    public function countMainProtos($pageId, $showReviewed = false) {
      $condition = '';
      $status = "se.[[sentence.status]] = 'ssTrainedSplit'";
      if($pageId) {
        $condition = " AND se.[[sentence.pageid]] = " . intval($pageId);
        $status = "se.[[sentence.status]] IN ('ssTrainedSplit', 'ssFinishedGenerate')";
      }
      if($showReviewed == "true") {
        $status = "se.[[sentence.isfixed]] IS NULL";
      }
      
      $query = $this->query("
        SELECT COUNT(DISTINCT pr.[[proto.id]]) AS `total` 
        FROM [[sentence]] se 
        INNER JOIN [[proto]] pr ON se.[[sentence.mainprotoid]] = pr.[[proto.id]]
        WHERE " . $status . "
        " . $condition
      );
      
      return $this->result($query);
    }
    
    public function getMainProtos($pageId, $offset, $limit, $showReviewed = false) {
      $condition = '';
      $status = "se.[[sentence.status]] = 'ssTrainedSplit'";
      if($pageId) {
        $condition = " AND se.[[sentence.pageid]] = " . intval($pageId);
        $status = "se.[[sentence.status]] IN ('ssTrainedSplit', 'ssFinishedGenerate')";
      }
      if($showReviewed == "true") {
        $status = "se.[[sentence.isfixed]] IS NULL OR se.[[sentence.isfixed]] = 0";
      }
      
      $query = $this->query("
        SELECT DISTINCT 
          pr.[[proto.id]] id,
          pr.[[proto.name]] name,
          pr.[[proto.order]] `order`,
          pr.[[proto.pageid]] pageid
        FROM [[sentence]] se 
        INNER JOIN [[proto]] pr ON se.[[sentence.mainprotoid]] = pr.[[proto.id]]
        WHERE " . $status . "
        " . $condition . "
        ORDER BY pr.[[proto.pageid]], pr.[[proto.id]]
        LIMIT :1, :2
      ", intval($offset), intval($limit));
      
      return $this->result($query);
    }
    
    public function getChildProtos($protoId) {
      $query = $this->query("
        SELECT 
          pr.[[proto.id]] id,
          pr.[[proto.name]] name,
          pr.[[proto.order]] `order`,
          pr.[[proto.pageid]] pageid
        FROM [[proto]] pr 
        WHERE [[proto.parentid]] = :1
        ORDER BY pr.[[proto.id]]
      ", intval($protoId));
      
      return $this->result($query);
    }

    public function getSentences($protoId) {
      $query = $this->query("
        SELECT 
          se.[[sentence.id]] id,
          se.[[sentence.name]] name,
          se.[[sentence.pageid]] pageid,
          se.[[sentence.order]] `order`,
          se.[[sentence.status]] status
        FROM [[sentence]] se 
        WHERE [[sentence.protoid]] = :1
        ORDER BY se.[[sentence.id]]
      ", intval($protoId));
      
      return $this->result($query);
    }

    public function getFirstSentenceIdForProtoId($protoId) {
      $query = $this->query("
        SELECT s.[[sentence.id]], pr.[[proto.name]]
        FROM [[sentence]] s
        INNER JOIN [[proto]] pr ON s.[[sentence.protoid]] = pr.[[proto.id]] AND pr.[[proto.id]] = :1
        ORDER BY s.[[sentence.order]] ASC, pr.[[proto.order]] ASC
        LIMIT 1
      ", intval($protoId));  
      
      return $this->result($query);    
    }
    
    public function revertSentenceToProto($sentenceId, $protoId) {
      $updateQuery = $this->query("
        UPDATE [[sentence]] s
        INNER JOIN [[proto]] pr 
          ON pr.[[proto.id]] = s.[[sentence.protoid]]
        SET s.[[sentence.name]] = pr.[[proto.name]],
            s.[[sentence.status]] = :1  
        WHERE s.[[sentence.id]] = :2
      ", 'ssTrainedSplit', intval($sentenceId));
      
      $deleteQuery = $this->query("
        DELETE FROM [[sentence]] 
        WHERE [[sentence.protoid]] = :1 
        AND [[sentence.id]] <> :2
      ", $protoId, $sentenceId);
    
      return ($this->result($updateQuery) && $this->result($deleteQuery));
    }
    
  }
?>
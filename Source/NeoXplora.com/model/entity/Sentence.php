<?php
  namespace NeoX\Entity;
  
  require_once APP_DIR . "/app/system/Entity.php";
  class TSentence extends \SkyCore\TEntity {
	  
    //Table Name in the DB
    public static $tablename = "neox_sentence";
    
    //Table Fields in the DB
    public static $tok_id = "Id";
    public static $tok_name = "Name";
    public static $tok_rep = "Rep";
    public static $tok_crep = "CRep";
    public static $tok_srep = "SRep";
    public static $tok_pageid = "PageId";
    public static $tok_protoid = "ProtoId";
    public static $tok_mainprotoid = "MainProtoId";
    public static $tok_pos = "Pos";
    public static $tok_guessaid = "GuessAId";
    public static $tok_guessbid = "GuessBId";
    public static $tok_guesscid = "GuessCId";
    public static $tok_guessdid = "GuessDId";
    public static $tok_status = "Status"; // ssFinishedGenerate, ssTrainedSplit, ssReviewedSplit, ssTrainedRep, ssReviewedRep, ssReviewedCRep
    public static $tok_assigneddate = "AssignedDate";
    public static $tok_order = "Order";
    
    public function advancedCount() {
      $query = $this->query("
        SELECT 
          COUNT(s1.[[sentence.id]]) AS total, 
          COUNT(s2.[[sentence.id]]) AS pendingTraining, 
          COUNT(s3.[[sentence.id]]) AS splitTrained, 
          COUNT(s4.[[sentence.id]]) AS splitReviewed,
          COUNT(s5.[[sentence.id]]) AS repTrained,
          COUNT(s6.[[sentence.id]]) AS repReviewed
        FROM [[sentence]] s1
        LEFT JOIN [[sentence]] s2 ON s1.[[sentence.id]] = s2.[[sentence.id]] AND s2.[[sentence.status]] = 'ssFinishedGenerate'
        LEFT JOIN [[sentence]] s3 ON s1.[[sentence.id]] = s3.[[sentence.id]] AND s3.[[sentence.status]] = 'ssTrainedSplit' 
        LEFT JOIN [[sentence]] s4 ON s1.[[sentence.id]] = s4.[[sentence.id]] AND s4.[[sentence.status]] = 'ssReviewedSplit' 
        LEFT JOIN [[sentence]] s5 ON s1.[[sentence.id]] = s5.[[sentence.id]] AND s5.[[sentence.status]] = 'ssTrainedRep'
        LEFT JOIN [[sentence]] s6 ON s1.[[sentence.id]] = s6.[[sentence.id]] AND s6.[[sentence.status]] = 'ssReviewedRep'
      ");
      
      $result = $this->result($query)->fetch_array();
      $result['crepReviewed'] = $this->countCRepReviewed(); 
      
      return $result;
    }
    
    public function countCRepReviewed() {
      $query = $this->query("
        SELECT 
          COUNT(s1.[[sentence.id]]) AS total
        FROM [[sentence]] s1
        INNER JOIN [[page]] p ON p.[[page.id]] = s1.[[sentence.pageid]] AND p.[[page.status]] = 'psReviewedCRep'
      ");
      
      $result = $this->result($query)->fetch_array();
      
      return $result['total'];
    }
    
	}
?>
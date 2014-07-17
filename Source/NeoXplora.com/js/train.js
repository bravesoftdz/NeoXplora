$(document).ready(function() {
  /*$(document).on('click', '.saveTrainerName', function() {
    $.cookie("trainername", $('#trainername').val(), { expires : 7 });
  }); */
  
	var ajaxLoading = false;
	
	/*
	if($.cookie("trainername") == null) {
		$.cookie("trainername", '', { expires : 7 });
	}*/
	
  $(document).on('keypress', '#trainername', function(event) {
  	if(event.which == 13) {
      $.cookie("trainername", $('#trainername').val(), { expires : 7 });
  	}
  });

  $(document).on('click', '.approveCRep', function() {
    approveCRep($(this).parent().parent());
  });
  
  $(document).on('keypress', '.newCRep', function(event) {
    if(event.which == 13) {
      saveCRep($(this).parent().parent());
    }
  });  

  $(document).on('click', '.skipButton', function() {
    skipStory();
  });

  $(document).on('click', '.byeButton', function() {
    leaveTrain();
  });
  
  $(document).on('click', '.goToPage', function() {
    loadExamples(parseInt($(this).html(), 10));
  });
  
  $(document).on('click', '.goToPageSplit', function() {
    loadReviewSplit(parseInt($(this).html(), 10));
  });
  
  $(document).on('click', '.goToPageRep', function() {
    loadReviewRep(parseInt($(this).html(), 10));
  });
  
  $(document).on('click', '.goToPageCRep', function() {
    loadReviewCrep(parseInt($(this).html(), 10));
  });
  
  $(document).on('click', '.incorporateButton', function() {
  	window.location.href = 'train.php?action=incorporate';
  });
  
  $(document).on('click', '.understandButton', function() {
    window.location.href = 'train.php?action=understand';
  });
  
  $(document).on('click', '.splitButton', function() {
    window.location.href = 'train.php?action=splitSentences';
  });
  
  $(document).on('click', '.aboutTrainerButton', function() {
    window.location.href = 'train.php?action=aboutTrainer';
  });
  
  $(document).on('click', '.addQAButton', function() {
    window.location.href = 'train.php?action=addQA';
  });

  $(document).on('click', '.doneUnderstandButton', function() {
  	if($('.newRepValue').val() == '') {
      loadUnderstandSentence();
    } else {
      saveRep();
    }
  });
  
  $(document).on('click', '.skipUnderstandButton', function() {
    loadUnderstandSentence();
  });
  
  $(document).on('click', '.useUnderstandButton', function() {
  	if($(".repguess").html() == '') {
      loadUnderstandSentence();      
  	} else {
      approveRepGuess();
  	}
  });
  
  $(document).on('click', '.approveUnderstandButton', function() {
    approveRep();
  });
  
  $(document).on('click', '.editUnderstandButton', function() {
    $(".newRepValue").val($(".repguess").html());
  });
  
  $(document).on('keypress', '.newRepValue', function(event) {
    if(event.which == 13) {
    	if($(this).val() == '') {
        loadUnderstandSentence();
    	} else {
        saveRep();
    	}
    }
  });
  
  $(document).on('click', '.skipSplitButton', function() {
  	var parent = $(this).parent().parent();
    var sentenceID = parent.find(".sentenceID").val();
    skipSplitSentence(sentenceID);
  });
  
  $(document).on('click', '.doneSplitButton', function() {
  	var parent = $(this).parent().parent();
    var sentenceID = parent.find(".sentenceID").val();
    var newSplitValue = parent.find('.newSplitValue').val();
    var level = parent.find('.level').val();
    splitSentence(sentenceID, newSplitValue, level);
  });
  
  $(document).on('click', '.nextSplitButton', function() {
    loadSplitSentence();
  });
  
  $(document).on('click', '.doneNoSplitButton', function() {
    var parent = $(this).parent().parent();
    var sentenceID = parent.find(".sentenceID").val();
    noSplitSentence(sentenceID);
    if(parent.find('.level').val() == 0) {
      loadSplitSentence();
    } else  {
      var row = $("input[value='" + sentenceID + "']").parent().parent();
      row.find('.newSplitValue').prop('disabled', true);
      row.find('.doneSplitButton').css('display', 'none');
      row.find('.doneNoSplitButton').css('display', 'none');
      
      var count = 0;
      $('.doneNoSplitButton').each(function () {
        if($(this).parent().parent().find('.doneSplitButton').css('display') != 'none') {
          count++;
        }
      });
      if(count == 0) {
      	loadSplitSentence();
      }
    }
  });
  
  $(document).on('click', '.approveSplitButton', function() {
    var sentenceIDs = [];
    $(".sentenceID").each(function() {
      sentenceIDs.push($(this).val());
    });
    approveSplit(sentenceIDs);
  });
  
  $(document).on('click', '.resetSplitButton', function() {
    var parent = $(this).parent().parent();
    var sentenceID = parent.find(".sentenceID").val();
    var level = parent.find(".level").val();
    var originalValue = parent.find(".originalValue").val();
    var deleteSentences = [];
    parent.nextAll().find(".level").each(function() {
      if($(this).val() > level) {
        deleteSentences.push($(this).parent().find('.sentenceID').val());
        $(this).parent().parent().remove();
      } else {
      	return false;
      }
    });
    resetSplitSentence(sentenceID, originalValue, deleteSentences);
    var row = $("input[value='" + sentenceID + "']").parent().parent();
    parent.find('.newSplitValue').prop('disabled', false);
    parent.find('.newSplitValue').val(originalValue);
    parent.find('.doneNoSplitButton').html("NO NEED");
    parent.find('.doneSplitButton').css('display', 'inline-block');
    parent.find('.doneNoSplitButton').css('display', 'inline-block');
    $(this).remove();
  });

  $(document).on('keypress', '.newSplitValue', function(event) {
  	if(event.which == 13) {
      var parent = $(this).parent().parent();
      var sentenceID = parent.find(".sentenceID").val();
      var newSplitValue = parent.find('.newSplitValue').val();
      var level = parent.find('.level').val();
      splitSentence(sentenceID, newSplitValue, level);
  	}
  });
  
  $(document).on('click', '.doneAddQAButton', function() {
    addQA();
  });
  
  $(document).on('click', '.skipQAButton', function() {
    loadQAStory();
  });
  
  $(document).on('click', '.doneAboutButton', function() {
    addAbout();
  });
  
  $(document).on('click', '.skipAboutButton', function() {
    loadAboutStory();
  });
  
  $(document).on('click', '.reviewRepButton', function() {
    window.location.href = 'train.php?action=reviewRep';
  });

  $(document).on('click', '.reviewCrepButton', function() {
    window.location.href = 'train.php?action=reviewCrep';
  });
  
  $(document).on('click', '.reviewSplitButton', function() {
    window.location.href = 'train.php?action=reviewSplit';
  });
  
  $(document).on('click', '.reviewQAButton', function() {
    window.location.href = 'train.php?action=reviewQA';
  });
  
  $(document).on('click', '.reviewSummaryButton', function() {
    window.location.href = 'train.php?action=reviewSummary';
  });
  
  $(document).on('click', '.approveReviewRepButton', function() {
  	var sentenceID = $(this).parent().parent().attr('id');
  	sentenceID = parseInt(sentenceID.replace('s', ''), 10);
  	var newValue = $(this).parent().parent().find('.newValue').val();
    approveReviewRep(sentenceID, newValue);
  });
  
  $(document).on('click', '.dismissReviewRepButton', function() {
  	var sentenceID = $(this).parent().parent().attr('id');
    sentenceID = parseInt(sentenceID.replace('s', ''), 10);
    dismissReviewRep(sentenceID);
  });
  
  $(document).on('click', '.approveAllRepButton', function() {
    var sentences = [];
    $('.reviewrep td .newValue').each(function() {
      var sentenceID = $(this).parent().parent().attr('id');
      sentenceID = parseInt(sentenceID.replace('s', ''), 10);
      var newValue = $(this).val();
      sentences.push({
        "sentenceID": sentenceID,
        "newValue": newValue
      });
    });
    approveAllReps(sentences);
  });
  
  $(document).on('click', '.dismissAllRepButton', function() {
    var sentences = [];
    $('.reviewrep td .newValue').each(function() {
      var sentenceID = $(this).parent().parent().attr('id');
      sentenceID = parseInt(sentenceID.replace('s', ''), 10);
      sentences.push({
        "sentenceID": sentenceID
      });
    });
    dismissAllReps(sentences);
  });
  
  $(document).on('click', '.approveReviewCRepButton', function() {
    var sentenceID = $(this).parent().parent().attr('id');
    sentenceID = parseInt(sentenceID.replace('s', ''), 10);
    var newValue = $(this).parent().parent().find('.newValue').val();
    approveReviewCRep(sentenceID, newValue);
  });
  
  $(document).on('click', '.dismissReviewCRepButton', function() {
    var sentenceID = $(this).parent().parent().attr('id');
    sentenceID = parseInt(sentenceID.replace('s', ''), 10);
    dismissReviewCRep(sentenceID);
  });
  
  $(document).on('click', '.approveAllCRepButton', function() {
    var sentences = [];
    $('.reviewrep td .newValue').each(function() {
      var sentenceID = $(this).parent().parent().attr('id');
      sentenceID = parseInt(sentenceID.replace('s', ''), 10);
      var newValue = $(this).val();
      sentences.push({
        "sentenceID": sentenceID,
        "newValue": newValue
      });
    });
    approveAllCReps(sentences);
  });
  
  $(document).on('click', '.dismissAllCRepButton', function() {
    var sentences = [];
    $('.reviewrep td .newValue').each(function() {
      var sentenceID = $(this).parent().parent().attr('id');
      sentenceID = parseInt(sentenceID.replace('s', ''), 10);
      sentences.push({
        "sentenceID": sentenceID
      });
    });
    dismissAllCReps(sentences);
  });
  
  // SPIT REVIEW
  
  $(document).on('click', '.revertReviewSplitButton', function () {
  	$(this).attr('class', "disabledRevertReviewSplitButton");
    var protoID = $(this).parent().parent().attr('id');
    protoID = parseInt(protoID.replace('pr', ''), 10);
    revertReviewSplit(protoID);
  });

  $(document).on('click', '.modifyReviewSplitButton', function() {
    var sentenceID = $(this).parent().parent().attr('id');
    sentenceID = parseInt(sentenceID.replace('s', ''), 10);
    var newValue = $(this).parent().parent().find('.newValue').val();
    modifyReviewSplit(sentenceID, newValue);
  });
  
  $(document).on('click', '.approveReviewSplitButton', function() {
    var protoID = $(this).parent().parent().attr('id');
    protoID = parseInt(protoID.replace('pr', ''), 10);
    approveReviewSplit(protoID);
    //$(this).parent().parent().fadeOut();
  });
  
  $(document).on('click', '.dismissReviewSplitButton', function() {
    var protoID = $(this).parent().parent().attr('id');
    protoID = parseInt(protoID.replace('pr', ''), 10);
    dismissReviewSplit(protoID);
    //$(this).parent().parent().fadeOut();
  });
  
  $(document).on('click', '.approveAllSplitButton', function() {
  	var protoIDs = [];
    $('.aproto').each(function() {
      var protoID = $(this).attr('id');
      protoID = parseInt(protoID.replace('pr', ''), 10);
      protoIDs.push(protoID);
    });
    approveAllSplits(protoIDs);
  });
  
  $(document).on('click', '.dismissAllSplitButton', function() {
    var protoIDs = [];
    $('.aproto').each(function() {
      var protoID = $(this).attr('id');
      protoID = parseInt(protoID.replace('pr', ''), 10);
      protoIDs.push(protoID);
    });
    dismissAllSplits(protoIDs);
  });
  
  //QA REVIEW
  
  $(document).on('click', '.approveReviewQAButton', function() {
    var questionID = $(this).parent().parent().attr('id');
    questionID = parseInt(questionID.replace('q', ''), 10);
    var newValueQ = $(this).parent().parent().find('.newValueQ').val();
    var newValueA = $(this).parent().parent().find('.newValueA').val();
    approveReviewQA(questionID, newValueQ, newValueA);
    $(this).parent().parent().fadeOut();
  });
  
  $(document).on('click', '.dismissReviewQAButton', function() {
    var questionID = $(this).parent().parent().attr('id');
    questionID = parseInt(questionID.replace('q', ''), 10);
    dismissReviewQA(questionID);
    $(this).parent().parent().fadeOut();
  });
  
  $(document).on('click', '.approveReviewSummaryButton', function() {
    var summaryID = $(this).parent().parent().attr('id');
    summaryID = parseInt(summaryID.replace('s', ''), 10);
    var newValue = $(this).parent().parent().find('.newValue').val();
    approveReviewSummary(summaryID, newValue);
    $(this).parent().parent().fadeOut();
  });
  
  $(document).on('click', '.dismissReviewSummaryButton', function() {
    var summaryID = $(this).parent().parent().attr('id');
    summaryID = parseInt(summaryID.replace('s', ''), 10);
    dismissReviewSummary(summaryID);
    $(this).parent().parent().fadeOut();
  });
  
});

function loadStory() { 
  $.ajax({
    type: "POST",
    url: "train_data.php",
    dataType: 'json',
    data: {
    	'type': 'TrainCRep',
      'action': 'load'
    },
    success: function(json) {
    	$('.story-title').html("Training Context: (" + json['title'] + ")");
      $('.content table').html(json['data']);
      loadIncorporateSentence();
    }
  });
}

function loadQAStory() { 
  $.ajax({
    type: "POST",
    url: "train_data.php",
    dataType: 'json',
    data: {
      'type': 'TrainQA',
      'action': 'load'
    },
    success: function(json) {
      $('.content').html(json['data']);
    }
  });
}

function loadAboutStory() { 
  $.ajax({
    type: "POST",
    url: "train_data.php",
    dataType: 'json',
    data: {
      'type': 'TrainSummary',
      'action': 'load'
    },
    success: function(json) {
      $('.content').html(json['data']);
    }
  });
}

function loadIncorporateSentence() {
  $.ajax({
    type: "POST",
    url: "train_data.php",
    dataType: 'json',
    data: {
      'type': 'TrainCRep',
      'action': 'nextSentence'
    },
    success: function(json) {
    	if(json['sentenceID'] == -1) {
        loadStory();
    	} else if(json['sentenceID'] == -2) { 
    		
    	} else {
      	var sRow = $('#s' + json['sentenceID']);
      	if(!sRow.hasClass('active')) {
        	var repCell = sRow.find('.contextrepresentation');
        	var oldRep = repCell.html();
          sRow.attr('class', 'active');
          var newCRep = '<input type="text" class="newCRep" value="' + oldRep + '" />';
          repCell.html(newCRep);
          $('html, body').animate({
              scrollTop: $('#s' + json['sentenceID']).offset().top
          }, 0);
          sRow.find('.newCRep').focus();
      	}
    	}
    }
  });
}

function loadUnderstandSentence() {
	if($('.sentenceID').val()) {
    var sentenceID = $('.sentenceID').val(); 
	} else {
		var sentenceID = -1;
	}
  $.ajax({
    type: "POST",
    url: "train_data.php",
    dataType: 'json',
    data: {
      'type': 'TrainRep',
      'action': 'load'
    },
    success: function(json) { 
      $('.content').html(json['data']);
      $('.newRepValue').focus();
    }
  });
}

function loadSplitSentence() {
  $.ajax({
    type: "POST",
    url: "train.php",
    dataType: 'json',
    data: {
      'type': 'splitter',
      'action': 'load'
    },
    success: function(json) { 
      $('.content').html(json['data']);
      //$('.newRepValue').focus();
    }
  });
}

function loadReviewRep(page) {
  $.ajax({
    type: "POST",
    url: "train_data.php",
    dataType: 'json',
    data: {
      'type': 'ReviewRep',
      'action': 'load',
      'page': page
    },
    success: function(json) { 
      $('.content').html(json['data']);
      $('.pagination').html(json['pagination']);
    }
  });
}

function loadReviewCrep(page) {
  $.ajax({
    type: "POST",
    url: "train_data.php",
    dataType: 'json',
    data: {
      'type': 'ReviewCRep',
      'action': 'load',
      'page': page
    },
    success: function(json) { 
      $('.content').html(json['data']);
      $('.pagination').html(json['pagination']);
      $('.story-title').html("Review CReps - " + json['title']);
    }
  });
}

function loadReviewSplit(page) {
  $.ajax({
    type: "POST",
    url: "train_data.php",
    dataType: 'json',
    data: {
      'type': 'ReviewSplit',
      'action': 'load',
      'page': page
    },
    success: function(json) { 
      $('.content').html(json['data']);
      $('.pagination').html(json['pagination']);
    }
  });
}

function loadReviewQA() {
  $.ajax({
    type: "POST",
    url: "train_data.php",
    dataType: 'json',
    data: {
      'type': 'ReviewQA',
      'action': 'load'
    },
    success: function(json) { 
      $('.content').html(json['data']);
    }
  });
}

function loadReviewSummary() {
  $.ajax({
    type: "POST",
    url: "train_data.php",
    dataType: 'json',
    data: {
      'type': 'ReviewSummary',
      'action': 'load'
    },
    success: function(json) { 
      $('.content').html(json['data']);
    }
  });
}

function approveCRep(crepRow) {
	var sentenceID = crepRow.attr('id');
	sentenceID = parseInt(sentenceID.replace('s', ''), 10);
  $.ajax({
    type: "POST",
    url: "train_data.php",
    dataType: 'json',
    data: {
      'type': 'TrainCRep',
      'action': 'approve',
      'sentenceID': sentenceID
    },
    success: function(json) {
    	removeActive(crepRow);
      loadIncorporateSentence();
    }
  });
}

function saveCRep(crepRow) {
  var sentenceID = crepRow.attr('id');
  sentenceID = parseInt(sentenceID.replace('s', ''), 10);
  var newValue = crepRow.find('.newCRep').val();
  $.ajax({
    type: "POST",
    url: "train_data.php",
    dataType: 'json',
    data: {
      'type': 'TrainCRep',
      'action': 'save',
      'sentenceID': sentenceID,
      'newValue': newValue
    },
    success: function(json) {
      removeActive(crepRow);
      loadIncorporateSentence();
    }
  });
}

function approveRep() {
  var sentenceID = $(".sentenceID").val();
  var newValue = $(".newRepValue").val();
  $.ajax({
    type: "POST",
    url: "train_data.php",
    dataType: 'json',
    data: {
      'type': 'TrainRep',
      'action': 'approve',
      'sentenceID': sentenceID,
      'newValue': newValue
    },
    success: function(json) {
      loadUnderstandSentence();
    }
  });
}

function approveRepGuess() {
  var sentenceID = $(".sentenceID").val();
  $.ajax({
    type: "POST",
    url: "train_data.php",
    dataType: 'json',
    data: {
      'type': 'TrainRep',
      'action': 'approveGuess',
      'sentenceID': sentenceID
    },
    success: function(json) {
      loadUnderstandSentence();
    }
  });
}

function saveRep() {
  var sentenceID = $(".sentenceID").val();
  var newValue = $('.newRepValue').val();
  $.ajax({
    type: "POST",
    url: "train_data.php",
    dataType: 'json',
    data: {
      'type': 'TrainRep',
      'action': 'save',
      'sentenceID': sentenceID,
      'newValue': newValue
    },
    success: function(json) {
      loadUnderstandSentence();
    }
  });
}

function addQA() {
  var storyID = $(".storyID").val();
  var questionValue = $('.questionValue').val();
  var answerValue = $('.answerValue').val();
  var whyValue = $('.whyValue').val();
  if(questionValue == '' || answerValue == '') return;
  $.ajax({
    type: "POST",
    url: "train_data.php",
    dataType: 'json',
    data: {
      'type': 'TrainQA',
      'action': 'add',
      'storyID': storyID,
      'questionValue': questionValue,
      'answerValue': answerValue,
      'whyValue': whyValue
    },
    success: function(json) {
    }
  });
}

function addAbout() {
  var storyID = $(".storyID").val();
  var aboutValue = $('.aboutValue').val();
  if(aboutValue == '') return;
  $.ajax({
    type: "POST",
    url: "train_data.php",
    dataType: 'json',
    data: {
      'type': 'TrainSummary',
      'action': 'add',
      'storyID': storyID,
      'aboutValue': aboutValue
    },
    success: function(json) {
    	loadAboutStory();
    }
  });
}

function approveSplit(sentenceIDs) {
  $.ajax({
    type: "POST",
    url: "train_data.php",
    dataType: 'json',
    data: {
      'type': 'TrainSplit',
      'action': 'approve',
      'sentenceIDs': sentenceIDs
    },
    success: function(json) {
    	loadSplitSentence();
    	//$(".sentencestbl tr td").animate({backgroundColor:'#73C96D'}, 300);
    }
  });
}

function resetSplitSentence(sentenceID, originalValue, deleteSentences) {
	$.ajax({
    type: "POST",
    url: "train_data.php",
    dataType: 'json',
    data: {
      'type': 'TrainSplit',
      'action': 'reset',
      'sentenceID': sentenceID,
      'originalValue': originalValue,
      'deleteSentences': deleteSentences
    },
    success: function(json) {
      $("input[value='" + sentenceID + "']").val(json['newSentenceID']);
    }
	});
}

function splitSentence(sentenceID, newSplitValue, level) {
  $.ajax({
    type: "POST",
    url: "train_data.php",
    dataType: 'json',
    data: {
      'type': 'TrainSplit',
      'action': 'split',
      'sentenceID': sentenceID,
      'newValue': newSplitValue,
      'level': level
    },
    success: function(json) {
    	if(json['error']) {
    	 alert(json['error']);
    	} else {
    		
      	var row = $("input[value='" + sentenceID + "']").parent().parent();
      	row.find('.newSplitValue').prop('disabled', true);
      	row.find('.doneNoSplitButton').css('display', 'none');
      	row.find('.doneSplitButton').css('display', 'none');
      	row.find('td:last-child').append(' <a href="javascript:void(0)" class="resetSplitButton">RE-SPLIT</a>');
      	if(level == 0) {
        	$('.skipSplitButton').html('NEXT');
        	$('.skipSplitButton').attr('class', 'nextSplitButton');
        	$('.doneNoSplitButton').html('DONE');
        	$('.doneNoSplitButton').css('display', 'inline-block');
          $('.doneNoSplitButton').attr('class', 'nextSplitButton');
      	}
        if(json['newSentencesCount'] > 1) {
          row.after(json['data']);
        }
        if(json['newSentencesCount'] == 1 && json['level'] == 1) {
        	loadSplitSentence();
        } else {
        	$(".sentenceID").each(function() {
            if(json['newSentenceIDs'][$(this).val()]) $(this).val(json['newSentenceIDs'][$(this).val()]); 
        	}); 
        }
    	}
    }
  });
}

function noSplitSentence(sentenceID) {
  $.ajax({
    type: "POST",
    url: "train_data.php",
    dataType: 'json',
    data: {
      'type': 'TrainSplit',
      'action': 'dont_split',
      'sentenceID': sentenceID
    },
    success: function() {
      
    }
  });
}

function skipSplitSentence(sentenceID) {
  $.ajax({
    type: "POST",
    url: "train_data.php",
    dataType: 'json',
    data: {
      'type': 'TrainSplit',
      'action': 'skip',
      'sentenceID': sentenceID
    },
    success: function() {
      loadSplitSentence();
    }
  });
}

function approveReviewRep(sentenceID, newValue) {
  $.ajax({
    type: "POST",
    url: "train_data.php",
    dataType: 'json',
    data: {
      'type': 'ReviewRep',
      'action': 'approve',
      'sentenceID': sentenceID,
      'newValue': newValue
    },
    success: function(json) {
    	$('#s' + sentenceID + ' td').animate({backgroundColor:'#A7E3A3'}, 300);
    	setTimeout(function() {
        var flag = true;
        $(".reviewrep tr").each(function() {
          if($(this).find('td').length && $(this).find('td').css('background-color') != 'rgb(167, 227, 163)') {
            flag = false;
          }
        });
        if(flag == true) {
          var page = parseInt($('.currentPage').html(), 10);
          if(!page) page = 1;
          loadReviewRep(page);
        }
      }, 300);
    }
  });
}

function dismissReviewRep(sentenceID) {
  $.ajax({
    type: "POST",
    url: "train_data.php",
    dataType: 'json',
    data: {
      'type': 'ReviewRep',
      'action': 'dismiss',
      'sentenceID': sentenceID
    },
    success: function(json) {
    	$('#s' + sentenceID + ' td').animate({backgroundColor:'#EDAE9A'}, 300);
    	setTimeout(function() {
        var flag = true;
        $(".reviewrep tr").each(function() {
          if($(this).find('td').length && $(this).find('td').css('background-color') != 'rgb(237, 174, 154)') {
            flag = false;
          }
        });
        if(flag == true) {
          var page = parseInt($('.currentPage').html(), 10);
          if(!page) page = 1;
          loadReviewRep(page);
        }
      }, 300);
    }
  });
}

function approveAllReps(sentences) {
  $.ajax({
    type: "POST",
    url: "train_data.php",
    dataType: 'json',
    data: {
      'type': 'ReviewRep',
      'action': 'approveMultiple',
      'sentences': sentences
    },
    success: function(json) {
      $('.reviewrep td').animate({backgroundColor:'#A7E3A3'}, 300);
      var page = parseInt($('.currentPage').html(), 10);
      if(!page) page = 1;
      loadReviewRep(page);
    }
  });
}

function dismissAllReps(sentences) {
  $.ajax({
    type: "POST",
    url: "train_data.php",
    dataType: 'json',
    data: {
      'type': 'ReviewRep',
      'action': 'dismissMultiple',
      'sentences': sentences
    },
    success: function(json) {
    	$('.reviewrep td').animate({backgroundColor:'#EDAE9A'}, 300);
    	var page = parseInt($('.currentPage').html(), 10);
      if(!page) page = 1;
      loadReviewRep(page);
    }
  });
}

function approveReviewCRep(sentenceID, newValue) {
  $.ajax({
    type: "POST",
    url: "train_data.php",
    dataType: 'json',
    data: {
      'type': 'ReviewCRep',
      'action': 'approve',
      'sentenceID': sentenceID,
      'newValue': newValue
    },
    success: function(json) {
    	$('#s' + sentenceID + ' td').animate({backgroundColor:'#A7E3A3'}, 300);
    	if(json['nextPage'] == 1) 
        loadReviewCrep(1);
    }
  });
}

function dismissReviewCRep(sentenceID) {
  $.ajax({
    type: "POST",
    url: "train_data.php",
    dataType: 'json',
    data: {
      'type': 'ReviewCRep',
      'action': 'dismiss',
      'sentenceID': sentenceID
    },
    success: function(json) {
    	$('#s' + sentenceID + ' td').animate({backgroundColor:'#EDAE9A'}, 300);
    }
  });
}

function approveAllCReps(sentences) {
  $.ajax({
    type: "POST",
    url: "train_data.php",
    dataType: 'json',
    data: {
      'type': 'ReviewCRep',
      'action': 'approveMultiple',
      'sentences': sentences
    },
    success: function(json) {
      $('.reviewrep td').animate({backgroundColor:'#A7E3A3'}, 300);
      if(json['nextPage'] == 1) 
        loadReviewCrep(1);
    }
  });
}

function dismissAllCReps(sentences) {
  $.ajax({
    type: "POST",
    url: "train_data.php",
    dataType: 'json',
    data: {
      'type': 'ReviewCRep',
      'action': 'dismissMultiple',
      'sentences': sentences
    },
    success: function(json) {
      $('.reviewrep td').animate({backgroundColor:'#EDAE9A'}, 300);
    }
  });
}

function revertReviewSplit(protoID) {
	$("#pr" + protoID).find("td").animate({backgroundColor:'#ccc'}, 300);
  $.ajax({
    type: "POST",
    url: "train_data.php",
    dataType: 'json',
    data: {
      'type': 'ReviewSplit',
      'action': 'revert',
      'protoID': protoID
    },
    success: function(json) {
      $("#pr" + protoID).nextUntil(".aproto").fadeOut("slow");
      
    },
    complete: function(xhr) {
    	var json = $.parseJSON(xhr.responseText);
    	setTimeout(function() {
        $("#pr" + protoID).after(json['data']);
        $("#s" + json['sentenceID']).hide().fadeIn();
        $(".disabledRevertReviewSplitButton").attr('class', 'revertReviewSplitButton');
      }, 600);
    }
  });
}

function modifyReviewSplit(sentenceID, newValue) {
  $.ajax({
    type: "POST",
    url: "train_data.php",
    dataType: 'json',
    data: {
      'type': 'ReviewSplit',
      'action': 'modify',
      'sentenceID': sentenceID,
      'newValue': newValue
    },
    success: function(json) {
      if(json['error']) {
       alert(json['error']);
      } else {
        if(json['newSentencesCount'] > 1) {
          $(".asentence").each(function() {
            var sID = $(this).attr('id');
            sID = parseInt(sID.replace('s', ''), 10);
            if(json['newSentenceIDs'][sID]) $(this).attr('id', "s" + json['newSentenceIDs'][sID]); 
          }); 
        }
        $("#s" + sentenceID).fadeOut("slow");
        var protoRow = $("#s" + sentenceID).prevAll('.aproto').eq(0);
        //protoRow.find('td').animate({backgroundColor:'#ccc'}, 300);
        //find('td').animate({backgroundColor:'#fff'}, 300);
        protoRow.nextUntil(".aproto").each(function(i) {
          if(i%2 == 0) { 
            $(this).removeClass('row2');
            $(this).addClass('row1', 300);
            $(this).find('td').css('background-color', '');
          } else {
            $(this).removeClass('row1');
            $(this).addClass('row2', 300);
            $(this).find('td').css('background-color', '');
          }
        });
        setTimeout(function() {
        	$("#s" + sentenceID).after(json['data']);
        	$("#s" + sentenceID).remove();
        	for(var key in json['newSentences']) {
        	 $("#s" + json['newSentences'][key]).hide().fadeIn("slow");
        	}
        	protoRow.nextUntil(".aproto").each(function(i) {
            if(i%2 == 0) { 
              $(this).removeClass('row2');
              $(this).addClass('row1', 300);
              $(this).find('td').css('background-color', '');
            } else {
              $(this).removeClass('row1');
              $(this).addClass('row2', 300);
              $(this).find('td').css('background-color', '');
            }
          });
        }, 600);
        
      }
    }
  });
}

function approveReviewSplit(protoID) {
  $.ajax({
    type: "POST",
    url: "train_data.php",
    dataType: 'json',
    data: {
      'type': 'ReviewSplit',
      'action': 'approve',
      'protoID': protoID
    },
    success: function(json) {
    	$("#pr" + protoID).nextUntil(".aproto").each(function() {
        $(this).find("td").animate({backgroundColor:'#A7E3A3'}, 300);
      });
      $("#pr" + protoID).find("td").animate({backgroundColor:'#73C96D'}, 300);
      setTimeout(function() {
      	var flag = true;
      	$(".aproto").each(function() {
          if($(this).find('td').length && $(this).find('td').css('background-color') != 'rgb(115, 201, 109)') {
            flag = false;
          }
      	});
      	if(flag == true) {
          var page = parseInt($('.currentPage').html(), 10);
          if(!page) page = 1;
          loadReviewSplit(page);
      	}
      }, 300);
    }
  });
}

function dismissReviewSplit(protoID) {
  $.ajax({
    type: "POST",
    url: "train_data.php",
    dataType: 'json',
    data: {
      'type': 'ReviewSplit',
      'action': 'dismiss',
      'protoID': protoID
    },
    success: function(json) {
      $("#pr" + protoID).nextUntil(".aproto").each(function() {
        $(this).find("td").animate({backgroundColor:'#EDAE9A'}, 300);
      });
      $("#pr" + protoID).find("td").animate({backgroundColor:'#C98D6D'}, 300);
      setTimeout(function() {
        var flag = true;
        $(".aproto").each(function() {
          if($(this).find('td').length && $(this).find('td').css('background-color') != 'rgb(201, 141, 109)') {
            flag = false;
          }
        });
        if(flag == true) {
          var page = parseInt($('.currentPage').html(), 10);
          if(!page) page = 1;
          loadReviewSplit(page);
        }
      }, 300);
    }
  });
}

function approveAllSplits(protoIDs) {
  $.ajax({
    type: "POST",
    url: "train_data.php",
    dataType: 'json',
    data: {
      'type': 'ReviewSplit',
      'action': 'approveMultiple',
      'protoIDs': protoIDs
    },
    success: function(json) {
    	/*$('.asentence').find('td').animate({backgroundColor:'#A7E3A3'}, 300);
      $('.aproto').find('td').animate({backgroundColor:'#73C96D'}, 300);*/
      var page = parseInt($('.currentPage').html(), 10);
      if(!page) page = 1;
      loadReviewSplit(page);
    }
  });
}

function dismissAllSplits(protoIDs) {
  $.ajax({
    type: "POST",
    url: "train_data.php",
    dataType: 'json',
    data: {
      'type': 'ReviewSplit',
      'action': 'dismissMultiple',
      'protoIDs': protoIDs
    },
    success: function(json) {
      /*$('.asentence').find('td').animate({backgroundColor:'#EDAE9A'}, 300);
      $('.aproto').find('td').animate({backgroundColor:'#C98D6D'}, 300);*/
      var page = parseInt($('.currentPage').html(), 10);
      if(!page) page = 1;
      loadReviewSplit(page);
    }
  });
}

function approveReviewQA(questionID, newValueQ, newValueA) {
  $.ajax({
    type: "POST",
    url: "train_data.php",
    dataType: 'json',
    data: {
      'type': 'ReviewQA',
      'action': 'approve',
      'questionID': questionID,
      'newValueA': newValueA,
      'newValueQ': newValueQ
    },
    success: function(json) {
    }
  });
}

function dismissReviewQA(questionID) {
  $.ajax({
    type: "POST",
    url: "train_data.php",
    dataType: 'json',
    data: {
      'type': 'ReviewQA',
      'action': 'dismiss',
      'questionID': questionID
    },
    success: function(json) {
    }
  });
}

function approveReviewSummary(summaryID, newValue) {
  $.ajax({
    type: "POST",
    url: "train_data.php",
    dataType: 'json',
    data: {
      'type': 'ReviewSummary',
      'action': 'approve',
      'summaryID': summaryID,
      'newValue': newValue
    },
    success: function(json) {
    }
  });
}

function dismissReviewSummary(summaryID) {
  $.ajax({
    type: "POST",
    url: "train_data.php",
    dataType: 'json',
    data: {
      'type': 'ReviewSummary',
      'action': 'dismiss',
      'summaryID': summaryID
    },
    success: function(json) {
    }
  });
}

function removeActive(crepRow) {
  crepRow.removeClass('active');
  var newValue = crepRow.find('.newCRep').val();
  crepRow.find('td').last().html(newValue);
}

function skipStory() {
  $.ajax({
    type: "POST",
    url: "train_data.php",
    dataType: 'json',
    data: {
      'type': 'TrainCRep',
      'action': 'skip'
    },
    success: function(json) {
      loadStory();
    }
  });
}

function leaveTrain() {
  $.ajax({
    type: "POST",
    url: "train_data.php",
    dataType: 'json',
    data: {
      'type': 'General',
      'action': 'leave'
    },
    success: function(json) {
      window.location.href = 'train.php';
    }
  });
}

function loadExamples(page) {
  $.ajax({
    type: "POST",
    url: "train_data.php",
    dataType: 'json',
    data: {
      'type': 'General',
      'action': 'examples',
      'page': page
    },
    success: function(json) {
      $('.content table').html(json['data']);
      $('.content .pagination').html(json['pagination']);
    }
  });
}
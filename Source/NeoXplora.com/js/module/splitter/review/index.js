var MSplitterReviewIndex_Implementation = {
  extend: "NeoX.TBaseObject",
  type: "module",
  
  construct: function(settings) {
  	this.base(this);
    this.setConfig($.extend(this.getConfig(), settings));
  },
  
  properties: {
    Config: {
    	Buttons: {
    		goToPage: '.goToPage',
        revert: '.revertReviewSplitButton',
        modify: '.modifyReviewSplitButton',
        approve: '.approveReviewSplitButton',
        dismiss: '.dismissReviewSplitButton',
        approveAll: '.approveAllSplitButton',
        dismissAll: '.dismissAllSplitButton'
    	},
      Inputs: {
      	newValue: '.newValue',
        aproto: '.aproto',
        asentence: '.asentence'
      },
      moduleScript: 'review.php',
      moduleType: 'splitter',
      dataContainer: '.boxContent',
      paginationContainer: '.boxPagination'
    }
  },
  
  methods: {
    
    init: function() {
      NeoX.Modules.SplitterReviewIndex.hookEvents();
      NeoX.Modules.SplitterReviewIndex.load();
    },
    
    hookEvents: function() {
      	NeoX.Modules.SplitterReviewIndex.hookEvent('click', NeoX.Modules.SplitterReviewIndex.getConfig().Buttons.goToPage, NeoX.Modules.SplitterReviewIndex.goToPage);
      	NeoX.Modules.SplitterReviewIndex.hookEvent('click', NeoX.Modules.SplitterReviewIndex.getConfig().Buttons.revert, NeoX.Modules.SplitterReviewIndex.revert);
      	NeoX.Modules.SplitterReviewIndex.hookEvent('click', NeoX.Modules.SplitterReviewIndex.getConfig().Buttons.modify, NeoX.Modules.SplitterReviewIndex.modify);
      	NeoX.Modules.SplitterReviewIndex.hookEvent('click', NeoX.Modules.SplitterReviewIndex.getConfig().Buttons.approve, NeoX.Modules.SplitterReviewIndex.approve);
      	NeoX.Modules.SplitterReviewIndex.hookEvent('click', NeoX.Modules.SplitterReviewIndex.getConfig().Buttons.dismiss, NeoX.Modules.SplitterReviewIndex.dismiss);
      	NeoX.Modules.SplitterReviewIndex.hookEvent('click', NeoX.Modules.SplitterReviewIndex.getConfig().Buttons.approveAll, NeoX.Modules.SplitterReviewIndex.approveAll);
      	NeoX.Modules.SplitterReviewIndex.hookEvent('click', NeoX.Modules.SplitterReviewIndex.getConfig().Buttons.dismissAll, NeoX.Modules.SplitterReviewIndex.dismissAll);
      	NeoX.Modules.SplitterReviewIndex.hookEvent('keypress', ".editProto", NeoX.Modules.SplitterReviewIndex.editProtoReq);
        NeoX.Modules.SplitterReviewIndex.hookEvent('click', ".aproto .content-indent.childProto b", NeoX.Modules.SplitterReviewIndex.editProto);
      	NeoX.Modules.SplitterReviewIndex.hookEvent('click', ".createProtoButton", NeoX.Modules.SplitterReviewIndex.createProto);
      	NeoX.Modules.SplitterReviewIndex.hookEvent('change', ".selectedSentence", NeoX.Modules.SplitterReviewIndex.selectedSentences_change);
      	NeoX.Modules.SplitterReviewIndex.hookEvent('change', "#dofix", NeoX.Modules.SplitterReviewIndex.dofix_change);
      	$(document).ready(function() {
        	$( window ).resize(function() {
            NeoX.Modules.SplitterReviewIndex.resizeInputs();
          });
      	});
    },
    
    load: function() {
    	$(".trainer").addClass("loading");
    	NeoX.Modules.SplitterReviewRequests.load(1);
    },
    
    editProto: function() {
    	if(!$(this).hasClass('inEdit')) {
      	var theval = $(this).text();
      	var protoId = parseInt($(this).parent().parent().parent().data("id"), 10);
      	$(this).addClass('inEdit');
      	$(this).html("<input class='editProto' id ='editProto" + protoId + "' style='width: 95%; padding: 5px;' value='abc' />");
      	$('#editProto' + protoId).val(theval);
    	}
    },
    
    dofix_change: function() {
    	NeoX.Modules.SplitterReviewRequests.reload();
    },
    
    resizeInputs: function() {
    	$(".trainer tr").each(function() {
        $(this).find("td").first().find(".content-indent").width(0);
    	});
    	$(".trainer tr").each(function() {
        
        var cell = $(this).find("td").first();
        var totalWidth = cell.width();
        
        var indentWidth = cell.find(".level-indent-wrapper").width();
        var newWidth = totalWidth - indentWidth - 10;
        cell.find(".content-indent").width(newWidth);
      });
    },
    
    editProtoReq: function(e) {
    	if(e.which == 13) {
      	var newVal = $(this).val();
      	var protoId = $(this).parent().parent().parent().parent().data("id");
      	NeoX.Modules.SplitterReviewRequests.editProto(protoId, newVal);
    	}
    },
    
    goToPage: function() {
    	$(".trainer").addClass("loading");
    	var page = parseInt($(this).html(), 10);
      NeoX.Modules.SplitterReviewRequests.load(page);
      $('html, body').animate({
          scrollTop: $('#content').offset().top
      }, 50);
    },
    
    createProto: function() {
    	var protoId = $(this).parent().parent().data("id");
    	var sentenceList = [];
    	
    	$(".selectedSentence:checked").each(function() {
    		var currentProtoId = $(this).parent().parent().parent().data("proto");
    		var sentenceId = $(this).parent().parent().parent().data("id");
    		if(currentProtoId == protoId) {
    		  sentenceList.push(sentenceId);
    		}
    	});
    	
    	if(sentenceList.length > 0) {
    		$(".trainer").addClass("loading");
    		NeoX.Modules.SplitterReviewRequests.createProto(protoId, sentenceList);
    	} else {
        alert("Please select at least one valid sentence that belongs to this proto.");
    	}
    },
    
    selectedSentences_change: function() {
    	var protoId = $(this).parent().parent().parent().data("proto");
    	$(".selectedSentence:checked").each(function() {
        var currentProtoId = $(this).parent().parent().parent().data("proto");
        if(currentProtoId != protoId) {
        	$(this).prop('checked', false);
        }
      });
    },
    
    revert: function () {
      $(this).attr('class', "disabledRevertReviewSplitButton button");
      var protoID = $(this).parent().parent().data('id');
      NeoX.Modules.SplitterReviewRequests.revert(protoID);
    },
    
    modify: function() {
    	var sentenceID = $(this).parent().parent().data('id');
      var newValue = $(this).parent().parent().find('.newValue').val();
      NeoX.Modules.SplitterReviewRequests.modify(sentenceID, newValue);
    },
    
    approve: function() {
    	var protoID = $(this).parent().parent().data('id');
      NeoX.Modules.SplitterReviewRequests.approve(protoID);
    },
    
    dismiss: function() {
    	var protoID = $(this).parent().parent().data('id');
      NeoX.Modules.SplitterReviewRequests.dismiss(protoID);
    },
    
    approveAll: function() {
    	var protoIDs = [];
      $('.aproto').each(function() {
        var protoID = $(this).data('id');
        protoIDs.push(protoID);
      });
      NeoX.Modules.SplitterReviewRequests.approveAll(protoIDs);
    },
    
    dismissAll: function() {
    	var protoIDs = [];
      $('.aproto').each(function() {
        var protoID = $(this).data('id');
        protoIDs.push(protoID);
      });
      NeoX.Modules.SplitterReviewRequests.dismissAll(protoIDs);
    }
    
  }
  
};

Sky.Class.Define("NeoX.Modules.SplitterReviewIndex", MSplitterReviewIndex_Implementation);

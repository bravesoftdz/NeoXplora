var MInterpreterTrainRequests_Implementation = {
  extend: "NeoX.TBaseObject",
  type: "module",
  construct: function() {
  	this.base(this);
  },
  
  methods: {
    
    init: function() {
      //nothing to init
    },
        
    /*
     * AJAX REQUESTS
     */
    
    load: function() {
      $.ajax({
        type: "POST",
        url: NeoX.Modules.InterpreterTrainIndex.getConfig().moduleScript,
        dataType: 'json',
        data: {
          'type': NeoX.Modules.InterpreterTrainIndex.getConfig().moduleType,
          'action': 'load'
        },
        success: NeoX.Modules.InterpreterTrainRequests.loadCallback
      });
    },
    
    save: function(sentenceID, newValue) {
    	$.ajax({
        type: "POST",
        url: NeoX.Modules.InterpreterTrainIndex.getConfig().moduleScript,
        dataType: 'json',
        data: {
          'type': NeoX.Modules.InterpreterTrainIndex.getConfig().moduleType,
          'action': 'save',
          'sentenceID': sentenceID,
          'newValue': newValue
        },
        success: NeoX.Modules.InterpreterTrainRequests.saveCallback(newValue)
      });
    },
    
    skip: function(sentenceID) {
      $.ajax({
        type: "POST",
        url: NeoX.Modules.InterpreterTrainIndex.getConfig().moduleScript,
        dataType: 'json',
        data: {
          'type': NeoX.Modules.InterpreterTrainIndex.getConfig().moduleType,
          'action': 'skip',
          'sentenceID': sentenceID
        },
        success: NeoX.Modules.InterpreterTrainRequests.skipCallback
      });
    },
      
    use: function(sentenceID) {
    	$.ajax({
        type: "POST",
        url: NeoX.Modules.InterpreterTrainIndex.getConfig().moduleScript,
        dataType: 'json',
        data: {
          'type': NeoX.Modules.InterpreterTrainIndex.getConfig().moduleType,
          'action': 'approveGuess',
          'sentenceID': sentenceID
        },
        success: NeoX.Modules.InterpreterTrainRequests.useCallback(newValue)
      });
    },
    
    approve: function(sentenceID, newValue) {
    	$.ajax({
        type: "POST",
        url: NeoX.Modules.InterpreterTrainIndex.getConfig().moduleScript,
        dataType: 'json',
        data: {
          'type': NeoX.Modules.InterpreterTrainIndex.getConfig().moduleType,
          'action': 'approve',
          'sentenceID': sentenceID,
          'newValue': newValue
        },
        success: NeoX.Modules.InterpreterTrainRequests.approveCallback(newValue)
      });
    },
    
    /*
     * AJAX SUCCESS CALLBACKS
     */
    
    loadCallback: function(json) {
    	$(NeoX.Modules.InterpreterTrainIndex.getConfig().dataContainer).html(json['data']);
    },
    
    saveCallback: function(newValue) {
    	return function(json) {
      	if(json && json['ErrorString'] && json['StrIndex']) {
          var near = newValue.substr(json['StrIndex'], newValue.length);
          $(NeoX.Modules.InterpreterTrainIndex.getConfig().Containers.error).remove();
          $(NeoX.Modules.InterpreterTrainIndex.getConfig().Containers.table).after("<div class='" + NeoX.Modules.InterpreterTrainIndex.getConfig().Containers.error.substr(1, NeoX.Modules.InterpreterTrainIndex.getConfig().Containers.error.length)  + "' style='color: red'><br/>" + json['ErrorString'] + " at \"" + near + "\"</div>");
        } else {
          NeoX.Modules.InterpreterTrainRequests.load();
        }
    	};
    },
    
    skipCallback: function(json) {
    	NeoX.Modules.InterpreterTrainRequests.load();
    },
    
    useCallback: function(newValue) {
      return function(json) {
        if(json && json['ErrorString'] && json['StrIndex']) {
          var near = newValue.substr(json['StrIndex'], newValue.length);
          $(NeoX.Modules.InterpreterTrainIndex.getConfig().Containers.error).remove();
          $(NeoX.Modules.InterpreterTrainIndex.getConfig().Containers.table).after("<div class='" + NeoX.Modules.InterpreterTrainIndex.getConfig().Containers.error.substr(1, NeoX.Modules.InterpreterTrainIndex.getConfig().Containers.error.length)  + "' style='color: red'><br/>" + json['ErrorString'] + " at \"" + near + "\"</div>");
        } else {
          NeoX.Modules.InterpreterTrainRequests.load();
        }
      };
    },
    
    approveCallback: function(newValue) {
      return function(json) {
        if(json && json['ErrorString'] && json['StrIndex']) {
          var near = newValue.substr(json['StrIndex'], newValue.length);
          $(NeoX.Modules.InterpreterTrainIndex.getConfig().Containers.error).remove();
          $(NeoX.Modules.InterpreterTrainIndex.getConfig().Containers.table).after("<div class='" + NeoX.Modules.InterpreterTrainIndex.getConfig().Containers.error.substr(1, NeoX.Modules.InterpreterTrainIndex.getConfig().Containers.error.length)  + "' style='color: red'><br/>" + json['ErrorString'] + " at \"" + near + "\"</div>");
        } else {
          NeoX.Modules.InterpreterTrainRequests.load();
        }
      };
    }
    
  }

};

Sky.Class.Define("NeoX.Modules.InterpreterTrainRequests", MInterpreterTrainRequests_Implementation);

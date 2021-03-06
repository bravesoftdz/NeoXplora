var TRuleGroup_Implementation = {

	extend: 'NeoAI.TBaseRule',
	
	construct: function() {
		this.base(this);
		this.setChildren([]);
	},
	
	properties: { 
		Children: null //(array of RuleValue/RuleGroup)
	},
	 
	methods: {
		
		GetModifiedNodes: function(){
			var nodes = [];
			if(this.getModified()){
				nodes.push(this);
			}
			var children = this.getChildren();
			for(var i=0;i<children.length;i++){
				if(children[i].getModified() && !(typeof children[i].getChildren == 'function')){
					nodes.push(children[i]);
				}else if (typeof children[i].getChildren == 'function'){
					nodes = nodes.concat(children[i].GetModifiedNodes());
				}
			}
			return nodes;
		},
		
		InsertChild: function(child, index) { // (TBaseRule, integer)
			index = typeof index !== 'undefined' ? index : -1;
			if(child != null) {
				child.setParent(this);
				if(index < 0) {
					child.setIndex(this.getChildren().length);
					this.getChildren().push(child);
				} else {
					child.setIndex(index);
					this.getChildren().splice(index, 0, child);
					this.reAdjustIndexes();
				}
				child.SetModified(true);
			}
		},
		
		MoveChild: function(childIndex, upDownToggle) {  //(integer, boolean)
			var children = this.getChildren();
			if(upDownToggle) { // true = UP
				if(childIndex == 0) {
					var child = children[childIndex];
					this.RemoveChild(childIndex);
					this.getParent().InsertChild(child, this.getIndex());
					if(this.getChildren().length == 0) {
						this.getParent().RemoveChild(this.getIndex());
					}
				} else if (!(typeof children[childIndex - 1].getChildren == 'function')) {
					this.swapChildren(childIndex, childIndex - 1);
				} else {
					var child = children[childIndex];
					this.RemoveChild(childIndex);
					children[childIndex-1].InsertChild(child);
				}
			} else { // false = DOWN
				if(childIndex == children.length-1) {
					var child = children[childIndex];
					this.RemoveChild(childIndex);
					this.getParent().InsertChild(child, this.getIndex() + 1);
					if(children.length == 0) {
						this.getParent().RemoveChild(this.Index);
					}
				} else if (!(typeof children[childIndex + 1].getChildren == 'function')) {
					this.swapChildren(childIndex, childIndex + 1);
				} else {
					var child = children[childIndex];
					this.RemoveChild(childIndex);
					children[childIndex].InsertChild(child, 0);
				}
			}
		},
		
		RemoveChild: function (childIndex) {  //(integer)
			if(childIndex < this.getChildren().length) {
				this.getChildren().splice(childIndex, 1);
				this.reAdjustIndexes();
			} else throw "IndexOutOfReachException";
		},
		
		reAdjustIndexes: function() {
			var children = this.getChildren();
			for(var i = 0; i < children.length; i++){
				if(children[i].getIndex() != i){
					children[i].setIndex(i);
					children[i].SetModified(true);
					this.SetModified(true);
				}
			}
		},
		
		SetUpdated: function(){
			this.SetModified(false);
			var children = this.getChildren();
			for(var i=0;i<children.length;i++){
				if(typeof children[i].getChildren == 'function'){
					children[i].SetUpdated();
				}else{
					children[i].SetModified(false);
				}
			}
		},
		
		swapChildren:  function (index1, index2) {
			var tmp = this.getChildren()[index1];
			this.getChildren()[index1] = this.getChildren()[index2];
			this.getChildren()[index2] = tmp;
			var tmpIndex = this.getChildren()[index1].getIndex();
			this.getChildren()[index1].setIndex(this.getChildren()[index2].getIndex());
			this.getChildren()[index2].setIndex(tmpIndex);
			this.getChildren()[index1].SetModified(true);
			this.getChildren()[index2].SetModified(true);
			this.SetModified(true);
		},
		
		
		
		toString: function(indent) {
			indent = typeof indent !== 'undefined' ? indent : 0;
			var indentStr = "";
			while(indent > 0) {
				indentStr += "\t";
				indent--;
			}
			var result = indentStr + "TRuleGroup[" + this.getIndex() + "]:{ ConjunctionType: " + this.getConjunctionType();
			
			var resultChildren = "";
			for(var i = 0; i < this.getChildren().length; i++) {
				resultChildren += indentStr + this.getChildren()[i].toString(indent + 1) + "\n";
			}
			
			if(resultChildren != ""){
				result += ",\n" + indentStr + "\tChildren:" + indentStr + "\t\n" + resultChildren;
			}
			result += indentStr + "}\n";
			return result;
		}
		
	 }
	
};

Sky.Class.Define("NeoAI.TRuleGroup", TRuleGroup_Implementation);
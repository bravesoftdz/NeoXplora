function Class() {
  this.extend = function(parent) {
    this.prototype = parent.prototype;
  };
  
  return this;
}

function TClassName(){
  var Object = new Class();
  
  Object.A = '';
  Object.B = function(){
    console.log('parent');
  };
  
  return Object; 
}

function TChildClass() {
  var Object = new Class();
  var parent = new TClassName();
  Object.extend(parent);
  
  this.B = function (){
    console.log('test');
  };
  
  return this;
}

var test = new TChildClass();
test.parent.B();
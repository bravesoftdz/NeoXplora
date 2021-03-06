unit IRepRuleCondition;

interface

uses
  BaseRuleCondition;

type
  TIRepRuleCondition = class(TBaseRuleCondition)
  published
    property GroupId;
    property Id;
    property Key;
    property OperatorType;
    property Order;
    property KeyPropertyType;
    property Value;
  end;

implementation

uses
  AppConsts;

{ TIRepRuleCondition }

initialization
  TIRepRuleCondition.RegisterEntityClassWithMappingToTable(ConstNeoPrefix + 'ireprulecondition');

end.

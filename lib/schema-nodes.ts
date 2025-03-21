type ExtractAdditionalProps<T extends { name: string }> = {
  [K in keyof T as K extends keyof { name: string } ? never : K]: T[K]
};
type HasAdditionalProps<T extends { name: string }> = 
  keyof ExtractAdditionalProps<T> extends never ? false : true;

type MethodNodeBase<Name extends string, Value extends unknown> = {
  name: Name;
  value: Value;
}
type MethodNodePipe = MethodNodeBase<'pipe', AnyNode[]>
const methodPipe = (item: AnyNode, value: AnyNode[]): MethodNodePipe => ({
  name: 'pipe',
  value: [item, ...value]
});

type MethodNode =
  | MethodNodePipe;


type Action<Node extends ActionNode> = Node extends { value: infer V }
  ? (value: V, message?: string) => Node
  : (message?: string) => Node;

type ActionNodeBase<Name extends string, Value extends unknown = undefined> = Value extends undefined
  ? {
    name: Name;
    message?: string
    custom?: boolean;
  } : {
    value: Value;
    name: Name;
    message?: string
    custom?: boolean;
  }

type ActionNodeMinLength = ActionNodeBase<'minLength', number>
const actionMinLength: Action<ActionNodeMinLength> = (value, message) => ({
  name: "minLength",
  value,
  message,
});

type ActionNodeMaxLength = ActionNodeBase<'maxLength', number>
const actionMaxLength: Action<ActionNodeMaxLength> = (value, message) => ({
  name: "maxLength",
  value,
  message,
});

type ActionNodeMinValue = ActionNodeBase<'minValue', number>
const actionMinValue: Action<ActionNodeMinValue> = (value, message) => ({
  name: "minValue",
  value,
  message,
});

type ActionNodeMaxValue = ActionNodeBase<'maxValue', number>
const actionMaxValue: Action<ActionNodeMaxValue> = (value, message) => ({
  name: "maxValue",
  value,
  message,
});

type ActionNodeMultipleOf = ActionNodeBase<'multipleOf', number>
const actionMultipleOf: Action<ActionNodeMultipleOf> = (value, message) => ({
  name: "multipleOf",
  value,
  message,
});

type ActionNodeRegex = ActionNodeBase<'regex', string>
const actionRegex: Action<ActionNodeRegex> = (value, message) => ({
  name: "regex",
  value,
  message,
});

type ActionNodeUniqueItems = ActionNodeBase<'uniqueItems'>
const actionUniqueItems: Action<ActionNodeUniqueItems> = (message) => ({
  name: "uniqueItems",
  message,
});

type ActionNodeEmail = ActionNodeBase<'email'>
const actionEmail: Action<ActionNodeEmail> = (message) => ({
  name: "email",
  message,
});

type ActionNodeUUID = ActionNodeBase<'uuid'>
const actionUUID: Action<ActionNodeUUID> = (message) => ({
  name: "uuid",
  message,
});

type ActionNodeIsoDateTime = ActionNodeBase<'isoDateTime'>
const actionIsoDateTime: Action<ActionNodeIsoDateTime> = (message) => ({
  name: "isoDateTime",
  message,
});

type ActionNode = 
  | ActionNodeMinLength
  | ActionNodeMaxLength
  | ActionNodeMinValue
  | ActionNodeMaxValue
  | ActionNodeMultipleOf
  | ActionNodeEmail
  | ActionNodeUUID
  | ActionNodeIsoDateTime
  | ActionNodeRegex
  | ActionNodeUniqueItems;

type SchemaNodeBase<Name extends string> = {
  name: Name;
}

type NodeFactory<Node extends SchemaNode> = HasAdditionalProps<Node> extends true
  ? (props: Omit<Node, "name">) => Node
  : () => Node;

type SchemaNodeString = SchemaNodeBase<'string'>
const schemaNodeString: NodeFactory<SchemaNodeString> = () => ({
  name: 'string',
});

type SchemaNodeNumber = SchemaNodeBase<'number'>
const schemaNodeNumber: NodeFactory<SchemaNodeNumber> = () => ({
  name: 'number',
});

type SchemaNodeInteger = SchemaNodeBase<'integer'>
const schemaNodeInteger: NodeFactory<SchemaNodeInteger> = () => ({
  name: 'integer',
});

type SchemaNodeBoolean = SchemaNodeBase<'boolean'>
const schemaNodeBoolean: NodeFactory<SchemaNodeBoolean> = () => ({
  name: 'boolean',
});

type SchemaNodeObject = SchemaNodeBase<'object'> & {
  content: Record<string, AnyNode>;
}
const schemaNodeObject: NodeFactory<SchemaNodeObject> = (props) => ({
  name: 'object',
  ...props,
});

type SchemaNodeArray = SchemaNodeBase<'array'> & {
  kind?: AnyNode;
}
const schemaNodeArray: NodeFactory<SchemaNodeArray> = (props) => ({
  name: 'array',
  ...props,
});

type SchemaNodeUnion = SchemaNodeBase<'union'> & {
  content: any[]
}
const schemaNodeUnion: NodeFactory<SchemaNodeUnion> = (props) => ({
  name: 'union',
  ...props,
});

type SchemaNodeNull = SchemaNodeBase<'null'>
const schemaNodeNull: NodeFactory<SchemaNodeNull> = () => ({
  name: 'null'
});

type SchemaNodeLiteral = SchemaNodeBase<'literal'> & {
  value?: any;
}
const schemaNodeLiteral: NodeFactory<SchemaNodeLiteral> = (props) => ({
  name: 'literal',
  ...props,
});

type SchemaNodeOptional = SchemaNodeBase<'optional'> & {
  item: AnyNode;
}
const schemaNodeOptional: NodeFactory<SchemaNodeOptional> = (props) => ({
  name: 'optional',
  ...props,
});

type SchemaNodeReference = SchemaNodeBase<'$ref'> & {
  ref?: string;
}
const schemaNodeReference: NodeFactory<SchemaNodeReference> = (props) => ({
  name: '$ref',
  ...props,
})

type SchemaNode = 
  | SchemaNodeString
  | SchemaNodeNumber
  | SchemaNodeInteger
  | SchemaNodeBoolean
  | SchemaNodeObject
  | SchemaNodeArray
  | SchemaNodeUnion
  | SchemaNodeNull
  | SchemaNodeOptional
  | SchemaNodeLiteral
  | SchemaNodeReference;

type AnyNode = 
 | SchemaNode
 | MethodNode
 | ActionNode;

export type { ActionNode, AnyNode, SchemaNode }
export {
  methodPipe,

  actionMinLength,
  actionMaxLength,
  actionEmail,
  actionIsoDateTime,
  actionUUID,
  actionRegex,
  actionUniqueItems,
  actionMaxValue,
  actionMinValue,
  actionMultipleOf,

  schemaNodeString,
  schemaNodeNumber,
  schemaNodeBoolean,
  schemaNodeObject,
  schemaNodeArray,
  schemaNodeUnion,
  schemaNodeInteger,
  schemaNodeOptional,
  schemaNodeNull,
  schemaNodeLiteral,
  schemaNodeReference,
}
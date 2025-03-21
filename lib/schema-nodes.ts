interface MethodNodeBase<Name extends string, Value extends unknown> {
  name: Name;
  value: Value;
}
interface MethodNodePipe extends MethodNodeBase<'pipe', SchemaNode[]> {}
const methodPipe = (item: SchemaNode, value: SchemaNode[]): MethodNodePipe => ({
  name: 'pipe',
  value: [item, ...value]
});

type MethodNode =
  | MethodNodePipe;


type Action<Node extends ActionNode> = Node["value"] extends never
  ? (message?: string) => Node
  : (value: Node["value"], message?: string) => Node;

interface ActionNodeBase<Name extends string, Value extends unknown = never> {
  name: Name;
  value: Value;
  message?: string
  custom?: boolean;
}

interface ActionNodeMinLength extends ActionNodeBase<'minLength', number> {}
const actionMinLength: Action<ActionNodeMinLength> = (value, message) => ({
  name: "minLength",
  value,
  message,
});

interface ActionNodeMaxLength extends ActionNodeBase<'maxLength', number> {}
const actionMaxLength: Action<ActionNodeMaxLength> = (value, message) => ({
  name: "maxLength",
  value,
  message,
});

interface ActionNodeMinValue extends ActionNodeBase<'minValue', number> {}
const actionMinValue: Action<ActionNodeMinValue> = (value, message) => ({
  name: "minValue",
  value,
  message,
});

interface ActionNodeMaxValue extends ActionNodeBase<'maxValue', number> {}
const actionMaxValue: Action<ActionNodeMaxValue> = (value, message) => ({
  name: "maxValue",
  value,
  message,
});

interface ActionNodeMultipleOf extends ActionNodeBase<'multipleOf', number> {}
const actionMultipleOf: Action<ActionNodeMultipleOf> = (value, message) => ({
  name: "multipleOf",
  value,
  message,
});

interface ActionNodeRegex extends ActionNodeBase<'regex', string> {}
const actionRegex: Action<ActionNodeRegex> = (value, message) => ({
  name: "regex",
  value,
  message,
});

interface ActionNodeUniqueItems extends ActionNodeBase<'uniqueItems'> {}
const actionUniqueItems: Action<ActionNodeUniqueItems> = (message) => ({
  name: "uniqueItems",
  message,
});

interface ActionNodeEmail extends ActionNodeBase<'email'> {}
const actionEmail: Action<ActionNodeEmail> = (message) => ({
  name: "email",
  message,
});

interface ActionNodeUUID extends ActionNodeBase<'uuid'> {}
const actionUUID: Action<ActionNodeUUID> = (message) => ({
  name: "uuid",
  message,
});

interface ActionNodeIsoDateTime extends ActionNodeBase<'isoDateTime'> {}
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

interface SchemaNodeBase<Name extends string> {
  name: Name;
}

interface SchemaNodeString extends SchemaNodeBase<'string'> {}
const schemaNodeString: NodeFactory<SchemaNodeString> = (props) => ({
  name: 'string',
  ...props
});

interface SchemaNodeNumber extends SchemaNodeBase<'number'> {}
const schemaNodeNumber: NodeFactory<SchemaNodeNumber> = (props) => ({
  name: 'number',
  ...props
});

interface SchemaNodeInteger extends SchemaNodeBase<'integer'> {}
const schemaNodeInteger: NodeFactory<SchemaNodeInteger> = (props) => ({
  name: 'integer',
  ...props
});

interface SchemaNodeBoolean extends SchemaNodeBase<'boolean'> {}
const schemaNodeBoolean: NodeFactory<SchemaNodeBoolean> = (props) => ({
  name: 'boolean',
  ...props
});

interface SchemaNodeObject extends SchemaNodeBase<'object'> {
  content: Record<string, SchemaNode>;
}
const schemaNodeObject: NodeFactory<SchemaNodeObject> = (props) => ({
  name: 'object',
  ...props
});

interface SchemaNodeArray extends SchemaNodeBase<'array'> {
  kind?: SchemaNode;
}
const schemaNodeArray: NodeFactory<SchemaNodeArray> = (props) => ({
  name: 'array',
  ...props
});

interface SchemaNodeUnion extends SchemaNodeBase<'union'> {
  content?: any[]
}
const schemaNodeUnion: NodeFactory<SchemaNodeUnion> = (props) => ({
  name: 'union',
  ...props
});

interface SchemaNodeNull extends SchemaNodeBase<'null'> {}
const schemaNodeNull: NodeFactory<SchemaNodeNull> = (props) => ({
  name: 'null',
  ...props
});

interface SchemaNodeLiteral extends SchemaNodeBase<'literal'> {
  value?: any;
}
const schemaNodeLiteral: NodeFactory<SchemaNodeLiteral> = (props) => ({
  name: 'literal',
  ...props
});

interface SchemaNodeOptional extends SchemaNodeBase<'optional'> {
  item: SchemaNode
}
const schemaNodeOptional: NodeFactory<SchemaNodeOptional> = (props) => ({
  name: 'optional',
  ...props
});

interface SchemaNodeReference extends SchemaNodeBase<'$ref'> {
  ref?: string;
}
const schemaNodeReference: NodeFactory<SchemaNodeReference> = (props) => ({
  name: '$ref',
  ...props
})

type NodeFactory<Node extends SchemaNode> = (props?: Omit<Node, "name">) => Node;

type SchemaNode = 
  | MethodNode
  | ActionNode
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

export type { SchemaNode, ActionNode }
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
}
export {
  // factoryByType,
  // actionNodePipe,
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
  schemaNodeReference
}
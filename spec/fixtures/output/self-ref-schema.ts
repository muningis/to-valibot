import { array, object, pipe, string, uuid, lazy, GenericSchema, optional } from "valibot";

type TreeNode = {
  id: string;
  name: string;
  children?: TreeNode[];
}

const TreeNodeSchema: GenericSchema<TreeNode> = object({
  id: pipe(string(), uuid()),
  name: string(),
  children: optional(array(lazy(() => TreeNodeSchema)))
});

type LinkedListNode = {
  value: string;
  next?: LinkedListNode;
}

const LinkedListNodeSchema: GenericSchema<LinkedListNode> = object({
  value: string(),
  next: optional(lazy(() => LinkedListNodeSchema))
});

const SelfRefSchema = object({
  tree: TreeNodeSchema,
  linkedList: LinkedListNodeSchema,
});

export {
  LinkedListNodeSchema,
  SelfRefSchema,
  TreeNodeSchema
}

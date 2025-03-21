import { CheckItemsAction, array, checkItems, isoDateTime, literal, object, optional, pipe, string, union, uuid } from "valibot";

const uniqueItems = <Type, Message extends string>(
  message?: Message
): CheckItemsAction<Type[], Message | undefined> =>
  checkItems((item, i, arr) => arr.indexOf(item) === i, message);

const StatusSchema = union([
  literal('active'),
  literal('inactive'),
  literal('pending'),
  literal('suspended'),
]);

const PrioritySchema = union([
  literal('low'),
  literal('medium'),
  literal('high'),
  literal('critical'),
]);

const CategorySchema = union([
  literal('bug'),
  literal('feature'),
  literal('enhancement'),
  literal('documentation'),
]);

const SeveritySchema = union([
  literal('trivial'),
  literal('minor'),
  literal('major'),
  literal('critical'),
]);

const UserRoleSchema = union([
  literal('admin'),
  literal('manager'),
  literal('developer'),
  literal('viewer'),
]);

const PermissionSchema = object({
  action: union([
    literal('read'),
    literal('write'),
    literal('delete'),
    literal('execute'),
  ]),
  resource: string(),
});

const UserSchema = object({
  id: pipe(string(), uuid()),
  username: string(),
  role: UserRoleSchema,
  permissions: optional(array(PermissionSchema)),
});

const CommentSchema = object({
  id: pipe(string(), uuid()),
  content: string(),
  author: UserSchema,
  createdAt: pipe(string(), isoDateTime()),
});

const IssueSchema = object({
  id: pipe(string(), uuid()),
  title: string(),
  description: string(),
  status: StatusSchema,
  priority: PrioritySchema,
  category: CategorySchema,
  severity: SeveritySchema,
  assignee: optional(UserSchema),
  reporter: UserSchema,
  comments: optional(array(CommentSchema)),
  relatedIssues: optional(array(pipe(string(), uuid()))),
  tags: optional(pipe(array(string()), uniqueItems())),
  createdAt: pipe(string(), isoDateTime()),
  updatedAt: optional(pipe(string(), isoDateTime())),
});

const ProjectSchema = object({
  id: pipe(string(), uuid()),
  name: string(),
  description: optional(string()),
  status: optional(StatusSchema),
  owner: UserSchema,
  members: optional(array(UserSchema)),
  issues: optional(array(IssueSchema)),
  createdAt: pipe(string(), isoDateTime()),
});

const ComplexRefsSchema = object({
  projects: array(ProjectSchema),
  users: optional(array(UserSchema)),
});

export {
  CategorySchema,
  CommentSchema,
  ComplexRefsSchema,
  IssueSchema,
  PermissionSchema,
  PrioritySchema,
  ProjectSchema,
  SeveritySchema,
  StatusSchema,
  UserRoleSchema,
  UserSchema,
}
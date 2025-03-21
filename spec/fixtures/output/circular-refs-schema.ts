import { GenericSchema, array, lazy, object, optional, string } from "valibot";

type Person = {
  name: string;
  spouse?: Person;
  children?: Person[];
}

const PersonSchema: GenericSchema<Person> = object({
  name: string(),
  spouse: optional(lazy(() => PersonSchema)),
  children: optional(array(lazy(() => PersonSchema))),
});

type Company = {
  name: string;
  employees?: Employee[];
}
const CompanySchema: GenericSchema<Company> = object({
  name: string(),
  employees: optional(array(lazy(() => EmployeeSchema))),
});

type Employee = {
  name: string;
  company?: Company;
  manager?: Employee;
  subordinates?: Employee[];
}

const EmployeeSchema: GenericSchema<Employee> = object({
  name: string(),
  company: optional(lazy(() => CompanySchema)),
  manager: optional(lazy(() => EmployeeSchema)),
  subordinates: optional(array(lazy(() => EmployeeSchema))),
});

const CircularRefsSchema = object({
  family: PersonSchema,
  organization: CompanySchema,
});

export {
  CircularRefsSchema,
  CompanySchema,
  EmployeeSchema,
  PersonSchema,
}
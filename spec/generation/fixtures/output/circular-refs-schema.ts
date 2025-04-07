import { GenericSchema, InferOutput, array, lazy, object, optional, string } from "valibot";


export type Person = {
  name: string;
  spouse?: Person | undefined;
  children?: Person[] | undefined;
}

export const PersonSchema: GenericSchema<Person> = object({
  name: string(),
  spouse: optional(lazy(() => PersonSchema)),
  children: optional(array(lazy(() => PersonSchema))),
});


export type Employee = {
  name: string;
  company?: Company | undefined;
  manager?: Employee | undefined;
  subordinates?: Employee[] | undefined;
}

export const EmployeeSchema: GenericSchema<Employee> = object({
  name: string(),
  company: optional(lazy(() => CompanySchema)),
  manager: optional(lazy(() => EmployeeSchema)),
  subordinates: optional(array(lazy(() => EmployeeSchema))),
});


export type Company = {
  name: string;
  employees?: Employee[] | undefined;
}

export const CompanySchema: GenericSchema<Company> = object({
  name: string(),
  employees: optional(array(lazy(() => EmployeeSchema))),
});


export const CircularRefsSchema = object({
  family: PersonSchema,
  organization: CompanySchema,
});

export type CircularRefs = InferOutput<typeof CircularRefsSchema>;

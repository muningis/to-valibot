import { array, email, maxLength, object, optional, pipe, string, uuid } from "valibot";

const AddressSchema = object({
  street: string(),
  city: string(),
  country: string(),
  postalCode: optional(string()),
});

const ContactSchema = object({
  phone: string(),
  email: pipe(string(), email()),
});

const MediumRefsSchema = object({
  id: pipe(string(), uuid()),
  name: string(),
  billingAddress: AddressSchema,
  shippingAddress: optional(AddressSchema),
  primaryContact: ContactSchema,
  secondaryContacts: optional(pipe(array(ContactSchema), maxLength(3))),
});

export {
  AddressSchema,
  ContactSchema,
  MediumRefsSchema,
}
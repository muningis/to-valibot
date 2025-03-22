import { array, email, maxLength, object, optional, pipe, string, uuid } from "valibot";


export const AddressSchema = object({
  street: string(),
  city: string(),
  country: string(),
  postalCode: optional(string()),
});


export const ContactSchema = object({
  phone: string(),
  email: pipe(string(), email()),
});


export const MediumRefsSchema = object({
  id: pipe(string(), uuid()),
  name: string(),
  billingAddress: AddressSchema,
  shippingAddress: optional(AddressSchema),
  primaryContact: ContactSchema,
  secondaryContacts: optional(pipe(array(ContactSchema), maxLength(3))),
});

import { InferOutput, boolean, object, string } from "valibot";


export const PetSchema = object({
  type: string(),
});

export type Pet = InferOutput<typeof PetSchema>;


export const DogSchema = object({
  ...PetSchema.entries,
  bark: boolean(),
});

export type Dog = InferOutput<typeof DogSchema>;

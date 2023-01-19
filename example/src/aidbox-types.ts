export interface Patient {
  resourceType: "Patient";
  id: string;
  active?: boolean;
  foo: string;
  name?: Array<{ text: string }>;
}

export interface Custom {
  resourceType: "Custom";
  id: string;
  bar: string;
}

export interface MyResourceTypeMap {
  Patient: Patient;
  Custom: Custom;
}

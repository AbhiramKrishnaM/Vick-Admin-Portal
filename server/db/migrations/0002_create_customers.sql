CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  id_proof_type TEXT NOT NULL CHECK (
    id_proof_type IN ('aadhar_card', 'pan_card', 'voter_id', 'driving_license', 'passport', 'ration_card')
  ),
  phone_number TEXT NOT NULL,
  second_phone_number TEXT,
  connection_types TEXT[] NOT NULL CHECK (
    connection_types <@ ARRAY['cable', 'internet']::TEXT[] AND array_length(connection_types, 1) > 0
  ),
  plan_type TEXT NOT NULL,
  status TEXT NOT NULL,
  payment_method TEXT NOT NULL CHECK (
    payment_method IN ('cash', 'upi', 'debit_card', 'credit_card', 'net_banking', 'bank_transfer', 'cheque')
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

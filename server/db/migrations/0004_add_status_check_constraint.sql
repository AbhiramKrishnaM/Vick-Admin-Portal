ALTER TABLE customers
  ADD CONSTRAINT customers_status_check CHECK (status IN ('Active', 'Not Active'));

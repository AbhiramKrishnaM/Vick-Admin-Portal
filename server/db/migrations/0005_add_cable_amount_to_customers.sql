ALTER TABLE customers
  ADD COLUMN cable_amount INTEGER CHECK (cable_amount IN (200, 250));

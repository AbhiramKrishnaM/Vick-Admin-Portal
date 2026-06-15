CREATE TABLE IF NOT EXISTS plans (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL CHECK (
    category IN ('fup_plans', 'unlimited_plans', 'pay_6_months_extra', 'one_year_plan', 'lco_combo_plan')
  ),
  name TEXT NOT NULL,
  speed TEXT NOT NULL,
  fup TEXT NOT NULL,
  validity TEXT,
  amount INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO plans (category, name, speed, fup, validity, amount) VALUES
  ('fup_plans', 'FUP40M2000G', '40Mbps', '2000Gb', 'FUP', 495),
  ('fup_plans', 'VOICE-FUP45M2500G', '45Mbps', '2500Gb', 'FUP', 530),
  ('fup_plans', 'FUP50M4000G', '50Mbps', '4000Gb', 'FUP', 530),
  ('fup_plans', 'VOICE-FUP55M4500G', '55Mbps', '4500Gb', 'FUP', 566),
  ('fup_plans', 'FUP60M4000G', '60Mbps', '4000Gb', 'FUP', 590),
  ('fup_plans', 'FUP80M4000G', '80Mbps', '4000Gb', 'FUP', 655),
  ('fup_plans', 'FUP100M4000G', '100Mbps', '4000Gb', 'FUP', 825),
  ('fup_plans', 'FUP125M4000G', '125Mbps', '4000Gb', 'FUP', 945),
  ('fup_plans', 'FUP200M4500G', '200Mbps', '4500Gb', 'FUP', 1180),
  ('fup_plans', 'FUP250M4500G', '250Mbps', '4500Gb', 'FUP', 1475),
  ('fup_plans', 'FUP300M5000G', '300Mbps', '5000Gb', 'FUP', 1770),
  ('fup_plans', 'FUP500M8000G', '500Mbps', '8000Gb', 'FUP', 2950),
  ('fup_plans', 'FUP1000M8000G', '1000Mbps', '8000GB', 'FUP', 4069),

  ('unlimited_plans', 'UL40M', '40Mbps', 'UNLIMITED', NULL, 766),
  ('unlimited_plans', 'UL50M', '50Mbps', 'UNLIMITED', NULL, 1002),
  ('unlimited_plans', 'UL80M', '80Mbps', 'UNLIMITED', NULL, 1238),

  ('pay_6_months_extra', 'FUP50M4000GPM200D', '50Mbps', '4000Gb MONTHLY', '200 DAYS', 3179),
  ('pay_6_months_extra', 'FUP60M4000GPM200D', '60Mbps', '4000Gb MONTHLY', '200 DAYS', 3533),
  ('pay_6_months_extra', 'FUP80M4000GPM200D', '80Mbps', '4000Gb MONTHLY', '200 DAYS', 3930),
  ('pay_6_months_extra', 'FUP125M4000GPM200D', '125Mbps', '4000Gb MONTHLY', '200 DAYS', 5670),
  ('pay_6_months_extra', 'LCO-CP-FUP20M1000GPM200D & CABLE TV', '20Mbps', '1000Gb MONTHLY', '200 DAYS', 3636),
  ('pay_6_months_extra', 'LCO-CP-FUP30M2000GPM200D & CABLE TV', '30Mbps', '2000Gb MONTHLY', '200 DAYS', 4230),
  ('pay_6_months_extra', 'LCO-CP-FUP50M4000GPM200D & CABLE TV', '50Mbps', '4000Gb MONTHLY', '200 DAYS', 4740),

  ('one_year_plan', 'FUP1Y40M2000G', '40Mbps', '2000Gb', 'FUP', 4129),
  ('one_year_plan', 'FUP1Y50M2500G', '50Mbps', '2500Gb', 'FUP', 5545),
  ('one_year_plan', 'UL1Y20M', '20Mbps', 'UNLIMITED', '14 MONTH', 6961),
  ('one_year_plan', 'UL1Y40M', '40Mbps', 'UNLIMITED', '14 MONTH', 9085),
  ('one_year_plan', 'FUP50M4000GPM1Y', '50Mbps', '4000Gb MONTHLY', '14 MONTH', 6358),
  ('one_year_plan', 'FUP60M4000GPM1Y', '60Mbps', '4000Gb MONTHLY', '14 MONTH', 7066),
  ('one_year_plan', 'FUP80M4000GPM1Y', '80Mbps', '4000Gb MONTHLY', '14 MONTH', 7859),
  ('one_year_plan', 'FUP125M4000GPM1Y', '125Mbps', '4000Gb MONTHLY', '14 MONTH', 11340),
  ('one_year_plan', 'LCO-CP-FUP20M1000GPM1Y & CABLE TV', '20Mbps', '1000Gb MONTHLY', '14 MONTH', 7272),
  ('one_year_plan', 'LCO-CP-FUP30M2000GPM1Y & CABLE TV', '30Mbps', '2000Gb MONTHLY', '14 MONTH', 8460),
  ('one_year_plan', 'LCO-CP-FUP50M4000GPM1Y & CABLE TV', '50Mbps', '4000Gb MONTHLY', '14 MONTH', 9480),

  ('lco_combo_plan', 'LCO-CP-FUP20M1000G & CABLE TV', '20Mbps', '1000Gb', 'FUP', 606),
  ('lco_combo_plan', 'VOICE-LCO-CP-FUP25M1500G & CABLE TV', '25Mbps', '1500Gb', 'FUP', 642),
  ('lco_combo_plan', 'LCO-CP-FUP30M2000G & CABLE TV', '30Mbps', '2000Gb', 'FUP', 705),
  ('lco_combo_plan', 'VOICE-LCO-CP-FUP35M2500G & CABLE TV', '35Mbps', '2500Gb', 'FUP', 741),
  ('lco_combo_plan', 'LCO-CP-FUP50M4000G & CABLE TV', '50Mbps', '4000Gb', 'FUP', 790),
  ('lco_combo_plan', 'VOICE-LCO-CP-FUP55M4500G & CABLE TV', '55Mbps', '4500Gb', 'FUP', 826);

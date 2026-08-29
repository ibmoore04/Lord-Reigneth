-- ============================================================
-- Migration 010: Payment Completion Guard
-- Prevents an order from being marked "completed" when
-- payment_status is still 'unpaid'.
-- Enforced at the database level — cannot be bypassed by the UI.
-- ============================================================

create or replace function enforce_payment_before_completion()
returns trigger language plpgsql as $$
begin
  -- Only fire when status is transitioning TO 'completed'
  if new.status = 'completed' and old.status <> 'completed' then
    if new.payment_status = 'unpaid' then
      raise exception
        'Cannot complete order % — payment status is still unpaid. '
        'Mark the order as paid before completing it.',
        new.order_number;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_payment_before_completion on orders;
create trigger trg_payment_before_completion
  before update of status on orders
  for each row execute function enforce_payment_before_completion();

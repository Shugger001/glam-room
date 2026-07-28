-- Allow day-of salon statuses on bookings
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check
  CHECK (status IN (
    'pending',
    'awaiting_approval',
    'confirmed',
    'arrived',
    'rejected',
    'cancelled',
    'completed',
    'no_show'
  ));

export const FUNCTION_TYPES = [
  "Mehendi",
  "Haldi",
  "Engagement",
  "Reception",
  "Wedding",
  "Party",
  "Other",
];

export const LOOK_OPTIONS = [
  "Bridal",
  "Engagement",
  "Reception",
  "Party Makeup",
  "Natural Look",
];

export const PHONE_REGEX = /^[6-9]\d{9}$/;

export function todayStr() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function isPastDate(dateStr) {
  return dateStr < todayStr();
}

// A function date must be strictly after today — bookings need at least a
// day's advance notice, so same-day requests aren't allowed either.
export function isTooSoon(dateStr) {
  return dateStr <= todayStr();
}

// Earliest date a bride (or admin editing a date) can pick — tomorrow.
export function minSelectableDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function validateBookingInput(input, options = {}) {
  const { skipDateFutureCheck = false } = options;
  const errors = {};

  if (!input.name || !input.name.trim()) {
    errors.name = "Please enter the bride's name.";
  }

  if (!input.phone || !input.phone.trim()) {
    errors.phone = "Please enter a phone number.";
  } else if (!PHONE_REGEX.test(input.phone.trim())) {
    errors.phone = "Enter a valid 10-digit number starting with 6, 7, 8 or 9.";
  }

  if (!input.functionDate) {
    errors.functionDate = "Please choose a function date.";
  } else if (!skipDateFutureCheck && isTooSoon(input.functionDate)) {
    errors.functionDate =
      input.functionDate === todayStr()
        ? "Please book at least a day in advance."
        : "Please choose a future date.";
  }

  if (!input.functionType) {
    errors.functionType = "Please select a function type.";
  } else if (!FUNCTION_TYPES.includes(input.functionType)) {
    errors.functionType = "Please select a valid function type.";
  } else if (
    input.functionType === "Other" &&
    (!input.functionTypeOther || !input.functionTypeOther.trim())
  ) {
    errors.functionTypeOther = "Please specify the function type.";
  }

  if (!input.look) {
    errors.look = "Please select the makeup look.";
  } else if (!LOOK_OPTIONS.includes(input.look)) {
    errors.look = "Please select a valid look.";
  }

  return errors;
}

export function hasErrors(errors) {
  return Object.keys(errors).length > 0;
}
